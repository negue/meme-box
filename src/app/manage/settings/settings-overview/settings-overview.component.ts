import { Component, OnInit } from '@angular/core';
import {ConfigMediaPathComponent} from "../../media/media-overview/config-media-path/config-media-path.component";
import {Observable} from "rxjs";
import {Config} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {DialogService} from "../../../shared/components/dialogs/dialog.service";
import {AppQueries} from "../../../state/app.queries";

@Component({
  selector: 'app-settings-overview',
  templateUrl: './settings-overview.component.html',
  styleUrls: ['./settings-overview.component.scss']
})
export class SettingsOverviewComponent implements OnInit {
  public config$: Observable<Partial<Config>> = this.query.config$;

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService) { }

  ngOnInit(): void {
  }

  openMediaFolderDialog(): void {
    this._dialog.open(ConfigMediaPathComponent, {
      data: {}
    });
  }

  openMediaFolderExplorer(): void {
    this.service.openMediaFolder();
  }
}
