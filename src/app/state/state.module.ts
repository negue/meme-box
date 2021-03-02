import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from "@angular/common/http";
import { AppService } from "./app.service";
import { AppQueries } from "./app.queries";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    AppService,
    AppQueries
  ]
})
export class StateModule {
}
