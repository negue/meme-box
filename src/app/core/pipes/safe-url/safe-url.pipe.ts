import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

/**
 * We need to sanitize a url for a IFrame to avoid unsafe value error.
 * more info : https://stackoverflow.com/questions/38037760/how-to-set-iframe-src-without-causing-unsafe-value-exception
 */
@Pipe({ name: "safeurl" })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
