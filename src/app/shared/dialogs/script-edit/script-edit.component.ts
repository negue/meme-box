import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {isDynamicIframeVariableValid, NOT_ALLOWED_SCRIPT_VARIABLE_NAMES, ScriptConfig} from "@memebox/utils";
import {CustomScriptDialogPayload} from "../dialog.contract";
import {MatCheckbox} from "@angular/material/checkbox";
import {downloadFile} from "@gewd/utils";
import {jsCodemirror} from "../../../core/codemirror.extensions";
import {DialogService} from "../dialog.service";
import {SCRIPT_TUTORIAL} from "../../../../../server/constants";
import {Clip, ClipAssigningMode, MediaType} from "@memebox/contracts";
import {ActionVariableConfig, ActionVariableTypes} from "@memebox/action-variables";
import {BehaviorSubject, Observable} from "rxjs";
import {
  ActionEntry,
  returnDeclaredActionEntries
} from "../../../../../projects/utils/src/lib/script-information.parser";
import {AppQueries} from "@memebox/app-state";
import {map, take, withLatestFrom} from "rxjs/operators";
import {CodemirrorComponent} from "@gewd/components/codemirror";

@Component({
  selector: 'app-script-edit',
  templateUrl: './script-edit.component.html',
  styleUrls: ['./script-edit.component.scss']
})
export class ScriptEditComponent implements OnInit, AfterViewInit {

  public declaredActionsEntries$ = new BehaviorSubject<ActionEntry[]>([]);

  public declaredActionInformation$: Observable<Clip[]> = this.declaredActionsEntries$.pipe(
    withLatestFrom(this.appQuery.clipMap$),
    map(([declaredActions, clipMap]) => {
      return declaredActions.map(action => clipMap[action.uuid])
    })
  );

  public workingValue: Partial<ScriptConfig> = {};
  public variablesList: ActionVariableConfig[] = [];

  @ViewChild('enablePreviewRefresh', {static: true})
  public autoRefreshCheckbox: MatCheckbox;

  @ViewChild('codemirrorExecScript', {static: true})
  public codemirrorComponent: CodemirrorComponent;


  @ViewChild('codemirrorBootScript', {static: true})
  public codemirrorBootScript: CodemirrorComponent;

  public jsExtensions = jsCodemirror;

  private initDone = false;
  private newVarCounter = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CustomScriptDialogPayload,
    private dialogRef: MatDialogRef<any>,
    private dialogService: DialogService,
    private appQuery: AppQueries
  ) { }

  ngOnInit(): void {
    this.setWorkingValues(this.data.scriptConfig);

    this.declaredActionsEntries$.next(returnDeclaredActionEntries(this.workingValue.executionScript));
    this.initDone = true;
  }

  ngAfterViewInit(): void {
    this.updateCodemirrorContent();
  }

  private updateCodemirrorContent() {
    // until the codemirror components works with default values again...

    this.codemirrorComponent.ngOnChanges({
      value: {
        currentValue: this.workingValue?.executionScript,
        previousValue: null,
        firstChange: true,
        isFirstChange(): boolean {
          return true
        }
      }
    });


    this.codemirrorBootScript.ngOnChanges({
      value: {
        currentValue: this.workingValue?.bootstrapScript,
        previousValue: null,
        firstChange: true,
        isFirstChange(): boolean {
          return true
        }
      }
    });
  }

  private setWorkingValues (payload: ScriptConfig) {
    this.workingValue = {
      settings: {},
      ...payload
    };
    this.variablesList = Object.values(this.workingValue.variablesConfig);
    console.info(this.workingValue);

    this.updateCodemirrorContent();
  }

  save() {
    const variablesObject = {};

    for (const value of this.variablesList) {
      const variableNameValid = isDynamicIframeVariableValid(value.name, NOT_ALLOWED_SCRIPT_VARIABLE_NAMES);

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

    }
  }

  addNewVariable() {
    this.variablesList.push({
      hint: '',
      name: `myVar${++this.newVarCounter}`,
      fallback: '',
      type: ActionVariableTypes.text
    });

    this.markForCheck();
  }

  deleteVariable($event: ActionVariableConfig) {
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
        const importedPayload: ScriptConfig = JSON.parse(content);

        this.setWorkingValues(importedPayload);
      }
    }
  }

  exportScript() {
    const jsonData = JSON.stringify(this.workingValue);
    var dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonData);

    console.info({jsonData, dataStr});

    downloadFile(this.data.name+'-script.json',dataStr);
  }

  openTutorialMarkdown() {
    this.dialogService.showMarkdownFile(SCRIPT_TUTORIAL);
  }

  async addActionAtCursor(codemirrorComponent: CodemirrorComponent) {
    // console.info({ editorState });

    const actionId = await this.dialogService.showClipSelectionDialog({
      mode: ClipAssigningMode.Single,
      dialogTitle: 'Action',
      showMetaItems: true
    });

    if (!actionId) {
      return;
    }

    const clipMap = await this.appQuery.clipMap$.pipe(
      take(1)
    ).toPromise();

      const selectedAction = clipMap[actionId];

      // todo get a variable name from the action name

      const isAction = [MediaType.Script, MediaType.Meta].includes(selectedAction.type);

    const codeToAdd = `const myActionVar = memebox.get${isAction ? 'Action' : 'Media'}('${actionId}');\n`;

    const selection = codemirrorComponent.selectedRange;

    codemirrorComponent.insertText(
      selection.from, selection.from,
      codeToAdd
    );
  }

  updateExecutionScript(newExecutionScriptCode: string) {
    this.workingValue.executionScript = newExecutionScriptCode;

    this.declaredActionsEntries$.next(returnDeclaredActionEntries(newExecutionScriptCode));

    this.markForCheck();
  }

  codemirrorBootstrapCreated(codemirrorBootScript: CodemirrorComponent) {
    this.codemirrorBootScript = codemirrorBootScript;
  }
}
