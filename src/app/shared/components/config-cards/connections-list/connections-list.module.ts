import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConnectionsListComponent} from './connections-list.component';
import {MatListModule} from "@angular/material/list";
import {ConfigCardModule} from "../config-card/config-card.module";
import {TranslocoModule} from "@ngneat/transloco";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {KeyValuePipe} from './mykeyvalue.pipe';


@NgModule({
  declarations: [
    ConnectionsListComponent,
    KeyValuePipe
  ],
  exports: [
    ConnectionsListComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    ConfigCardModule,
    TranslocoModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ]
})
export class ConnectionsListModule { }
