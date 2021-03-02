import {fileEndingToType} from "../projects/utils/src/lib/files";
import {basename, extname, resolve, sep} from "path";
import {FileInfo, SERVER_URL} from '@memebox/contracts';
import fs from "fs";

const { readdir } = fs.promises;

export async function getFiles(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? await getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

export function mapFileInformations (
  mediaFolder: string,
  files: string[]): FileInfo[] {

  if (files.length === 0) {
    return [];
  }

  // remove path separator at the end
  if (mediaFolder.endsWith(sep)) {
    mediaFolder = mediaFolder.substring(0, mediaFolder.length - sep.length);
  }

  if (mediaFolder.includes('/') && sep === '\\') {
    mediaFolder = mediaFolder.replace(/[/]/gm, sep);
  }

  // files with information
  return files.map((fullPath: string) => {
    const ext = extname(fullPath);
    const fileName = basename(fullPath);

    const fileType = fileEndingToType(ext);

    const convertedPath = fullPath
      .replace(mediaFolder, `${SERVER_URL}/file`);

    if (!convertedPath.includes(SERVER_URL)) {
      throw new Error('The converted file path had an issue, maybe check your Media-Path.');
    }

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
