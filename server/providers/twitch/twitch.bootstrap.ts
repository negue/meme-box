import {Service} from "@tsed/di";
import {TwitchConnector} from "../../../projects/triggers-twitch/src/lib/twitch.connector";
import {TwitchLogger} from "./twitch.logger";

// This is just to have all Services created on startup

@Service()
export class TwitchBootstrap {
  constructor(
    private _connector: TwitchConnector,
    private _logger: TwitchLogger
  ) {
  }
}
