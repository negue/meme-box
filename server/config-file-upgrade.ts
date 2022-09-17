import {ConfigV0, SettingsState} from "@memebox/contracts";
import {SavePreviewFile} from "./persistence.functions";
import {convertMetaActionsToRecipe} from "./migrations/3_meta_to_recipe";
import {convertRecipeTriggerRandomPayload} from "./migrations/4_recipeTriggerRandomPayload";

/* Deprecation List: (properties to rename or remove)
 * maybe for the next version
 *
 * SettingsState.clips => should be renamed
 * Action.metaType => should be removed
 * Action.metaDelay => should be removed
 * ActionType.Meta => should be removed
 * ACTION_TYPE_INFORMATION.Meta => should be removed
 */

// This is the CONFIG-Version, not the App Version
const CURRENT_VERSION = 4;

export function upgradeConfigFile(
  configFromFile: SettingsState
): SettingsState {

  if (!configFromFile.version) {
    // new twitch config state
    const configV0 = configFromFile.config as ConfigV0;

    if (configV0) {
      configFromFile.config.twitch = {
        channel: configV0.twitchChannel,
        token: '',
        enableLog: configV0.twitchLog,
        bot: {
          enabled: false,
          response: '',
          command: '!command'
        }
      };

      delete configV0.twitchLog;
      delete configV0.twitchChannel;
    }
  }

  if (configFromFile.version < 2) {
    // extract the preview base64 images out to their own files
    for (const action of Object.values(configFromFile.clips)) {
      SavePreviewFile(action);
    }
  }

  if (configFromFile.version < 3) {
    convertMetaActionsToRecipe(configFromFile);
  }

  if (configFromFile.version === 3) {
    convertRecipeTriggerRandomPayload(configFromFile);
  }

  configFromFile.version = CURRENT_VERSION;

  return configFromFile;
}
