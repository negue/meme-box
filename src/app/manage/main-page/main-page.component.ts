import {Component, OnInit} from '@angular/core';
import {AppService} from "@memebox/app-state";
import {HotkeysService} from "@ngneat/hotkeys";
import {DialogService} from "../../shared/dialogs/dialog.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {NotesComponent} from "./notes/notes.component";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  public buttonVisible = true;

  constructor(private appService: AppService,
              private hotkeys: HotkeysService,
              private dialogService: DialogService,
              private _bottomSheet: MatBottomSheet) {
  }

  ngOnInit(): void {
    this.appService.loadState();
    this.hotkeys.addShortcut({ keys: 'f1' })
      .subscribe(e => {
        this.dialogService.showHelpOverview();
      });
  }

  async openNotes() {
    const res = this._bottomSheet.open(NotesComponent, {
      panelClass: 'above-everything'
    });

    this.buttonVisible = false;
    await res.afterDismissed().toPromise();
    this.buttonVisible = true;
  }
}
