import {BodyParams, Controller, Delete, Get, Inject, PathParams, Post, Put, Use} from "@tsed/common";
import {PERSISTENCE_DI} from "../providers/contracts";
import {Persistence, PersistenceInstance} from "../persistence";
import {ENDPOINTS, TwitchTrigger, TwitchTriggerCommand} from "@memebox/contracts";
import {TwitchDataProvider} from "../providers/twitch/twitch.data-provider";
import {twitchPostValidator, twitchPutValidator, validOrLeave} from "../validations";
import {ExampleTwitchCommandsSubject} from "../shared";
import {TwitchEvent} from "../providers/twitch/twitch.connector.types";
import {TwitchQueueEventBus} from "../providers/twitch/twitch-queue-event.bus";

@Controller(`/${ENDPOINTS.TWITCH_EVENTS.PREFIX}`)
export class TwitchEventsController {

  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private _dataProvider: TwitchDataProvider,
    private _twitchEventBus: TwitchQueueEventBus
  ) {
  }

  @Get('/')
  getTwitchEvents(): TwitchTrigger[] {
    return PersistenceInstance.listTwitchEvents();
  }


  @Post('/')
  @Use([twitchPostValidator, validOrLeave])
  addTwitchEvent(
    @BodyParams() newTrigger: TwitchTrigger
  ): string {
    return PersistenceInstance.addTwitchEvent(newTrigger)
  }

  @Put('/:eventId')
  @Use([twitchPutValidator, validOrLeave])
  updateTwitchEvent(
    @PathParams("eventId") eventId: string,
    @BodyParams() trigger: TwitchTrigger
  ): any {
    PersistenceInstance.updateTwitchEvent(eventId, trigger)

    return {
      ok: true
    };
  }

  @Delete('/:eventId')
  deleteTwitchEvent(
    @PathParams("eventId") eventId: string
  ): void {
    PersistenceInstance.deleteTwitchEvent(eventId);
  }

  @Post(ENDPOINTS.TWITCH_EVENTS.TRIGGER_CONFIG_EXAMPLE)
  triggerConfigExample(
    @BodyParams() triggerCommand: TwitchTriggerCommand
  ): void {
    ExampleTwitchCommandsSubject.next(triggerCommand);
  }

  @Post(ENDPOINTS.TWITCH_EVENTS.TRIGGER_EVENT)
  triggerEvent(
    @BodyParams() twitchEvent: TwitchEvent
  ): void {
    this._twitchEventBus.queueEvent(twitchEvent);
  }
}
