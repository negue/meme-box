import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {SafePipe} from "./safe-url/safe-url.pipe";
import {ReplaceholderPipe} from './replaceholder.pipe';
import {ReadableMsPipe} from './readable-ms.pipe';
import {ClipToIframePipe} from './clip-to-iframe.pipe';
import {PositionToStringPipe} from "./position-to-string.pipe";
import {SettingsToSizingTypePipe} from "./settings-to-sizing-type.pipe";
import {VisibilityToStringPipe} from "./visibility-to-string.pipe";

const PIPES = [
  SafePipe, ReplaceholderPipe,
  ReadableMsPipe, ClipToIframePipe,
  PositionToStringPipe, SettingsToSizingTypePipe,
  VisibilityToStringPipe
];

@NgModule({
  imports: [CommonModule],
  declarations: PIPES,
  exports: PIPES,
})
export class PipesModule {}
