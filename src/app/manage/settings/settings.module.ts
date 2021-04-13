import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsOverviewComponent} from './settings-overview/settings-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {PersistenceActionsComponent} from './persistence-actions/persistence-actions.component';
import {ImportMediaFilesDialogComponent} from './persistence-actions/import-media-files-dialog/import-media-files-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatSelectModule} from "@angular/material/select";
import {CardOverviewModule} from "../../shared/components/card-overview/card-overview.module";
import {TwitchSettingModule} from "../../shared/components/config-cards/twitch-setting/twitch-setting.module";
import {TwitchbotConfigModule} from '../../shared/components/config-cards/twitchbot-config/twitchbot-config.module';
import {VersionCardModule} from "../../shared/components/config-cards/version-card/version-card.module";
import {CustomPortSettingModule} from "../../shared/components/config-cards/custom-port-setting/custom-port-setting.module";

const routes: Routes = [
  {
    path: '',
    component: SettingsOverviewComponent
  }
];

@NgModule({
  declarations: [SettingsOverviewComponent, PersistenceActionsComponent, ImportMediaFilesDialogComponent],
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
    CardOverviewModule,
    TwitchSettingModule,
    TwitchbotConfigModule,
    VersionCardModule,
    CustomPortSettingModule,
  ],
})
export class SettingsModule {
}
