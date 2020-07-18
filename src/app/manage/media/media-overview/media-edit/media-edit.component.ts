import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip} from "@memebox/contracts";
import {FormBuilder} from "@angular/forms";
import {AppService} from "../../../../state/app.service";

@Component({
  selector: 'app-media-edit',
  templateUrl: './media-edit.component.html',
  styleUrls: ['./media-edit.component.css']
})
export class MediaEditComponent implements OnInit {

  public form = new FormBuilder().group({
    id: '',
    name: '',
    type: 0,
    volumeSetting: 0,
    clipLength: 0,
    playLength: 0,
    path: '',
    previewUrl: '',
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Clip,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService) { }

  ngOnInit(): void {
    this.form.reset(this.data);
  }

  async save() {
    const {value} = this.form;

    await this.appService.addOrUpdateClip(value);

    this.dialogRef.close();
  }
}
