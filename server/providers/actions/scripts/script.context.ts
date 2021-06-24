import {clipDataToScriptConfig, getScriptVariablesOrFallbackValues, ScriptConfig} from "@memebox/utils";
import {VM, VMScript} from "vm2";
import {ActionStoreAdapter, ActionStoreApi} from "@memebox/state";
import {Clip, Dictionary, TriggerAction} from "@memebox/contracts";
import {Subject} from "rxjs";
import {Sleep, sleep} from "./apis/sleep.api";

class ScriptCompileError extends Error {
  constructor(script: Clip,
              public scriptType: 'bootstrap'|'execution',
              public baseError: Error) {
    super(`Failed to compile the ${scriptType} Script "${script.name}" [${script.id}]: \n${baseError.message}`);
  }
}

interface ExecutionScriptPayload {
  variables: Dictionary<unknown>;
  bootstrap: Record<string, unknown>;
  triggerPayload: TriggerAction;
  store: ActionStoreApi;
  sleep: Sleep
}

type ExecutionScript = (
  payload: ExecutionScriptPayload
) => Promise<void>;

export class ScriptContext {
  scriptConfig: ScriptConfig;

  // API Properties
  store: ActionStoreApi;

  // VMScript Parts
  isBootstrapped: boolean;
  compiledBootstrapScript: VMScript;
  bootstrap_variables: Record<string, unknown>;
  compiledExecutionScript: VMScript;

  // created execution function
  scriptToCall: ExecutionScript;

  constructor(
    private _vm: VM,
    storeAdapter: ActionStoreAdapter,
    public script: Clip,
  ) {
    this.scriptConfig = clipDataToScriptConfig(script);

    // TODO error$ subject for logger or other stuff
    var error$ = new Subject<string>();

    this.store = new ActionStoreApi(
      script.id,
      script.id,
      storeAdapter,
      error$
    );
  }

  public compile() {
    try {
      this.compiledBootstrapScript = new VMScript(`
          async function bootstrap(
            { variables }
          ) {
            ${this.scriptConfig.bootstrapScript}
          }

          (bootstrap);
        `).compile();
    } catch (err) {
      throw new ScriptCompileError(this.script,'bootstrap', err);
    }

    try {
      this.compiledExecutionScript = new VMScript(`
          async function scriptInVm(
            { variables, bootstrap, triggerPayload, store }
          ) {
            ${this.scriptConfig.executionScript}
          }

          (scriptInVm)
        `).compile();
    } catch (err) {

      throw new ScriptCompileError(this.script,'execution', err);
    }
  }

  public async bootstrap(variables: Dictionary<unknown>) : Promise<void> {
    if (!this.isBootstrapped) {
      const bootstrapFunc = this._vm.run(this.compiledBootstrapScript);

      this.bootstrap_variables = await bootstrapFunc({
        variables,
        store: this.store
      });
      this.isBootstrapped = true;
    }
  }

  public async execute(payloadObs: TriggerAction) : Promise<void> {
    // TODO apply variable overrides from TriggerClip

    const variables = getScriptVariablesOrFallbackValues(
      this.scriptConfig,
      this.script.extended
    );


    if (!this.scriptToCall) {
      await Promise.all([
        this.bootstrap(variables),
        this.store.ready()
      ]);

      this.scriptToCall = this._vm.run(this.compiledExecutionScript);
    }

    // these are the available APIs / variables that can be used inside
    const scriptArguments: ExecutionScriptPayload = {
      variables,
      bootstrap: this.bootstrap_variables,
      triggerPayload: payloadObs,
      store: this.store,
      sleep: sleep
    };

    await this.scriptToCall(scriptArguments);
  }
}
