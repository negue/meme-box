import {fileEndingToType} from "../projects/utils/src/lib/files";
import {basename, extname, resolve, sep} from "path";
import {FileInfo} from "../projects/contracts/src/lib/types";
import fs from "fs";
import {SERVER_URL} from "../projects/contracts/src/lib/placeholders";

const { readdir } = fs.promises;

export async function getFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? await getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

export function mapFileInformations (
  mediaFolder: string,
  currentAppPort: string,
  files: string[]): FileInfo[] {

  // remove path separator at the end
  if (mediaFolder.endsWith(sep)) {
    mediaFolder = mediaFolder.substring(0, mediaFolder.length - sep.length);
  }

  // files with information
  return files.map((fullPath: string) => {
    const ext = extname(fullPath);
    const fileName = basename(fullPath);

    const fileType = fileEndingToType(ext);

    const convertedPath = fullPath
      .replace(mediaFolder, `${SERVER_URL}/file`);

    // path separator, not URL
    const splittedPath = convertedPath.split(sep);

    const apiUrl = splittedPath.join('/');

    return {
      fullPath,
      fileName,
      ext,
      fileType,
      apiUrl
    }
  });
}
