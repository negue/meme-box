import {Component, OnInit} from '@angular/core';
import VERSION_JSON from '../../../../../version_info.json';
import {AppQueries} from "../../../../state/app.queries";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";
import {map} from "rxjs/operators";
import {RELEASE_PAGE} from "../../../../../../server/constants";
import {ConfigService} from "../../../../state/config.service";


@Component({
  selector: 'app-version-card',
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent implements OnInit {

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

  ngOnInit(): void {
  }

  onVersionCheckChanged($event: MatCheckboxChange,
                        config: Partial<Config>) {

    this.configService.updateConfig({
      enableVersionCheck: $event.checked
    });
  }

  openGitubPage() {
    window.open(RELEASE_PAGE, '_blank');
  }
}
