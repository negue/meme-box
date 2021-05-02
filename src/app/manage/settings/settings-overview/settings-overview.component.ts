import {Component, OnInit} from '@angular/core';
import {ConfigMediaPathComponent} from "../../media/media-overview/config-media-path/config-media-path.component";
import {Observable} from "rxjs";
import {Config} from "@memebox/contracts";
import {AppService} from "../../../state/app.service";
import {DialogService} from "../../../shared/dialogs/dialog.service";
import {AppQueries} from "../../../state/app.queries";
import {TranslocoService} from "@ngneat/transloco";
import {TranslocoSelectedLangService} from "../../../transloco/transloco-selected-lang.service";

const dummyItemsCreatorLazy = () => import('./dummyItemsCreator');

@Component({
  selector: 'app-settings-overview',
  templateUrl: './settings-overview.component.html',
  styleUrls: ['./settings-overview.component.scss']
})
export class SettingsOverviewComponent implements OnInit {
  public config$: Observable<Partial<Config>> = this.query.config$;
  public offlineMode$ = this.query.inOfflineMode$;

  public currentLanguage = this.translocoService.getActiveLang();
  public availableLanguages = this.translocoService.getAvailableLangs();

  constructor(public service: AppService,
              public query: AppQueries,
              private _dialog: DialogService,
              private translocoService: TranslocoService,
              private selectedLangService: TranslocoSelectedLangService) {

  }

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

  reload() {
    location.reload();
  }

  openConfigFolder() {
    this.service.openConfigFolder();
  }

  downloadStreamdeckPlugin() {
    window.open('https://github.com/negue/meme-box/raw/release/memebox-streamdeck/Release/com.memebox.memebox-streamdeck.streamDeckPlugin');
  }

  addMoreDummyItems () {
    dummyItemsCreatorLazy().then(value => value.addMoreItems(this.service));
  }

  selectNewLanguage($event: any) {
    this.selectedLangService.setSelectedLang($event)
  }
}
