import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {checkToken} from "./shared/dialogs/twitch-connection-edit/twitch.oauth";

@Injectable({ providedIn: 'root'})
export class OAuthGuard  {
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
