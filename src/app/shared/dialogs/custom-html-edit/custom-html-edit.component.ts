import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DynamicIframeContent} from "@memebox/utils";
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import type {CustomHtmlDialogPayload} from "../dialog.contract";
import {MatCheckbox} from "@angular/material/checkbox";

@Component({
  selector: 'app-custom-html-edit',
  templateUrl: './custom-html-edit.component.html',
  styleUrls: ['./custom-html-edit.component.scss']
})
export class CustomHtmlEditComponent implements OnInit {

  public workingValue: DynamicIframeContent = {};

  @ViewChild('enablePreviewRefresh', {static: true})
  public autoRefreshCheckbox: MatCheckbox;

  public iframeContentSubject$ = new BehaviorSubject(this.data.iframePayload);
  public iframeContent$ = this.iframeContentSubject$.pipe(
    debounceTime(400)
  );

  private initDone = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CustomHtmlDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.workingValue = {...this.data.iframePayload};

    this.initDone = true;
  }

  addNewExternal() {
    this.workingValue.libraries.push({type:'css', src:''});
    this.markForCheck();
  }

  saveExternalArray() {

  }

  deleteExternalFile(index: number) {
    this.workingValue.libraries.splice(index, 1);
    this.markForCheck();
  }

  save() {

    console.info('SAVING WITH', this.workingValue);

    this.dialogRef.close(this.workingValue);
  }

  markForCheck(force = false) {
    const enableSubjectRefresh = force || this.autoRefreshCheckbox?.checked;

    if (this.initDone && enableSubjectRefresh) {
      this.iframeContentSubject$.next({
        ...this.workingValue
      });
    }
  }
}
