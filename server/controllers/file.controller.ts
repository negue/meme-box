import { Persistence } from "../persistence";
import { getFiles, mapFileInformations } from "../file.utilts";
import { ENDPOINTS, FileInfo, SERVER_URL } from "@memebox/contracts";
import fs from "fs";
import { allowedFileUrl } from "../validations";
import { Controller, Get, Inject, PathParams, Req } from "@tsed/common";
import { PERSISTENCE_DI } from "../providers/contracts";
import { NotFound, PreconditionFailed } from "@tsed/exceptions";
import type { Request } from 'express';
import { GetPreviewFilePath } from "../persistence.functions";
import { safeResolve } from "../path.utils";


@Controller(ENDPOINTS.FILE.PREFIX)
export class FileController {
  constructor(
    @Inject(PERSISTENCE_DI) private _persistence: Persistence
  ) {
  }

  @Get('')
  async getList(): Promise<FileInfo[]> {
    const mediaFolder = this._persistence.getConfig().mediaFolder;

    // fullpath as array
    const files = await getFiles(mediaFolder);


    // files with information
    const fileInfoList = mapFileInformations(mediaFolder, files);

    return fileInfoList;
  }

  @Get(`${ENDPOINTS.FILE.BY_ID}:mediaId`)
  getById(
    @PathParams("mediaId") mediaId: string,
  ): Buffer {
    if (!mediaId){
      throw new PreconditionFailed('need a media ID');
    }

    // simple solution
    // check one path and then other
    const mediaFolder = this._persistence.getConfig().mediaFolder;
    const clipMap = this._persistence.fullState().clips;

    const clip = clipMap[mediaId];

    if (!clip) {
      throw new PreconditionFailed('invalid mediaId');
    }

    const filename = clip.path.replace(`${SERVER_URL}/file`, mediaFolder);

    if (fs.existsSync(filename)) {
      const loadedFile = fs.readFileSync(filename);

      return loadedFile;
    }

    throw new NotFound('no media file found');
  }


  @Get(`${ENDPOINTS.FILE.PREVIEW}:mediaId`)
  getPreviewById(
    @PathParams("mediaId") mediaId: string,
  ): Buffer {
    if (!mediaId){
      throw new PreconditionFailed('need a media ID');
    }

    // simple solution
    // check one path and then other
    const clipMap = this._persistence.fullState().clips;

    const clip = clipMap[mediaId];

    if (!clip) {
      throw new PreconditionFailed('invalid mediaId');
    }

    const filename = GetPreviewFilePath(clip.id);

    if (fs.existsSync(filename)) {
      const loadedFile = fs.readFileSync(filename);

      return loadedFile;
    }

    throw new NotFound('no media file found');
  }

  // dev mode : "/src/assets"
  // prod mode:  "/assets"
  @Get(ENDPOINTS.FILE.ANY_FILE)
  getByPath(
    @Req() request: Request,
  ): Buffer {
    const firstParam = request.params[0];

    if (!firstParam){
      throw new PreconditionFailed('need a param');
    }

    if (!allowedFileUrl(firstParam)) {
      throw new PreconditionFailed('need a param');
    }

    // simple solution
    // check one path and then other
    const mediaFolder = this._persistence.getConfig().mediaFolder;

    const filename = safeResolve(mediaFolder, firstParam);

    if (fs.existsSync(filename)) {
      const loadedFile = fs.readFileSync(filename);

      return loadedFile;
    }

    throw new NotFound('no media file found');
  }
}
