import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ScriptConfig} from "@memebox/utils";

@Component({
  selector: 'script-readonly-view',
  templateUrl: './script-readonly-view.component.html',
  styleUrls: ['./script-readonly-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScriptReadonlyViewComponent {

  @Input()
  public scriptObject!: ScriptConfig;

}
