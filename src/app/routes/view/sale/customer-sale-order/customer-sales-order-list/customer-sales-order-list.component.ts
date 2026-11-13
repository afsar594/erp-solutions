import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SalesServiceService } from 'src/app/routes/service/sales-services/sales-service.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-customer-sales-order-list',
  templateUrl: './customer-sales-order-list.component.html',
  styleUrls: ['./customer-sales-order-list.component.scss']
})
export class CustomerSalesOrderListComponent implements OnInit {
  passEntry: any=1;
  dataset: any;
  licensekey: any;
  state: { Dir: string; Field: any; Skip: any; Take: any; Search: any; Filter: any; };
  search: any;
  filter: any;

  constructor(private saleService: SalesServiceService, private translate: TranslateService, public config: DynamicDialogConfig,public ref: DynamicDialogRef) { }

  ngOnInit(): void {
    this.licensekey = defaults.hotlicensekey;
    this.GetGridListData(null);
    this.initializeControls();
  }
  hotid: any = 'CustomerSalesOrderList';

  private hotRegisterer = new HotTableRegisterer();
  CustomerSalesOrder: Handsontable.GridSettings;

  initializeControls() {
    this.CustomerSalesOrder = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [30, 30, 90, 30, 30, 30, 30, 30],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      beforeOnCellMouseUp: (event, coords, TD) => {

        if (coords.col.valueOf() === 0) {
                    const hot = new Handsontable(document.getElementById('CustomerSalesOrder'), this.CustomerSalesOrder);
            var data = hot.getDataAtRow(coords.row);
this.CloseModel(data[0]);

          // hot.alter('insert_row', 2);
          // hot.alter("remove_row", [[0, 1]]);
          //  hot.setDataAtCell(0, 3,   'g');
          //this.newEntry();
        }
        else if (coords.col.valueOf() === 3) {
          // this.unitListing = true;
        }
        else if (coords.col.valueOf() === 5) {
        }
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'itemMasterBatchCode',
          type: 'numeric',
        },
        {
          data: 'PartNo',
          type: 'numeric'
        },
        {
          data: 'Material Name',
          type: 'numeric',
        },
        {
          data: 'itemMasterUnitPrice',
          type: 'autocomplete',
        },
        {
          data: 'Quantity',
          type: 'numeric',
        },
        {
          data: 'Price',
          type: 'numeric'
        },
        {
          data: 'Amount',
          type: 'numeric',
        },
        {
          data: 'Remark',
          type: 'numeric'
        }
      ],
      colHeaders: [

        this.translate.instant('CODE'),
        this.translate.instant('PartNo'),
        this.translate.instant('Material Name'),
        this.translate.instant('Unit'),
        this.translate.instant('Quantity'),
        this.translate.instant('Price'),
        this.translate.instant('Amount'),
        this.translate.instant('Remark'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }
  CloseModel(id) {
    this.passEntry=id;
    this.ref.close()
   }

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
      Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
      Skip: event != null ? event.first != null ? event.first : 0 : 0,
      Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
      Search: this.search,
      Filter: this.filter
    }
    this.saleService.GetCustomerOrdersGridList(this.state).subscribe((response: any) => {
      if (response.isSuccess && response.returnObject.data.length > 0) {
        this.dataset = response.returnObject.data;
      }
    })
  }

}
