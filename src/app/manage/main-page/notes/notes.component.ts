import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MemeboxWebsocketService} from "@memebox/app-state";
import {uuid} from "@gewd/utils";
import {WidgetStoreRemoteAdapter} from "../../../shared/components/dynamic-iframe/widget-store-remote-adapter.service";
import {Subject} from "rxjs";
import {debounceTime, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit, OnDestroy {

  public notesChanged$ = new Subject<string>();
  public notesControl = new FormControl();
  private noteInstance = uuid();
  private destroy$ = new Subject<void>();

  constructor(
    private websocket: MemeboxWebsocketService,
    private remoteStoreApiAdapter: WidgetStoreRemoteAdapter
  ) { }

  async ngOnInit(): Promise<void> {
    this.websocket.sendWidgetRegistration('notes', this.noteInstance, true);

    const result = await this.remoteStoreApiAdapter.getCurrentData('notes');

    if (result) {
      this.notesControl.patchValue(result['notes']);
    }

    this.notesChanged$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(newValue => {
      this.remoteStoreApiAdapter.updateData('notes', this.noteInstance, {
        notes: newValue
      });
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.websocket.sendWidgetRegistration('notes', this.noteInstance, false);
  }

}
