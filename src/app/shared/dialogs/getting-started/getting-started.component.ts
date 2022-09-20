import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {DialogService} from "../dialog.service";
import {DialogData} from "../dialog.contract";
import {DOCUMENT} from "@angular/common";
import {Observable} from "rxjs";
import {Action, Screen} from "@memebox/contracts";
import {map} from "rxjs/operators";
import {AppQueries, NetworkInterfacesService} from "@memebox/app-state";
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {
  ConfigMediaPathComponent
} from "../../../manage/media/media-overview/config-media-path/config-media-path.component";
import {openStreamdeckPluginUrl} from "../../utils";
import {QrcodeDialogComponent} from "../../../manage/qrcode-dialog/qrcode-dialog.component";


@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent
  implements OnInit, OnDestroy, DialogData<void> {

  private dialogDivElement: HTMLDivElement = null;

  @ViewChild('dialogContent', {static: true})
  public dialogContent: ElementRef<HTMLElement>;

  public mediaList$: Observable<Action[]> = this.query.actionList$;

  public screenList$: Observable<Screen[]> = this.query.screensList$
  public firstScreen$: Observable<Screen> = this.query.screensList$.pipe(
    map(screens => screens.slice(0,1).pop())
  );

  public hasMediaFolder$ =  this.query.config$.pipe(
    map(config => !!config.mediaFolder)
  );

  twitchChannelExist$ = this.query.config$.pipe(
    map(cfg => !!cfg.twitch.channel)
  );

  public networkUrl$ = this.networkInterfacesService.networkInterface$.pipe(
    map(networkInterfaces => networkInterfaces
      .filter(netInterface => netInterface.address.includes('localhost'))
      .pop()
    ),
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document: Document,
              private dialogRef: MatDialogRef<any>,
              private http: HttpClient,
              private dialogService: DialogService,
              private query: AppQueries,
              private configService: ConfigService,
              private networkInterfacesService : NetworkInterfacesService) {

  }

  ngOnInit(): void {
    this.dialogDivElement = this.document.getElementsByClassName('cdk-overlay-container').item(0) as HTMLDivElement;

    this.dialogDivElement.style.zIndex = '4000';
  }

  ngOnDestroy(): void {
    this.dialogDivElement.style.zIndex = null;
  }


  newMediaClip(): void  {
    this.dialogService.showMediaEditDialog(null);
  }

  newScreen(): void  {
    this.dialogService.showScreenEditDialog({});
  }

  fillData(): void  {
    this.configService.fillDummyData();
  }

  openMediaFolderDialog(): void {
    // todo change those Dialogs to be lazy loaded
    this.dialogService.open(ConfigMediaPathComponent, {
      data: {}
    });
  }

  openTwitchConfigs(): void  {
    this.dialogService.openTwitchConnectionConfig();
  }

  showMobileUrlDialog(): void  {
    this.dialogService.open(QrcodeDialogComponent, {

    });
  }

  openStreamDeckPluginUrl(): void  {
    openStreamdeckPluginUrl();
  }

  newTwitchTrigger(): void  {
    this.dialogService.showTwitchEditDialog(null);
  }
}
