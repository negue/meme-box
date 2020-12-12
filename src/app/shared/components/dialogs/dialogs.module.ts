import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogService} from "./dialog.service";
import {MediaEditComponent} from "./media-edit/media-edit.component";
import {ScreenEditComponent} from "./screen-edit/screen-edit.component";
import {MatDialogModule} from "@angular/material/dialog";
import {SimpleConfirmationDialogComponent} from "./simple-confirmation-dialog/simple-confirmation-dialog.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MatSliderModule} from "@angular/material/slider";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {ScreenClipOptionsComponent} from "./screen-clip-options/screen-clip-options.component";
import {MatIconModule} from "@angular/material/icon";
import {PipesModule} from "../../../core/pipes/pipes.module";
import {TwitchEditComponent} from './twitch-edit/twitch-edit.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ClipAssigningDialogComponent} from "./clip-assigning-dialog/clip-assigning-dialog/clip-assigning-dialog.component";
import {FilterModule} from "../filter/filter.module";
import {MatListModule} from "@angular/material/list";
import {ClipTypeModule} from "../clip-type/clip-type.module";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {CompactClipCardModule} from "../compact-clip-card/compact-clip-card.module";
import {ClipPreviewModule} from "../clip-preview/clip-preview.module";
import {HighlightEditorModule} from "@gewd/components/highlight-editor";
import {CustomFormControlModule} from "@gewd/components/custom-form-control";
import {TimedEditComponent} from "./timed-edit/timed-edit.component";
import {DynamicIframeModule} from "../dynamic-iframe/dynamic-iframe.module";
import {DynamicIframeEditComponent} from './dynamic-iframe-edit/dynamic-iframe-edit.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {MarkdownComponent} from './markdown/markdown.component';
import {MarkdownModule} from "@gewd/markdown/module";
import {HelpOverviewComponent} from './help-overview/help-overview.component';

@NgModule({
  declarations: [
    MediaEditComponent,
    ScreenEditComponent,
    SimpleConfirmationDialogComponent,
    ScreenClipOptionsComponent,
    TwitchEditComponent,
    ClipAssigningDialogComponent,
    TimedEditComponent,
    DynamicIframeEditComponent,
    MarkdownComponent,
    HelpOverviewComponent
  ],
  imports: [
    PipesModule,
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    FilterModule,
    MatListModule,
    ClipTypeModule,
    MatCheckboxModule,
    CompactClipCardModule,
    ClipPreviewModule,
    HighlightEditorModule,
    CustomFormControlModule,
    DynamicIframeModule,
    FormsModule,
    MatExpansionModule,
    MarkdownModule,
  ],
  providers: [DialogService],
})
export class DialogsModule {}
