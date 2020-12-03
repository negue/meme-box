import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {TestComponent} from "./test/test.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {CustomFormControlModule} from "@gewd/components/custom-form-control";
import {HighlightEditorModule} from "@gewd/components/highlight-editor";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {DynamicIframeModule} from "../shared/components/dynamic-iframe/dynamic-iframe.module";

const routes: Routes = [
  {
    path: '',
    component: TestComponent,
  },
];

@NgModule({
  declarations: [TestComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
    MatFormFieldModule,
    CustomFormControlModule,
    HighlightEditorModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    DynamicIframeModule,
  ]
})
export class TestpageModule { }
