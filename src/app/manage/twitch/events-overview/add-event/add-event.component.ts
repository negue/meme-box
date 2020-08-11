import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Clip, Twitch, TwitchTypesArray} from "@memebox/contracts";
import {Observable} from "rxjs";
import {AppQueries} from "../../../../state/app.queries";
import {DialogService} from "../../../../shared/components/dialogs/dialog.service";

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {

  formGroup = new FormBuilder().group({
    event: '',
    clipId: ''
  });

  twitchEvents = TwitchTypesArray;
  clipList$: Observable<Clip[]> = this.appQueries.clipList$;

  @Output()
  added = new EventEmitter<Twitch>();

  constructor(private appQueries: AppQueries,
              private dialog: DialogService) {
  }

  ngOnInit(): void {
  }

  triggerAdd() {
    this.dialog.showTwitchEditDialog(null);
  }
}
