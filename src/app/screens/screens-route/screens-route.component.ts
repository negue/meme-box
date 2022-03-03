import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Title} from "@angular/platform-browser";

export interface ScreenWithZIndex {
  screenId: string;
  zIndex: number;
}

@Component({
  selector: 'app-screens-route',
  templateUrl: './screens-route.component.html',
  styleUrls: ['./screens-route.component.scss']
})
export class ScreensRouteComponent implements OnInit {
  public alLScreens: ScreenWithZIndex[] = [];

  constructor(
    private route: ActivatedRoute,
    private title: Title,
  ) { }

  ngOnInit(): void {
    const queryMap = this.route.snapshot.queryParamMap;

    const keys = queryMap.keys.filter(k => k !== 'debug');

    this.alLScreens = keys.map(k => {
      return {
        screenId: k,
        zIndex: +queryMap.get(k)
      }
    });

    console.info({
      keys, screens: this.alLScreens
    });

    this.title.setTitle('Multiple Screens - TODO Names :)');
  }

}
