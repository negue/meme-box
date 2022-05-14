import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionScreenListPipe} from './action-screen-list.pipe';


@NgModule({
  declarations: [
    ActionScreenListPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ActionScreenListPipe
  ]
})
export class StateBasedPipesModule { }
