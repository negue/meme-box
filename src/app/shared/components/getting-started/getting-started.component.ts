import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Clip, Screen} from "@memebox/contracts";
import {AppQueries} from "../../../state/app.queries";
import {DialogService} from "../../dialogs/dialog.service";
import {ConfigMediaPathComponent} from "../../../manage/media/media-overview/config-media-path/config-media-path.component";
import {map} from "rxjs/operators";
import {ConfigService} from "../../../state/config.service";

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {
  public mediaList$: Observable<Clip[]> = this.query.clipList$;

  public screenList$: Observable<Screen[]> = this.query.screensList$
  public inOfflineMode$: Observable<boolean> = this.query.inOfflineMode$;
  public hasMediaFolder$ =  this.query.config$.pipe(
    map(config => !!config.mediaFolder)
  );


  constructor(private query: AppQueries,
              private configService: ConfigService,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
  }

  newMediaClip() {
    this.dialog.showMediaEditDialog(null);
  }

  newScreen() {
    this.dialog.showScreenEditDialog({});
  }

  fillData() {
    this.configService.fillDummyData();
  }

  openMediaFolderDialog(): void {
    this.dialog.open(ConfigMediaPathComponent, {
      data: {}
    });
  }
}
