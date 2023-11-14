import {Controller, Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence} from "../persistence";
import {AllTwitchEvents, ENDPOINTS, TwitchEventTypes} from "@memebox/contracts";
import {TwitchDataProvider} from "../providers/twitch/twitch.data-provider";
import {TwitchQueueEventBus} from "../providers/triggers/twitch-triggers/twitch-queue-event.bus";
import {takeLatestItems} from "@memebox/utils";
import {filter} from "rxjs/operators";

@Controller(ENDPOINTS.TRIGGER_CONFIGS.PREFIX)
export class TriggerConfigsController {
  private latest20Events: TriggerConfig[] = [];

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private _dataProvider: TwitchDataProvider,
    private _twitchEventBus: TwitchQueueEventBus,
  ) {
    _twitchEventBus.AllQueuedEvents$.pipe(
      filter(str => {
        return str.type !== TwitchEventTypes.message;
      } ),
      takeLatestItems(20)
    ).subscribe(value => {
      this.latest20Events = value;
    });
  }

  /*
  @Get('/')
  getTwitchEvents(): TwitchTrigger[] {
    return [];
    //return PersistenceInstance.listTrigger();
  }


  @Post('/')
  @Use([twitchPostValidator, validOrLeave])
  addTwitchEvent(
    @BodyParams() newTrigger: TwitchTrigger
  ): string {
    return '';
    //return PersistenceInstance.addTwitchEvent(newTrigger)
  }

  @Put('/:eventId')
  @Use([twitchPutValidator, validOrLeave])
  updateTwitchEvent(
    @PathParams("eventId") eventId: string,
    @BodyParams() trigger: TwitchTrigger
  ): any {
    //PersistenceInstance.updateTrigger(eventId, trigger)

    return {
      ok: true
    };
  }

  @Delete('/:eventId')
  deleteTwitchEvent(
    @PathParams("eventId") eventId: string
  ): void {
    //PersistenceInstance.deleteTrigger(eventId);
  }

  @Post(ENDPOINTS.TWITCH_EVENTS.TRIGGER_EVENT)
  triggerEvent(
    @BodyParams() twitchEvent: AllTwitchEvents
  ): void {
    this._twitchEventBus.queueEvent(twitchEvent);
  }

  @Get(ENDPOINTS.TWITCH_EVENTS.LAST_20_EVENTS)
  getLast20Events(): AllTwitchEvents[] {
    return this.latest20Events;
  }

   */
}
