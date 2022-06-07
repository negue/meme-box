import {RecipeCommandBlockRegistry} from "./recipe.types";

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
