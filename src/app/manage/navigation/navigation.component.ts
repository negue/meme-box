import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  links = [
    {path:'./media', displayName: 'Media'},
    {path:'./screens', displayName: 'Screens'},
    {path:'./settings', displayName: 'Settings'}
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
