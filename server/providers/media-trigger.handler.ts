import {Service, UseOpts} from "@tsed/di";
import {ACTIONS, Clip, Dictionary, MediaType, MetaTriggerTypes, Screen, TriggerClip} from "@memebox/contracts";
import {Persistence} from "../persistence";
import {NamedLogger} from "./named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "./contracts";
import {MemeboxWebsocket} from "./websockets/memebox.websocket";
import {MediaTriggerEventBus} from "./media-trigger.event-bus";

import {VM, VMScript} from "vm2";
import OBSWebSocket from "obs-websocket-js";
import {clipDataToScriptConfig, getScriptVariablesOrFallbackValues, ScriptConfig} from "@memebox/utils";

// name pending
interface ScriptHoldingData {
  script: ScriptConfig;
  compiledBootstrapScript: VMScript;
  bootstrap_variables: Record<string, unknown>;
  isBootstrapped: boolean;
  compiledExecutionScript: VMScript;
}

@Service()
export class MediaTriggerHandler {
  private _allScreens: Screen[] = [];
  private _allMediasMap: Dictionary<Clip> = {};
  private _allMediasList: Clip[] = [];

  private _compiledScripts = new Map<string, ScriptHoldingData>();

  // TODO / check can it run multiple longer-scripts at once?
  private _vm = new VM({
    sandbox: {
      console: {
        info: (...args) => {
           this.logger.info(...args)
        }
      },
      getObsWebsocket: (address: string, password?: string) => {
        const obs = new OBSWebSocket();
        obs.connect({ address, password });

        return obs;
      },
      waitMilliseconds: (ms: number) => timeoutAsync(ms),
      triggerClip: (targetMediaId: string, targetScreenId?: string) => {
        this.triggerMediaClipById({
          id: targetMediaId,
          targetScreen: targetScreenId
        })

        return Promise.resolve(true);
      }
    }
  });

  constructor(
    @UseOpts({name: 'MediaTriggerHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private mediaTriggerEventBus: MediaTriggerEventBus,
    private _memeboxWebSocket: MemeboxWebsocket
  ) {
    mediaTriggerEventBus.AllEvents$.subscribe(triggerMedia => {
      this.triggerMediaClipById(triggerMedia);
    });

    _persistence.dataUpdated$().subscribe(() => {
      this.getData();

      // TODO get updated Path to know what kind of state needs to be refilled
      // for example the compiled scripts

      this._compiledScripts = new Map<string, ScriptHoldingData>();
    })

    this.getData();
  }

  async triggerMediaClipById(payloadObs: TriggerClip) {
    this.logger.info(`Clip triggered: ${payloadObs.id} - Target: ${payloadObs.targetScreen ?? 'Any'}`, payloadObs);

    const mediaConfig = this._allMediasMap[payloadObs.id];

    switch (mediaConfig.type) {
      case MediaType.Meta:
        this.triggerMeta(mediaConfig);
        break;
      case MediaType.Script:
        this.triggerScript(mediaConfig, payloadObs);
        break;
      default: {
        if (payloadObs.targetScreen) {
          this._memeboxWebSocket.sendDataToScreen(payloadObs.targetScreen, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(payloadObs)}`);
          return;
        }

        // No Meta Type
        // Trigger the clip on all assign screens
        for (const screen of this._allScreens) {
          if (screen.clips[payloadObs.id]) {
            const newMessageObj = {
              ...payloadObs,
              targetScreen: screen.id
            };

            this._memeboxWebSocket.sendDataToScreen(screen.id, `${ACTIONS.TRIGGER_CLIP}=${JSON.stringify(newMessageObj)}`);
          }
        }
      }
    }
  }

  private async triggerScript(mediaConfig: Clip, payloadObs: TriggerClip) {
    let scriptHoldingData: ScriptHoldingData;

    if (this._compiledScripts.has(mediaConfig.id)) {
      scriptHoldingData = this._compiledScripts.get(mediaConfig.id);
    } else {
      var executionScript: VMScript;
      var bootstrapScript: VMScript;

      const scriptConfig = clipDataToScriptConfig(mediaConfig);

      try {
        bootstrapScript = new VMScript(`
          async function bootstrap(
            { variables }
          ) {
            ${scriptConfig.bootstrapScript}
          }

          (bootstrap);
        `).compile();
      } catch (err) {
        this.logger.error(`Failed to compile bootstrap script for "${mediaConfig.name}" [${mediaConfig.id}]`, err);
        return;
      }

      try {
        executionScript = new VMScript(`
          async function scriptInVm(
            { variables, bootstrap, triggerPayload }
          ) {
            ${scriptConfig.executionScript}
          }

          (scriptInVm)
        `).compile();
      } catch (err) {
        this.logger.error(`Failed to compile execution script for "${mediaConfig.name}" [${mediaConfig.id}]`, err);
        return;
      }

      scriptHoldingData = {
        compiledExecutionScript: executionScript,
        compiledBootstrapScript: bootstrapScript,
        bootstrap_variables: {},
        isBootstrapped: false,
        script: scriptConfig
      };

      this._compiledScripts.set(mediaConfig.id, scriptHoldingData);
    }

    try {
      const variables = getScriptVariablesOrFallbackValues(scriptHoldingData.script,
        mediaConfig.extended);

      console.info({
        variables
      });

      if (!scriptHoldingData.isBootstrapped) {
        const bootstrapFunc = this._vm.run(scriptHoldingData.compiledBootstrapScript);

        scriptHoldingData.bootstrap_variables = await bootstrapFunc({
          variables,
        });
        scriptHoldingData.isBootstrapped = true;

        console.info('bootstrap result', scriptHoldingData.bootstrap_variables);
      }

      const scriptToCall = this._vm.run(scriptHoldingData.compiledExecutionScript);

      const scriptArguments = {
        variables,
        bootstrap: scriptHoldingData.bootstrap_variables,
        triggerPayload: payloadObs
      };

      console.info({
        variables,
        script: scriptHoldingData.script
      });

      console.info({ scriptArguments });

      scriptToCall(scriptArguments);
    }
    catch(err) {
      this.logger.error(`Failed to run script for "${mediaConfig.name}" [${mediaConfig.id}]`, err);
    }
  }

  private async triggerMeta(mediaConfig: Clip): Promise<void> {
    // Get all Tags
    const assignedTags = mediaConfig.tags || [];

    if (assignedTags.length === 0) {
      return;
    }

    // Get all clips assigned with these tags
    const allClips = this._allMediasList.filter(
      clip => clip.id !== mediaConfig.id && clip.tags && clip.tags.some(tagId => assignedTags.includes(tagId))
    );
    // per metaType
    switch (mediaConfig.metaType) {
      case MetaTriggerTypes.Random: {
        // random 0..1
        const randomIndex = Math.floor(Math.random() * allClips.length);

        const clipToTrigger = allClips[randomIndex];

        this.triggerMediaClipById(clipToTrigger);

        break;
      }
      case MetaTriggerTypes.All: {
        allClips.forEach(clipToTrigger => {
          this.triggerMediaClipById(clipToTrigger);
        });

        break;
      }
      case MetaTriggerTypes.AllDelay: {

        for (const clipToTrigger of allClips) {
          await this.triggerMediaClipById(clipToTrigger);
          await timeoutAsync(mediaConfig.metaDelay)
        }

        break;
      }
    }
  }

  private getData() {
    this._allScreens = this._persistence.listScreens();
    this._allMediasMap = this._persistence.fullState().clips;
    this._allMediasList = Object.values(this._allMediasMap);
  }
}

function timeoutAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

