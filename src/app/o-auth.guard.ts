import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {checkToken} from "./shared/dialogs/twitch-connection-edit/twitch.oauth";

@Injectable({ providedIn: 'root'})
export class OAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean  {
    const tokenAvailable = checkToken();

    if (tokenAvailable) {
      return true;
    }

    this.router.navigate(['/manage']);

    return false;
  }
}
