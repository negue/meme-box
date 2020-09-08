import {Component, OnInit} from '@angular/core';
import {WebsocketService} from "../../../core/services/websocket.service";
import {AppService} from "../../../state/app.service";

@Component({
  selector: 'app-persistence-actions',
  templateUrl: './persistence-actions.component.html',
  styleUrls: ['./persistence-actions.component.scss']
})
export class PersistenceActionsComponent implements OnInit {

  constructor(private wsService: WebsocketService,
              private appService: AppService) { }

  ngOnInit(): void {

  }

  deleteAllConfig() {
    this.appService.deleteAll();
  }

  importAll() {
    this.appService.importAll();
  }
}
