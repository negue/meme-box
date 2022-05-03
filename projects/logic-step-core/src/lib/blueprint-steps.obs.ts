import {BlueprintRegistry, BlueprintStepConfigObsSetFilterStatePayload, generateCodeByStep} from "./blueprint.types";
import {uuid} from "@gewd/utils";

export function registerObsSteps (
  registry: BlueprintRegistry,
  generateCodeByStep: generateCodeByStep
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
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: obsSwitchSceneType,
        payload,
        entryType: "step",
        subSteps: [],
      };
    },
    toScriptCode: (step, context) => {
      const scenePayload = step.payload.scene as string;

      return `obs.switchToScene('${scenePayload}');`;
    },
    stepEntryLabelAsync: async (queries, payload, parentStep) => {
      const scenePayload = payload.scene as string;

      return 'OBS: switch scene: '+ scenePayload;
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
    generateBlueprintStep: (payload) => {
      return {
        id: uuid(),
        stepType: obsSetFilterState,
        payload,
        entryType: "step",
        subSteps: [],
      };
    },
    toScriptCode: (step, context) => {
      const filterPayload = step.payload.filter as BlueprintStepConfigObsSetFilterStatePayload;
      const enabled = step.payload.enabled as boolean;

      return `obs.getFilter('${filterPayload.sourceName}', '${filterPayload.filterName}')
                 .updateEnabled(${enabled});`;
    },
    stepEntryLabelAsync: async (queries, payload, parentStep) => {
      const filterPayload = payload.filter as BlueprintStepConfigObsSetFilterStatePayload;
      const enabled = payload.enabled as boolean;

      return `OBS: setting Filter: ${filterPayload.filterName} to ${enabled}`;
    }
  };
}
