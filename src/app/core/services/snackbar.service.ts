import {Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSnackBarConfig} from "@angular/material/snack-bar/snack-bar-config";

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

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private matSnackBar: MatSnackBar) {
  }

  normal(text: string, options: SnackbarOptions = null) {
    options = options ?? DEFAULT_OPTIONS;

    const emote = typeof options.emote !== 'undefined'
      ? options.emote
      : randomEmote();

    this.matSnackBar.open(`${emote} ${text} ${emote}`, options.action, options.config);
  }

  sorry(text: string, options: SnackbarOptions = null) {
    options = options ?? DEFAULT_OPTIONS;

    this.matSnackBar.open(text, options.action, options.config);
  }
}
