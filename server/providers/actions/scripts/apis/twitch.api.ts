import {TwitchConnector} from "../../../twitch/twitch.connector";
import {ScriptApiBase} from "./script-api.base";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {MediaType} from "@memebox/contracts";

export class TwitchApi implements ScriptApiBase {
  private _destroy$ = new Subject();

  // for permanent scripts
  public onEvent$ = this.twitchConnector.twitchEvents$().pipe(
    takeUntil(this._destroy$)
  );

  constructor(
    private twitchConnector: TwitchConnector,
    private scriptType: MediaType
  ) {
    // Only Permanent Scripts as allowed to subscribe to Events
    if (scriptType === MediaType.Script) {
      this._destroy$.next();
    }
  }

  public say(message: string) {
    const tmiInstance = this.twitchConnector.tmiInstance();
    const settings = this.twitchConnector.getTwitchSettings();

    tmiInstance.say(settings.channel, message);
  }

  dispose(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
