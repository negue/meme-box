import { Component, OnInit } from '@angular/core';

export const StyleguideColors = {
  // var(--palette-background-background)
  background: '#2f3640',
  foreground: '#ffffff',
  primary: '#4bcffa',
  // mat-css-color-accent()
  accent: '#575fcf',
  warn: '#f53b57',
  highlight: '#00d8d6', // todo add custom css var
  chipSelected: '#ffd32a'
}


@Component({
  selector: 'app-styleguide',
  templateUrl: './styleguide.component.html',
  styleUrls: ['./styleguide.component.scss']
})
export class StyleguideComponent implements OnInit {
  colors = [
    {
      name: '--highlighter-pink',
      hex: '#ef5777',
    },
    {
      name: '--sizzling-red',
      hex: '#f53b57',
    },
    {
      name: '--dark-periwinkle',
      hex: '#575fcf',
    },
    {
      name: '--free-speech-blue',
      hex: '#3c40c6',
    },
    {
      name: '--megaman',
      hex: '#4bcffa',
    },
    {
      name: '--spiro-disco-ball',
      hex: '#0fbcf9',
    },
    {
      name: '--fresh-turquoise',
      hex: '#34e7e4',
    },
    {
      name: '--jade-dust',
      hex: '#00d8d6',
    },
    {
      name: '--minty-green',
      hex: '#0be881',
    },
    {
      name: '--green-teal',
      hex: '#05c46b',
    },
    {
      name: '--narenji-orange',
      hex: '#ffc048',
    },
    {
      name: '--chrome-yellow',
      hex: '#ffa801',
    },
    {
      name: '--yriel-yellow',
      hex: '#ffdd59',
    },
    {
      name: '--vibrant-yellow',
      hex: '#ffd32a',
    },
    {
      name: '--sunset-orange',
      hex: '#ff5e57',
    },
    {
      name: '--red-orange',
      hex: '#ff3f34',
    },
    {
      name: '--hint-of-elusive-blue',
      hex: '#d2dae2',
    },  {
      name: '--london-square',
      hex: '#808e9b',
    },
    {
      name: '--increase-luminance-of-electromagnetic',
      hex: '#3F4855',
    },
    {
      name: '--electromagnetic',
      hex: '#2f3640',
    },
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
