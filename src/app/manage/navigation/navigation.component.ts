import {Component, OnInit} from '@angular/core';
import {DialogService} from "../../shared/components/dialogs/dialog.service";
import {QrcodeDialogComponent} from "../qrcode-dialog/qrcode-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {take} from "rxjs/operators";

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
              private snackbar: MatSnackBar) {
    snackbar.open('Update available: V1337.Profit', 'Open GitHub', {
      horizontalPosition: "center",
      verticalPosition: "bottom",
      duration: 10000,
    }).onAction()
      .pipe(
        take(1)
      )
      .subscribe(ev => {
        window.open('https://github.com/negue/meme-box/releases', '_blank');

        //console.info('pressed', ev);
    })
  }

  ngOnInit(): void {
  }

  openMobileViewDialog() {
    console.info('open qr');
    this.dialogService.open(QrcodeDialogComponent, {

    });
  }
}
