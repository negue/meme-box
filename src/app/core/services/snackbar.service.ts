import {Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";


const SNACKBAR_DURATION = 3000;

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private matSnackBar: MatSnackBar) {
  }

  normal(text: string) {
    this.matSnackBar.open(text, null, {
      duration: SNACKBAR_DURATION,
      verticalPosition: 'top'
    });
  }
}
