import {RecipeCommandBlockRegistry, RecipeCommandConfigObsSetFilterStatePayload} from "./recipe.types";

/*
 *
 * Set Volume: SetVolume
 *
 * Mute Source: SetMute
 *
 */

export function registerObsCommandBlocks (
  registry: RecipeCommandBlockRegistry
): void {
  const obsSwitchSceneType = "obs:switchScene";

  registry[obsSwitchSceneType] = {
    pickerLabel: "Switch Scene",
    commandGroup: "obs",
    configArguments: [
      {
        name: "scene",
        label: "Scene to switch to",
        type: "obs:scene"
      }
    ],
    toScriptCode: (step) => {
      const scenePayload = step.payload.scene as string;

      return `obs.switchToScene('${scenePayload}');`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const scenePayload = payload.scene as string;

      return Promise.resolve('OBS: switch scene: '+ scenePayload);
    }
  };

  const obsSetSourceVisibilityType = "obs:setSourceVisibility";

  registry[obsSetSourceVisibilityType] = {
    pickerLabel: "Set Source Visibility",
    commandGroup: "obs",
    configArguments: [
      {
        name: "sourceName",
        label: "Source to change the visibility",
        type: "obs:source"
      },
      {
        name: "visible",
        label: "Visible",
        type: "boolean"
      }

    ],
    toScriptCode: (step) => {
      const scenePayload = step.payload.sourceName as string;

      return `obs.setSourceVisibility('${scenePayload}', ${step.payload.visible});`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const sourceName = payload.sourceName as string;

      return Promise.resolve(`OBS: ${payload.visible ? 'show' : 'hide'} [${sourceName}] Source`);
    }
  };

  const obsSetFilterState = "obs:setFilterState";

  registry[obsSetFilterState] = {
    pickerLabel: "Set Filter State",
    commandGroup: "obs",
    configArguments: [
      {
        name: "filter",
        label: "Select a Filter",
        type: "obs:filter"
      },
      {
        name: "enabled",
        label: "Enabled",
        type: "boolean"
      }
    ],
    toScriptCode: (step) => {
      const filterPayload = step.payload.filter as RecipeCommandConfigObsSetFilterStatePayload;
      const enabled = step.payload.enabled as boolean;

      return `obs.getFilter('${filterPayload.sourceName}', '${filterPayload.filterName}')
                 .updateEnabled(${enabled});`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const filterPayload = payload.filter as RecipeCommandConfigObsSetFilterStatePayload;
      const enabled = payload.enabled as boolean;

      return Promise.resolve(`OBS: ${enabled ? 'enable' : 'disable'}  [${filterPayload.filterName}] Filter`);
    }
  };

  const obsSendRaw = "obs:sendRaw";

  registry[obsSendRaw] = {
    pickerLabel: "Send Raw Request (OBS WS v4)",
    commandGroup: "obs",
    configArguments: [
      {
        name: "command",
        label: "Command",
        type: "text"
      },
      {
        name: "obsPayload",
        label: "Payload",
        type: "textarea"
      }
    ],
    toScriptCode: (step) => {
      const obsCommand = step.payload.command as string;
      const obsPayload = step.payload.obsPayload as string;

      return `obs.raw.send('${obsCommand}', ${obsPayload})`;
    },
    commandEntryLabelAsync: (queries, payload) => {
      const obsCommand = payload.command as string;

      return Promise.resolve(`OBS: send raw: ${obsCommand}`);
    }
  };
}
