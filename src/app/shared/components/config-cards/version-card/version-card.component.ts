import {Component, OnInit} from '@angular/core';
import VERSION_JSON from '../../../../../version_info.json';
import {AppQueries} from "../../../../state/app.queries";
import {AppService} from "../../../../state/app.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {Config} from "@memebox/contracts";


@Component({
  selector: 'app-version-card',
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent implements OnInit {

  VERSION_JSON = VERSION_JSON;

  public config$ = this.appQuery.config$;

  constructor(private appQuery: AppQueries,
              private appService: AppService) { }

  ngOnInit(): void {
  }

  onVersionCheckChanged($event: MatCheckboxChange,
                        config: Partial<Config>) {

    this.appService.updateConfig({
      enableVersionCheck: $event.checked
    });
  }
}
