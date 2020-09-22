import * as fs from "fs";

export function createDirIfNotExists(dir: string) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}
