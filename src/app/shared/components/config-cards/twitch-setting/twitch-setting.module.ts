import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TwitchSettingComponent} from "./twitch-setting.component";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ConfigCardModule} from "../config-card/config-card.module";


@NgModule({
  declarations: [TwitchSettingComponent],
  exports: [
    TwitchSettingComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    ConfigCardModule
  ]
})
export class TwitchSettingModule { }
