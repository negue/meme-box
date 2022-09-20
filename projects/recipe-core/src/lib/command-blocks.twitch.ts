import {RecipeCommandBlockRegistry} from "./recipe.types";

/*
 * Announcements: moderator:manage:announcements
 * https://dev.twitch.tv/docs/api/reference#send-chat-announcement
 *
 * Clear chat: moderator:manage:chat_messages
 * https://dev.twitch.tv/docs/api/reference#delete-chat-messages
 *
 * Start Commercial: channel:edit:commercial
 * https://dev.twitch.tv/docs/api/reference#start-commercial
 *
 * Start a Raid: channel:manage:raids
 * https://dev.twitch.tv/docs/api/reference#start-a-raid
 *
 * Create Stream Marker: channel:manage:broadcast
 * https://dev.twitch.tv/docs/api/reference#create-stream-marker
 *
 * Chat Settings: moderator:manage:chat_settings
 * https://dev.twitch.tv/docs/api/reference#update-chat-settings
 * Slow, Sub only, Follower only, unique
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
}
