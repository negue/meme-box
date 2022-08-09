import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OpenActionSettingsButtonComponent} from './open-action-settings-button.component';
import {MatButtonModule} from "@angular/material/button";
import {ActionTypeIconModule} from "@memebox/state-components";


@NgModule({
  declarations: [
    OpenActionSettingsButtonComponent
  ],
  exports: [
    OpenActionSettingsButtonComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    ActionTypeIconModule
  ]
})
export class OpenActionSettingsButtonModule { }
