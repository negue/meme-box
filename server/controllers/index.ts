import {ScreenController} from "./screen.controller";
import {WidgetStateController} from "./widget-state.controller";
import {ConfigController} from "./config.controller";
import {OpenController} from "./open.controller";
import {TwitchDataController} from "./twitch-data.controller";
import {ActionActivityController} from "./action-activity.controller";
import {TwitchEventsController} from "./twitch-events.controller";
import {ActionController} from "./action.controller";
import {FileController} from "./file.controller";

export const CONTROLLERS = [
  ActionController,
  ActionActivityController,
  ConfigController,
  FileController,
  ScreenController,
  WidgetStateController,
  OpenController,
  TwitchDataController,
  TwitchEventsController
]
