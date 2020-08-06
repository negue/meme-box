import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, Twitch, TwitchTypesArray} from "@memebox/contracts";
import {AppService} from "../../../../state/app.service";
import {Observable} from "rxjs";
import {AppQueries} from "../../../../state/app.queries";
import {SnackbarService} from "../../../../core/services/snackbar.service";

@Component({
  selector: 'app-edit-twitch-event',
  templateUrl: './edit-twitch-event.component.html',
  styleUrls: ['./edit-twitch-event.component.scss']
})
export class EditTwitchEventComponent implements OnInit {

  public form = new FormBuilder().group({
    name: '',
    id: '',
    screenId: '',
    clipId: '',
    event: '',
    contains: ''
  })

  twitchEvents = TwitchTypesArray;


  clipList$: Observable<Clip[]> = this.appQueries.clipList$;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Twitch,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService,
              private appQueries: AppQueries,
              private snackBar: SnackbarService) {
    this.form.patchValue({
      name: data.name,
      id: data.id,
      screenId: data.screenId,
      clipId: data.clipId,
      event: data.event,
      contains: data.contains
    })
  }

  ngOnInit(): void {

  }

  async save() {
    const {value} = this.form;

    const newTwitchValue = {
      ...this.data,
      ...value
    };

    await this.appService.addOrUpdateTwitchEvent(newTwitchValue);

    // todo refactor "better way?" to trigger those snackbars
    this.snackBar.normal(`Twitch "${newTwitchValue.name}" ${newTwitchValue.id ? 'updated' : 'added'} 🎉`);

    this.dialogRef.close();
  }
}
