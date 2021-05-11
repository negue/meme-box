import {BodyParams, Controller, Get, PathParams, Put} from "@tsed/common";
import {WidgetConnectionState} from "../providers/widget-connection.state";
import {UseOpts} from "@tsed/di";
import {NamedLogger} from "../providers/named-logger";

@Controller("/widget-state")
export class WidgetStateController {

  constructor(
    @UseOpts({name: 'WidgetStateController'}) private logger: NamedLogger,
    private widgetConnectionState: WidgetConnectionState
  ) {
  }

  @Get('/:mediaId')
  getWidgetState(
    @PathParams("mediaId") mediaId: string,
  ): unknown {
    return {};
  }

  @Put('/:mediaId/:widgetInstance')
  updateScreen(
    @PathParams("mediaId") mediaId: string,
    @PathParams("widgetInstance") widgetInstanceId: string,
    @BodyParams() updatedState: unknown
  ): void {
    if (this.widgetConnectionState.isTheMainInstance(mediaId, widgetInstanceId)) {
      this.logger.info('Allowed to update the State', { widgetInstanceId });

      // allowed to save
    }
     else {

      this.logger.info('Not allowed to update the State', { widgetInstanceId });
    }
  }
}
