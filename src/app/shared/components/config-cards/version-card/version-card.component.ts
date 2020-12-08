import {Component, OnInit} from '@angular/core';
import VERSION_JSON from '../../../../../version_info.json';


@Component({
  selector: 'app-version-card',
  templateUrl: './version-card.component.html',
  styleUrls: ['./version-card.component.scss']
})
export class VersionCardComponent implements OnInit {

  VERSION_JSON = VERSION_JSON;

  constructor() { }

  ngOnInit(): void {
  }

}
