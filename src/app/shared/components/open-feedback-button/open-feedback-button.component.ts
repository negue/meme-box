import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-open-feedback-button',
  templateUrl: './open-feedback-button.component.html',
  styleUrls: ['./open-feedback-button.component.scss']
})
export class OpenFeedbackButtonComponent {

  @Input()
  public feedbackTarget = '';

  openFeedback() {
    const title = `Feedback for: ${this.feedbackTarget}`;
    const body =  `Please extend the title with a short version of your feedback/suggestion`
    // const urlToOpen = `https://github.com/negue/meme-box/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    const urlToOpen = `https://github.com/negue/meme-box/discussions/new?category=feedback&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

    window.open(urlToOpen, '_blank');
  }
}
