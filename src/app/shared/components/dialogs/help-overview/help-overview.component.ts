import {Component, OnInit} from '@angular/core';
import {MarkdownDialogPayload} from "../markdown/markdown.component";
import {DialogService} from "../dialog.service";
import {TUTORIALS_GITHUB_PAGE} from "../../../../../../server/constants";

@Component({
  selector: 'app-help-overview',
  templateUrl: './help-overview.component.html',
  styleUrls: ['./help-overview.component.scss']
})
export class HelpOverviewComponent implements OnInit {

  public helpItems: MarkdownDialogPayload[] = [
    {
      name: 'Getting Started',
      githubName: 'getting_started.md'
    }
  ];

  constructor(private dialogService: DialogService) { }

  ngOnInit(): void {
  }

  openDialog(item: MarkdownDialogPayload) {
    this.dialogService.showMarkdownFile(item)
  }

  openGithubRepo() {
    window.open(TUTORIALS_GITHUB_PAGE, '_blank');
  }
}
