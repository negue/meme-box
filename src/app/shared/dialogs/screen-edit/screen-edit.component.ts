import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Screen} from "@memebox/contracts";
import {UntypedFormBuilder} from "@angular/forms";
import {AppService, SnackbarService} from "@memebox/app-state";
import {cssCodemirror} from "../../../core/codemirror.extensions";

@Component({
  selector: 'app-obs-edit',
  templateUrl: './screen-edit.component.html',
  styleUrls: ['./screen-edit.component.scss']
})
export class ScreenEditComponent implements OnInit {

  public form = new UntypedFormBuilder().group({
    name: '',
    id: '',
    customCss: '',
    height: 0,
    width: 0
  })

  public cssExtensions = cssCodemirror;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Screen,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService,
              private snackBar: SnackbarService) {

  }

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.name,
      id: this.data.id,
      customCss: this.data.customCss,
      height: this.data.height || 1080,
      width: this.data.width || 1920
    });

    console.info({ data: this.data });
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const {value} = this.form;

    const newScreenValue = {
      ...this.data,
      ...value
    };

    await this.appService.addOrUpdateScreen(newScreenValue);

    // todo refactor "better way?" to trigger those snackbars
    this.snackBar.normal(`Screen "${newScreenValue.name}" ${newScreenValue.id ? 'updated' : 'added'}`);

    this.dialogRef.close();
  }
}
