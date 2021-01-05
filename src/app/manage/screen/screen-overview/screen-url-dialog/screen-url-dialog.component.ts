import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Screen} from "@memebox/contracts";
import {map, tap} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";

import orderBy from 'lodash/orderBy';

export interface SelectionStateDictionary {
  [key: string]: {
    checked: boolean;
    zIndex: number;
  }
}

@Component({
  selector: 'app-screen-url-dialog',
  templateUrl: './screen-url-dialog.component.html',
  styleUrls: ['./screen-url-dialog.component.scss']
})
export class ScreenUrlDialogComponent implements OnInit {
  public selectionState: SelectionStateDictionary = {};

  // TODO add orderby of z-index

  public screenList$: Observable<Screen[]> = this._queries.screensList$.pipe(
    map(screenArray => orderBy(screenArray, 'name')),
    tap(screens => {
      let counter = 1;
      for (const screen of screens) {
        this.selectionState[screen.id] = this.selectionState[screen.id] ?? {
          checked: false,
          zIndex: counter++
        }
      }
    })
  )

  constructor(
    private _queries: AppQueries
  ) { }

  ngOnInit(): void {
  }

}
