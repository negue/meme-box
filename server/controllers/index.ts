import {ScreenController} from "./screen.controller";
import {WidgetStateController} from "./widget-state.controller";
import {ConfigController} from "./config.controller";
import {OpenController} from "./open.controller";
import {TwitchDataController} from "./twitch-data.controller";
import {ActionActivityController} from "./action-activity.controller";
import {ActionController} from "./action.controller";
import {FileController} from "./file.controller";
import {ObsDataController} from "./obs-data.controller";
import {TriggerConfigsController} from "./trigger-configs.controller";

export const CONTROLLERS = [
  ActionController,
  ActionActivityController,
  ConfigController,
  FileController,
  ScreenController,
  WidgetStateController,
  OpenController,
  TwitchDataController,
  TriggerConfigsController,
  ObsDataController
]
