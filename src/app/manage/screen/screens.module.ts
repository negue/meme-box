import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScreenOverviewComponent} from "./screen-overview/screen-overview.component";
import {ScreenInfoComponent} from "./screen-overview/screen-info/screen-info.component";
import {ClipAssigningDialogModule} from "./screen-overview/clip-assigning-dialog/clip-assigning-dialog.module";
import {ClipTypeModule} from "../../shared/components/clip-type/clip-type.module";
import {GettingStartedModule} from "../../shared/components/getting-started/getting-started.module";
import { StyleguideModule } from '../../shared/styleguide/styleguide.module';


const routes: Routes = [
  {
    path: '',
    component: ScreenOverviewComponent
  }
];


@NgModule({
  // todo finish renaming
  declarations: [ScreenOverviewComponent, ScreenInfoComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatListModule,
        MatInputModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        ClipAssigningDialogModule,
        ClipTypeModule,
        GettingStartedModule,
        StyleguideModule,
    ],
})
export class ScreensModule {
}
