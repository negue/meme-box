import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Action, ActionType, Dictionary, ENDPOINTS, TriggerActionOverrides} from "@memebox/contracts";
import {actionDataToScriptConfig, actionDataToWidgetContent, extractVariablesFromExtended} from "@memebox/utils";
import {ActionVariableConfig} from "@memebox/action-variables";
import {MemeboxApiService, MemeboxWebsocketService} from "@memebox/app-state";

@Component({
  selector: 'app-trigger-action-variables',
  templateUrl: './trigger-action-variables.component.html',
  styleUrls: ['./trigger-action-variables.component.scss']
})
export class TriggerActionVariablesComponent implements OnInit {
  public variablesConfig?: ActionVariableConfig[];
  public variables?: Dictionary<unknown>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Action,

    private _wsService: MemeboxWebsocketService,
    private _memeboxApi: MemeboxApiService
  ) {
    if (this.data.type === ActionType.Widget) {
      const widgetConfig = actionDataToWidgetContent(this.data);

      this.variablesConfig = widgetConfig.variablesConfig;
      this.variables = widgetConfig.variables ?? {};
    }

    if (this.data.type === ActionType.Script) {
      const scriptConfig = actionDataToScriptConfig(this.data);

      this.variablesConfig = scriptConfig.variablesConfig;
      this.variables = extractVariablesFromExtended(this.data.extended);
    }
  }

  trigger(): void  {
    this._wsService.triggerClipOnScreen(this.data.id, null, {
      action: {
        variables: this.variables
      }
    });
  }

  async ngOnInit (): Promise<void> {
    const overrides = await this._memeboxApi.get<TriggerActionOverrides>(
      `${ENDPOINTS.ACTION.PREFIX}${ENDPOINTS.ACTION.LAST_OVERRIDES}${this.data.id}`);

    this.variables = overrides?.action?.variables ?? {};
  }
}
