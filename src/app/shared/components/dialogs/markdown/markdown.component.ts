import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TUTORIALS_GITHUB_PAGE} from "../../../../../../server/constants";

export interface MarkdownDialogPayload {
  name: string;
  githubName: string;
}

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
export class MarkdownComponent implements OnInit {

  markdownFile$: Observable<string>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: MarkdownDialogPayload,
              private dialogRef: MatDialogRef<any>,
              private http: HttpClient) {
    this.markdownFile$ = http.get(`./assets/tutorials/${data.githubName}`, {
      responseType: 'text'
    });
  }

  ngOnInit(): void {
  }

  openMarkdownOnGitHub() {
      window.open(TUTORIALS_GITHUB_PAGE + '/' + this.data.githubName, '_blank');

  }
}
