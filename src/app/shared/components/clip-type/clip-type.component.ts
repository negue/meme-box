import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-clip-type',
  templateUrl: './clip-type.component.html',
  styleUrls: ['./clip-type.component.css']
})
export class ClipTypeComponent implements OnInit {

  @Input()
  public type: number;

  constructor() { }

  ngOnInit(): void {
  }

}
