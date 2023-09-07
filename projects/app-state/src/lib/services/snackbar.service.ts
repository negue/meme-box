import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";
import merge from 'lodash/merge';
import {take} from 'rxjs/operators';

const EMOTES = [
  '🎉', '🙌','😎', '🤩',
  '👀', '✨', '🎊'
]

function randomEmote() {
  // random 0..1
  const randomIndex = Math.floor(Math.random()*EMOTES.length);

  return EMOTES[randomIndex];
}

const SNACKBAR_DURATION = 3000;

interface SnackbarOptions {
  emote?: string; // if its empty a random will be picked
  action?: string;
  config?: MatSnackBarConfig;
}

const DEFAULT_OPTIONS: SnackbarOptions = {
  config: {
    duration: SNACKBAR_DURATION,
    verticalPosition: 'top',
    horizontalPosition: "end"
  }
}

const DEFAULT_ERROR_OPTIONS: SnackbarOptions = {
  config: {
    duration: SNACKBAR_DURATION,
    verticalPosition: 'top',
    horizontalPosition: "end",
    panelClass: ['danger']
  }
}


@Injectable({
  providedIn: "root"
})
export class SnackbarService {

  constructor(private matSnackBar: MatSnackBar) {
  }

  normal(text: string, options: SnackbarOptions|null = null) {
    options = options ?? DEFAULT_OPTIONS;

    const emote = typeof options.emote !== 'undefined'
      ? options.emote
      : randomEmote();

    this.matSnackBar.open(`${emote} ${text} ${emote}`, options.action, options.config);
  }

  sorry(text: string, options: SnackbarOptions|null = null) {
    options = merge(DEFAULT_ERROR_OPTIONS, options);

   this.matSnackBar.open(text, options.action, options.config);
  }

  sorryWithAction(text: string, options: SnackbarOptions|null = null): Promise<boolean> {
    options = merge(DEFAULT_ERROR_OPTIONS, options);

    const snackbarRef = this.matSnackBar.open(text, options.action, options.config);

    return new Promise<boolean>((resolve) => {

      snackbarRef.onAction().pipe(
        take(1)
      ).subscribe(() => resolve(true));

      snackbarRef.afterDismissed().pipe(
        take(1)
      ).subscribe((value) => resolve(false));
    });
  }
}
