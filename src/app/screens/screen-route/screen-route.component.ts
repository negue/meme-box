import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { filter, map, take } from "rxjs/operators";
import { AppQueries } from "../../state/app.queries";

@Component({
  selector: 'app-screen-route',
  templateUrl: './screen-route.component.html',
  styleUrls: ['./screen-route.component.scss']
})
export class ScreenRouteComponent implements OnInit {

  public screenId = '';

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private appQuery: AppQueries,
  ) { }

  ngOnInit(): void {
    this.screenId = this.route.snapshot.params.guid;

    this.appQuery.screenMap$.pipe(
      filter(screens => screens && Object.keys(screens).length > 0),
      map(screensMap => screensMap[this.screenId]),
      filter(screen => !screen),
      take(1)
    ).subscribe(screen => {
      this.title.setTitle(`Screen: ${screen.name}`);
    });
  }

}
