import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Screen} from "@memebox/contracts";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";

@Component({
  selector: 'app-obs-edit',
  templateUrl: './screen-edit.component.html',
  styleUrls: ['./screen-edit.component.css']
})
export class ScreenEditComponent implements OnInit {

  public form = new FormBuilder().group({
    name: '',
    id: ''
  })

  constructor(@Inject(MAT_DIALOG_DATA) public data: Screen,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService) {
    this.form.patchValue({
      name: data.name,
      id: data.id
    })
  }

  ngOnInit(): void {
    this.form.reset(this.data);
  }

  async save() {
    const {value} = this.form;

    await this.appService.addOrUpdateScreen(value);

    this.dialogRef.close();
  }
}
