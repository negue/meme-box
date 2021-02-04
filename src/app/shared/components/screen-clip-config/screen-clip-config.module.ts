import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScreenClipConfigComponent} from './screen-clip-config.component';


@NgModule({
  declarations: [ScreenClipConfigComponent],
  exports: [
    ScreenClipConfigComponent
  ],
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ScreenClipConfigModule { }
