import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemMasterRoutingModule } from './item-master-routing.module';
import { EntryComponent } from './entry/entry.component';
import { ListComponent } from './list/list.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { NgxBarcodeModule } from 'ngx-barcode';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ContextMenuModule, TreeModule, FileUploadModule } from 'primeng';
@NgModule({
  declarations: [EntryComponent, ListComponent],
  imports: [
    CommonModule,
    ItemMasterRoutingModule,
    SharedModule,
    NgxBarcodeModule,
    NgxQRCodeModule,
    ContextMenuModule,
    TreeModule,
    FileUploadModule,
  ],
})
export class ItemMasterModule {}
