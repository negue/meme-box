import {Component, Input, OnInit} from '@angular/core';
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-url-panel',
  templateUrl: './url-panel.component.html',
  styleUrls: ['./url-panel.component.scss']
})
export class UrlPanelComponent implements OnInit {

  @Input()
  public url: string;

  constructor(private clipboard: Clipboard,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  copyURL() {
    if (this.clipboard.copy(this.url)) {
      this._snackBar.open('URL copied to clipboard', null, {
        duration: 5000,
      });
    } else {
      this._snackBar.open('URL couldn\'t be copied to clipboard', null, {
        duration: 10000,

        panelClass: ['mat-toolbar', 'mat-warn']
      });
    }
  }
}
