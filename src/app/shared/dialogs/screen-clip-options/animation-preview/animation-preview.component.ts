import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-animation-preview',
  templateUrl: './animation-preview.component.html',
  styleUrls: ['./animation-preview.component.scss']
})
export class AnimationPreviewComponent implements OnInit, OnChanges {

  @Input()
  public animationList: string[] = [];

  @Input()
  public selectedAnimationConfig = '';

  @Input()
  public animationDuration = 777;

  public animationToShow = '';

  ngOnInit(): void {
    this.selectNewAnimation();
  }

  ngOnChanges ({selectedAnimationConfig}: SimpleChanges): void {
    if (selectedAnimationConfig.previousValue === '') {
      this.animationEnded();
    }
  }

  animationEnded (): void {
    this.animationToShow = '';

    setTimeout(() => {
      this.selectNewAnimation();
    }, 700);
  }

  private selectNewAnimation () {
    if (this.selectedAnimationConfig === 'random') {
      this.animationToShow = this.randomAnimation();
    } else {
      this.animationToShow = this.selectedAnimationConfig;
    }
  }

  private randomAnimation() {
    const randomIndex = Math.floor(Math.random() * this.animationList.length);     // returns a random integer from 0 to 9

    return this.animationList[randomIndex];
  }
}
