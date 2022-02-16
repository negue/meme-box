import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import {Action, ActionType, Screen, Tag} from "@memebox/contracts";
import {ActivityQueries} from "@memebox/app-state";
import {NgChanges} from "../../../../../../projects/ui-components/src/lib/typed-ng-changes";
import {actionCanBeTriggeredWithVariables, actionHasVariables} from "@memebox/utils";

@Component({
  selector: "app-media-card",
  templateUrl: "./media-card.component.html",
  styleUrls: ["./media-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCardComponent implements OnInit, OnChanges {
  @Input()
  action: Action;

  @Input()
  screens: Screen[];

  @Input()
  tags: Tag[];

  @Output()
  onPreview = new EventEmitter();

  @Output()
  onEdit = new EventEmitter();

  @Output()
  onDelete = new EventEmitter();

  @Output()
  onDuplicate = new EventEmitter();

  @Output()
  onToggleActive = new EventEmitter();


  @Output()
  onOpenTriggerVariables = new EventEmitter();

  menuIsOpened = false;

  appearsInScreens: Screen[] = [];
  connectedTags: Tag[] = [];

  hasVariables = false;
  hasTriggerableVariables = false;
  showDetailsBar = false;

  readonly ACTION_TYPE = ActionType;

  constructor(
    public activityState: ActivityQueries
  ) {

  }

  ngOnInit(): void {
    this.updateNeededVariables();
  }

  ngOnChanges({action, screens, tags}: NgChanges<MediaCardComponent>): void {
    if (action || screens || tags) {
      this.updateNeededVariables();
    }
  }

  private updateNeededVariables () {
    this.appearsInScreens = this.createAppearsInScreensList();
    this.connectedTags = this.createConnectedTags();
    this.hasVariables = actionHasVariables(this.action);
    this.hasTriggerableVariables = actionCanBeTriggeredWithVariables(this.action);

    this.showDetailsBar = this.hasVariables
      || this.appearsInScreens.length > 0
      || this.connectedTags.length > 0;
  }

  private createAppearsInScreensList(): Screen[] {
    const screensEmpty = this.screens === null || this.screens.length === 0;
    if (this.action === null || screensEmpty) {
      return [];
    }
    return this.screens.filter(screen => screen.clips?.[this.action.id]).filter(s => !!s);
  }

  private createConnectedTags(): Tag[] {
    const tagssEmpty = this.tags === null || this.tags.length === 0;
    if (this.action === null || !this.action?.tags || tagssEmpty) {
      return [];
    }
    return this.tags.filter(tag => this.action.tags.includes(tag.id));
  }
}

