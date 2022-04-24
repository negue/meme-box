import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {AppQueries, AppService, SnackbarService} from "@memebox/app-state";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ConfigService} from "../../../../../../projects/app-state/src/lib/services/config.service";

@Component({
  selector: 'app-config-media-path',
  templateUrl: './config-media-path.component.html',
  styleUrls: ['./config-media-path.component.css']
})
export class ConfigMediaPathComponent implements OnInit, OnDestroy {


  public form = new FormBuilder().group({
    path: '',
  });

  public config$ = this.appQuery.config$;

  private _destroy$ = new Subject();

  constructor(private appQuery: AppQueries,
              private dialogRef: MatDialogRef<any>,
              private appService: AppService,
              private configService: ConfigService,
              private snackBar: SnackbarService) {

  }

  ngOnInit(): void {
    this.config$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this.form.reset({
        path: value.mediaFolder
      });
    })
  }

  async save() {
    if (!this.form.valid) {
      // highlight hack
      this.form.markAllAsTouched();
      return;
    }

    const {value} = this.form;

    await this.configService.updateConfig({
      mediaFolder: value.path
    });

    this.snackBar.normal(`Media-Folder Path changed`);

    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  openNativeFolderPicker(): void  {
    if (this.isElectron) {

      const electronApi = window.electron;

      electronApi.electronIpcSend('select-dirs')

      electronApi.electronIpcOn('dir-selected', (event, args) => {
        if (args) {
          this.form.patchValue({
            path: args
          });
        }
      });
    }
  }

  // todo extract that to a service
  get isElectron(): boolean {
    return !!window.electron;
  }
}
