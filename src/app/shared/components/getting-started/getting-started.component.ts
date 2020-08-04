import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Clip, Screen} from "@memebox/contracts";
import {AppQueries} from "../../../state/app.queries";
import {DialogService} from "../dialogs/dialog.service";

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.css']
})
export class GettingStartedComponent implements OnInit {
  public mediaList$: Observable<Clip[]> = this.query.clipList$;

  public screenList$: Observable<Screen[]> = this.query.screensList$


  constructor(private query: AppQueries,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
  }

  newMediaClip() {
    this.dialog.showMediaEditDialog(null);
  }

  newScreen() {
    this.dialog.showScreenEditDialog({});
  }
}
