import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DynamicIframeContent, DynamicIframeVariable, isDynamicIframeVariableValid} from "@memebox/utils";
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import type {CustomHtmlDialogPayload} from "../dialog.contract";
import {MatCheckbox} from "@angular/material/checkbox";
import {downloadFile} from "@gewd/utils";
import {cssCodemirror, htmlCodemirror, jsCodemirror} from "../../../core/codemirror.extensions";

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

  public iframeContentSubject$ = new BehaviorSubject(null);
  public iframeContent$ = this.iframeContentSubject$.pipe(
    debounceTime(400)
  );


  public cssExtensions = cssCodemirror;
  public jsExtensions = jsCodemirror;
  public htmlExtensions = htmlCodemirror;

  private initDone = false;
  private newVarCounter = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CustomHtmlDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.setWorkingValues(this.data.iframePayload);
    this.initDone = true;
  }

  private setWorkingValues (payload: DynamicIframeContent) {
    this.workingValue = {
      settings: {},
      ...payload
    };
    this.variablesList = Object.values(this.workingValue.variablesConfig);
    this.iframeContentSubject$.next(this.workingValue);
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

  onFileInputChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    const files = target.files;

    const file = files[0];

    console.info({$event, file});

    // setting up the reader
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
      var content = readerEvent.target.result; // this is the content!

      if (typeof content === 'string' ) {
        const importedPayload: DynamicIframeContent = JSON.parse(content);

        this.setWorkingValues(importedPayload);
      }
    }
  }

  exportWidget() {
    const jsonData = JSON.stringify(this.workingValue);
    var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonData);

    console.info({jsonData, dataStr});

    downloadFile('widget.json',dataStr);
  }
}
