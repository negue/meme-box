import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-screen-route',
  templateUrl: './screen-route.component.html',
  styleUrls: ['./screen-route.component.scss']
})
export class ScreenRouteComponent implements OnInit {

  public screenId = '';

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.screenId = this.route.snapshot.params.guid;
  }

}
