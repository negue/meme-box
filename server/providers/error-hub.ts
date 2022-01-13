import {Service} from "@tsed/di";
import {takeLatestItems} from "@memebox/utils";
import {NamedLogger} from "./named-logger";
import {filter, shareReplay, startWith} from "rxjs/operators";


@Service()
export class ErrorHub {
  private _newestError$ = NamedLogger.NewestError$;

  public NewestError$ = this._newestError$.pipe(
    filter(error => !!error)
  );
  public Latest5Errors$ = this.NewestError$.pipe(
    takeLatestItems(5),
    startWith([]),
    shareReplay()
  );

  public queueError(error: Error, context?: string) {
    this._newestError$.next({
      error,
      context
    });
  }
}
