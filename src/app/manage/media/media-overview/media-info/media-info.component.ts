import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {Clip, Screen} from "@memebox/contracts";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AppQueries} from "../../../../state/app.queries";

@Component({
  selector: 'app-media-info',
  templateUrl: './media-info.component.html',
  styleUrls: ['./media-info.component.scss']
})
export class MediaInfoComponent implements OnInit {

  public screenList$: Observable<Screen[]> = this.appQueries.screensList$.pipe(
    map(screenList => screenList.filter(screen => !!screen.clips[this.info.id]))
  )

  @Input()
  public info: Clip;

  @Output()
  public onPreview = new EventEmitter();

  @Output()
  public onEdit = new EventEmitter();

  @Output()
  public onDelete = new EventEmitter();

  @Output()
  public onAssignObs = new EventEmitter();

  @Output()
  public onEditScreenClipOptions = new EventEmitter<Screen>();

  constructor(public domSanitizer: DomSanitizer,
              private appQueries: AppQueries) { }

  ngOnInit(): void {
  }
}
