import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {debounceTime} from "rxjs/internal/operators";
import {dynamicIframe, HtmlExternalFile} from "../../../../projects/utils/src/lib/dynamicIframe";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  customHTMLForm = new FormBuilder().group({
    html: '',
    htmlStyles: '',
    css: '',
    js: '',
    externalFiles: []
  });

  public externalFiles: HtmlExternalFile[] = [];

  @ViewChild('targetIframe', {static: true})
  targetIframe: ElementRef<HTMLIFrameElement>;

  jqueryAdded = false;

  constructor() { }

  ngOnInit(): void {

    this.externalFiles = JSON.parse(localStorage.getItem('external') ?? '[]');

    var previousValues = JSON.parse(localStorage.getItem('html_form') ?? '{}');

    this.customHTMLForm.patchValue(previousValues);

    this.customHTMLForm.valueChanges
      .pipe(
        debounceTime(1000)
      )
      .subscribe(value => {

        // save to storage
        localStorage.setItem('html_form', JSON.stringify(value));

      this.updateIframe();
    });


    this.updateIframe();
  }

  private updateIframe() {
    // just do it

    // CSS => <style>{content}</style>
    // JS => <script>{content}</scritp>
    /*elementsToReplace.push(`
      <script type="text/javascript">
        ${this.customHTMLForm.value.js}
      </script>
    `);*/
    dynamicIframe(this.targetIframe.nativeElement, {
      html: this.customHTMLForm.value.html,
      css: this.customHTMLForm.value.css,
      js: this.customHTMLForm.value.js,
      libraries: this.externalFiles
    })
  }

  addNewExternal() {
    this.externalFiles.push({type:'css', src:''});

    this.saveExternalArray();
  }

  deleteExternalFile(index: number) {
    this.externalFiles.splice(index, 1);

    this.saveExternalArray();
  }

  public saveExternalArray () {
    this.updateIframe();

    // save to storage
    localStorage.setItem('external', JSON.stringify(this.externalFiles));
  }
}
