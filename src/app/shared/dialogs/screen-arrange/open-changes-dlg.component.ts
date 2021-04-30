import { Component } from '@angular/core';

@Component({
  selector: 'app-open-changes-dlg',
  template: `
    <h1 mat-dialog-title>Unsaved changes</h1>
    <div mat-dialog-content>
      <p>You still have unchanged changes. If you leave this tab they will be reset to their prior state.</p>
    </div>

    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">Stay</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Leave</button>
    </div>
  `,
  styles: []
})
export class OpenChangesDlgComponent {

}
