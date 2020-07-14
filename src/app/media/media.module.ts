import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MediaOverviewComponent} from './media-overview/media-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MediaInfoComponent} from './media-overview/media-info/media-info.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MediaTypePipe} from './media-overview/media-info/media-type.pipe';
import {MediaEditComponent} from './media-overview/media-edit/media-edit.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSliderModule} from "@angular/material/slider";
import {ReactiveFormsModule} from "@angular/forms";
import {MatDividerModule} from "@angular/material/divider";
import {ClipAssigningDialogModule} from "./media-overview/clip-assigning-dialog/clip-assigning-dialog.module";

const routes: Routes = [
  {
    path: '',
    component: MediaOverviewComponent
  }
];


@NgModule({
  declarations: [MediaOverviewComponent, MediaInfoComponent, MediaTypePipe, MediaEditComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    ReactiveFormsModule,
    MatDividerModule,
    ClipAssigningDialogModule,
  ]
})
export class MediaModule { }
