import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppQueries, AppService, MemeboxWebsocketService, SnackbarService} from "@memebox/app-state";
import {HotkeysService} from "@ngneat/hotkeys";
import {DialogService} from "../../shared/dialogs/dialog.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {NotesComponent} from "./notes/notes.component";
import {WebsocketHandler} from "../../../../projects/app-state/src/lib/services/websocket.handler";
import {AppConfig} from "@memebox/app/env";
import {WEBSOCKET_PATHS} from "@memebox/contracts";
import {Subject} from "rxjs";
import {filter, take, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject();

  private errorWS = new WebsocketHandler(
    AppConfig.wsBase + WEBSOCKET_PATHS.ERRORS,
    3000
  );

  public buttonVisible = true;

  constructor(private appService: AppService,
              private appQuery: AppQueries,
              private hotkeys: HotkeysService,
              private dialogService: DialogService,
              private _bottomSheet: MatBottomSheet,
              private _snackbarService: SnackbarService,
              private _memeboxWebsocket: MemeboxWebsocketService) {

  }

  async ngOnInit(): Promise<void> {
    this.appService.loadState();
    this.hotkeys.addShortcut({ keys: 'f1' })
      .subscribe(e => {
        this.dialogService.showHelpOverview();
      });

    this.errorWS.onMessage$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(newestError => {
      this._snackbarService.sorry(newestError, {
        config: {
          duration: 10000
        }
      });
    });

    this.appQuery.state$
      .pipe(
        filter(state => state.version > 0),
        take(1)
      )
      .subscribe(state => {
        const isItANewInstance = Object.keys(state.clips).length === 0
          && Object.keys(state.screen).length === 0
          && !state.config.twitch.channel.trim();


        if (isItANewInstance) {
          this.dialogService.showGettingStarted(null);
        }
      } );

    this.errorWS.connect();

    await this._memeboxWebsocket.isReady();
    this._memeboxWebsocket.sendI_Am_MANAGE();
  }

  async openNotes() {
    const res = this._bottomSheet.open(NotesComponent, {
      panelClass: 'above-everything'
    });

    this.buttonVisible = false;
    await res.afterDismissed().toPromise();
    this.buttonVisible = true;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.errorWS.stopReconnects();
  }
}
