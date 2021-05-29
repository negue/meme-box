import {Service, UseOpts} from "@tsed/di";
import {VM, VMScript} from "vm2";
import OBSWebSocket from "obs-websocket-js";
import {Clip, TriggerClip, TriggerClipOrigin} from "@memebox/contracts";
import {NamedLogger} from "../named-logger";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";
import {MediaTriggerEventBus} from "./media-trigger.event-bus";
import {clipDataToScriptConfig, getScriptVariablesOrFallbackValues, ScriptConfig} from "@memebox/utils";
import {MediaActiveState} from "./media-active-state";
import {MediaStateEventBus} from "./media-state.event-bus";

// name pending
interface ScriptHoldingData {
  script: ScriptConfig;
  compiledBootstrapScript: VMScript;
  bootstrap_variables: Record<string, unknown>;
  isBootstrapped: boolean;
  compiledExecutionScript: VMScript;
}

@Service()
export class ScriptHandler {

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
      waitMillisecondsAsync: (ms: number) => timeoutAsync(ms),
      triggerMediaAsync: (targetMediaId: string, targetScreenId?: string) => {
        this.mediaTriggerEventBus.triggerMedia({
          id: targetMediaId,
          targetScreen: targetScreenId,
          origin: TriggerClipOrigin.Scripts
        });

        return this.mediaActiveState.waitUntilDoneAsync(targetMediaId, targetScreenId);
      }
    }
  });

  constructor(
    @UseOpts({name: 'ScriptHandler'}) public logger: NamedLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private mediaTriggerEventBus: MediaTriggerEventBus,
    private mediaStateEventBus: MediaStateEventBus,
    private mediaActiveState: MediaActiveState
  ) {
    _persistence.dataUpdated$().subscribe(() => {
      // TODO get updated Path to know what kind of state needs to be refilled
      // for example the compiled scripts

      this._compiledScripts = new Map<string, ScriptHoldingData>();
    })

  }


  public async handleScript(mediaConfig: Clip, payloadObs: TriggerClip) {
    this.logger.info('Handle Script!!');

    this.mediaStateEventBus.updateMediaState({
      mediaId: mediaConfig.id,
      active: true
    });

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

      await scriptToCall(scriptArguments);
    }
    catch(err) {
      this.logger.error(`Failed to run script for "${mediaConfig.name}" [${mediaConfig.id}]`, err);
    }

    this.logger.info(`Script "${mediaConfig.name}" is done.`);

    this.mediaStateEventBus.updateMediaState({
      mediaId: mediaConfig.id,
      active: false
    });
  }
}

export function timeoutAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

