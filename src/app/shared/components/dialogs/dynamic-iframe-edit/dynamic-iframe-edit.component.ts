import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DynamicIframeContent} from "@memebox/utils";
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-dynamic-iframe-edit',
  templateUrl: './dynamic-iframe-edit.component.html',
  styleUrls: ['./dynamic-iframe-edit.component.scss']
})
export class DynamicIframeEditComponent implements OnInit {

  public workingValue: DynamicIframeContent = {};

  public iframeContentSubject$ = new BehaviorSubject(this.data);
  public iframeContent$ = this.iframeContentSubject$.pipe(
    debounceTime(400)
  );

  private initDone = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DynamicIframeContent,
    private dialogRef: MatDialogRef<any>,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.workingValue = {...this.data};

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

  markForCheck() {
    if (this.initDone) {
      this.iframeContentSubject$.next({
        ...this.workingValue
      });
    }
  }
}
