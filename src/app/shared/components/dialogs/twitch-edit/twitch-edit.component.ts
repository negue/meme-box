import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Observable, Subject} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Clip, Twitch, TwitchEventTypes, TwitchTypesArray} from "@memebox/contracts";
import {AppService} from "../../../../state/app.service";
import {AppQueries} from "../../../../state/app.queries";
import {SnackbarService} from "../../../../core/services/snackbar.service";

// TODO better class/interface name?
const INITIAL_TWITCH: Partial<Twitch> = {
  name: '',
  event: TwitchEventTypes.message,
  contains: '',
  active: true
};

@Component({
  selector: 'app-twitch-edit',
  templateUrl: './twitch-edit.component.html',
  styleUrls: ['./twitch-edit.component.scss']
})
export class TwitchEditComponent implements OnInit, OnDestroy {
  public form = new FormBuilder().group({
    id: "",
    name: "",
    event: "",
    clipId: "",
    contains: "",
  });

  twitchEvents = TwitchTypesArray;


  clipList$: Observable<Clip[]> = this.appQuery.clipList$;


  private _destroy$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Twitch,
    private dialogRef: MatDialogRef<any>,
    private appService: AppService,
    private appQuery: AppQueries,
    private snackBar: SnackbarService
  ) {
    this.data = this.data ?? (INITIAL_TWITCH as any);
    console.info({data: this.data});
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }


    const {value} = this.form;

    const newTwitchValue = {
      ...this.data,
      ...value
    };

    console.info(newTwitchValue);
    await this.appService.addOrUpdateTwitchEvent(newTwitchValue);

    // todo refactor "better way?" to trigger those snackbars
    this.snackBar.normal(`Twitch "${newTwitchValue.name}" ${newTwitchValue.id ? 'updated' : 'added'}`);

    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.form.reset(this.data);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
