import {Component, OnInit} from '@angular/core';
import {AppService} from "../../../../projects/app-state/src/lib/state/app.service";
import {HotkeysService} from "@ngneat/hotkeys";
import {DialogService} from "../../shared/dialogs/dialog.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(private appService: AppService,
              private hotkeys: HotkeysService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.appService.loadState();
    this.hotkeys.addShortcut({ keys: 'f1' })
      .subscribe(e => {
        this.dialogService.showHelpOverview();
      });
  }

}
