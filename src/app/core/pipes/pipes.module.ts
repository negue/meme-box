import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SafePipe } from "./safe-url/safe-url.pipe";

@NgModule({
  imports: [CommonModule],
  declarations: [SafePipe],
  exports: [SafePipe],
})
export class PipesModule {}
