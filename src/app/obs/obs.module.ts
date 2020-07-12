import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ObsOverviewComponent} from './obs-overview/obs-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {ObsInfoComponent} from './obs-overview/obs-info/obs-info.component';
import {ObsEditComponent} from './obs-overview/obs-edit/obs-edit.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


const routes: Routes = [
  {
    path: '',
    component: ObsOverviewComponent
  }
];


@NgModule({
  declarations: [ObsOverviewComponent, ObsInfoComponent, ObsEditComponent],
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
    ReactiveFormsModule
  ]
})
export class ObsModule { }
