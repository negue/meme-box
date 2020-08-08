import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyleguideComponent } from './styleguide.component';



@NgModule({
    declarations: [StyleguideComponent],
    exports: [
        StyleguideComponent
    ],
    imports: [
        CommonModule
    ]
})
export class StyleguideModule { }
