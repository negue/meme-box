import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Clip, Twitch} from "@memebox/contracts";
import {Observable} from "rxjs";
import {AppQueries} from "../../../../state/app.queries";

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

  twitchEvents = ['message', 'follow', 'sub', 'bits', 'raid', 'host', 'etc'];
  memeList$: Observable<Clip[]> = this.appQueries.clipList$;

  @Output()
  added = new EventEmitter<Twitch>();

  constructor(private appQueries: AppQueries) {
  }

  ngOnInit(): void {
  }

  triggerAdd() {
    if (!this.formGroup.valid) {
      return;
    }

    const newEvent: Twitch = this.formGroup.value;

    this.added.emit(newEvent);

    this.formGroup.reset();
  }
}
