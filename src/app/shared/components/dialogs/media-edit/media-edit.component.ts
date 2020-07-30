import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, MediaType} from "@memebox/contracts";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {AppService} from "../../../../state/app.service";
import {MatSnackBar} from "@angular/material/snack-bar";

const INITIAL_CLIP: Partial<Clip> = {
  type: MediaType.Picture,
  name: 'Your Clip Name',
  volumeSetting: 10
}

@Component({
  selector: 'app-media-edit',
  templateUrl: './media-edit.component.html',
  styleUrls: ['./media-edit.component.scss']
})
export class MediaEditComponent implements OnInit {

  public form = new FormBuilder().group({
    id: '',
    name: '',
    type: 0,
    volumeSetting: 0,
    clipLength: 0,
    playLength: new FormControl(0, [Validators.required]),
    path: '',
    previewUrl: '',
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Clip,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService,
              private snackBar: MatSnackBar) {
    this.data = this.data ?? INITIAL_CLIP as any;
  }

  ngOnInit(): void {
    this.form.reset(this.data);
  }

  async save() {
    const {value} = this.form;

    if (this.form.valid) {
      await this.appService.addOrUpdateClip(value);

      this.snackBar.open(`Clip "${value.name}"  ${value.id ? 'updated' : 'added' } 🎉`);

      this.dialogRef.close();
    } else {
      // highlight hack
      this.form.markAllAsTouched();
    }
  }
}
