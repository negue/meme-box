import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {AppService} from "../../../../state/app.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppQueries} from "../../../../state/app.queries";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

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
              private snackBar: MatSnackBar) {

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
    const {value} = this.form;

    await this.appService.updateMediaFolder(value.path);

    this.snackBar.open(`Media-Folder Path changed 🎉`);

    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
