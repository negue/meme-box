import {Component} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {TargetScreenType} from "@memebox/contracts";
import {ConfigService} from "../../../../../../projects/app-state/src/lib/services/config.service";

@Component({
  selector: 'app-import-media-files-dialog',
  templateUrl: './import-media-files-dialog.component.html',
  styleUrls: ['./import-media-files-dialog.component.scss']
})
export class ImportMediaFilesDialogComponent {
  public form = new FormBuilder().group({
    targetScreenType: TargetScreenType.OneScreen,
  });

  TargetScreenType = TargetScreenType;

  constructor(
    private configService: ConfigService,
  ) { }

  executeImport() {
      if (!this.form.valid) {
        // highlight hack
        this.form.markAllAsTouched();
        return;
      }

      const {value} = this.form;

      // reloads the view
    this.configService.importAll(value);
  }
}
