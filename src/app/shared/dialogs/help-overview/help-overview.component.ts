import {Component, OnInit} from '@angular/core';
import {DialogService} from "../dialog.service";
import {MARKDOWN_FILES, MarkdownDialogPayload, TUTORIALS_GITHUB_PAGE} from "../../../../../server/constants";

@Component({
  selector: 'app-help-overview',
  templateUrl: './help-overview.component.html',
  styleUrls: ['./help-overview.component.scss']
})
export class HelpOverviewComponent implements OnInit {

  public helpItems = MARKDOWN_FILES.filter(mdFile => !mdFile.hideFromOverview);

  constructor(private dialogService: DialogService) { }

  ngOnInit(): void {
  }

  openDialog(item: MarkdownDialogPayload): void  {
    this.dialogService.showMarkdownFile(item)
  }

  openGithubRepo(): void  {
    window.open(TUTORIALS_GITHUB_PAGE, '_blank');
  }
}
