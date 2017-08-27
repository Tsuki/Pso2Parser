import {NgModule} from '@angular/core';
import {MdIconModule, MdToolbarModule} from '@angular/material';

@NgModule({
  imports: [MdToolbarModule, MdIconModule],
  exports: [MdToolbarModule, MdIconModule],
})
export class MaterialModule {
}
