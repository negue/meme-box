import {Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {DialogService} from "../dialog.service";
import {DialogData} from "../dialog.contract";
import {DOCUMENT} from "@angular/common";


@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent
  implements OnInit, OnDestroy, DialogData<any> {

  private dialogDivElement: HTMLDivElement = null;

  @ViewChild('dialogContent', {static: true})
  public dialogContent: ElementRef<HTMLElement>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document: Document,
              private dialogRef: MatDialogRef<any>,
              private http: HttpClient,
              private dialogService: DialogService) {

  }

  ngOnInit(): void {
    this.dialogDivElement = this.document.getElementsByClassName('cdk-overlay-container').item(0) as HTMLDivElement;

    this.dialogDivElement.style.zIndex = '4000';
  }

  ngOnDestroy(): void {
    this.dialogDivElement.style.zIndex = null;
  }
}
