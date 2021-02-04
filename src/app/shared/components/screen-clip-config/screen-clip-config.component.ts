import {Component, OnInit} from '@angular/core';
import {defineCustomElements as defineDeckGoDrr} from '@deckdeckgo/drag-resize-rotate/dist/loader'

defineDeckGoDrr();

@Component({
  selector: 'app-screen-clip-config',
  templateUrl: './screen-clip-config.component.html',
  styleUrls: ['./screen-clip-config.component.scss']
})
export class ScreenClipConfigComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
