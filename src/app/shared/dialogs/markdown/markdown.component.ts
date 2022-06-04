import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {MARKDOWN_FILES, MarkdownDialogPayload, TUTORIALS_GITHUB_PAGE} from "../../../../../server/constants";
import {MarkdownLinkClicked} from "@gewd/markdown/module";
import {DialogService} from "../dialog.service";


@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent {

  markdownFile$: Observable<string>;

  @ViewChild('dialogContent', {static: true})
  public dialogContent: ElementRef<HTMLElement>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MarkdownDialogPayload,
              private dialogRef: MatDialogRef<any>,
              private http: HttpClient,
              private dialogService: DialogService) {
    this.markdownFile$ = http.get(`./assets/tutorials/${data.githubName}`, {
      responseType: 'text'
    });
  }

  openMarkdownOnGitHub(): void  {
    window.open(TUTORIALS_GITHUB_PAGE + '/' + this.data.githubName, '_blank');
  }

  handleLinkClick($event: MarkdownLinkClicked): void  {
    $event.event.preventDefault();

    const linkAttributes = $event.link.attributes;

    const realHrefAttribute = linkAttributes.getNamedItem('href');
    const realHrefValue = realHrefAttribute.value;

    // markdown header scrollto anchors
    if (realHrefValue.startsWith('#')) {
      const scrollToElement = this.dialogContent.nativeElement.querySelector<HTMLHeadingElement>(realHrefValue);

      scrollToElement.scrollIntoView();

      return;
    }

    const foundMarkdownItem = MARKDOWN_FILES.find(md => realHrefValue.includes(md.githubName));

    if (foundMarkdownItem) {
      // if its a found tutorial file, open a new markdown dialog
      this.dialogService.showMarkdownFile(foundMarkdownItem);
      return;
    }

    // open external URLs
    window.open(realHrefValue, '_blank');
  }
}
