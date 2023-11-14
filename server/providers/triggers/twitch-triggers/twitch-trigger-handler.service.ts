import {Injectable, ProviderScope, ProviderType} from "@tsed/di";
import {TwitchConnector} from "./twitch.connector";
import {Inject} from "@tsed/common";
import {PERSISTENCE_DI} from "../../contracts";
import {Persistence} from "../../../persistence";
import {
  Action,
  ActionType,
  ConfigSelectionEntry,
  Dictionary,
  TriggerTypeRegistration,
  TwitchTriggerCommand
} from "@memebox/contracts";
import {TwitchLogger} from "../../twitch/twitch.logger";
import {isAllowedToTrigger} from "./twitch.utils";
import {getCommandsOfTwitchEvent, getLevelOfTags} from "./twitch.functions";
import {ActionQueueEventBus} from "../../actions/action-queue-event.bus";
import {TwitchQueueEventBus} from "./twitch-queue-event.bus";
import {uuid} from "@gewd/utils";
import {ScriptHandler} from "../../actions/scripts/script.handler";

// skipcq: JS-0579
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
    private _mediaTriggerEventBus: ActionQueueEventBus,
    private _scriptHandler: ScriptHandler
  ) {
   this.registerTwitchTriggers();


    _persistence.dataUpdated$().subscribe(() => {
      this.fillActionMap();
    })

    this.fillActionMap();

    _twitchEventBus
      .AllQueuedEvents$
      .subscribe(twitchEvent => {
        _twitchLogger.log(twitchEvent);

        const foundCommandsIterator = getCommandsOfTwitchEvent(
          this._twitchConnector.twitchSettings,
          twitchEvent
        );

        for (const command of foundCommandsIterator) {
          // todo add the correct twitchevent-types!
          this.handle(command);
        }
      })
  }

  private registerTwitchTriggers(){
    TriggerTypeRegistration.addTriggerGroup({
      key: 'twitch',
      labels: {
        'en': 'Twitch'
      },
      arguments: [
        {
          type: "number",
          name: 'cooldown',
          labels: {
            'en': 'Cooldown between triggers'
          },
          suffix: 'ms'
        },
        {
          type: "boolean",
          name: 'ignoreBroadcasterCooldown',
          labels: {
            'en': 'Can the Broadcaster ignore cooldown'
          },
        },
      ]
    });


    TriggerTypeRegistration.addTriggerType({

      type: 'twitch.message',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch Chat Message'
      },
      arguments: [
        {
          type: "text",
          name: 'message',
          labels: {
            'en': 'Message text to trigger'
          }
        },
        {
          type: "multipleText",
          name: 'aliasList',
          labels: {
            'en': 'Aliases'
          },
          displayAs: {
            chipInput: true
          }
        },
        {
          type: "selectionMultiple",
          name: 'twitchRoles',
          labels: {
            'en': 'Select Twitch Roles'
          },
          displayAs: {
            checkboxes: true
          },
          getEntries(): Promise<ConfigSelectionEntry[]> {
            return Promise.resolve([]);
          }
        },
      ]
    })

    TriggerTypeRegistration.addTriggerType({

      type: 'twitch.cheer',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch Bits / Cheer'
      },
      arguments: [
        {
          type: "number",
          name: 'min_bits',
          labels: {
            'en': 'Bits Min. Amount'
          }
        },
        {
          type: "number",
          name: 'max_bits',
          labels: {
            'en': 'Bits Max. Amount'
          }
        }
      ]
    })

    TriggerTypeRegistration.addTriggerType({
      type: 'twitch.raid',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch Raid'
      },
      arguments: [
        {
          type: "number",
          name: 'min_viewer',
          labels: {
            'en': 'Viewer Min. Amount'
          }
        },
        {
          type: "number",
          name: 'max_viewer',
          labels: {
            'en': 'Viewer Max. Amount'
          }
        }
      ]
    })

    TriggerTypeRegistration.addTriggerType({
      type: 'twitch.sub',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch Subscription'
      },
      arguments: []
    })

    TriggerTypeRegistration.addTriggerType({
      type: 'twitch.giftsub',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch Gift Sub'
      },
      arguments: []
    })

    TriggerTypeRegistration.addTriggerType({
      type: 'twitch.ban',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch User Ban'
      },
      arguments: []
    })

    TriggerTypeRegistration.addTriggerType({
      type: 'twitch.channelpoint',
      groupKey: 'twitch',
      labels: {
        'en': 'Twitch Channel Point Redemption'
      },
      arguments: [
        {
          type: "selectionSingle",
          name: 'channelPointId',
          labels: {
            'en': 'Select Twitch Roles'
          },
          getEntries(): Promise<ConfigSelectionEntry[]> {
            return Promise.resolve([]);
          }
        },
      ]
    })
  }

  handle(trigger: TwitchTriggerCommand): void  {
    this._twitchLogger.log(`Trigger "${trigger.config.label}" Type - ${trigger.config.type}`);

    this._twitchLogger.log({
      message: 'Trigger Tags',
      tags: trigger.tags
    });

    const foundLevels = getLevelOfTags(trigger.tags);

    const isBroadcaster = foundLevels.includes('broadcaster');

    const allowedByRole = trigger.config.type !== 'twitch.message' || isAllowedToTrigger(trigger.config, foundLevels);

    const cooldownEntry = this.cooldownDictionary[trigger.config.id];
    let allowedByCooldown = cooldownEntry && trigger.config.argumentValues.cooldown
      ? (Date.now() - cooldownEntry) > trigger.config.argumentValues.cooldown
      : true;

    if (!allowedByCooldown && isBroadcaster && trigger.config.argumentValues.ignoreBroadcasterCooldown) {
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

    this.cooldownDictionary[trigger.config.id] = Date.now();

    this._twitchLogger.log('BEFORE TRIGGER MEDIA BY EVENT BUS');

    if (trigger.config.recipe) {
      this._scriptHandler.handleRecipe({
        name: 'TODO Twitch Trigger',
        type: ActionType.Recipe,
        recipe: trigger.config.recipe,
        id: trigger.config.id
      }, {
        id: trigger.config.id,
        uniqueId: uuid(),
        byTwitch: trigger.twitchEvent
      })
    }
  }

  private fillActionMap() {
    const newMap: Dictionary<Action> = {};

    for (const listClip of this._persistence.listActions()) {
      newMap[listClip.id] = listClip;
    }

    this.actionsMap = newMap;
  }
}
