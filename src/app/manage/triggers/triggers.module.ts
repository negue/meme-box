import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EventsOverviewComponent} from './events-overview/events-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {CardOverviewModule} from "../../shared/components/card-overview/card-overview.module";
import {TwitchSettingModule} from "../../shared/components/config-cards/twitch-setting/twitch-setting.module";
import {ClipPreviewModule} from "../../shared/components/clip-preview/clip-preview.module";
import {TimedEventInfoComponent} from "./events-overview/twitch-event-info/timed-event-info.component";
import {TwitchEventInfoComponent} from "./events-overview/timed-event-info/twitch-event-info.component";

const routes: Routes = [
  {
    path: '',
    component: EventsOverviewComponent
  }
];

@NgModule({
  declarations: [EventsOverviewComponent, TimedEventInfoComponent, TwitchEventInfoComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
    CardOverviewModule,
    TwitchSettingModule,
    ClipPreviewModule,
  ]
})
export class TriggersModule {
}
