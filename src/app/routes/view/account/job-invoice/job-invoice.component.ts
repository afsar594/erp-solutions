import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  SelectItem,
  MessageService,
  ConfirmationService,
  DialogService,
} from 'primeng';
import { timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  DepartmentMaster,
  CurrencyMaster,
  ChartofAccounts,
  ItemMaster,
} from 'src/app/routes/domain';
import { JobInvoice } from 'src/app/routes/domain/Accounts/JobInvoice';
import { JobInvoiceDetails } from 'src/app/routes/domain/Accounts/JobInvoiceDetails';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { MasterAccountsTable } from 'src/app/routes/domain/Masters/MasterAccountsTable';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { ToWords } from 'to-words';
import { ItemModifyComponent } from '../../sale/item-modify/item-modify.component';
import { AccountsTransactions } from 'src/app/routes/domain/Masters/AccountsTransactions';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { HrStaffMasterService } from 'src/app/routes/service/hr-staff-master.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';

@Component({
  selector: 'app-job-invoice',
  templateUrl: './job-invoice.component.html',
  styleUrls: ['./job-invoice.component.scss'],
})
export class JobInvoiceComponent implements OnInit {
  rptFilter: ReportFilterModel;
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  showItemList: boolean = false;
  ItemList: Array<any>;
  items: any;
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<string>;
  customerCols: Array<any>;
  jobInvoiceCols: Array<any>;
  jobInvoiceEditCols: Array<any>;
  jobCols: Array<any>;
  // locationList: Array<LocationMaster> = [];
  // currencyList: Array<CurrencyMaster> = [];
  departmentList: Array<DepartmentMaster> = [];
  jobInvoiceList: any;
  salesAccountList: Array<MasterAccountsTable> = [];
  showCustomerList: boolean = false;
  showJobList: boolean = false;
  showJobInvoiceList: boolean = false;
  showJobInvoiceEditList: boolean = false;
  SaveConfirm: boolean = false;
  unitList: Array<UnitMaster> = [];
  selectedItem: any;
  selectedUnit: UnitMaster;
  accountTransactionList: AccountsTransactions[] = [];
  urrencyList: SelectItem[];
  currArry: string[] = [];
  currency: CurrencyMaster[] = [];
  currencyList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  // unitList: SelectItem[];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  unitsArray: Array<string> = [];
  // invoiceGroup: FormGroup;
  index: number = 0;
  gAmount: number = 0;
  selectedCustomer: any;
  hotid = 'JobInvoice';

  jobInvoicearry: JobInvoice[] = [];
  savedJobInvoice: JobInvoice;

  private hotRegisterer = new HotTableRegisterer();
  JobInvoice_Entry: Handsontable.GridSettings;
  x: any;
  selectedJob: any;

  JobInvoiceFormGroup: FormGroup;

  btnFlag: ButtonFlag;

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitListing: boolean = false;
  unitCols: Array<any>;
  currentRow: number = 0;
  currentIndex: number;
  unitDetailsConversionTypeNumber: number = 1;
  unitDetailsUnitPrice: number = 1;
  funitid: number;
  unitListt: any;
  activeRow: { row: number; column: number };
  ItemMasterArrayByName: any;
  units: any;
  ItemMasterArray: ItemMaster[] = [];
  ScreenId: number;
  Permission: any;
  user: any;
  JOBCOST: boolean = false;
  JobInvoice_EntryDataset = [];
  VatCalculation: Boolean = false;
  stationmasterObj: StationMaster;
  displayPrintPreview: any;
  partyDetails: CustomerMaster;
  wordamt: any;
  UpdateItem: ItemMaster;
  Obj: any;
  DefAccCheck: any;
  DefAcc: string;
  v_typeList: SelectItem[];
  cashAccount: any;
  saleAccount: any;
  DiscountPaidAccount: any;
  vatPayableAccount: any;
  displayPrintPreview1: any;
  pdfSource: string;
  staffList: any;
  staffArray: any;
  ProgramSetting: any;
  enableVNo: boolean = false;
  constructor(
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private stockapiService: StockApiService,
    private masterApi: MasterApiService,
    private accountApi: AccountApiService,
    private messageService: MessageService,
    private fb: FormBuilder,

    public dialogService: DialogService,
    private router: Router,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private printService: FileSaverService,
    private crystalReportService: CrystalReportService
  ) {
    event: KeyboardEvent;
  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);
      this.user = this.permission.getUser();
      this.stationmasterObj = this.permission.getStation();
      if (rights) {
        var res = rights[0];
        this.Permission = {
          Allow: res?.workGroupPermissionsUallow,
          Add: res?.workGroupPermissionsUadd,
          Delete: res?.workGroupPermissionsUdelete,
          Edit: res?.workGroupPermissionsUedit,
          Print: res?.workGroupPermissionsUprint,
          View: res?.workGroupPermissionsUview,
        };
      }
    });
    this.v_typeList = [
      { label: 'Select', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
      { label: 'CARD', value: 'CARD' },
    ];
    this.JobInvoiceFormGroup = this.fb.group({
      jobInvoiceVoucherNo: [{ value: null, disabled: true }],
      jobInvoiceVoucherDate: [{ value: null, disabled: true }],
      jobInvoiceJobId: [{ value: '', disabled: true }],
      jobInvoiceCustomerId: [
        { value: '', disabled: true },
        [DropDownValidator],
      ],
      jobInvoiceCustomerName: [{ value: '', disabled: true }],
      jobInvoiceCustomerAddress: [{ value: '', disabled: true }],
      jobInvoiceLpoNo: [{ value: '', disabled: true }],
      jobInvoiceLpoDate: [{ value: null, disabled: true }],
      jobInvoiceSalesManId: [{ value: [0], disabled: true }],
      jobInvoiceLocationId: [{ value: [0], disabled: true }],
      jobInvoiceCurrencyId: [{ value: [0], disabled: true }],
      jobInvoiceSalesAccount: [
        { value: [0], disabled: true },
        [DropDownValidator],
      ],
      jobInvoiceRemarks: [{ value: '', disabled: true }],
      jobInvoiceDiscount: [{ value: [0], disabled: true }],
      jobInvoiceGrossAmount: [{ value: [0], disabled: true }],
      jobInvoiceNetAmount: [{ value: [0], disabled: true }],
      jobInvoiceId: new FormControl(null),
      jobInvoiceVat: [{ value: [0], disabled: true }],
      invoicetype: [{ value: [0], disabled: true }],
      jobInvoiceVatAmt: [{ value: [0], disabled: true }],
    });

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.items = [
      { field: 'itemMasterItemId', header: 'Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },
    ];
    this.unitCols = [
      { field: 'unitMasterUnitShortName', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];

    this.jobInvoiceCols = [
      { field: 'job_Invoice_Voucher_No', header: 'Voucher#' },
      { field: 'job_Invoice_Voucher_Date', header: 'Date' },
      { field: 'job_Invoice_Customer_Name', header: 'Customer' },
      { field: 'location', header: 'Location' },
      { field: 'job_Invoice_Gross_Amount', header: 'Gross Amount' },
      { field: 'job_Invoice_Discount', header: 'Discount' },
      { field: 'job_Invoice_Net_Amount', header: 'Net Amount' },
      { field: 'action', header: 'Action' },
    ];

    this.jobInvoiceEditCols = [
      { field: 'job_Invoice_Voucher_No', header: 'Voucher#' },
      { field: 'job_Invoice_Voucher_Date', header: 'Date' },
      { field: 'job_Invoice_Customer_Name', header: 'Customer' },
      { field: 'location', header: 'Location' },
      { field: 'job_Invoice_Gross_Amount', header: 'Gross Amount' },
      { field: 'job_Invoice_Discount', header: 'Discount' },
      { field: 'job_Invoice_Net_Amount', header: 'Net Amount' },
      { field: 'job_Invoice_Net_Amount', header: 'Net Amount' },
      { field: 'Actions', header: 'Actions' },
    ];
    this.initializeControls();
  }

  GetGeneralSettingbyKey() {
    this.masterApi.GetGeneralSettingbyKey('Allow_Manual_VoucherNo').subscribe(
      (res) => {
        this.ProgramSetting = res.result;
        this.enableVNo = this.ProgramSetting[0].generalSettingsBoolValue;
        this.initializeControls();
      },
      (error) => {
        this.initializeControls();
      }
    );
  }

  crystalReport() {
    this.rptFilter = {
      ReportName: 'JobInvoiceGeoMak',
      SelectionFormula: '',
      Parameters: [],
      SP_Queries: [],
      Queries: [
        `select * from vr_JobInvoice where VR_JobInvoice.Job_Invoice_ID='${
          this.JobInvoiceFormGroup.getRawValue().jobInvoiceId
        }'`,
      ],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        console.log('reponse', response);
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  printAsPDF() {
    const fileName = String(new Date().valueOf());
    var css: string = `

.rectImg {
height: 140px;
    width: 217px;
}

.squreImg {
  height: 145px;
  width: 145px;
}
#customers {
font-family: Arial, Helvetica, sans-serif;
border-collapse: collapse;
width: 100%;
  border:  2px solid #85898ee0;
}

#customers td,
#customers th {
border: 1px solid #ddd;
padding: 8px;

}

#customers tr:nth-child(even) {
background-color: #f2f2f2;
}

#customers tr:hover {
background-color: #ddd;
}

#customers th {
padding-top: 12px;
padding-bottom: 12px;
text-align: left;
background-color: #bcc0bf;
color: rgb(0, 0, 0);
text-align: center;
}
.flex {
    display: flex;
    margin-bottom: 5px;
    gap: 2px; /* Adjusted the gap value here */
   }

  .contain1{
    width: 43.5%;
     border-radius: 1px;
    margin-top: 6%;
     padding-bottom: 0%;
    padding: 8px;
   }

  .contain2{
    width: 43.5%;
     border-radius: 1px;
    margin-top: 5px;
     padding-bottom: 0%;
    padding: 8px;
    margin-left: 65px;
   }

   .bank2 {
    border: 2.5px solid rgb(201, 204, 204);
    width: 49.5%;
    margin-bottom: 5px;
    border-radius: 1px;
    margin-top: 5px;
     padding-bottom: 0%;
    padding: 8px;
    box-shadow: 5px 5px rgb(201, 204, 204);
   }

 .w70{
  width:280px;
 }

  .bank1 {
    border: 2.5px solid rgb(201, 204, 204);
    width: 49%;
    padding: 8px;
    margin-bottom: 5px;
    border-radius: 1px;
    margin-top: 5px;
     padding-bottom: 0%;
      box-shadow: 5px 5px rgb(201, 204, 204);
  }

.min-panel {
    min-height: 106px !important;
}

:host ::ng-deep .ui-table .ui-table-thead>tr>th {
    position: -webkit-sticky;
    position: sticky;
    top: -8px;
    box-shadow: 1px 3px 6px 0 rgba(32, 33, 36, 0.10);
}

@media screen and (max-width: 64em) {
    :host ::ng-deep .ui-table .ui-table-thead>tr>th {
        top: -8px;
    }
}

.ui-dropdown {
    min-width: 50% !important;
}

.signature-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.customer-signature {
    order: 1; /* Specifies the order of the flex items */
}

.authorized-signature {
    order: 2; /* Specifies the order of the flex items */
}


  .flexcol{
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
  }

  .flexrow{
      display: flex;
      flex-direction: row;
      justify-content: start;
      align-items: start;
  }

  .border{
      border: 1px #b1aeae solid;
      border-radius: 5px ;
      margin-bottom: 5px;
      padding: 15px;
  }
  .bR{
    border-right: 1px solid #ddd ;
    margin-right:10px ;
  }

  .rowgap{
      gap: 111px;
  }
  .w-80 {
    width: 80% !important;
  }
  .w-20 {
    width: 20% !important;
  }
  .flexSpaceBetween{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 20px;
  }

  .center {
    text-align: center;
  }

  .alignEnd{
    align-items: end;
}

.end{
  text-align: end;
}

.w-100 {
  width: 100% !important;
}
h2{
  margin: 0 0 8px 0;
}

.wp-50{
  width: 50% !important;
}

.alignstart{
  text-align: start;
}
.w-80 {
  width: 75% !important;
}
.w-20{
  width: 25% !important;
}
.page {
  page-break-after: always;
}
h2{
  margin: 0 0 8px 0;
}
h1{
  margin: 0 0 8px 0;
}
h1{
  margin: 0 0 8px 0;
}
.w0 {
  width: 40px !important;
}
.w50 {
  width: 35px !important;
}

@page {
  margin: 5mm 10mm;

}
@media print {
  thead {display: table-header-group;}
  tfoot {display: table-footer-group;}
  table { page-break-inside:auto ;
    font-size: 11px;}
  tr { page-break-inside:avoid; page-break-after:auto }

  body {margin: 0;}

  .gaprow{
    gap: 50px;
  }
  .container {
    position: relative;
    min-height: 100vh;
  }
  .print.page {
    page-break-after: always; /* Force page break after content */
    font-size: 12px;
  }
  .page-footer {
    // position: running(footer); /* Use "fixed" for sticking on the last page */
    position: absolute;
bottom: 0;
width: 100%;
height: 2.5rem;            /* Footer height */
}

  }

  @page :last {  /* Target the last page */

  }

}
#page-container {
  position: relative;
  min-height: 100vh;
}

#content-wrap {
  padding-bottom: 2.5rem;    /* Footer height */
}

#footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 2.5rem;            /* Footer height */
}
.page-footer {
text-align: center;

margin-left: 10%;
margin-top: -3px;
 border-top: 0px solid rgb(201, 204, 204);

}
.sp{
margin-top: 10px;
}
`;
    this.printService.PrintPDF('contentToConvertSv', css);
    this.userTrackingLog('PDF');
  }
  cindex: number;
  clickEvent(index) {
    this.cindex = index;
  }

  initializeControls() {
    this.accountApi.getJobinvoiceDropdown().subscribe((m) => {
      //item
      this.ItemList = m.resultSet?.itemMaster;
      this.ItemMasterArray = m.resultSet?.itemMaster;
      // unit
      this.unitList = m.resultSet?.unitMasters;
      this.units = m.resultSet?.unitMasters;
      this.unitList.forEach((element) => {
        this.unitsArray.push(element.unitMasterUnitFullName);
      });
      this.unitListt = m.resultSet?.unitMasters.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = m.resultSet?.unitMasters.map((ar) =>
        ar?.unitMasterUnitShortName?.trim()
      );
      // job
      this.jobArray = m.resultSet?.jobMasters;
      this.jobList = m.resultSet?.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.jobArry = m.resultSet?.jobMasters.map((ar) =>
        ar.jobMasterJobName?.trim()
      );
      //customer
      this.CustomerMasterArray = m.resultSet?.customerMasters;
      this.CustomerMasterList = m.resultSet?.customerMasters.map((kl) => ({
        label:
          kl.customerMasterCustomerReffAcNo != null
            ? kl.customerMasterCustomerName +
              ' -- ' +
              kl.customerMasterCustomerReffAcNo
            : kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.CustomerMasterList.unshift({
        label: '--Select Customer--',
        value: -1,
      });
      this.CustomerMasterArry = m.resultSet?.customerMasters.map(
        (ar) =>
          ar.customerMasterCustomerName?.trim() +
          '|' +
          ar.customerMasterCustomerNo
      );
      // sale man
      this.SalesManMasterArray = m.resultSet?.saleManList;
      this.SalesManMasterList = m.resultSet?.saleManList.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.SalesManMasterList.unshift({
        label: '--Select Sales Man--',
        value: -1,
      });
      this.SalesManMasterArry = m.resultSet?.saleManList.map(
        (ar) =>
          ar.salesManMasterSalesManName?.trim() +
          '|' +
          ar.salesManMasterSalesManId
      );
      //currency
      this.currency = m.resultSet?.currencyMasters;
      this.currencyList = m.resultSet?.currencyMasters.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      this.currArry = m.resultSet?.currencyMasters.map((ar) =>
        ar.currencyMasterCurrencyName?.trim()
      );
      //location
      this.locationArray = m.resultSet?.locationMaster;
      this.locationList = m.resultSet?.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = m.resultSet?.locationMaster.map((ar) =>
        ar.locationMasterLocationName?.trim()
      );
      //accounts
      this.accountArray = m.resultSet?.masterAccountsTables;
      this.accountList = m.resultSet?.masterAccountsTables.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = m.resultSet?.masterAccountsTables.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
      this.DefAccCheck = m.resultSet?.accountsSettings?.find(
        (i) => i.accountSettingsAccountDescription == 'Sales Account'
      )?.accountSettingsAccountTextValue;
      var res = m.resultSet.accountsSettings;
      const splitText12 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Cash Account'
      )?.accountSettingsAccountTextValue;
      const parts12 = splitText12.split('::');
      this.cashAccount = parts12[1]?.trim();
      const splitText = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Sales Account'
      )?.accountSettingsAccountTextValue;
      const parts = splitText.split('::');
      this.saleAccount = parts[1]?.trim();

      var res = m.resultSet.accountsSettings;
      const splitText0 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Discount Paid Account'
      )?.accountSettingsAccountTextValue;
      const parts0 = splitText0.split('::');
      this.DiscountPaidAccount = parts0[1]?.trim();

      const splitText3 = res?.find(
        (x) => x.accountSettingsAccountDescription == 'Vat Input'
      )?.accountSettingsAccountTextValue;
      const parts3 = splitText3.split('::');
      this.vatPayableAccount = parts3[1]?.trim();
    });

    this.JobInvoice_Entry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
      minRows: 9,
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
      enterMoves: { row: 0, col: 1 },

      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [8, 9],
        indicators: false,
      },
      columns: [
        {
          data: 'itemId',
          type: 'numeric',
          readOnly: true,
          width: 100,
        },
        {
          data: 'itemName',
          type: 'text',
          readOnly: true,
          width: 180,
        },
        {
          data: 'Unit',
          type: 'autocomplete',
          source: (query, callback) => {
            callback(this.unitsArray);
          },
          width: 100,
        },
        {
          data: 'Qty',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'Price',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
          //readOnly: true
        },
        {
          data: 'GAmount',
          type: 'numeric',
          readOnly: true,
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'Discount',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
        {
          data: 'NetAmount',
          type: 'numeric',
          readOnly: true,
          width: 100,
          // numericFormat: {
          //   pattern: '0,0.00',
          // },
        },

        {
          data: 'unitId',
          type: 'numeric',
          readOnly: true,
          width: 100,
        },
        {
          data: 'Discountvalue',
          type: 'numeric',
          numericFormat: {
            pattern: '0,0.00',
          },
          width: 100,
        },
      ],
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          this.showItemModal();
        } else if (coords.col.valueOf() === 2) {
          const hotinstance = this.hotRegisterer.getInstance(this.hotid);
          var data = hotinstance.getDataAtRow(coords.row);
          this.masterApi.GetUnitDetails(data[0]).subscribe((res) => {
            this.unitArray = res.result;
            this.unitArry = res.result.map((ar) =>
              ar.unitMasterUnitShortName?.trim()
            );
          });
          this.unitListing = true;
        } else if (
          coords.col.valueOf() === 1 &&
          this.JobInvoice_Entry.readOnly === false
        ) {
          const hotinstance = this.hotRegisterer.getInstance(this.hotid);
          var data = hotinstance.getDataAtRow(coords.row);
          this.EditItem(data[1], data[0]);
        }
      },

      afterSelection: (
        row,
        column,
        row2,
        column2,
        preventScrolling,
        selectionLayerLevel
      ) => {
        var x = this.hotRegisterer
          .getInstance(this.hotid)
          .getDataAtCell(row, column);
        if (column == 0) {
          this.currentIndex = row;
          // this.displayMaximizableItems = true;
        }
        this.currentRow = row;
        this.activeRow = { row, column };
      },
      afterChange: (changes, source) => {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        if (changes != null) {
          var data = hotinstance.getDataAtRow(changes[0][0]);

          if (
            data[3] != null &&
            data[4] != null &&
            changes[0][1] != 'NetAmount' &&
            changes[0][1] != 'GAmount'
          ) {
            //&& data[7] != null
            var sum1 = data[3] * data[4];
            if (data[6]) {
              var discPer = (data[6] / 100) * sum1;
            } else {
              var discPer = 0;
            }

            if (discPer > sum1) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Discount must be less than net amount',
              });
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 7, 0);
            } else {
              var totalSum = data[3] * data[4];
              var result = totalSum - discPer;
              if (this.currentRow >= 0 && data[0] != null) {
                this.JobInvoice_EntryDataset[this.currentRow].GAmount =
                  totalSum;
                this.JobInvoice_EntryDataset[this.currentRow].NetAmount =
                  result;
                this.JobInvoice_EntryDataset[this.currentRow].Discountvalue =
                  discPer;
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .updateSettings({ data: this.JobInvoice_EntryDataset });
              }
              this.ColumnSum();
            }
          }
          this.ColumnSum();
        }
      },
      beforeChange: (change: Handsontable.CellChange[]) => {
        // setting if prevent scrolling after selection
        if (change[0][1] === 0) {
          this.activeRow = { row: change[0][0], column: change[0][1] };
        }
      },
      afterValidate: (isValid, value, row, prop) => {
        if (!isValid) {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Invalid entry',
          });
        }
      },
      afterRemoveRow: (index: number, amount: number) => {
        this.ColumnSum();
      },

      colHeaders: [
        this.translate.instant('Item Id'),
        this.translate.instant('Material Name'),
        this.translate.instant('Unit'),
        this.translate.instant('Qty'),
        this.translate.instant('Price'),
        this.translate.instant('G Amount'),
        this.translate.instant('Disc. (%)'),
        this.translate.instant('Net Amount'),
        this.translate.instant('unitId'),
        this.translate.instant('DISC value'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  public getCustomerdetails(id: number) {
    let customer = this.CustomerMasterArray?.find(
      (k) => k.customerMasterCustomerNo === id
    );
    return customer;
  }
  EditItem(name, id) {
    const ref = this.dialogService.open(ItemModifyComponent, {
      header: 'Edit Item',
      width: '50%',
      contentStyle: { height: '50%', overflow: 'auto' },
      data: {
        itemName: name,
        itemId: id,
      },
    });

    ref.onClose.subscribe((res) => {
      if (res && !res.isSave) {
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 1, res.Itemname);
      } else {
        this.masterApi.GetAllItemMasterById(res.ItemId).subscribe((data) => {
          // Assuming updatedValue is properly defined as a FormGroup or a FormControl
          if (data.result != null) {
            this.Obj = {
              itemMasterAccountNo: data.result.itemMasterAccountNo,
              itemMasterItemId: 0,
              itemMasterMaterialCode: data.result.itemMasterMaterialCode,
              itemMasterItemName: res.Itemname,
              itemMasterStockType: data.result.itemMasterStockType,
              itemMasterItemType: data.result.itemMasterItemType,
              itemMasterSupplierId: data.result.itemMasterSupplierId,
              itemMasterVenderId: data.result.itemMasterVenderId,
              itemMasterSupplierCode: data.result.itemMasterSupplierCode,
              itemMasterPartNo: data.result.itemMasterPartNo,
              itemMasterReOrderLevel: data.result.itemMasterReOrderLevel,
              itemMasterItemSize: data.result.itemMasterItemSize,
              itemMasterColor: data.result.itemMasterColor,
              itemMasterShape: data.result.itemMasterShape,
              itemMasterPacking: data.result.itemMasterPacking,
              itemMasterRef2: data.result.itemMasterRef2,
              itemMasterRef1: data.result.itemMasterRef1,
              itemMasterUserId: data.result.itemMasterUserId,
              itemMasterLandingCost: data.result.itemMasterLandingCost,
              itemMasterVat: data.result.itemMasterVat,
              unitDetails: data.result.unitDetails.map((res) => ({
                unitDetailsBarcode: res.unitDetailsBarcode,
                unitDetailsConversionType: res.unitDetailsConversionType,
                unitDetailsDefUnit: res.unitDetailsDefUnit,
                unitDetailsDefWunit: res.unitDetailsDefWunit,
                unitDetailsDelStatus: res.unitDetailsDelStatus,
                unitDetailsDescrption: res.unitDetailsDescrption,
                unitDetailsHeight: res.unitDetailsHeight,
                unitDetailsId: 0,
                unitDetailsItemId: 0,
                unitDetailsOverhdPer: res.unitDetailsOverhdPer,
                unitDetailsPacking: res.unitDetailsPacking,
                unitDetailsProfitPer: res.unitDetailsProfitPer,
                unitDetailsRate: res.unitDetailsRate,
                unitDetailsReorder: res.unitDetailsReorder,
                unitDetailsUnitCost: res.unitDetailsUnitCost,
                unitDetailsUnitId: res.unitDetailsUnitId,
                unitDetailsUnitPrice: res.unitDetailsUnitPrice,
                unitDetailsWidth: res.unitDetailsWidth,
                unitDetailsWrate: res.unitDetailsWrate,
              })),
            };
          }
          if (this.Obj != null) {
            this.masterApi.NewItem(this.Obj).subscribe((res) => {
              if (res.valid) {
                this.UpdateItem = res.result;

                this.funitid =
                  this.UpdateItem?.unitDetails[0]?.unitDetailsUnitId;
                const Unit: string = this.unitListt?.find(
                  (l) => l.value == this.funitid
                )?.label;

                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(this.activeRow.row, 2, Unit);

                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    0,
                    this.UpdateItem?.itemMasterMaterialCode
                  );

                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    1,
                    this.UpdateItem?.itemMasterItemName
                  );
                this.hotRegisterer
                  .getInstance(this.hotid)
                  .setDataAtCell(
                    this.activeRow.row,
                    4,
                    this.UpdateItem?.unitDetails[0]?.unitDetailsUnitPrice
                  );

                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: res.message,
                });
              }
            });
          }
        });
      }
    });
  }

  ColumnSum() {
    var discountTotal: Number = 0;
    // var disc = 0;
    this.JobInvoice_EntryDataset.forEach((elemt: any) => {
      if (elemt && elemt.Discountvalue) {
        discountTotal += elemt.Discountvalue;
      }
    });

    this.JobInvoiceFormGroup.get('jobInvoiceDiscount').setValue(
      discountTotal.toFixed(2)
    );

    var NetAmount: Number = 0;
    this.JobInvoice_EntryDataset.forEach((elemt: any) => {
      if (elemt && elemt.NetAmount) {
        NetAmount += elemt.NetAmount;
      }
    });
    this.JobInvoiceFormGroup.get('jobInvoiceNetAmount').setValue(
      NetAmount.toFixed(2)
    );
    var value: Number = 0;
    this.JobInvoice_EntryDataset.forEach((elemt: any) => {
      if (elemt && elemt.GAmount) {
        value += elemt.GAmount;
      }
    });
    this.JobInvoiceFormGroup.get('jobInvoiceGrossAmount').setValue(
      value.toFixed(2)
    );
    this.GetTotal();
  }

  GetTotal() {
    const grossAmount =
      Number(this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount) || 0;
    const discount =
      Number(this.JobInvoiceFormGroup.value.jobInvoiceDiscount) || 0;
    const vatPercentage =
      Number(this.JobInvoiceFormGroup.value.jobInvoiceVat) || 0;

    const netAmount = grossAmount - discount;

    if (this.VatCalculation) {
      const vatAmount = netAmount * (vatPercentage / 100);

      this.JobInvoiceFormGroup.controls.jobInvoiceVatAmt.setValue(
        vatAmount.toFixed(2)
      );

      const total = netAmount + vatAmount;
      this.JobInvoiceFormGroup.get('jobInvoiceNetAmount').setValue(
        total.toFixed(2)
      );
    } else {
      this.JobInvoiceFormGroup.get('jobInvoiceNetAmount').setValue(
        netAmount.toFixed(2)
      );
      this.JobInvoiceFormGroup.controls.jobInvoiceVatAmt.setValue('0.00'); // Set VAT amount to 0
    }
  }

  savejobInvoice() {
    if (this.enableVNo) {
      this.masterApi
        .CheckVoucherExists(
          'JobInoviceVoucher',
          this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo
        )
        .subscribe((res: any) => {
          if (res.exists) {
            this.messageService.add({
              severity: 'info',
              summary: 'Alert',
              detail: 'Voucher No already exists',
            });
            this.JobInvoiceFormGroup.controls.jobInvoiceVoucherNo.setValue('');
            return;
          }
        });
    }
    this.JobInvoiceFormGroup.markAllAsTouched();

    const savedData: any[] = (
      this.JobInvoice_EntryDataset as GridData[]
    )?.filter((k) => k.hasOwnProperty('itemName'));
    const jobInvoice: JobInvoice = this.JobInvoiceFormGroup.value as JobInvoice;
    jobInvoice.accountsTransactions = [];
    jobInvoice.jobInvoiceVoucherNo =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo;
    jobInvoice.jobInvoiceVoucherDate =
      this.JobInvoiceFormGroup.value.jobInvoiceVoucherDate;
    jobInvoice.jobInvoiceJobId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceJobId;
    jobInvoice.jobInvoiceCustomerId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceCustomerId;
    jobInvoice.jobInvoiceLpoNo =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceLpoNo;
    jobInvoice.jobInvoiceLpoDate =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceLpoDate;
    jobInvoice.jobInvoiceSalesManId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceSalesManId;
    jobInvoice.jobInvoiceLocationId =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceLocationId;
    jobInvoice.jobInvoiceSalesAccount =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceSalesAccount;
    jobInvoice.jobInvoiceNetAmount = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceNetAmount
    );
    jobInvoice.jobInvoiceDiscount = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceDiscount
    );
    jobInvoice.jobInvoiceGrossAmount = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceGrossAmount
    );
    jobInvoice.jobInvoiceVat = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceVat
    );
    jobInvoice.jobInvoiceVatAmt = Number(
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceVatAmt
    );
    jobInvoice.jobInvoiceRemarks =
      this.JobInvoiceFormGroup.getRawValue().jobInvoiceRemarks;
    jobInvoice.invoicetype = this.JobInvoiceFormGroup.getRawValue().invoicetype;
    jobInvoice.jobInvoiceUserId = this.user.userId;

    const creditData: AccountsTransactions = {
      // accountsTransactionsAccNo: this.cashAccount,
      accountsTransactionsAccNo:
        this.JobInvoiceFormGroup.getRawValue().invoicetype == 'CASH'
          ? this.cashAccount
          : this.CustomerMasterArray?.find(
              (o) =>
                o.customerMasterCustomerNo ==
                this.JobInvoiceFormGroup.value.jobInvoiceCustomerId
            )?.customerMasterCustomerReffAcNo,

      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount
      ),
      accountsTransactionsFcDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceNetAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.user.userId,
      accountsTransactionsCurrencyId:
        this.JobInvoiceFormGroup.value.jobInvoiceCurrencyId,
    };

    jobInvoice.accountsTransactions.push(creditData);

    //saleAccount
    const saleAccount: AccountsTransactions = {
      // accountsTransactionsAccNo: this.goodsSoldAccount,
      accountsTransactionsAccNo: this.saleAccount,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount
      ),
      accountsTransactionsFcCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceGrossAmount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.user.userId,
      accountsTransactionsCurrencyId:
        this.JobInvoiceFormGroup.value.jobInvoiceCurrencyId,
    };

    jobInvoice.accountsTransactions.push(saleAccount);

    const creditData1: AccountsTransactions = {
      accountsTransactionsAccNo: this.DiscountPaidAccount,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount
      ),
      accountsTransactionsFcDebit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceDiscount
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
      accountsTransactionsUserId: this.user.userId,
      accountsTransactionsCurrencyId:
        this.JobInvoiceFormGroup.value.JobInvoiceCurrencyId,
    };

    ///vat
    const vatData: AccountsTransactions = {
      accountsTransactionsAccNo: this.vatPayableAccount,
      accountsTransactionsTransDate:
        this.JobInvoiceFormGroup.value.jobInvoiceDate,
      accountsTransactionsParticulars:
        this.JobInvoiceFormGroup.value.jobInvoiceRemarks,
      accountsTransactionsCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt
      ),
      accountsTransactionsFcCredit: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt
      ),
      accountsTransactionsAllocBalance:
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt,
      accountsTransactionsFcAllocBalance: Number(
        this.JobInvoiceFormGroup.value.jobInvoiceVatAmt
      ),
      accountsTransactionsVoucherType: null,
      accountsTransactionsTstamp: new Date(),
      accountsTransactionsVoucherNo:
        this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
      accountsTransactionsDescription:
        this.JobInvoiceFormGroup.value.JobInvoiceRemarks,
      accountsTransactionsStatus: null,
      accountstransactionsDelStatus: false,
      accountsTransactionsTransSno: 0,
    };

    if (
      this.JobInvoiceFormGroup.value.jobInvoiceVatAmt > 0 &&
      this.VatCalculation
    ) {
      jobInvoice.accountsTransactions.push(vatData);
    }
    if (this.JobInvoiceFormGroup.value.jobInvoiceDiscount > 0) {
      jobInvoice.accountsTransactions.push(creditData1);
    }

    jobInvoice.jobInvoiceDetails = savedData
      ?.filter((k) => k.itemName != null && k.NetAmount != null)
      .map((k: any) => {
        return {
          jobInvoiceDetailsDetailsId: k.id != null ? k.id : 0,
          jobInvoiceDetailsVoucherNo:
            this.JobInvoiceFormGroup.getRawValue().jobInvoiceVoucherNo,
          jobInvoiceDetailsItemId: k.itemId,
          jobInvoiceDetailsItemName: k.itemName,
          jobInvoiceDetailsDescription: '',
          jobInvoiceDetailsUnitId: k.unitId,
          jobInvoiceDetailsSoldQty: k.Qty,
          jobInvoiceDetailsUnitPrice: k.Price,
          jobInvoiceDetailsUnit: k.Unit,
          jobInvoiceDetailsGrossAmount: k.GAmount,
          jobInvoiceDetailsDiscount: k.Discount,
          jobInvoiceDetailsNetAmount: k.NetAmount,
          jobInvoiceDetailsFsno: null,
          jobInvoiceDetailsSno: null,
          jobInvoiceDetailsLocationId: null,
          jobInvoiceDetailsDelStatus: null,
        };
      });

    if (this.btnFlag.save) {
      this.saveJobInvo(jobInvoice);
    } else {
      this.updateJobInvo(jobInvoice);
    }
  }

  public getItemMasterName(itemMasterItemId: number): string {
    return this.ItemList?.find((j) => j.itemMasterItemId === itemMasterItemId)
      ?.itemMasterItemName;
  }

  public getUnitName(unit: number): string {
    return this.units?.find((j) => j.unitMasterUnitId === unit)
      ?.unitMasterUnitShortName;
  }

  getEmptyRowCount(length): number {
    const jobInvoiceDetailsLength = length || 0;
    if (length < 13) {
      return Math.max(0, 13 - jobInvoiceDetailsLength);
    } else {
      return;
    }
  }

  public getCurrencyName(id: number): string {
    return this.currency?.find((j) => j?.currencyMasterCurrencyId === id)
      ?.currencyMasterCurrencyName;
  }

  new() {
    this.GetGeneralSettingbyKey();
    this.JobInvoiceFormGroup.reset();
    this.JobInvoice_Entry.data = [];
    this.accountTransactionList = [];
    this.JobInvoice_EntryDataset = [];
    this.JobInvoice_Entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.JobInvoice_Entry);
    this.JobInvoiceFormGroup.get('jobInvoiceVoucherNo').setValue(null);
    this.JobInvoiceFormGroup.get('jobInvoiceCurrencyId').setValue(
      Number(this.DefCurrency)
    );
    this.JobInvoiceFormGroup.get('jobInvoiceLocationId').setValue(
      Number(this.DefLocid)
    );
    this.JobInvoiceFormGroup.get('jobInvoiceSalesAccount').setValue(-1);
    this.JobInvoiceFormGroup.get('invoicetype').setValue('CASH');

    this.JobInvoiceFormGroup.get('jobInvoiceLpoDate').setValue(
      new Date(new Date().setFullYear(new Date().getFullYear()))
    );
    this.JobInvoiceFormGroup.get('jobInvoiceVoucherDate').setValue(
      new Date(new Date().setFullYear(new Date().getFullYear()))
    );
    if (this.VatCalculation == true) {
      this.JobInvoiceFormGroup.get('jobInvoiceVat').setValue(5);
    }
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    if (this.DefAccCheck !== null) {
      const splitText = this.DefAccCheck.split('::');
      this.DefAcc = splitText[1].trim();
      this.JobInvoiceFormGroup.get('jobInvoiceSalesAccount').setValue(
        this.DefAcc
      );
    }

    this.JobInvoiceFormGroup.enable();
    this.f.jobInvoiceVoucherNo.clearValidators();
    this.JobInvoiceFormGroup.updateValueAndValidity();
    this.GetDefaultSettings();
  }

  GetDefaultSettings() {
    this.masterApi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      // currency

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
          this.f.jobInvoiceCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocCheck !== null) {
          const splitText = this.DefLocCheck.split('::');
          this.DefLocid = splitText[1]?.trim();
          this.f.jobInvoiceLocationId.setValue(Number(this.DefLocid));
        }
      }
      //hide job
      var HIDE_JOBCOST = list?.filter(
        (a) => a.generalSettingsKeyValue == 'HIDE_JOBCOST'
      );
      var jobcal = HIDE_JOBCOST[0]?.generalSettingsBoolValue;

      this.JOBCOST = jobcal == true ? true : false;

      var VAT_Calculation = list?.filter(
        (a) => a.generalSettingsKeyValue == 'VAT_Calculation'
      );
      var vatcal = VAT_Calculation[0]?.generalSettingsBoolValue;

      this.VatCalculation = vatcal == true ? true : false;
    });
  }

  getVoucherNumber() {
    this.stockapiService.GenerateVoucherNo().subscribe((response: any) => {
      this.JobInvoiceFormGroup.get('jobInvoiceVoucherNo').setValue(
        response.vouchersNumbersVNo
      );
    });
  }

  updateFormGrid(JobInvo: JobInvoice) {
    this.JobInvoiceFormGroup.patchValue({
      jobInvoiceVoucherNo: JobInvo?.jobInvoiceVoucherNo,
      jobInvoiceVoucherDate: new Date(JobInvo?.jobInvoiceVoucherDate),
      jobInvoiceJobId: Number(JobInvo?.jobInvoiceJobId),
      jobInvoiceCustomerId: JobInvo?.jobInvoiceCustomerId,
      jobInvoiceCustomerName: JobInvo?.jobInvoiceCustomerName,
      jobInvoiceCurrencyId: JobInvo?.jobInvoiceCurrencyId,
      jobInvoiceLpoNo: JobInvo?.jobInvoiceLpoNo,
      jobInvoiceLpoDate: new Date(JobInvo?.jobInvoiceLpoDate),
      jobInvoiceSalesManId: JobInvo?.jobInvoiceSalesManId,
      jobInvoiceLocationId: JobInvo?.jobInvoiceLocationId,
      jobInvoiceSalesAccount: JobInvo?.jobInvoiceSalesAccount,
      jobInvoiceRemarks: JobInvo?.jobInvoiceRemarks,
      jobInvoiceDiscount: JobInvo?.jobInvoiceDiscount,
      jobInvoiceGrossAmount: JobInvo?.jobInvoiceGrossAmount,
      jobInvoiceNetAmount: JobInvo?.jobInvoiceNetAmount,
      jobInvoiceId: JobInvo?.jobInvoiceId,
      invoicetype: JobInvo?.invoicetype,
      jobInvoiceVat: JobInvo?.jobInvoiceVat,
      jobInvoiceVatAmt: JobInvo?.jobInvoiceVatAmt,
    });
    this.accountTransactionList = JobInvo.accountsTransactions;

    this.wordamt = this.convertNumberToWordsWithDecimal(
      JobInvo?.jobInvoiceNetAmount
    );
    this.getPartyDetails(JobInvo.jobInvoiceCustomerId);
    const gridData: any[] = JobInvo?.jobInvoiceDetails.map((k) => {
      const ItemId: string =
        k?.jobInvoiceDetailsItemId != null
          ? this.ItemMasterArray?.find(
              (x) => x?.itemMasterItemId == k?.jobInvoiceDetailsItemId
            )?.itemMasterItemName
          : null;
      return {
        itemId: k.jobInvoiceDetailsItemId,
        itemName: k.jobInvoiceDetailsItemName,
        unitId: k.jobInvoiceDetailsUnitId,
        Unit: k?.jobInvoiceDetailsUnit,
        Qty: k?.jobInvoiceDetailsSoldQty,
        Price: k?.jobInvoiceDetailsUnitPrice,
        GAmount: k?.jobInvoiceDetailsGrossAmount,
        Discount: k?.jobInvoiceDetailsDiscount,
        NetAmount: k?.jobInvoiceDetailsNetAmount,
        id: k?.jobInvoiceDetailsDetailsId,
      };
    });
    this.JobInvoice_EntryDataset = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.JobInvoiceFormGroup.disable();
    this.f.jobInvoiceVoucherNo.clearValidators();
    this.JobInvoiceFormGroup.updateValueAndValidity();
  }

  convertNumberToWordsWithDecimal(number: number): string {
    if (!number || typeof number !== 'number') {
      throw new Error('Invalid input: number must be a valid number');
    }

    const toWords = new ToWords();

    const numberString = number.toFixed(2);
    const parts = numberString.split('.');

    if (parts.length !== 2) {
      throw new Error('Invalid input: number must have a decimal part');
    }

    const [integerPart, decimalPart] = parts;

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords} `;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords} `;
    }

    return result;
  }
  public getPartyDetails(id) {
    this.partyDetails = this.CustomerMasterArray?.find(
      (j) => j.customerMasterCustomerNo === id
    );
  }

  edit() {
    this.JobInvoice_Entry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    // this.f.vou.clearValidators();
    this.JobInvoiceFormGroup.enable();
    this.JobInvoiceFormGroup.updateValueAndValidity();
  }

  GetSavedJobInvoiceDetails(id: any) {
    this.index = 0;
    this.accountApi.GetJobInvoiceVoucherNo(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.savedJobInvoice = data?.result;
          this.JobInvoiceFormGroup.disable();
          this.updateFormGrid(data?.result);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Job Invoice not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.JobInvoiceFormGroup.updateValueAndValidity();
      }
    );
  }

  getJobInvoiceListing() {
    this.accountApi.getJobinvoice().subscribe((res) => {
      this.jobInvoiceList = res.result;
    });
    this.showJobInvoiceList = true;
  }

  public getSalesManName(id: number): string {
    return this.SalesManMasterArray?.find(
      (j) => j?.salesManMasterSalesManId === id
    )?.salesManMasterSalesManName;
  }

  getSalesAccountList() {
    this.accountApi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select Account--', value: -1 });
      this.acctArry = k.result.map(
        (ar) => ar.maAccName?.trim() + '|' + ar.maAccNo
      );
    });
  }

  getItemList() {
    this.masterApi.GetAllItemNotGroup().subscribe((response: any) => {
      this.ItemList = response?.result;
      this.ItemMasterArray = response?.result;
    });
  }

  getUnitList() {
    this.masterApi.GetAllUnit().subscribe((response: any) => {
      this.unitList = response;
      this.units = response;
      this.unitList.forEach((element) => {
        this.unitsArray.push(element.unitMasterUnitFullName);
      });
      this.unitListt = response.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = response.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }

  showItemModal() {
    this.showItemList = true;
  }

  delete() {
    this.deleteJobInvoiceItem(this.savedJobInvoice);
  }

  deleteJobInvoiceItem(item: any) {
    this.showJobInvoiceEditList = false;
    if (
      item.jobInvoiceVoucherNo != null &&
      item.jobInvoiceVoucherNo != undefined
    ) {
      this.SaveConfirm = true;
      this.confirmation.confirm({
        key: 'confirm-key',
        message:
          'Do you want to delete Job Invoice No : ' +
          item.jobInvoiceVoucherNo +
          '?',
        accept: () => {
          this.accountApi
            .DeleteJobInvoice(item.jobInvoiceVoucherNo)
            .subscribe((response) => {
              if (response) {
                this.userTrackingLog('Delete');
                this.JobInvoiceFormGroup.reset();
                this.JobInvoice_Entry.data = [];
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Job Invoice is Deleted ',
                });
                this.new();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: 'Job Invoice Delete Failed',
                });
              }
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Null',
        detail: 'No Voucher Number',
      });
      return;
    }
  }

  get f() {
    return this.JobInvoiceFormGroup.controls;
  }

  SetItemValue(item) {
    this.masterApi
      .GetItemMasterById({ id: item.itemMasterItemId })
      .subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.setDataAtCell(
          this.currentIndex,
          0,
          this.ItemMasterArrayByName.itemMasterItemId
        );
        hot.setDataAtCell(
          this.currentIndex,
          1,
          this.ItemMasterArrayByName.itemMasterItemName
        );
        hot.setDataAtCell(
          this.currentIndex,
          8,
          this.ItemMasterArrayByName.itemMasterItemId
        );
        this.unitDetailsConversionTypeNumber =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;
        this.unitDetailsUnitPrice =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsRate;
        hot.setDataAtCell(
          this.currentIndex,
          4,
          this.unitDetailsUnitPrice ? this.unitDetailsUnitPrice : null
        );
        // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(this.activeRow.row, 5, this.ItemMasterArrayByName.unitDetails[0].unitDetailsUnitPrice);
        this.funitid =
          this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
        const UnitId: any = this.unitListt?.find(
          (l) => l.value == this.funitid
        );
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 2, UnitId.label);
        this.hotRegisterer
          .getInstance(this.hotid)
          .setDataAtCell(this.activeRow.row, 9, UnitId.value);
      });
    this.selectedItem = item;
    this.showItemList = false;
  }

  selectUnit(unit: UnitMaster) {
    if (this.unitArray.length != 0) {
      const UnitId: string = this.unitArray?.find(
        (l) => l.unitMasterUnitId == unit.unitMasterUnitId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 2, UnitId);
    }
    this.unitListing = false;
  }

  handleChange(e) {
    this.index = e.index;
  }

  public get IsValidGrid(): boolean {
    if (this.JobInvoice_EntryDataset.length > 0) {
      return Object.values(this.JobInvoice_EntryDataset).some(
        (k: GridData) => k.itemName != null
      );
      // });
    }
    return false;
  }

  saveJobInvo(jobInvoice: JobInvoice) {
    if (this.JobInvoiceFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.accountApi.saveJobInvoice(jobInvoice).subscribe(
            (data: any) => {
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedJobInvoice = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
              } else if (!data.isSuccess) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.errorMessage != null && data.errorMessage.trim() !== ''
                      ? data.errorMessage
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Job Invoice Save Failed',
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.JobInvoiceFormGroup.markAllAsTouched();
      this.JobInvoiceFormGroup.markAsDirty();
    }
  }

  updateJobInvo(jobInvoice: JobInvoice) {
    if (this.JobInvoiceFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.accountApi.UpdateJobInvoice(jobInvoice).subscribe(
            (data: any) => {
              if (data.valid) {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedJobInvoice = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: 'Job Invoice Updated Succesfully',
                });
              } else if (!data.isSuccess) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail: data.errorMessage,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Job Invoice Update Failed',
              });
            }
          );
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.JobInvoiceFormGroup.markAllAsTouched();
      this.JobInvoiceFormGroup.markAsDirty();
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  userTrackingLog(type) {
    let req = {
      page: 'Job Invoice',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.JobInvoiceFormGroup.get('jobInvoiceVoucherNo').value,
      vpType: 'Job Invoice',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface GridData {
  code?: string;
  itemName?: string;
  brand?: string;
  packing?: string;
  origin?: string;
  Unit?: string;
  Qty?: number;
  Price?: number;
  GAmount?: number;
  Discount?: number;
  NetAmount?: number;
  id?: number;
  itemId?: number;
  unitId?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
