import {Component, OnInit} from '@angular/core';
import {DialogService} from "../../shared/dialogs/dialog.service";
import {QrcodeDialogComponent} from "../qrcode-dialog/qrcode-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {take} from "rxjs/operators";
import {AppQueries, AppService} from "@memebox/app-state";
import {RELEASE_PAGE} from "../../../../server/constants";

interface LinkEntry {
  path: string;
  displayName: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  links: LinkEntry[];

  public update$ = this.appQuery.update$;

  constructor(private dialogService: DialogService,
              private snackbar: MatSnackBar,
              private appService: AppService,
              private appQuery: AppQueries) {

    this.links = [
      {path: './dashboard', displayName: 'dashboard'},
      {path: './actions', displayName: 'actions'},
      {path: './screens', displayName: 'screens'},
      {path: './triggers', displayName: 'triggers'},
    ];
  }

  ngOnInit(): void {
    setTimeout(async () => {
      const updateAvailable = await this.appService.checkVersionUpdateAvailable();

      console.info({updateAvailable});

      if (updateAvailable.available) {
        this.snackbar.open('Update available', 'Open GitHub', {
          horizontalPosition: "center",
          verticalPosition: "bottom",
          duration: 10000,
        }).onAction()
          .pipe(
            take(1)
          )
          .subscribe(ev => {
            window.open(RELEASE_PAGE, '_blank');

            //console.info('pressed', ev);
          })
      }
    }, 15000)
  }

  openMobileViewDialog() {
    console.info('open qr');
    this.dialogService.open(QrcodeDialogComponent, {

    });
  }
}
