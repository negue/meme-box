import {BodyParams, Controller, Get, PathParams, Put} from "@tsed/common";
import {WidgetConnectionState} from "../providers/widget-connection.state";
import {UseOpts} from "@tsed/di";
import {NamedLogger} from "../providers/named-logger";
import {ActionStore} from "@memebox/shared-state";
import {ActionPersistentStateHandler} from "../providers/actions/action-persistent-state.handler";

// TODO extract the endpoint path as constant
@Controller("widget-state")
export class WidgetStateController {

  constructor(
    @UseOpts({name: 'WidgetStateController'}) private logger: NamedLogger,
    private widgetConnectionState: WidgetConnectionState,
    private actionStateHandler: ActionPersistentStateHandler
  ) {
  }

  @Get('/:mediaId')
  getWidgetState(
    @PathParams("mediaId") mediaId: string,
  ): Promise<ActionStore> {
    const widgetFileHandler = this.actionStateHandler.getActionFileHandler(mediaId);

    return widgetFileHandler.loadFile({});
  }


  @Put('/:mediaId/:widgetInstance')
  updateScreen(
    @PathParams("mediaId") mediaId: string,
    @PathParams("widgetInstance") widgetInstanceId: string,
    @BodyParams() updatedState: ActionStore
  ): void {
    if (this.widgetConnectionState.isTheMainInstance(mediaId, widgetInstanceId)) {
      const widgetFileHandler = this.actionStateHandler.getActionFileHandler(mediaId);

      widgetFileHandler.update(updatedState);

      this.logger.info('Allowed to update the State', { widgetInstanceId });

      // allowed to save
    } else {
      this.logger.info('Not allowed to update the State', { widgetInstanceId });
    }
  }
}
