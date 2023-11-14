import { Service } from "@tsed/di";
import { FileHandler, NEW_CONFIG_PATH } from "@memebox/server-common";
import path from "path";
import { ActionStore } from "@memebox/shared-state";

@Service()
export class ActionPersistentStateHandler {
  private _widgetStateMap = new Map<string, FileHandler<ActionStore>>();

  public getActionFileHandler(actionId: string): FileHandler<ActionStore> {
    let fileHandler: FileHandler<ActionStore>;

    if (!this._widgetStateMap.has(actionId)) {
      fileHandler = new FileHandler<ActionStore>(
        path.join(NEW_CONFIG_PATH, 'action-states', `${actionId}.json`)
      )
      this._widgetStateMap.set(actionId, fileHandler);
    } else {
      fileHandler = this._widgetStateMap.get(actionId);
    }

    return fileHandler;
  }
}
