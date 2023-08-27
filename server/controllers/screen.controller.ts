import { BodyParams, Controller, Delete, Get, PathParams, Post, Put, Use } from "@tsed/common";
import { Persistence } from "@memebox/server-common";
import { Screen, ScreenMedia } from "@memebox/contracts";
import { screenValidations, validOrLeave } from "../validations";

// TODO to ENDPOINTS object

@Controller("screen")
export class ScreenController {

  constructor(
    private _persistence: Persistence
  ) {
  }

  @Get('/')
  listAllScreens(): Screen[] {
    return this._persistence.listScreens();
  }

  @Post('/')
  @Use([screenValidations, validOrLeave])
  addScreen(
    @BodyParams() newScreen: Screen
  ): any {
    const newScreenId = this._persistence.addScreen(newScreen);

    return {
      ok: true,
      id: newScreenId
    };
  }

  @Put('/:screenId')
  updateScreen(
    @PathParams("screenId") screenId: string,
    @BodyParams() updateScreen: Screen
  ): Screen {
    return this._persistence.updateScreen(screenId, updateScreen);
  }

  @Delete('/:screenId')
  deleteScreen(
    @PathParams("screenId") screenId: string
  ): void {
    this._persistence.deleteScreen(screenId);
  }


  // TODO to nested Controller ?


  @Put('/:screenId/clips/bulk')
  updateScreenMediaBulk(
    @PathParams("screenId") screenId: string,
    @BodyParams() updateScreenMedia: ScreenMedia[]  // todo rename type
  ): void {
    for (const media of updateScreenMedia) {
      this._persistence.updateScreenClip(screenId, media.id, media);
    }
  }


  @Put('/:screenId/clips/:mediaId')
  updateScreenMedia(
    @PathParams("screenId") screenId: string,
    @PathParams("mediaId") mediaId: string,
    @BodyParams() updateScreenMedia: ScreenMedia  // todo rename type
  ): ScreenMedia {
    return this._persistence.updateScreenClip(screenId, mediaId, updateScreenMedia);
  }

  @Delete('/:screenId/clips/:mediaId')
  deleteScreenMedia(
    @PathParams("screenId") screenId: string,
    @PathParams("mediaId") mediaId: string
  ): void {
    this._persistence.deleteScreenClip(screenId, mediaId);
  }
}
