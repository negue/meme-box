/*blueprint:
  - step of type (which is unique)
for example "trigger action while"
=> will be able to call other steps
subSteps*/

export interface BlueprintSubStepInfo {
  name: string; // property to save the subSteps
  label: string; // to show in the UI
}

export interface BlueprintStepInfo {
  name: string; // unique name of this step
  label: string;
  hasSubSteps: BlueprintSubStepInfo[]; // different types of steps to show
}

// at some point custom controls/ui for each stepInfo could be shown

export interface BlueprintEntryBase {
  subSteps: {[key: string]: BlueprintEntry[]}
}

export interface BlueprintEntryStepCall extends BlueprintEntryBase {
  type: 'step';
  stepName: string; // connection to BlueprintStepInfo
  payload: unknown;
}

export interface BlueprintEntryStepGroup extends BlueprintEntryBase {
  type: 'group';
  awaited: boolean; // really needed?
}

export interface BlueprintEntryStepFunction extends BlueprintEntryBase {
  type: 'function';
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
