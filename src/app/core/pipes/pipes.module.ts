import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {SafePipe} from "./safe-url/safe-url.pipe";
import {ReplaceholderPipe} from './replaceholder.pipe';
import {ReadableMsPipe} from './readable-ms.pipe';
import {ClipToIframePipe} from './clip-to-iframe.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SafePipe, ReplaceholderPipe, ReadableMsPipe, ClipToIframePipe],
  exports: [SafePipe, ReplaceholderPipe, ReadableMsPipe, ClipToIframePipe],
})
export class PipesModule {}
