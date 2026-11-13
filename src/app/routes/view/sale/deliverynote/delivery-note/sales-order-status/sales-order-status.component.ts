import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { DynamicDialogConfig, DynamicDialogRef, SelectItem } from 'primeng';
import { ItemMaster } from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';

@Component({
  selector: 'app-sales-order-status',
  templateUrl: './sales-order-status.component.html',
  styleUrls: ['./sales-order-status.component.scss'],
})
export class SalesOrderStatusComponent implements OnInit {
  selectedCustomers = []; // Array to hold selected customers
  loading = false;
  unitAry: any;
  unitListt: any;
  units: any;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  receivedData: any;
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  SalesOrderStatus: FormGroup;
  title: string;
  subtitle: string;
  dataset: any;
  index: number = 0;
  foundcustomer: any;
  foundLocation: any;
  cols: any;
  cars: any;
  customers: any;
  checkedCustomers: any;
  defaultValue: any;
  filterArray: any;
  handleChange(e) {
    this.index = e.index;
  }
  licensekey: any;
  gridHeader: string;
  hotid = 'salesorder';
  private hotRegisterer = new HotTableRegisterer();
  salesorder: Handsontable.GridSettings;

  initializeControls() {
    this.salesorder = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [
        40, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 40, 150,
      ],
      minRows: 3,
      width: '100%',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      // allowInsertColumn: false,
      // allowRemoveColumn: false,
      // allowRemoveRow: false,
      // autoWrapRow: false,
      // autoWrapCol: false,
      //  autoWrapRow: true,
      // height: 487,
      // maxRows: 22,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'A',
          type: 'text',
        },
        {
          data: 'PO. NO.',
          type: 'text',
        },
        {
          data: 'LPO No.',
          type: 'numeric',
        },
        {
          data: 'Date',
          type: 'numeric',
        },
        {
          data: 'Customer',
          type: 'numeric',
        },
        {
          data: 'Material',
          type: 'numeric',
        },
        {
          data: 'Unit',
          type: 'numeric',
        },
        {
          data: 'Qty',
          type: 'numeric',
        },
        {
          data: 'Delivery Qty',
          type: 'numeric',
        },
        {
          data: 'Balance',
          type: 'numeric',
        },
        {
          data: 'Stock',
          type: 'numeric',
        },
        {
          data: 'Unit Price',
          type: 'numeric',
        },
        {
          data: 'N',
          type: 'numeric',
        },
        {
          data: 'Amount',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('A'),
        this.translate.instant('PO No.'),
        this.translate.instant('LPO No.'),
        this.translate.instant('Date'),
        this.translate.instant('Customer'),
        this.translate.instant('Material'),
        this.translate.instant('Unit'),
        this.translate.instant('Qty'),
        this.translate.instant('Delivery Qty'),
        this.translate.instant('Balance'),
        this.translate.instant('Stock'),
        this.translate.instant('Unit Price'),
        this.translate.instant('N'),
        this.translate.instant('Amount'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
    this.getAllLocation();
    this.getAllCustomer();
    this.getAllItemMaster();
    this.setDefaultValue();
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
    private masterapi: MasterApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private stockApi: StockApiService
  ) {}

  ngOnInit(): void {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.receivedData = this.config.data;
    this.SalesOrderStatus = new FormGroup({
      Customer: new FormControl(''),
      item: new FormControl(''),
      location: new FormControl(),
      DateTO: new FormControl(new Date()),
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear() - 5))
      ),
      isDate: new FormControl(),
      total: new FormControl(),
    });
    this.getAllUnit();
    this.initializeControls();
    this.show();
    if (this.receivedData) {
      this.SalesOrderStatus.controls.location.setValue(
        this.receivedData.selectedLocation
      );
      this.SalesOrderStatus.controls.Customer.setValue(
        this.receivedData.selectedCustomer
      );
    }
  }
  show() {
    if (this.SalesOrderStatus.get('isDate').value === true) {
      this.defaultValue = {
        isDataChecked: true,
        locacationId: this.SalesOrderStatus.value.location
          ? this.SalesOrderStatus.value.location
          : 0,
        itemId: this.SalesOrderStatus.value.item
          ? this.SalesOrderStatus.value.item
          : 0,
        customerId: this.SalesOrderStatus.value.Customer
          ? this.SalesOrderStatus.value.Customer
          : 0,
        quotationId: 0,
        dateFrom:
          this.SalesOrderStatus.get('isDate').value === true
            ? this.SalesOrderStatus.value.DateFrom
            : null,
        dateTo:
          this.SalesOrderStatus.get('isDate').value === true
            ? this.SalesOrderStatus.value.DateTO
            : null,
      };
    } else {
      this.defaultValue = {
        locacationId: this.SalesOrderStatus.value.location
          ? this.SalesOrderStatus.value.location
          : 0,
        itemId: this.SalesOrderStatus.value.item
          ? this.SalesOrderStatus.value.item
          : 0,
        customerId: this.SalesOrderStatus.value.Customer
          ? this.SalesOrderStatus.value.Customer
          : 0,
        quotationId: 0,
        // dateFrom:this.SalesOrderStatus.get('isDate').value===true? this.SalesOrderStatus.value.DateFrom:null,
        // dateTo:this.SalesOrderStatus.get('isDate').value===true? this.SalesOrderStatus.value.DateTO:null,
      };
    }
    this.stockApi
      .GetPurchaseOrderStatuses(this.defaultValue)
      .subscribe((response: any) => {
        this.customers = response.result;
        this.filterArray = response.result;
        if (this.customers) {
          this.GetTotal();
        }
      });
  }

  GetTotal() {
    var value = 0;
    this.customers?.forEach((element: any) => {
      if (element && element.amount) {
        value += element.amount;
      }
      element.balancedQuantity =
        element.quantity - (element.deliveredQuantity ?? 0);
    });
    this.customers = this.customers?.filter((a) => a.balancedQuantity > 0);
    this.filterArray = this.customers;
    value = parseFloat(value.toFixed(2));
    this.SalesOrderStatus.controls.total.setValue(value);
  }
  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }

  setDefaultValue(): void {
    this.SalesOrderStatus.controls['location'].setValue(
      this.receivedData?.selectedLocation
    );
    this.SalesOrderStatus.controls['Customer'].setValue(
      this.receivedData?.selectedCustomer != -1
        ? this.receivedData?.selectedCustomer
        : 0
    );
  }
  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select--', value: '' });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName.trim());
    });
  }
  getAllCustomer() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.customerArray = k;
      this.customerList = k.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.customerList.unshift({ label: '--Select--', value: '' });
      this.customerArry = k.map((ar) => ar.customerMasterCustomerName.trim());
    });
  }

  getAllCustomer_OLD() {
    this.masterapi.GetAllCustomer().subscribe((k) => {
      this.customerArray = k;
      this.customerList = k.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.customerList.unshift({ label: '--Select--', value: 0 });
      this.customerArry = k.map((ar) => ar.customerMasterCustomerName.trim());
      this.foundcustomer = this.customerList?.find(
        (obj) => obj.label === this.receivedData?.selectedCustomer
      );
      this.SalesOrderStatus.controls['Customer'].setValue(
        this.foundcustomer?.value
      );
    });
  }
  getAllItemMaster() {
    this.masterapi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        value: kl.itemMasterItemId,
        label: kl.itemMasterItemName,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: '' });
      this.ItemMasterArry = k.result?.map(
        (ar) => ar.itemMasterItemName?.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  clearAllSelections() {
    this.selectedCustomers = [];
  }

  toggleSelection(customer: any) {
    const index = this.selectedCustomers.indexOf(customer);
    if (index === -1) {
      this.selectedCustomers.push(customer);
    } else {
      this.selectedCustomers.splice(index, 1);
    }
  }

  isSelected(customer: any): boolean {
    return this.selectedCustomers.includes(customer);
  }

  onSelectionChange() {
    // Handle selection change event if needed
  }

  export() {
    this.ref.close(this.selectedCustomers);
  }
  close() {
    this.ref.close();
  }
  filter() {
    let filteredArray = this.filterArray;
    if (
      this.SalesOrderStatus.value.customer != -1 &&
      this.SalesOrderStatus.value.customer != ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.customer === this.SalesOrderStatus.value.customer
      );
    }
    if (
      this.SalesOrderStatus.value.item != -1 &&
      this.SalesOrderStatus.value.item != ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.itemId === this.SalesOrderStatus.value.item
      );
    }
    if (
      this.SalesOrderStatus.value.location != -1 &&
      this.SalesOrderStatus.value.location != ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.locationId === this.SalesOrderStatus.value.location
      );
    }
    if (this.SalesOrderStatus.value.isDate) {
      const fromDateStr = this.SalesOrderStatus.value.DateFrom;
      const toDateStr = this.SalesOrderStatus.value.DateTO;

      const fromDate = new Date(fromDateStr).toISOString().split('T')[0];
      const toDate = new Date(toDateStr).toISOString().split('T')[0];

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.cpoDate).toISOString().split('T')[0];

        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.customers = filteredArray;
    }
    this.customers = filteredArray;
    this.GetTotal();
  }
  clearfilter() {
    this.SalesOrderStatus.get('Customer').setValue('');
    this.SalesOrderStatus.get('item').setValue('');
    this.SalesOrderStatus.get('location').setValue('');

    this.SalesOrderStatus.get('DateFrom').setValue(new Date());
    this.SalesOrderStatus.get('DateTO').setValue(new Date());
    this.SalesOrderStatus.get('isDate').setValue(false);
    this.show();
    this.customers = this.filterArray;
  }
}
