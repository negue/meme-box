import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { Screen } from "@memebox/contracts";
import { map, take } from "rxjs/operators";
import { AppQueries } from "../../../../state/app.queries";

import orderBy from 'lodash/orderBy';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

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
    map(screenArray => orderBy(screenArray, 'name'))
  )

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Screen,
    private dialogRef: MatDialogRef<any>,
    private _queries: AppQueries
  ) { }

  ngOnInit(): void {
    this.screenList$.pipe(
      take(1)
    ).subscribe(screens => {
      let counter = 1;
      for (const screen of screens) {
        this.selectionState[screen.id] = this.selectionState[screen.id] ?? {
          checked: this.data.id === screen.id,
          zIndex: counter++
        }
      }
    })
  }

}
