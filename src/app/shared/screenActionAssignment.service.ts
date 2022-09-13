import {Injectable, NgModule} from "@angular/core";
import {DialogService} from "./dialogs/dialog.service";
import {ActionAssigningMode, Screen, UnassignedFilterEnum} from "@memebox/contracts";
import {AppService} from "@memebox/app-state";
import {DialogsModule} from "./dialogs/dialogs.module";


@Injectable({
  providedIn: 'any'
})
export class ScreenActionAssignmentService {
  constructor(
    private dialogService: DialogService,
    private appService: AppService
  ) {

  }

  public async showAssignmentDialog(screen: Partial<Screen>): Promise<void> {
    const selectedActionIdListBefore = Object.keys(screen.clips);

    const returnedActionIdList = await this.dialogService.showActionSelectionDialogAsync(
      {
        mode: ActionAssigningMode.Multiple,
        selectedActionIdList: selectedActionIdListBefore,

        dialogTitle: screen.name,
        showMetaItems: false,
        showOnlyUnassignedFilter: true,
        unassignedFilterType: UnassignedFilterEnum.Screens
      }
    );


    if (returnedActionIdList.length === 0) {
      return;
    }

    const newlyAdded = returnedActionIdList.filter(id => !selectedActionIdListBefore.includes(id));
    const nowDeleted = selectedActionIdListBefore.filter(id => !returnedActionIdList.includes(id));

    this.appService.addOrUpdateAssignedScreenMediaInBulk(screen.id,
      newlyAdded,
      nowDeleted);
  }
}

@NgModule({
  providers: [ScreenActionAssignmentService],
  imports: [DialogsModule]
})
export class ScreenActionAssignmentModule {

}
