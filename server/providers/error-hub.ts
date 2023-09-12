import { Service } from "@tsed/di";
import { NamedLogger } from "@memebox/server-common";
import { filter } from "rxjs/operators";


@Service()
export class ErrorHub {
  private _newestError$ = NamedLogger.NewestError$;

  public NewestError$ = this._newestError$.pipe(
    filter(error => !!error)
  );
}
