import {Component, OnInit} from '@angular/core';
import {DialogService} from "../../shared/components/dialogs/dialog.service";
import {QrcodeDialogComponent} from "../qrcode-dialog/qrcode-dialog.component";

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

  constructor(private dialogService: DialogService) {
  }

  ngOnInit(): void {
  }

  openMobileViewDialog() {
    console.info('open qr');
    this.dialogService.open(QrcodeDialogComponent, {

    });
  }
}
