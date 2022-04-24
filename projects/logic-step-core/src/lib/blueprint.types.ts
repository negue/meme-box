/*blueprint:
  - step of type (which is unique)
for example "trigger action while"
=> will be able to call other steps
subSteps*/

import { uuid } from "@gewd/utils";

export interface BlueprintSubStepInfo {
  name: string; // property to save the subSteps
  label: string; // to show in the UI
  entries: string[];
}

export interface BlueprintStepInfo {
  stepType: string; // unique name of this step
  label: string;
}

// at some point custom controls/ui for each stepInfo could be shown

export interface BlueprintEntryBase {
  id: string;
  awaited?: boolean;
  subSteps: {
    label: string;
    entries: string[]  // entryId
  }[];
}

export interface BlueprintEntryStepCall extends BlueprintEntryBase {
  entryType: 'step';
  stepType: string; // connection to BlueprintStepInfo
  payload: {[prop: string]: unknown};
}

export interface BlueprintEntryStepGroup extends BlueprintEntryBase {
  entryType: 'group';
}

export interface BlueprintEntryStepFunction extends BlueprintEntryBase {
  entryType: 'function';
  functionName: string;
}

export type BlueprintEntry = BlueprintEntryStepCall | BlueprintEntryStepGroup | BlueprintEntryStepFunction;

// Blueprint
// => entries
//     => step or group
//         => step to call

export interface Blueprint {
  entries: BlueprintEntry[];
}

export interface BlueprintContext {
  rootEntry: string;
  entries: {[entryId: string]: BlueprintEntry}
}


export function createBlueprintContext (): BlueprintContext {
  const rootId = uuid();

  return {
    rootEntry: rootId,
    entries: {
      [rootId]: {
        id: rootId,
        entryType: "group",
        awaited: false,
        subSteps: [
          {
            label: 'Blueprint',
            entries: []
          }
        ]
      }
    }
  };
}
