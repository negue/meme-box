import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsOverviewComponent} from './settings-overview/settings-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {TwitchSettingComponent} from './twitch-setting/twitch-setting.component';
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {TwitchIconComponent} from './svg/twitch-icon/twitch-icon.component';
import {PersistenceActionsComponent} from './persistence-actions/persistence-actions.component';
import {ImportMediaFilesDialogComponent} from './persistence-actions/import-media-files-dialog/import-media-files-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatSelectModule} from "@angular/material/select";

const routes: Routes = [
  {
    path: '',
    component: SettingsOverviewComponent
  }
];

@NgModule({
  declarations: [SettingsOverviewComponent, TwitchSettingComponent, TwitchIconComponent, PersistenceActionsComponent, ImportMediaFilesDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
  ],
})
export class SettingsModule {
}
