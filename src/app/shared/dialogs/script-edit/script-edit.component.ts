import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {isDynamicIframeVariableValid, NOT_ALLOWED_SCRIPT_VARIABLE_NAMES, ScriptConfig} from "@memebox/utils";
import {CustomScriptDialogPayload} from "../dialog.contract";
import {MatCheckbox} from "@angular/material/checkbox";
import {downloadFile} from "@gewd/utils";
import {jsCodemirror} from "../../../core/codemirror.extensions";
import {DialogService} from "../dialog.service";
import {SCRIPT_TUTORIAL} from "../../../../../server/constants";
import {Action, ActionType, ClipAssigningMode} from "@memebox/contracts";
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
export class ScriptEditComponent implements OnInit {

  public declaredActionsEntries$ = new BehaviorSubject<ActionEntry[]>([]);

  public declaredActionInformation$: Observable<Action[]> = this.declaredActionsEntries$.pipe(
    withLatestFrom(this.appQuery.actionMap$),
    map(([declaredActions, clipMap]) => {
      return declaredActions
        .map(action => clipMap[action.uuid])
        .filter(a => !!a)
    })
  );

  public workingValue: Partial<ScriptConfig> = {};
  public variablesList: ActionVariableConfig[] = [];

  @ViewChild('enablePreviewRefresh', {static: true})
  public autoRefreshCheckbox: MatCheckbox;

  @ViewChild('codemirrorExecScript', {static: true})
  public codemirrorComponent: CodemirrorComponent;

  public jsExtensions = jsCodemirror;

  private initDone = false;

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


  private setWorkingValues (payload: ScriptConfig) {
    this.workingValue = {
      settings: {},
      ...payload
    };
    this.variablesList = Object.values(this.workingValue.variablesConfig);
    console.info(this.workingValue);
  }

  save(): void {
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

  addNewVariable(): void {
    this.variablesList.push({
      hint: '',
      name: `myVar${this.variablesList.length+1}`,
      fallback: '',
      type: ActionVariableTypes.text
    });
  }

  deleteVariable($event: ActionVariableConfig): void {
    // TODO "Are you sure?"

    const foundIndex = this.variablesList.findIndex(value => value.name === $event.name);

    this.variablesList.splice(foundIndex, 1);
  }

  // todo extract to common utils function

  onFileInputChanged($event: Event): void {
    const target = $event.target as HTMLInputElement;
    const files = target.files;

    const file = files[0];

    console.info({$event, file});

    // setting up the reader
    const reader = new FileReader();
    reader.readAsText(file,'UTF-8');

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
      const content = readerEvent.target.result; // this is the content!

      if (typeof content === 'string' ) {
        const importedPayload: ScriptConfig = JSON.parse(content);

        this.setWorkingValues(importedPayload);
      }
    }
  }

  exportScript(): void {
    const jsonData = JSON.stringify(this.workingValue);
    const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(jsonData);

    console.info({jsonData, dataStr});

    downloadFile(this.data.name+'-script.json',dataStr);
  }

  openTutorialMarkdown(): void {
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

    const clipMap = await this.appQuery.actionMap$.pipe(
      take(1)
    ).toPromise();

      const selectedAction = clipMap[actionId];

      // todo get a variable name from the action name

      const isAction = [ActionType.Script, ActionType.Meta].includes(selectedAction.type);

    const codeToAdd = `const myActionVar = memebox.get${isAction ? 'Action' : 'Media'}('${actionId}');\n`;

    const selection = codemirrorComponent.selectedRange;

    codemirrorComponent.insertText(
      selection.from, selection.from,
      codeToAdd
    );
  }

  updateExecutionScript(newExecutionScriptCode: string): void {
    this.workingValue.executionScript = newExecutionScriptCode;

    this.declaredActionsEntries$.next(returnDeclaredActionEntries(newExecutionScriptCode));
  }
}
