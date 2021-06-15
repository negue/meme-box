import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-config-card',
  templateUrl: './config-card.component.html',
  styleUrls: ['./config-card.component.scss']
})
export class ConfigCardComponent implements OnInit {

  @Input()
  public title : string;

  @Input()
  public icon: string;

  constructor() { }

  ngOnInit(): void {
  }

}
