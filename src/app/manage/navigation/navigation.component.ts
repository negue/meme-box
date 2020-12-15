import {Component, OnInit} from '@angular/core';
import {DialogService} from "../../shared/components/dialogs/dialog.service";
import {QrcodeDialogComponent} from "../qrcode-dialog/qrcode-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {take} from "rxjs/operators";
import {AppService} from "../../state/app.service";
import {RELEASE_PAGE} from "../../../../server/constants";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  links = [
    {path: './media', displayName: 'Media'},
    {path: './screens', displayName: 'Screens'},
    {path: './triggers', displayName: 'Triggers'}
  ]

  constructor(private dialogService: DialogService,
              private snackbar: MatSnackBar,
              private appService: AppService) {




  }

  ngOnInit(): void {
    setTimeout(async () => {
      const updateAvailable = await this.appService.checkVersionUpdateAvailable();

      if (updateAvailable) {
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
