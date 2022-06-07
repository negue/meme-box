import {Component} from '@angular/core';
import {ConfigMediaPathComponent} from "../../media/media-overview/config-media-path/config-media-path.component";
import {Observable} from "rxjs";
import {Config} from "@memebox/contracts";
import {AppService} from "../../../../../projects/app-state/src/lib/state/app.service";
import {DialogService} from "../../../shared/dialogs/dialog.service";
import {AppQueries} from "../../../../../projects/app-state/src/lib/state/app.queries";
import {TranslocoService} from "@ngneat/transloco";
import {TranslocoSelectedLangService} from "../../../transloco/transloco-selected-lang.service";
import {ConfigService} from "../../../../../projects/app-state/src/lib/services/config.service";
import {openStreamdeckPluginUrl} from "../../../shared/utils";

const dummyItemsCreatorLazy = () => import('./dummyItemsCreator');

interface LanguageEntry {
  id: string;
  label: string;
}

@Component({
  selector: 'app-settings-overview',
  templateUrl: './settings-overview.component.html',
  styleUrls: ['./settings-overview.component.scss'],
  providers: [ ]
})
export class SettingsOverviewComponent {
  public config$: Observable<Partial<Config>> = this.query.config$;
  public offlineMode$ = this.query.inOfflineMode$;

  public currentLanguage = this.translocoService.getActiveLang();
  public availableLanguages: LanguageEntry[] = [...this.translocoService.getAvailableLangs()].map(value => {
    if (typeof value  === 'string') {
      return {
        id: value,
        label: value,
      }
    }

    return {
      id: value.id,
      label: value.label
    };
  })
  ;

  constructor(public service: AppService,
              private configService: ConfigService,
              public query: AppQueries,
              private _dialog: DialogService,
              private translocoService: TranslocoService,
              private selectedLangService: TranslocoSelectedLangService) {

  }

  openMediaFolderDialog(): void {
    this._dialog.open(ConfigMediaPathComponent, {
      data: {}
    });
  }

  openMediaFolderExplorer(): void {
    this.configService.openMediaFolder();
  }

  reload(): void  {
    location.reload();
  }

  openConfigFolder(): void  {
    this.configService.openConfigFolder();
  }

  downloadStreamdeckPlugin(): void  {
    openStreamdeckPluginUrl();
  }

  addMoreDummyItems (): void  {
    dummyItemsCreatorLazy().then(value => value.addMoreItems(this.service));
  }

  selectNewLanguage($event: LanguageEntry): void  {
    this.selectedLangService.setSelectedLang($event.id)
  }
}
