import { Pipe, PipeTransform } from '@angular/core';
import { BlueprintEntry, BlueprintStepInfo, BlueprintStepRegistry } from "@memebox/recipe-core";
import { AppQueries } from "@memebox/app-state";

@Pipe({
  name: 'getEntryStepMetaData$'
})
export class GetEntryStepMetaDataPipe implements PipeTransform {

  constructor (
    private appQueries: AppQueries
  ) {
  }

  async transform(value: BlueprintEntry, parentEntry: BlueprintEntry): Promise<BlueprintStepInfo|null> {
    if (value.entryType !== 'step') {
      return  Promise.resolve(null)
    }

    const blueprintRegistryEntry = BlueprintStepRegistry[value.stepType];

    const entryLabel = await blueprintRegistryEntry.stepEntryLabelAsync(this.appQueries, value.payload, parentEntry);

    return {
      stepType: value.stepType,
      label: entryLabel,
    };
  }

}
