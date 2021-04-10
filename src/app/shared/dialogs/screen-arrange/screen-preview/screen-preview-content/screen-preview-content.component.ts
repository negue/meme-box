import { Component, Input } from '@angular/core';
import { Screen } from '@memebox/contracts';

@Component({
  selector: 'app-screen-preview-content',
  templateUrl: './screen-preview-content.component.html',
  styleUrls: ['./screen-preview-content.component.scss']
})
export class ScreenPreviewContentComponent {
  @Input()
  screen: Screen;
}
