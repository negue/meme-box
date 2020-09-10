import {FileResult, MediaType} from "../../projects/contracts/src/public-api";
import {SERVER_URL} from "../../projects/contracts/src/lib/placeholders";

const { resolve, basename, extname, sep, normalize } = require('path');
const { readdir } = require('fs').promises;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

export function fileEndingToType (fileEnding: string) : MediaType {
  fileEnding = fileEnding.toLowerCase().replace('.', '');

  switch (fileEnding) {
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'png':
      return MediaType.Picture;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
      return MediaType.Audio;
    case 'mp4':
    case 'webm':
      return MediaType.Video;
  }
}

export async function listAllFilesFromFolderAsync (mediaFolder: string): Promise<FileResult[]> {

  // fullpath as array
  const files = await getFiles(mediaFolder);

  // files with information
  const fileInfoList = files.map((fullPath: string) => {
    const ext = extname(fullPath);
    const fileName = basename(fullPath);

    const fileType = fileEndingToType(ext);

    // TODO replace PORT with the "--port"
    const apiUrl = fullPath
      .replace(mediaFolder,
        `${SERVER_URL}/file`
      ).split(sep).join('/');

    return {
      fullPath,
      fileName,
      ext,
      fileType,
      apiUrl
    };
  });

  return fileInfoList;
}
