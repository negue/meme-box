import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GettingStartedComponent} from './getting-started.component';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
  declarations: [GettingStartedComponent],
  exports: [
    GettingStartedComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class GettingStartedModule {
}
