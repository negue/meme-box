import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionShortcutToolbarComponent} from './action-shortcut-toolbar.component';
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [
    ActionShortcutToolbarComponent
  ],
  exports: [
    ActionShortcutToolbarComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule
  ]
})
export class ActionShortcutToolbarModule { }
