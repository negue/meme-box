import path from "path";
import { createDirIfNotExists } from "../path.utils";
import fs from "fs";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

export class FileHandler<TFileContent> {
  private _currentContent: TFileContent;
  private _alreadyLoaded = false;
  private _debounceSubject = new Subject<void>();

  constructor(private filePath: string) {
    this._debounceSubject.pipe(
      debounceTime(5000)
    ).subscribe(value => {
      const getDirOfPath = path.dirname(filePath);

      createDirIfNotExists(getDirOfPath);

      const stringifiedData = JSON.stringify(this._currentContent, null, '  ');

      fs.writeFileSync(filePath, stringifiedData);
    })
  }

  public async loadFile(fallbackIfEmpty: TFileContent): Promise<TFileContent> {
    if (this._alreadyLoaded) {
      return this._currentContent;
    }

    const dir = path.dirname(this.filePath);

    // if the settings folder not exist
    // create it
    createDirIfNotExists(dir);

    return new Promise((resolve, reject) => {
      // Read the file
      fs.readFile(this.filePath, {
        encoding: 'utf8',
        flag: 'a+' // open or create if not exist
      }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (!data) {
          this._currentContent = fallbackIfEmpty;
        } else {
          this._currentContent = JSON.parse(data);
        }

        this._alreadyLoaded = true;

        resolve(this._currentContent);
      });
    });


  }

  public update(newContent: TFileContent): void {
    this._currentContent = newContent;
    this._debounceSubject.next();
  }
}
