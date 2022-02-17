import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DynamicIframeContent, isDynamicIframeVariableValid, NOT_ALLOWED_WIDGET_VARIABLE_NAMES} from "@memebox/utils";
import {BehaviorSubject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import type {CustomHtmlDialogPayload} from "../dialog.contract";
import {MatCheckbox} from "@angular/material/checkbox";
import {downloadFile} from "@gewd/utils";
import {cssCodemirror, htmlCodemirror, jsCodemirror} from "../../../core/codemirror.extensions";
import {ActionVariableConfig, ActionVariableTypes} from "@memebox/action-variables";
import {WIDGET_TUTORIAL} from "../../../../../server/constants";
import {DialogService} from "../dialog.service";

@Component({
  selector: 'app-widget-edit',
  templateUrl: './widget-edit.component.html',
  styleUrls: ['./widget-edit.component.scss']
})
export class WidgetEditComponent implements OnInit {

  public workingValue: DynamicIframeContent = {};
  public variablesList: ActionVariableConfig[] = [];

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CustomHtmlDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private dialogService: DialogService,
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

  addNewExternal(): void {
    this.workingValue.libraries.push({type:'css', src:''});
    this.markForCheck();
  }

  saveExternalArray(): void {

  }

  deleteExternalFile(index: number): void {
    this.workingValue.libraries.splice(index, 1);
    this.markForCheck();
  }

  save(): void {
    const variablesObject = {};

    for (const value of this.variablesList) {
      const variableNameValid = isDynamicIframeVariableValid(value.name, NOT_ALLOWED_WIDGET_VARIABLE_NAMES);

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

  markForCheck(force = false): void {
    const enableSubjectRefresh = force || this.autoRefreshCheckbox?.checked;

    if (this.initDone && enableSubjectRefresh) {
      this.iframeContentSubject$.next({
        ...this.workingValue,
        variablesConfig: this.variablesList
      });
    }
  }

  addNewVariable(): void {
    this.variablesList.push({
      hint: '',
      name: `myVar${this.variablesList.length+1}`,
      fallback: '',
      type: ActionVariableTypes.text
    });

    this.markForCheck();
  }

  deleteVariable($event: ActionVariableConfig): void {
    // TODO "Are you sure?"

    const foundIndex = this.variablesList.findIndex(value => value.name === $event.name);

    this.variablesList.splice(foundIndex, 1);

    this.markForCheck();
  }

  onFileInputChanged($event: Event): void {
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

  exportWidget(): void {
    const jsonData = JSON.stringify(this.workingValue);
    var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonData);

    console.info({jsonData, dataStr});
    downloadFile(this.data.name+'-widget.json',dataStr);
  }

  openTutorialMarkdown(): void  {
    this.dialogService.showMarkdownFile(WIDGET_TUTORIAL);
  }
}
