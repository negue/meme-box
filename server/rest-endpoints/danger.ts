import * as express from 'express';
import {PersistenceInstance} from "../persistence";
import {Clip, FileResult, MEDIA_TYPE_INFORMATION, MediaType, TargetScreenType} from "@memebox/contracts";
import {getFiles, mapFileInformations} from "../file.utilts";

// Only used in the Server
export function mediaToString(mediaType: MediaType) {
  return MEDIA_TYPE_INFORMATION[mediaType]?.labelFallback ?? "";
}

export const DANGER_ROUTES = express.Router();

DANGER_ROUTES
  .post('/clean_config', (req,res) => {
    PersistenceInstance.cleanUpConfigs();

    res.send({ok: true});
  })
  .post('/add_all', async (req, res) => {
    const targetScreenType: TargetScreenType = req.body.targetScreenType ?? TargetScreenType.OneScreen;

    const mediaFolder = PersistenceInstance.getConfig().mediaFolder;

    // fullpath as array
    const files = await getFiles(mediaFolder);

    // files with information
    const fileInfoList = mapFileInformations(mediaFolder, files);

    switch(targetScreenType) {
      // todo rename enum?
      case TargetScreenType.OneScreen:
      {
        // add a new screen
        const oneScreenId = PersistenceInstance.addScreen({
          name: 'Imported all files',
        });

        const newClips = fileInfoList.map(fileInfoToClip);

        // add all files (add-all in persistence? , or bulk-mode)
        PersistenceInstance.addAllClipsToScreen(oneScreenId, newClips)

        break;
      }

      case TargetScreenType.ScreenPerType:
      {
        // group all clips by type

        const groupedByType = groupBy(fileInfoList, 'fileType');

        console.info({groupedByType});

        for (const [key, value] of Object.entries(groupedByType)) {

          const screenPerTypeId = PersistenceInstance.addScreen({
            // key is string
            // but enum needs a "number" for it, so +string = number
            name: `All ${mediaToString(+key as any)} files`,
          });

          const newClips = value.map(fileInfoToClip);

          // add all files (add-all in persistence? , or bulk-mode)
          console.info({key, newClips, screenPerTypeId});
          PersistenceInstance.addAllClipsToScreen(screenPerTypeId, newClips)
        }

        break;
      }
    }

    res.send({ok: true});
  })
;


function fileInfoToClip (fileInfo: FileResult): Partial<Clip> {
  const clip: Partial<Clip> = {
    name: fileInfo.fileName,
    type: fileInfo.fileType,
    path: fileInfo.apiUrl,
    volumeSetting: 20, // XX / 100
  };

  if (clip.type === MediaType.Picture) {
    clip.playLength = 1500;
  }

  return clip;
}

function groupBy<T>(xs: T[], key: keyof T): {[key: string]: T[]} {
  return xs.reduce(function(rv, x) {
    (rv[x[key] as any] = rv[x[key] as any] || []).push(x);
    return rv;
  }, {});
};
