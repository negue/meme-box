import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-open-feedback-button',
  templateUrl: './open-feedback-button.component.html',
  styleUrls: ['./open-feedback-button.component.scss']
})
export class OpenFeedbackButtonComponent {

  @Input()
  public feedbackTarget = '';

  openFeedback(): void {
    const body = `Please extend the title with a short version of your feedback/suggestion`

    this.openGithubTarget('Feedback for', body,
      'https://github.com/negue/meme-box/discussions/new?category=feedback&');
  }

  openBugReport() {
    const body = `Please extend the title with a short version of your issue`

    this.openGithubTarget('Issue in', body,
      'https://github.com/negue/meme-box/issues/new?');
  }

  private openGithubTarget(titlePrefix: string,
                           body: string,
                           githubTargetUrl: string) {
    const title = `${titlePrefix}: ${this.feedbackTarget}`;
    const urlToOpen = `${githubTargetUrl}title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

    window.open(urlToOpen, '_blank');
  }
}
