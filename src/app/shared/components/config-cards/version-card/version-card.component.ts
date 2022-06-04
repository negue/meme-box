import {Component} from '@angular/core';
import VERSION_JSON from '../../../../../version_info.json';
import {AppQueries} from "@memebox/app-state";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {map} from "rxjs/operators";
// TODO constants / path imports
import {RELEASE_PAGE} from "../../../../../../server/constants";
import {ConfigService} from "../../../../../../projects/app-state/src/lib/services/config.service";


@Component({
  selector: 'app-version-card',
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent {

  VERSION_JSON = VERSION_JSON;

  public config$ = this.appQuery.config$;
  public update$ = this.appQuery.update$;

  public updateAvailableBadgeLabel$ = this.update$.pipe(
    map(update => {
      if (!update || !update.available) {
        return `Version: ${VERSION_JSON.VERSION_TAG}`;
      }

      return `Update Available: ${update.version}`;
    })
  )

  constructor(private appQuery: AppQueries,
              private configService: ConfigService) { }

  onVersionCheckChanged($event: MatCheckboxChange): void  {

    this.configService.updateConfig({
      enableVersionCheck: $event.checked
    });
  }

  openGitubPage(): void  {
    window.open(RELEASE_PAGE, '_blank');
  }
}
