import {RecipeCommandBlockRegistry} from "./recipe.types";

/* Command Block Ideas
 *
 * Start a Raid: channel:manage:raids
 * https://dev.twitch.tv/docs/api/reference#start-a-raid
 * Dependency:
 *    Resolve BroadcasterID based on a username
 */

export function registerTwitchCommandBlocks (
  registry: RecipeCommandBlockRegistry
): void {
  registry['twitch:sendMessage'] = {
    pickerLabel: "Send a Chat Message",
    commandGroup: "twitch",
    configArguments: [
      {
        name: "text",
        label: "Message to say",
        type: "textarea"
      }
    ],
    toScriptCode: (step) => {
      const textToSay = step.payload.text as string;

      return `twitch.say('${textToSay}');`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const textToSay = payload.text as string;

      return Promise.resolve('Twitch: Say: '+ textToSay);
    }
  };

  // https://dev.twitch.tv/docs/api/reference#send-chat-announcement
  registry['twitch:sendAnnouncement'] = {
    pickerLabel: "Send a Chat Announcement",
    commandGroup: "twitch",
    configArguments: [
      {
        name: "text",
        label: "Announcement to send",
        type: "textarea"
      },
      {
        name: "color",
        label: "Color of this announcement",
        type: "selectionStatic",
        defaultSelected: 'primary',
        entries: [
          {
            id: 'primary',
            label: 'Primary',

          },
          {
            id: 'blue',
            label: 'Blue',
          },
          {
            id: 'green',
            label: 'Green',
          },
          {
            id: 'orange',
            label: 'Orange',
          },
          {
            id: 'purple',
            label: 'Purple',
          }
        ]
      }
    ],
    toScriptCode: (step) => {
      const textToSay = step.payload.text as string;
      const color = step.payload.color as string;

      return `twitch.sendAnnouncement('${textToSay}','${color}');`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const textToSay = payload.text as string;
      const color = payload.color as string;

      return Promise.resolve(`Twitch: ${color} Announcement: ${textToSay}`);
    }
  };

  // https://dev.twitch.tv/docs/api/reference#delete-chat-messages
  registry['twitch:clearChat'] = {
    pickerLabel: "Clear Chat",
    commandGroup: "twitch",
    configArguments: [],
    toScriptCode: () => {
      return `twitch.clearChat();`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      return Promise.resolve(`Twitch: Clear Chat`);
    }
  };


  // https://dev.twitch.tv/docs/api/reference#start-commercial
  registry['twitch:startCommercial'] = {
    pickerLabel: "Start Commercial",
    commandGroup: "twitch",
    configArguments: [
      {
        name: "length",
        label: "Commercial Length",
        type: "selectionStatic",
        defaultSelected: '30',
        entries: [
          {
            id: '30',
            label: '30 Seconds',
          },
          {
            id: '60',
            label: '60 Seconds',
          },
          {
            id: '90',
            label: '90 Seconds',
          },
          {
            id: '120',
            label: '120 Seconds',
          },
          {
            id: '150',
            label: '150 Seconds',
          },
          {
            id: '180',
            label: '180 Seconds',
          }
        ]
      }
    ],
    toScriptCode: (command) => {
      const length = command.payload.length as string;
      return `twitch.startCommercial(${+length});`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const length = payload.length as string;
      return Promise.resolve(`Twitch: Start Commercial for ${length} Seconds`);
    }
  };

  // https://dev.twitch.tv/docs/api/reference#create-stream-marker
  registry['twitch:createMarker'] = {
    pickerLabel: "Create Marker",
    commandGroup: "twitch",
    configArguments: [],
    toScriptCode: () => {
      return `twitch.createMarker();`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      return Promise.resolve(`Twitch: Create Marker`);
    }
  };

  // https://dev.twitch.tv/docs/api/reference#update-chat-settings
  registry['twitch:changeChatSettings'] = {
    pickerLabel: "Change Chat Settings",
    commandGroup: "twitch",
    configArguments: [
      {
        name: "emote_mode",
        label: "Emote Mode",
        type: "boolean"
      },   {
        name: "follower_mode",
        label: "Follower Mode",
        type: "boolean"
      },   {
        name: "slow_mode",
        label: "Slow Mode",
        type: "boolean"
      },   {
        name: "subscriber_mode",
        label: "Subscriber Mode",
        type: "boolean"
      },   {
        name: "unique_chat_mode",
        label: "Unique Chatter Mode",
        type: "boolean"
      },
    ],
    toScriptCode: (step) => {
      return `twitch.updateChatSettings(${JSON.stringify(step.payload)});`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      return Promise.resolve(`Twitch: Update Chat Settings`);
    }
  };
}
