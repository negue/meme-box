import {Injectable} from "@angular/core";

import VERSION_JSON from '../../../../../src/version_info.json';

@Injectable({
  providedIn: 'root'
  }
)
export class GithubService {
  public static NEW_BUG_URL = 'https://github.com/negue/meme-box/issues/new?';
  public static NEW_FEEDBACK_URL = 'https://github.com/negue/meme-box/discussions/new?category=feedback&';

  public openNewBug (title: string,
                     body: string) {
    this.openGithubTarget(title, body, GithubService.NEW_BUG_URL);
  }

  public openNewFeedback (title: string,
                     body: string) {
    this.openGithubTarget(title, body, GithubService.NEW_FEEDBACK_URL);
  }

  private openGithubTarget(title: string,
                           body: string,
                           githubTargetUrl: string) {
    body = [body,
      '',
      '### Version:',
      `> ${VERSION_JSON.VERSION_TAG} - ${VERSION_JSON.COMMIT}`
    ].join('\n');

    const urlToOpen = `${githubTargetUrl}title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

    window.open(urlToOpen, '_blank');
  }
}
