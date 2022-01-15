import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {DialogService} from "../dialog.service";
import {DialogData} from "../dialog.contract";
import {DOCUMENT} from "@angular/common";
import {Observable} from "rxjs";
import {Action, Screen} from "@memebox/contracts";
import {map} from "rxjs/operators";
import {AppQueries} from "@memebox/app-state";
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {ConfigMediaPathComponent} from "../../../manage/media/media-overview/config-media-path/config-media-path.component";


@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent
  implements OnInit, OnDestroy, DialogData<any> {

  private dialogDivElement: HTMLDivElement = null;

  @ViewChild('dialogContent', {static: true})
  public dialogContent: ElementRef<HTMLElement>;

  public mediaList$: Observable<Action[]> = this.query.actionList$;

  public screenList$: Observable<Screen[]> = this.query.screensList$
  public inOfflineMode$: Observable<boolean> = this.query.inOfflineMode$;
  public hasMediaFolder$ =  this.query.config$.pipe(
    map(config => !!config.mediaFolder)
  );


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document: Document,
              private dialogRef: MatDialogRef<any>,
              private http: HttpClient,
              private dialogService: DialogService,
              private query: AppQueries,
              private configService: ConfigService,) {

  }

  ngOnInit(): void {
    this.dialogDivElement = this.document.getElementsByClassName('cdk-overlay-container').item(0) as HTMLDivElement;

    this.dialogDivElement.style.zIndex = '4000';
  }

  ngOnDestroy(): void {
    this.dialogDivElement.style.zIndex = null;
  }


  newMediaClip() {
    this.dialogService.showMediaEditDialog(null);
  }

  newScreen() {
    this.dialogService.showScreenEditDialog({});
  }

  fillData() {
    this.configService.fillDummyData();
  }

  openMediaFolderDialog(): void {
    this.dialogService.open(ConfigMediaPathComponent, {
      data: {}
    });
  }
}
