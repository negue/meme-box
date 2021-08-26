import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {SafePipe} from "./safe-url/safe-url.pipe";
import {ReadableMsPipe} from './readable-ms.pipe';
import {ClipToIframePipe} from './clip-to-iframe.pipe';
import {PositionToStringPipe} from "./position-to-string.pipe";
import {SettingsToSizingTypePipe} from "./settings-to-sizing-type.pipe";
import {VisibilityToStringPipe} from "./visibility-to-string.pipe";
import {MediaPathToUrlPipe, MediaToUrlPipe} from "./media-to-url.pipe";
import {LazyArrayPipe} from "./lazy-array.pipe";
import {VariableConverterPipe} from "./variable-converter.pipe";
import {MediaToPreviewUrlPipe} from "./media-to-preview-url.pipe";

const PIPES = [
  SafePipe,
  ReadableMsPipe, ClipToIframePipe,
  PositionToStringPipe, SettingsToSizingTypePipe,
  VisibilityToStringPipe, MediaToUrlPipe,
  LazyArrayPipe, VariableConverterPipe,
  MediaToPreviewUrlPipe, MediaPathToUrlPipe
];

@NgModule({
  imports: [CommonModule],
  declarations: PIPES,
  exports: [...PIPES],
})
export class PipesModule {}