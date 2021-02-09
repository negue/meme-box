import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Screen} from "@memebox/contracts";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {SnackbarService} from "../../../../core/services/snackbar.service";

@Component({
  selector: 'app-obs-edit',
  templateUrl: './screen-edit.component.html',
  styleUrls: ['./screen-edit.component.scss']
})
export class ScreenEditComponent implements OnInit {

  public form = new FormBuilder().group({
    name: '',
    id: '',
    customCss: '',
    height: 1080,
    width: 1920
  })

  constructor(@Inject(MAT_DIALOG_DATA) public data: Screen,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService,
              private snackBar: SnackbarService) {
    this.form.patchValue({
      name: data.name,
      id: data.id,
      customCss: data.customCss,
      height: data.height,
      width: data.width
    })
  }

  ngOnInit(): void {
    this.form.reset(this.data);
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
