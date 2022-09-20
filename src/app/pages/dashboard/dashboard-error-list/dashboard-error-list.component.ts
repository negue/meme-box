import {Component} from '@angular/core';
import {ErrorsService, GithubService} from "@memebox/app-state";
import {ErrorWithContext} from "@memebox/contracts";

@Component({
  selector: 'app-dashboard-error-list',
  templateUrl: './dashboard-error-list.component.html',
  styleUrls: ['./dashboard-error-list.component.scss']
})
export class DashboardErrorListComponent {
  public latestErrors$ = this._errorService.latestErrorList$;

  constructor(
    private _errorService: ErrorsService,
    private _githubService: GithubService
  ) { }

  public reportError(error: ErrorWithContext) {
    const githubBodyToSent: string[] = [
      '### What are the Steps to reproduce this issue:',
      '\n',
      '\n',
      '### Message',
      `> ${error.errorMessage}`,
      '\n',
      '### Context',
      `> ${error.context}`,
      '\n',
      '### Stack',
      '```',
      error.errorStack,
      '```'
    ];


    this._githubService.openNewBug('Error: '+error.errorMessage, githubBodyToSent.join('\n'));
  }

}
