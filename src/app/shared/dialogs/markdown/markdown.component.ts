import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { MARKDOWN_FILES, MarkdownDialogPayload, TUTORIALS_GITHUB_PAGE } from "../../../../../server/constants";
import { MarkdownLinkClicked } from "@gewd/markdown/module";
import { DialogService } from "../dialog.service";


@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent implements OnInit {

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

  ngOnInit(): void {
  }

  openMarkdownOnGitHub() {
    window.open(TUTORIALS_GITHUB_PAGE + '/' + this.data.githubName, '_blank');
  }

  handleLinkClick($event: MarkdownLinkClicked) {
    $event.event.preventDefault();

    const linkAttributes = $event.link.attributes;

    const realHref = linkAttributes.getNamedItem('href');

    const foundMarkdownItem = MARKDOWN_FILES.find(md => realHref.value.includes(md.githubName));

    this.dialogService.showMarkdownFile(foundMarkdownItem);
  }
}
