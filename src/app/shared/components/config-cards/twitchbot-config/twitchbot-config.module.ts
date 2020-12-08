import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { TwitchbotConfigComponent } from './twitchbot-config.component';
import { MatTabsModule } from '@angular/material/tabs';



@NgModule({
  declarations: [TwitchbotConfigComponent],
  exports: [
    TwitchbotConfigComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule
  ]
})
export class TwitchbotConfigModule { }
