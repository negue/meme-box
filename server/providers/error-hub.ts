import {Service} from "@tsed/di";
import {NamedLogger} from "./named-logger";
import {filter} from "rxjs/operators";


@Service()
export class ErrorHub {
  private _newestError$ = NamedLogger.NewestError$;

  public NewestError$ = this._newestError$.pipe(
    filter(error => !!error)
  );
}
