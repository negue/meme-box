import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";



@NgModule({
  declarations: [NavigationComponent],
  exports: [
    NavigationComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    RouterModule
  ]
})
export class NavigationModule { }
