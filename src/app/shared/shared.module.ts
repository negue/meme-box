import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {PageNotFoundComponent} from './components/';
import {WebviewDirective} from './directives/';
import {FormsModule} from '@angular/forms';
import {SimpleConfirmationDialogComponent} from './components/simple-confirmation-dialog/simple-confirmation-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, SimpleConfirmationDialogComponent],
  imports: [CommonModule, TranslateModule, FormsModule, MatDialogModule, MatButtonModule],
  exports: [TranslateModule, WebviewDirective, FormsModule]
})
export class SharedModule {}
