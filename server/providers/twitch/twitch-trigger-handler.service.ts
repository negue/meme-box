import {Injectable, ProviderScope, ProviderType} from "@tsed/di";
import {TwitchConnector} from "./twitch.connector";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../contracts";
import {Persistence} from "../../persistence";
import {Action, Dictionary, TriggerClipOrigin, TwitchTriggerCommand} from "@memebox/contracts";
import {TwitchLogger} from "./twitch.logger";
import {isAllowedToTrigger} from "./twitch.utils";
import {getCommandsOfTwitchEvent, getLevelOfTags} from "./twitch.functions";
import {AllTwitchEvents} from "./twitch.connector.types";
import {ExampleTwitchCommandsSubject} from "../../shared";
import {ActionQueueEventBus} from "../actions/action-queue-event.bus";
import {convertExtendedToTypeValues, getVariablesListOfAction} from "@memebox/action-variables";
import {uuid} from "@gewd/utils";
import {TwitchQueueEventBus} from "./twitch-queue-event.bus";

@Injectable({
  type: ProviderType.SERVICE,
  scope: ProviderScope.SINGLETON
})
export class TwitchTriggerHandler {
  private cooldownDictionary: Dictionary<number> = {}; // last timestamp of twitch command

  private actionsMap: Dictionary<Action> = {};

  constructor(
    private _twitchConnector: TwitchConnector,
    private _twitchEventBus: TwitchQueueEventBus,
    private _twitchLogger: TwitchLogger,
    @Inject(PERSISTENCE_DI) private _persistence: Persistence,
    private _mediaTriggerEventBus: ActionQueueEventBus
  ) {

    _persistence.dataUpdated$().subscribe(() => {
      this.fillActionMap();
    })

    this.fillActionMap();

    _twitchEventBus
      .AllQueuedEvents$
      .subscribe(twitchEvent => {
        const foundCommandsIterator = getCommandsOfTwitchEvent(
          this._twitchConnector.twitchSettings,
          twitchEvent as AllTwitchEvents
        );

        for (const command of foundCommandsIterator) {
          // todo add the correct twitchevent-types!
          this.handle(command);
        }
      })

    // TODO REFACTOR this Subject
    ExampleTwitchCommandsSubject.subscribe(value => {
      this.handle(value);
    });
  }

  handle(trigger: TwitchTriggerCommand) {
    if (!trigger.command) {
      return;
    }

    this._twitchLogger.log(`Trigger "${trigger.command.name}" Type - ${trigger.command.event}`);

    this._twitchLogger.log({
      message: 'Trigger Tags',
      tags: trigger.tags
    });

    const foundLevels = getLevelOfTags(trigger.tags);

    const isBroadcaster = foundLevels.includes('broadcaster');
    const allowedByRole = isAllowedToTrigger(trigger, foundLevels);


    const cooldownEntry = this.cooldownDictionary[trigger.command.id];
    let allowedByCooldown = cooldownEntry && trigger.command.cooldown
      ? (Date.now() - cooldownEntry) > trigger.command.cooldown
      : true;

    if (!allowedByCooldown && isBroadcaster && trigger.command.canBroadcasterIgnoreCooldown) {
      allowedByCooldown = true;
    }

    const allowedToTrigger = allowedByRole && allowedByCooldown;

    this._twitchLogger.log({
      isBroadcaster,
      foundLevels,
      trigger
    });

    if (!allowedToTrigger) {
      return;
    }

    this.cooldownDictionary[trigger.command.id] = Date.now();

    const action = this.actionsMap[trigger.command.clipId];

    const variablesOfAction = getVariablesListOfAction(action);

    const variableValues: Dictionary<unknown> = {}

    if (trigger.command.extended) {
      for (const actionVariableConfig of variablesOfAction) {
        variableValues[actionVariableConfig.name] = convertExtendedToTypeValues(
          trigger.command.extended[actionVariableConfig.name], actionVariableConfig.type
        )
      }
    }

    this._twitchLogger.log('BEFORE TRIGGER MEDIA BY EVENT BUS');

    this._mediaTriggerEventBus.queueAction({
      id: trigger.command.clipId,
      uniqueId: uuid(),
      targetScreen: trigger.command.screenId,
      origin: TriggerClipOrigin.TwitchEvent,
      originId: trigger.command.id,

      byTwitch: trigger.twitchEvent,

      overrides: {
        action: {
          variables: variableValues
        }
      }
    });
  }

  private fillActionMap() {
    const newMap: Dictionary<Action> = {};

    for (const listClip of this._persistence.listActions()) {
      newMap[listClip.id] = listClip;
    }

    this.actionsMap = newMap;
  }
}
