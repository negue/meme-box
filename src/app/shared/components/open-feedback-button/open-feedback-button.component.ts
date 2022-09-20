import {Component, Input} from '@angular/core';
import {GithubService} from "@memebox/app-state";

@Component({
  selector: 'app-open-feedback-button',
  templateUrl: './open-feedback-button.component.html',
  styleUrls: ['./open-feedback-button.component.scss']
})
export class OpenFeedbackButtonComponent {

  @Input()
  public feedbackTarget = '';

  constructor(
    private _githubService: GithubService
  ) {
  }

  openFeedback(): void {
    const body = `Please extend the title with a short version of your feedback/suggestion`

    this._githubService.openNewFeedback('Feedback for: '+this.feedbackTarget, body);
  }

  openBugReport() {
    const body = `Please extend the title with a short version of your issue`

    this._githubService.openNewBug('Issue in: '+this.feedbackTarget, body);
  }
}
