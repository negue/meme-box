import {BlueprintRegistry, BlueprintStepConfigObsSetFilterStatePayload} from "./blueprint.types";

export function registerObsCommandBlocks (
  registry: BlueprintRegistry
): void {
  const obsSwitchSceneType = "obs:switchScene";

  registry[obsSwitchSceneType] = {
    pickerLabel: "Switch Scene",
    stepGroup: "obs",
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
    stepEntryLabelAsync: (queries, payload) => {
      const scenePayload = payload.scene as string;

      return Promise.resolve('OBS: switch scene: '+ scenePayload);
    }
  };

  const obsSetFilterState = "obs:setFilterState";

  registry[obsSetFilterState] = {
    pickerLabel: "Set Filter State",
    stepGroup: "obs",
    configArguments: [
      {
        name: "filter",
        label: "Select a Filter",
        type: "obs:filter"
      },
      {
        name: "enabled",
        label: "Set filter state",
        type: "boolean"
      }
    ],
    toScriptCode: (step) => {
      const filterPayload = step.payload.filter as BlueprintStepConfigObsSetFilterStatePayload;
      const enabled = step.payload.enabled as boolean;

      return `obs.getFilter('${filterPayload.sourceName}', '${filterPayload.filterName}')
                 .updateEnabled(${enabled});`;
    },
    stepEntryLabelAsync: (queries, payload) => {
      const filterPayload = payload.filter as BlueprintStepConfigObsSetFilterStatePayload;
      const enabled = payload.enabled as boolean;

      return Promise.resolve(`OBS: setting Filter: ${filterPayload.filterName} to ${enabled}`);
    }
  };

  const obsSendRaw = "obs:sendRaw";

  registry[obsSendRaw] = {
    pickerLabel: "Send Raw Request",
    stepGroup: "obs",
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
    stepEntryLabelAsync: (queries, payload) => {
      const obsCommand = payload.command as string;

      return Promise.resolve(`OBS: send raw: ${obsCommand}`);
    }
  };
}
