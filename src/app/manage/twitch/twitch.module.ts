import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EventsOverviewComponent} from './events-overview/events-overview.component';
import {EventInfoComponent} from './events-overview/event-info/event-info.component';
import {RouterModule, Routes} from "@angular/router";
import {AddEventComponent} from './events-overview/add-event/add-event.component';
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";


const routes: Routes = [
  {
    path: '',
    component: EventsOverviewComponent
  }
];

@NgModule({
  declarations: [EventsOverviewComponent, EventInfoComponent, AddEventComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
  ]
})
export class TwitchModule {
}
