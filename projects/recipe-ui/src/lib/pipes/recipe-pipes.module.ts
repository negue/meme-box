import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GetEntryStepActionListPipe} from "./get-entry-step-action-list.pipe";
import {GetEntryStepMetaDataPipe} from "./get-entry-step-meta-data.pipe";
import {GetEntrySubBlockInfoArrayPipe} from "./get-entry-sub-block-info.pipe";
import {IsCommandEntryPipe} from "./isCommandEntry.pipe";
import {GetActionsByActionListPipe} from "./get-actions-by-action-list.pipe";

const PIPES = [
  GetEntryStepActionListPipe,
  GetEntryStepMetaDataPipe,
  GetEntrySubBlockInfoArrayPipe,
  IsCommandEntryPipe,
  GetActionsByActionListPipe
];

@NgModule({
  declarations: [
    ...PIPES
  ],
  exports: [
    ...PIPES
  ],
  providers: [
    ...PIPES
  ],
  imports: [
    CommonModule
  ]
})
export class RecipePipesModule { }
