import {BodyParams, Controller, Get, PathParams, Put} from "@tsed/common";
import {WidgetConnectionState} from "../providers/widget-connection.state";
import {UseOpts} from "@tsed/di";
import {NamedLogger} from "../providers/named-logger";
import {FileHandler} from "../utils/file-handler";
import path from "path";
import {NEW_CONFIG_PATH} from "../path.utils";

type WidgetStateType = Record<string, unknown>;

@Controller("/widget-state")
export class WidgetStateController {
  private _widgetStateMap = new Map<string, FileHandler<WidgetStateType>>();

  constructor(
    @UseOpts({name: 'WidgetStateController'}) private logger: NamedLogger,
    private widgetConnectionState: WidgetConnectionState
  ) {
  }

  @Get('/:mediaId')
  getWidgetState(
    @PathParams("mediaId") mediaId: string,
  ): Promise<WidgetStateType> {
    const widgetFileHandler = this.getWidgetFileHandler(mediaId);

    return widgetFileHandler.loadFile({});
  }


  @Put('/:mediaId/:widgetInstance')
  updateScreen(
    @PathParams("mediaId") mediaId: string,
    @PathParams("widgetInstance") widgetInstanceId: string,
    @BodyParams() updatedState: WidgetStateType
  ): void {
    if (this.widgetConnectionState.isTheMainInstance(mediaId, widgetInstanceId)) {
      const widgetFileHandler = this.getWidgetFileHandler(mediaId);

      widgetFileHandler.update(updatedState);

      this.logger.info('Allowed to update the State', { widgetInstanceId });

      // allowed to save
    } else {
      this.logger.info('Not allowed to update the State', { widgetInstanceId });
    }
  }

  private getWidgetFileHandler(mediaId: string) {
    let fileHandler: FileHandler<WidgetStateType>;

    if (!this._widgetStateMap.has(mediaId)) {
      fileHandler = new FileHandler<WidgetStateType>(path.join(NEW_CONFIG_PATH, 'widget-states', `${mediaId}.json`))
      this._widgetStateMap.set(mediaId, fileHandler);
    }  else {
      fileHandler = this._widgetStateMap.get(mediaId);
    }

    return fileHandler;
  }
}
