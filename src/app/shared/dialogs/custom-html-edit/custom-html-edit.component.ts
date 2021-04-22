import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DynamicIframeContent, DynamicIframeVariable, isDynamicIframeVariableValid} from "@memebox/utils";
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
  public variablesList: DynamicIframeVariable[] = [];

  @ViewChild('enablePreviewRefresh', {static: true})
  public autoRefreshCheckbox: MatCheckbox;

  public iframeContentSubject$ = new BehaviorSubject(this.data.iframePayload);
  public iframeContent$ = this.iframeContentSubject$.pipe(
    debounceTime(400)
  );

  private initDone = false;
  private newVarCounter = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CustomHtmlDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.workingValue = {...this.data.iframePayload};
    this.variablesList = Object.values(this.workingValue.variablesConfig);

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
    const variablesObject = {};

    for (const value of this.variablesList) {
      const variableNameValid = isDynamicIframeVariableValid(value.name);

      if (!variableNameValid.ok){
        alert(variableNameValid.message);
        return;
      }

      if (variablesObject[value.name]) {
        alert(`Variable with the Name "${value.name}" already exists.`);
        return;
      }

      variablesObject[value.name] = value;
    }

    this.workingValue.variablesConfig = this.variablesList;
    console.info('SAVING WITH', this.workingValue);

    this.dialogRef.close(this.workingValue);
  }

  markForCheck(force = false) {
    const enableSubjectRefresh = force || this.autoRefreshCheckbox?.checked;

    if (this.initDone && enableSubjectRefresh) {
      this.iframeContentSubject$.next({
        ...this.workingValue,
        variablesConfig: this.variablesList
      });
    }
  }

  addNewVariable() {
    this.variablesList.push({
      hint: '',
      name: `myVar${++this.newVarCounter}`,
      fallback: '',
      type: 'text'
    });

    this.markForCheck();
  }

  deleteVariable($event: DynamicIframeVariable) {
    // TODO "Are you sure?"

    const foundIndex = this.variablesList.findIndex(value => value.name === $event.name);

    this.variablesList.splice(foundIndex, 1);

    this.markForCheck();
  }
}
