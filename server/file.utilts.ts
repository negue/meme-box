import {fileEndingToType} from "../projects/utils/src/lib/files";
import {basename, extname, resolve, sep} from "path";
import {FileInfo} from "../projects/contracts/src/lib/types";
import fs from "fs";

const { readdir } = fs.promises;

export async function getFiles(dir): Promise<string[]> {
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
  // files with information
  return files.map((fullPath: string) => {
    const ext = extname(fullPath);
    const fileName = basename(fullPath);

    const fileType = fileEndingToType(ext);

    // TODO replace PORT with the "--port"
    const apiUrl = fullPath
      .replace(mediaFolder,
        `http://localhost:${currentAppPort}/file`
      ).split(sep).join('/');

    return {
      fullPath,
      fileName,
      ext,
      fileType,
      apiUrl
    }
  });
}
