import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MediaOverviewComponent} from './media-overview/media-overview.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MediaInfoComponent} from './media-overview/media-info/media-info.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSliderModule} from "@angular/material/slider";
import {ReactiveFormsModule} from "@angular/forms";
import {MatDividerModule} from "@angular/material/divider";
import {ClipTypeModule} from "../../shared/components/clip-type/clip-type.module";
import {MatListModule} from "@angular/material/list";
import {GettingStartedModule} from "../../shared/components/getting-started/getting-started.module";
import {ConfigMediaPathModule} from "./media-overview/config-media-path/config-media-path.module";
import {MatChipsModule} from "@angular/material/chips";
import {PipesModule} from "../../core/pipes/pipes.module";
import {CardOverviewModule} from "../../shared/components/card-overview/card-overview.module";
import {FilterModule} from "../../shared/components/filter/filter.module";
import {ClipChipsListModule} from "../../shared/components/clip-chips-list/clip-chips-list.module";

const routes: Routes = [
  {
    path: "",
    component: MediaOverviewComponent,
  },
];

@NgModule({
  declarations: [MediaOverviewComponent, MediaInfoComponent],
  exports: [MediaOverviewComponent],
  imports: [
    PipesModule,
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
    ClipTypeModule,
    MatListModule,
    GettingStartedModule,
    ConfigMediaPathModule,
    MatChipsModule,
    CardOverviewModule,
    FilterModule,
    ClipChipsListModule,
  ]
})
export class MediaModule {}
