import {Injectable} from "@angular/core";
import {ConnectionStateService} from "./connection-state.service";
import {HttpClient} from "@angular/common/http";
import {AppConfig} from "@memebox/app/env";
import {API_PREFIX} from "../../../../../server/constants";

export const EXPRESS_BASE = AppConfig.expressBase;
export const API_BASE = `${EXPRESS_BASE}${API_PREFIX}/`;


@Injectable({
  providedIn: "root"
})
export class MemeboxApiService {
  constructor(
    private http: HttpClient,
    private connectionState: ConnectionStateService
  ) {
  }

  public postReturnString(url: string, data: unknown, offlineFallback: string){
    if (this.connectionState.isOffline()) {
      return Promise.resolve(offlineFallback);
    }

    return this.http.post<string>(API_BASE+url, data, {
      responseType: 'text' as any
    }).toPromise();
  }

  public post<TReturn>(url: string, data: unknown, offlineFallback: TReturn): Promise<TReturn> {
    if (this.connectionState.isOffline()) {
      return Promise.resolve(offlineFallback);
    }

    return this.http.post<TReturn>(API_BASE+url, data).toPromise();
  }


  public get<TResult>(url: string): Promise<TResult|undefined> {
    if (this.connectionState.isOffline()) {
      return Promise.resolve<TResult|undefined>(undefined);
    }


    return this.http.get<TResult>(API_BASE+url).toPromise();
  }

  public put(url: string, postData: unknown){
    if (this.connectionState.isOffline()) {
      return Promise.resolve();
    }

    return this.http.put<unknown>(API_BASE+url, postData).toPromise();
  }

  public delete(url: string){
    if (this.connectionState.isOffline()) {
      return Promise.resolve();
    }

    return this.http.delete<unknown>(API_BASE+url).toPromise();
  }
}
