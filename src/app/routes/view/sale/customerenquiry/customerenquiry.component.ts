import { CustomerMaster } from './../../../domain/Masters/CustomerMaster';
import { LocationMaster } from './../../../domain/Masters/LocationMaster';
import { SalesManMaster } from './../../../domain/Masters/SalesManMaster';
import { ItemMaster } from './../../../domain/Masters/ItemMaster';
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { CustomerEnquiryDetails } from 'src/app/routes/domain/Sales/CustomerEnquiryDetails';
import { CustomerEnquiry } from 'src/app/routes/domain/Sales/CustomerEnquiry';
import { EnquiryAbount } from 'src/app/routes/domain/Sales/EnquiryAbout';
import { EnquiryStatus } from 'src/app/routes/domain/Sales/EnquiryStatus';
import { BusinessTypeMaster } from 'src/app/routes/domain/Masters/BusinessTypeMaster';
import { SalesApiService } from 'src/app/routes/service/sales.api.services';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { AccountApiService } from 'src/app/routes/service/account.api.service';

@Component({
  selector: 'app-customerenquiry',
  templateUrl: './customerenquiry.component.html',
  styleUrls: ['./customerenquiry.component.scss'],
})
export class CustomerenquiryComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('enqsCtrl', { static: false }) enquirystatusCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  @ViewChild('custCtrl', { static: false }) customerCtrol: ElementRef;
  @ViewChild('saleCtrl', { static: false }) salesmanCtrol: ElementRef;
  @ViewChild('enqaCtrl', { static: false }) enquiryaboutCtrol: ElementRef;
  @ViewChild('locaCtrl', { static: false }) locationCtrol: ElementRef;
  @ViewChild('bustCtrl', { static: false }) businesstypeCtrol: ElementRef;

  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string = null;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showSalesLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;
  conversion_Type: number;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;
  DefLocCheck: string;
  DefLocid: string;

  itemArray: ItemMaster[] = [];
  itemArry: string[] = [];
  itemList: SelectItem[];

  ItemMasterArrayByName: any = null;
  funitid: number;

  invoiceList: SelectItem[];

  customerArray: CustomerMaster[] = [];
  customerArry: string[] = [];
  customerList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[];
  locationArry: string[] = [];

  salesManArray: SalesManMaster[] = [];
  salesManList: SelectItem[];
  salesManArry: string[] = [];

  enquiryAboutArray: EnquiryAbount[] = [];
  enquiryAboutList: SelectItem[];
  enquiryAboutArry: string[] = [];

  businessTypeArray: BusinessTypeMaster[] = [];
  businessTypeList: SelectItem[];
  businessTypeArry: string[] = [];

  enquiryStatusArray: EnquiryStatus[] = [];
  enquiryStatusList: SelectItem[];
  enquiryStatusArry: string[] = [];

  unitAry: any;
  unitListt: any;
  units: any;

  unitArray: UnitMaster[] = [];
  unitList: SelectItem[];
  unitArry: string[] = [];

  customerEnquiryarry: CustomerEnquiry[] = [];

  // savedPaymentVoucherGridData: GridData[] = [];
  savedCustomerEnquiry: CustomerEnquiry;

  private hotRegisterer = new HotTableRegisterer();
  hotid = 'customerEnquiryEntry';
  Permission: any;
  ScreenId: number;
  user: any;
  pdfSource: string | URL;
  isServerSearch = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private crystalReportService: CrystalReportService,
    private utilityService: UtilityService,
    private salesapi: SalesApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  customerEnquiryentry: Handsontable.GridSettings;
  customerEnquiryFormGroup: FormGroup;
  // accountTransactionDataset = [];
  cols;
  ngAfterViewInit() {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();

      var rights = this.permission.getById(this.ScreenId);
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

    this.cols = [
      { field: 'enquiryMasterEnquiryId', header: 'Enquiry No' },
      { field: 'enquiryMasterEnquiryDate', header: 'Enquiry Date' },
      // { field: 'enquiryMasterContactEmail', header: 'Contact Email' },
      // { field: 'enquiryMasterEnquiryAboutID', header: 'Enquiry About' },
      { field: 'enquiryMasterLocation', header: 'Location' },
      // { field: 'enquiryMasterBusineesTypeId', header: 'Business Type' },
      // { field: 'enquiryMasterContactName', header: 'Contact Person' },
      // { field: 'enquiryMasterContactId', header: 'Customer Name' },
      { field: 'enquiryMasterSalesManID', header: 'Sales Man' },
      { field: 'enquiryMasterCurrencyID', header: 'Currency' },
      { field: 'enquiryMasterRemarks', header: 'Remarks' },
      // { field: 'enquiryMasterCustomerRef', header: 'Customer Ref.' },
      // { field: 'enquiryMasterEnqStatusId', header: 'Equiry Status' },
      { field: ' ', header: 'Action' },
    ];

    this.invoiceList = [
      { label: '  -- Select --', value: null },
      { label: ' CASH', value: 0 },
      { label: ' CREDIT', value: 1 },
    ];
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
    this.initializeControls();
    this.customerEnquiryFormGroup = this.fb.group({
      enquiryMasterEnquiryId: [null],
      enquiryMasterEnquiryDate: [new Date(), [Validators.required]],
      enquiryMasterContactEmail: [null],
      enquiryMasterEnquiryAboutId: [-1],
      enquiryMasterLocationId: [null],
      enquiryMasterBusineesTypeId: [-1],
      enquiryMasterContactName: [-1],
      enquiryMasterContactId: [null, [DropDownValidator]],
      enquiryMasterSalesManId: [-1],
      enquiryMasterCurrencyId: [-1, [DropDownValidator]],
      enquiryMasterRemarks: [null],
      enquiryMasterCustomerReference: [null],
      enquiryMasterEnquiryStatusId: [-1],
      enquiryMasterAmount: [null],
      itemDetailsChecked: [true],
    });
    this.customerEnquiryFormGroup.disable();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    // this.customerEnquiryFormGroup.controls.enquiryMasterEnquiryId.valueChanges.subscribe((control) => {
    // if (control != null) {
    // this.f.enquiryMasterEnquiryId.setAsyncValidators([vchrnoAsyncValidator(this.accountapi)]);
    // }else {
    //   this.f.enquiryMasterEnquiryId.clearValidators();
    // }
    // });
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }
  getLocation(id: any): string {
    const location = this.locationList?.find((k) => k.value === id);
    return location ? location?.label : '';
  }
  public getSalesMan(id): string {
    return this.salesManList?.find((k) => k.value === id)?.label;
  }

  public getItems(id): string {
    return this.itemList?.find((k) => k.value === id)?.label;
  }

  public getEnquiryAbout(id): string {
    return this.enquiryAboutList?.find((k) => k.value === id)?.label;
  }

  public getEnquiryStatus(id): string {
    return this.enquiryStatusList?.find((k) => k.value === id)?.label;
  }

  public getBusinessTypes(id): string {
    return this.businessTypeList?.find((k) => k.value === id)?.label;
  }

  public getUnitId(id): string {
    return this.unitList?.find((k) => k.value === id)?.label;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get f() {
    return this.customerEnquiryFormGroup.controls;
  }

  initializeControls() {
    this.salesapi.GetCustomerEnquiryDropdown().subscribe((m) => {
      //location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select--', value: -1 });
      //sale man
      this.salesManArray = m.resultSet.saleManList;
      this.salesManList = m.resultSet.saleManList.map((kl) => ({
        label: kl.salesManMasterSalesManName,
        value: kl.salesManMasterSalesManId,
      }));
      this.salesManList.unshift({ label: '--Select--', value: -1 });
      //currency
      this.currencyList = m.resultSet.currencyMasters.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
      //about
      this.enquiryAboutArray = m.resultSet.enquiryAbout;
      this.enquiryAboutList = m.resultSet.enquiryAbout?.map((kl) => ({
        label: kl.enquiryAboutEnquiryAbout,
        value: kl.enquiryAboutEnquiryAboutId,
      }));
      this.enquiryAboutList.unshift({ label: '--Select--', value: -1 });
      //status
      this.enquiryStatusArray = m.resultSet.enquiryStatus;
      this.enquiryStatusList = m.resultSet.enquiryStatus?.map((kl) => ({
        label: kl.enquiryStatusEnquiryStatus,
        value: kl.enquiryStatusEnquiryStatusId,
      }));
      this.enquiryStatusList.unshift({ label: '--Select--', value: -1 });
      //business type
      this.businessTypeArray = m.resultSet.businesstypeMasters;
      this.businessTypeList = m.resultSet.businesstypeMasters.map((kl) => ({
        label: kl.businessTypeMasterBusinessTypeName,
        value: kl.businessTypeMasterBusinessTypeId,
      }));
      this.businessTypeList.unshift({ label: '--Select--', value: -1 });
      //item list
      this.itemArray = m.resultSet.itemMaster;
      this.itemList = m.resultSet.itemMaster?.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.itemList.unshift({ label: '--Select--', value: -1 });
      //unit

      this.units = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters?.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });

      //customer
      this.customerArray = m.resultSet.customerMasters;
      this.customerList = m.resultSet.customerMasters?.map((kl) => ({
        label: kl.customerMasterCustomerName,
        value: kl.customerMasterCustomerNo,
      }));
      this.customerList.unshift({ label: '--Select--', value: -1 });
    });
    // this.customerEnquiryentry = {
    //   rowHeaders: true,
    //   viewportColumnRenderingOffset: 27,
    //   viewportRowRenderingOffset: 'auto',
    //   colWidths: '120px',
    //   minRows: 7,
    //   width: 'auto',
    //   height: 200,
    //   rowHeights: 23,
    //   fillHandle: {
    //     direction: 'vertical',
    //     autoInsertRow: true,
    //   },
    //   data: [],
    //   minSpareRows: 1,
    //   // allowInsertColumn: false,
    //   allowInsertRow: true,
    //   // allowRemoveColumn: false,
    //   // allowRemoveRow: false,
    //   // autoWrapRow: false,
    //   // autoWrapCol: false,
    //   stretchH: 'all',
    //   //  autoWrapRow: true,
    //   // height: 487,
    //   // maxRows: 22,
    //   manualRowResize: true,
    //   manualColumnResize: true,
    //   hiddenColumns: {
    //     columns: [],
    //     indicators: false,
    //   },
    //   // rowHeaders: true,
    //   columns: [
    //     {
    //       data: 'itemId',
    //       type: 'numeric',
    //       width: 60,
    //     },
    //     // {
    //     //   data: 'item',
    //     //   width: 150,
    //     //   type: 'autocomplete',
    //     //   source: (query, callback) => {
    //     //     callback(this.itemArry);

    //     //   },
    //     //   allowInvalid: false,
    //     //   strict: true
    //     // },
    //     {
    //       data: 'partno',
    //       type: 'text',
    //     },
    //     {
    //       data: 'itemname',
    //       type: 'text',
    //     },
    //     {
    //       data: 'unit',
    //       width: 70,
    //       type: 'text',
    //       // source: (qry,callback)=>{
    //       //   callback(this.unitArry);
    //       // },
    //       allowInvalid: false,
    //       strict: true,
    //     },
    //     {
    //       data: 'qty',
    //       type: 'numeric',
    //       numericFormat: {
    //         pattern: '0,0.00',
    //       },
    //       width: 50,
    //     },
    //     {
    //       data: 'description',
    //       type: 'text',
    //       width: 150,
    //     },
    //     // {
    //     //   data: 'id',
    //     //   type: 'numeric',
    //     //   width: 0
    //     // }
    //   ],

    //   colHeaders: [
    //     this.translate.instant('Item Code '),
    //     this.translate.instant('Part No'),
    //     this.translate.instant('Item Name'),
    //     this.translate.instant('Unit'),
    //     this.translate.instant('Quantity'),
    //     this.translate.instant('Description'),
    //     // this.translate.instant('Id')
    //   ],
    //   manualRowMove: true,
    //   manualColumnMove: true,
    //   contextMenu: true,
    //   filters: true,
    //   dropdownMenu: true,
    // };
    this.customerEnquiryentry = this.utilityService.getTableConfig(
      columnDetailList(this),
      []
    );

    this.customerEnquiryentry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);

      if (column === 0) {
        this.isServerSearch = true;
        this.lookupGridColumns = ['BarCode', 'Item', 'Item ID'];
        this.dataList = this.itemSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.onSearch('');
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3) {
        this.isServerSearch = false;
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(row);
        this.getUnitByItemId(data[0]);
        this.lookupGridColumns = ['Unit', 'Unit ID'];
        this.dataList = this.unitSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showSalesLookUp = true;
        this.activeRow = { row, column };
      }
      // else if (column === 5) {
      //   this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
      //   this.dataList = this.costSetLookup;
      //   this.showAccountLookUp = true;
      //   this.activeRow = {row, column};
      // }
      else {
        this.showSalesLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.sales == x);
      } else {
        this.selectItem = {};
      }
    };

    this.customerEnquiryentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showSalesLookUp = false;
      if (change[0][1] === 0) {
        this.showSalesLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.customerEnquiryentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
      //  if (change[0][1] === 'item') {
      //    if (change[0][3] != null) {
      //      this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 4, this.f.paymentVoucherNarration.value );
      //    }else{
      //      this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 4, null );
      //    }
      //  }
      ////const  hotinstance = this.hotRegisterer.getInstance(this.hotid);
      //     if( change [0][1] === 'item') {

      //        var data = hotinstance.getDataAtRow(change[0][0]);
      // if( data[0] != null ) {
      //   //&& data[7] != null
      //   // var matname =  data[0].split('|')[0];
      //   // this.hotRegisterer.getInstance(this.hotid).setDataAtCell(change[0][0], 1, matname );

      //   }
      //   }
    };

    // this.customerEnquiryentry.afterChange = (r, c) => {

    // };

    this.customerEnquiryentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.customerEnquiryentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Invalid entry',
        });
      }
    };
  }
  ColumnSum() {
    if (this.customerEnquiryentry.data.length > 0) {
      const sum1 = this.customerEnquiryentry.data?.filter((item) =>
        item.hasOwnProperty('netamount')
      );
      //   .reduce((sum, current) => sum + current.netamount, 0);
      // this.customerEnquiryFormGroup.controls.enquiryMasterAmount.setValue(sum1);
    }
  }

  get itemSetLookup() {
    return this.itemArray.map((kl) => ({
      sales: kl.itemMasterItemName,
      salesId: kl.itemMasterItemId,
      barcode: kl?.itemMasterBarcode,
    }));
  }

  get unitSetLookup() {
    return this.unitArray.map((kl) => ({
      sales: kl.unitMasterUnitShortName,
      salesId: kl.unitMasterUnitId,
    }));
  }

  savecustomerEnquiry() {
    const savedData: Array<any> = this.customerEnquiryentry.data;
    // const savedData: Array<any> = this.customerEnquiryentry.data?.filter(k => k.hasOwnProperty('code'));
    const customerEnqy: CustomerEnquiry = this.customerEnquiryFormGroup
      .value as CustomerEnquiry;
    customerEnqy.enquiryMasterEnquiryId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId;
    customerEnqy.enquiryMasterEnquiryDate =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryDate;
    customerEnqy.enquiryMasterContactEmail =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterContactEmail;
    customerEnqy.enquiryMasterEnquiryAboutId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryAboutId;
    customerEnqy.enquiryMasterLocationId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterLocationId;
    customerEnqy.enquiryMasterBusineesTypeId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterBusineesTypeId;
    customerEnqy.enquiryMasterContactName =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterContactName;
    customerEnqy.enquiryMasterContactId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterContactId;
    customerEnqy.enquiryMasterSalesManId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterSalesManId;
    customerEnqy.enquiryMasterCurrencyId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterCurrencyId;
    customerEnqy.enquiryMasterRemarks =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterRemarks;
    customerEnqy.enquiryMasterCustomerReference =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterCustomerReference;
    customerEnqy.enquiryMasterEnquiryStatusId =
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryStatusId;
    customerEnqy.enquiryMasterEnquiryVoucherNo = null;
    customerEnqy.enquiryMasterTypeId = null;
    customerEnqy.enquiryMasterDelStatus = null;
    customerEnqy.enquiryMasterModelId = null;
    customerEnqy.enquiryMasterJobNo = null;
    customerEnqy.enquiryMasterVendorId = null;
    customerEnqy.enquiryMasterVesselId = null;
    customerEnqy.enquiryMasterSerialNo = null;
    customerEnqy.enquiryMasterBuilder = null;
    customerEnqy.customerEnquiryDetails = savedData
      ?.filter((k) => k.itemId != null && k.itemname != null)
      .map((k: any) => {
        return {
          enquiryDetailsEnquiryDetailsId: k.id != null ? k.id : 0,
          enquiryDetailsEnquiryDetailsEquiryId:
            this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId,
          enquiryDetailsEnquiryDetailsSlno: 0,
          enquiryDetailsEnquiryDetailsItemId: parseInt(k.itemId),
          enquiryDetailsEnquiryDetailsMaterialDescription: k.itemname,
          enquiryDetailsEnquiryDetailsUnitId:
            k.unit != null && k.unit !== ''
              ? this.units?.find(
                  (j) => j.unitMasterUnitShortName?.trim() === k.unit?.trim()
                ).unitMasterUnitId
              : null,
          enquiryDetailsEnquiryDetailsQty: k.qty,
          enquiryDetailsEnquiryDetailsDescription: k.description,
          enquiryDetailsEnquiryDetailsDelStatus: false,
          EnquiryDetailsEnquiryDetailsIsEdited: null,
        };
      });

    if (this.btnFlag.save) {
      this.saveEnquiry(customerEnqy);
    } else {
      this.updateEnquiry(customerEnqy);
    }
  }

  saveEnquiry(customerEnqy: CustomerEnquiry) {
    if (
      this.customerEnquiryFormGroup.valid &&
      this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value &&
      this.IsValidGrid
    ) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.salesapi.InsertCustomerEnquiry(customerEnqy).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerEnquiry = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Enquiry Save Failed',
              });
            }
          );
        },
      });
    }
    // else {
    //   this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
    //   this.customerEnquiryFormGroup.markAllAsTouched();
    //   this.customerEnquiryFormGroup.markAsDirty();
    // }
    else if (
      this.customerEnquiryFormGroup.valid &&
      !this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value
    ) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          if (customerEnqy.customerEnquiryDetails) {
            customerEnqy.customerEnquiryDetails = null;
          }
          this.salesapi.InsertCustomerEnquiry(customerEnqy).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerEnquiry = data.result;
              this.updateFormGrid(data.result);
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Enquiry Save Failed',
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
      this.customerEnquiryFormGroup.markAllAsTouched();
      this.customerEnquiryFormGroup.markAsDirty();
    }
  }
  updateEnquiry(customerEnqy: CustomerEnquiry) {
    // if (this.customerEnquiryFormGroup.valid && this.IsValidGrid) {
    //   this.confirmation.confirm({
    //     key: 'confirm-key',
    //     message: 'Do you want to update existing voucher?',
    //     accept: () => {
    //       this.salesapi.UpdateCustomerEnquiry(customerEnqy).subscribe((data) => {
    //         this.btnFlag = { edit: true, cancel: false, save: false, update: true, delete: true };
    //         this.updateFormGrid(data.result);
    //         this.messageService.add({ severity: 'success', summary: 'Alert', detail: 'Customer Enquiry Updated Succesfully' });
    //       }, (err) => {
    //         this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Customer Enquiry Update Failed' });
    //       });
    //     }
    //   });
    // } else {
    //   // const msg1 = 'Please fill mandatory fields';
    //   // const msg2 = 'Please fill Empyt Debit account details';
    //   this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
    //   this.customerEnquiryFormGroup.markAllAsTouched();
    //   this.customerEnquiryFormGroup.markAsDirty();
    // }

    if (
      this.customerEnquiryFormGroup.valid &&
      this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value &&
      this.IsValidGrid
    ) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.salesapi.UpdateCustomerEnquiry(customerEnqy).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerEnquiry = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Update');
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Enquiry Update Failed',
              });
            }
          );
        },
      });
    }
    // else {
    //   this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
    //   this.customerEnquiryFormGroup.markAllAsTouched();
    //   this.customerEnquiryFormGroup.markAsDirty();
    // }
    else if (
      this.customerEnquiryFormGroup.valid &&
      !this.customerEnquiryFormGroup.controls['itemDetailsChecked'].value
    ) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          if (customerEnqy.customerEnquiryDetails) {
            customerEnqy.customerEnquiryDetails = null;
          }
          this.salesapi.UpdateCustomerEnquiry(customerEnqy).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.savedCustomerEnquiry = data.result;
              this.updateFormGrid(data.result);
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
                });
              } else if (data.error) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Alert',
                  detail:
                    data.message != null && data.message?.trim() !== ''
                      ? data.message
                      : data.exception,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Customer Enquiry Update Failed',
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
      this.customerEnquiryFormGroup.markAllAsTouched();
      this.customerEnquiryFormGroup.markAsDirty();
    }
  }

  getAllCustomerEnquiry() {
    this.salesapi.GetCustomerEnquiry().subscribe((data) => {
      this.customerEnquiryarry = data.result;
    });
  }

  //  public getAccountName(acctnumber: string): string{
  //    return this.accountArray
  //    ?.find(j => j.masterAccountsTableAccNo?.trim() === acctnumber?.trim())maAccNo;
  //  }

  new() {
    this.customerEnquiryFormGroup.reset();
    this.customerEnquiryentry.data = [];
    this.customerEnquiryentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.customerEnquiryentry);
    //  this.hotRegisterer.getInstance(this.hotid).selectAll();
    //  this.hotRegisterer.getInstance(this.hotid).destroyEditor(false, true);
    //  this.hotRegisterer.getInstance(this.hotid).clear();
    //  this.hotRegisterer.getInstance(this.hotid).selectCell(0, 0);
    this.customerEnquiryFormGroup.get('enquiryMasterEnquiryId').setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterEnquiryDate')
      .setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterContactEmail')
      .setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterEnquiryAboutId')
      .setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterLocationId').setValue(-1);
    this.customerEnquiryFormGroup
      .get('enquiryMasterBusineesTypeId')
      .setValue(-1);
    this.customerEnquiryFormGroup
      .get('enquiryMasterContactName')
      .setValue(null);
    this.customerEnquiryFormGroup.get('enquiryMasterContactId').setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterSalesManId').setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterCurrencyId').setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterRemarks').setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterCustomerReference')
      .setValue(null);
    this.customerEnquiryFormGroup
      .get('enquiryMasterEnquiryStatusId')
      .setValue(-1);
    this.customerEnquiryFormGroup.get('enquiryMasterAmount').setValue(null);
    this.customerEnquiryFormGroup.get('itemDetailsChecked').setValue(true);

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.search = null;
    this.index = 0;
    this.GetDefaultSettings();
    //this.getDefaultCurrency();
    //this.getDefaultLocation();
    //this.defaultEnqueryStatus();
    this.customerEnquiryFormGroup.enable();
    this.f.enquiryMasterEnquiryDate.setValue(new Date());
    this.f.enquiryMasterEnquiryId.clearValidators();
    this.customerEnquiryFormGroup.updateValueAndValidity();
  }
  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
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
          this.f.enquiryMasterCurrencyId.setValue(Number(this.DefCurrency));
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
          this.f.enquiryMasterLocationId.setValue(Number(this.DefLocid));
        }
      }

      let data = this.enquiryStatusList?.find(
        (obj) => obj.label === this.enquiryStatusList[5].label
      );
      this.f.enquiryMasterEnquiryStatusId.setValue(data.value);
    });
  }
  showMaximizableDialog() {
    this.getAllCustomerEnquiry();
    this.displayMaximizable = true;
  }

  updateFormGrid(CustEnquiry: CustomerEnquiry) {
    this.search = null;
    this.customerEnquiryFormGroup.patchValue({
      enquiryMasterEnquiryId: CustEnquiry.enquiryMasterEnquiryId,
      enquiryMasterEnquiryDate: new Date(CustEnquiry.enquiryMasterEnquiryDate),
      enquiryMasterContactEmail: CustEnquiry.enquiryMasterContactEmail,
      enquiryMasterEnquiryAboutId: CustEnquiry.enquiryMasterEnquiryAboutId,
      enquiryMasterLocationId: CustEnquiry.enquiryMasterLocationId,
      enquiryMasterBusineesTypeId: CustEnquiry.enquiryMasterBusineesTypeId,
      enquiryMasterContactName: CustEnquiry.enquiryMasterContactName,
      enquiryMasterContactId: CustEnquiry.enquiryMasterContactId,
      enquiryMasterSalesManId: CustEnquiry.enquiryMasterSalesManId,
      enquiryMasterCurrencyId: CustEnquiry.enquiryMasterCurrencyId,
      enquiryMasterRemarks: CustEnquiry.enquiryMasterRemarks,
      enquiryMasterCustomerReference:
        CustEnquiry.enquiryMasterCustomerReference,
      enquiryMasterEnquiryStatusId: CustEnquiry.enquiryMasterEnquiryStatusId,
    });
    // this.currencyCtrol.nativeElement.value = this.currencyList?.find(k => k.value === CustEnquiry.enquiryMasterCurrencyId)?.label;
    // this.customerCtrol.nativeElement.value = this.customerList?.find(k => k.value === CustEnquiry.enquiryMasterContactId)?.label;
    // this.enquirystatusCtrol.nativeElement.value = this.enquiryStatusList?.find(k => k.value === CustEnquiry.enquiryMasterEnquiryStatusId)?.label;
    // this.enquiryaboutCtrol.nativeElement.value = this.enquiryAboutList?.find(k => k.value === CustEnquiry.enquiryMasterEnquiryAboutId)?.label;
    // this.locationCtrol.nativeElement.value = this.locationList?.find(k => k.value === CustEnquiry.enquiryMasterLocationId)?.label;
    // this.salesmanCtrol.nativeElement.value = this.salesManList?.find(k => k.value === CustEnquiry.enquiryMasterSalesManId)?.label;
    // this.businesstypeCtrol.nativeElement.value = this.businessTypeList?.find(k => k.value === CustEnquiry.enquiryMasterSalesManId)?.label;

    const gridData: GridData[] = CustEnquiry.customerEnquiryDetails.map((k) => {
      const itemId: string =
        k.enquiryDetailsEnquiryDetailsItemId != null
          ? this.itemList?.find(
              (l) => l.value == k.enquiryDetailsEnquiryDetailsItemId
            )?.label
          : null;
      const unitId: string =
        k.enquiryDetailsEnquiryDetailsUnitId != null
          ? this.unitListt?.find(
              (l) => l.value == k.enquiryDetailsEnquiryDetailsUnitId
            )?.label
          : null;

      return {
        itemId: k.enquiryDetailsEnquiryDetailsItemId, //String(k.enquiryDetailsEnquiryDetailsItemId),
        itemname: itemId, //k.enquiryDetailsEnquiryDetailsMaterialDescription,
        unit: unitId, //String(k.enquiryDetailsEnquiryDetailsUnitId),
        qty: k.enquiryDetailsEnquiryDetailsQty,
        description: k.enquiryDetailsEnquiryDetailsDescription,
        id: k.enquiryDetailsEnquiryDetailsId,
      };
    });
    this.customerEnquiryentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.customerEnquiryFormGroup.disable();
    this.f.enquiryMasterEnquiryId.clearValidators();
    this.customerEnquiryFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedCustomerEnquiryDetails(id: string) {
    this.index = 0;
    this.salesapi.GetSavedCustEnquiryDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data.result);
          this.savedCustomerEnquiry = data.result;
          this.customerEnquiryFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Customer Enquiry not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.customerEnquiryFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.salesapi
          .DeleteCustomerEnquiry(this.savedCustomerEnquiry)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Customer Enquiry) Deleted Succesfully',
              });
              this.new();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Failed',
              });
            }
          );
      },
    });
  }
  cancel() {
    this.GetSavedCustomerEnquiryDetails(
      this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId
    );
  }
  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.enquiryMasterEnquiryId.clearValidators();
    this.customerEnquiryFormGroup.enable();
    this.customerEnquiryFormGroup.controls.enquiryMasterEnquiryId.disable();
    this.customerEnquiryFormGroup.updateValueAndValidity();
  }

  public get IsValidGrid(): boolean {
    if (this.customerEnquiryentry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.customerEnquiryentry.data).some(
        (k: GridData) => k.itemId != null && k.qty != null
      );
      // });
    }
    return false;
  }

  pagedRequest: PagedRequest;
  onSearch(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi.LoadFilteredItemMaster(this.pagedRequest).subscribe((m) => {
      this.itemArray = m.resultSet.itemMaster;
      this.itemList = m.resultSet.itemMaster?.map((kl) => ({
        sales: kl?.itemMasterItemName,
        salesId: kl?.itemMasterItemId,
      }));
      this.dataList = this.itemSetLookup;
    });
  }

  selectsales(evt) {
    let trimmedSales = evt.sales?.trim();
    const includesPcs = this.units.some((unit) =>
      unit.unitMasterUnitShortName?.trim().includes(trimmedSales)
    );
    if (includesPcs && this.unitArray.length != 0) {
      const UnitId: string = this.unitArray?.find(
        (l) => l.unitMasterUnitId == evt.salesId
      )?.unitMasterUnitShortName;
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, 3, UnitId);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(this.activeRow.row, this.activeRow.column, evt.salesId);
      // this.masterapi.GetItemMasterById(evt.salesId).subscribe((k) => {
      this.masterapi
        .GetItemMasterById({
          id: evt.salesId,
          customerId:
            this.customerEnquiryFormGroup.value.enquiryMasterContactId,
        })
        .subscribe((k) => {
          this.ItemMasterArrayByName = k.resultSet?.itemMaster;
          this.conversion_Type =
            this.ItemMasterArrayByName.unitDetails?.unitDetailsConversionType;

          const hotInstance = this.hotRegisterer.getInstance(this.hotid);
          hotInstance.setDataAtCell(this.activeRow.row, 0, evt.salesId);

          hotInstance.setDataAtCell(
            this.activeRow.row,
            1,
            this.ItemMasterArrayByName.itemMasterPartNo
          );

          // // Setting MaterialName
          hotInstance.setDataAtCell(
            this.activeRow.row,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );

          if (this.ItemMasterArrayByName.unitDetails) {
            const unitId =
              this.ItemMasterArrayByName.unitDetails?.unitDetailsUnitId;
            const UnitId: string =
              unitId != null
                ? this.unitListt?.find((l) => l.value == unitId)?.label
                : null;
            hotInstance.setDataAtCell(this.activeRow.row, 3, UnitId);
            // hotInstance.setDataAtCell(
            //   this.activeRow.row,
            //   4,
            //   this.ItemMasterArrayByName.unitDetails?.unitDetailsRate
            // );
          }
        });
    }
    this.showSalesLookUp = false;
  }
  getUnitByItemId(id) {
    this.unitArray = [];
    this.masterapi.GetUnitDetails(id).subscribe((res) => {
      this.unitArray = res.result;
      this.dataList = this.unitSetLookup;
      this.unitArry = res.result.map((ar) =>
        ar.unitMasterUnitShortName?.trim()
      );
      this.showSalesLookUp = true;
    });
  }
  rptFilter: ReportFilterModel;
  getReport() {
    this.rptFilter = {
      ReportName: 'Enquiry',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_enquiry  where Enquiry_Master_Enquiry_ID ='${
          this.customerEnquiryFormGroup.getRawValue().enquiryMasterEnquiryId
        }'`,
      ],
      SP_Queries: [],
    };

    this.crystalReportService
      .getReportPrint(this.rptFilter, true)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }

  exit(evt) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.salesId);
    this.elementReference.nativeElement.value = evt.sales;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showSalesLookUp = false;
    this.formControlLookUp = false;
  }

  userTrackingLog(type) {
    let req = {
      page: 'Customer Enquiry',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.customerEnquiryFormGroup.get('enquiryMasterEnquiryId').value,
      vpType: 'Customer Enquiry',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      console.log('Response:', res);
    });
  }
}

interface GridData {
  itemId?: any;
  partno?: any;
  itemname?: string;
  unit?: string;
  qty?: number;
  description?: string;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
export const columnDetailList = (component: CustomerenquiryComponent) => [
  {
    data: 'itemId',
    type: 'numeric',
    label: 'Item Code',
    toolTip: 'Item Id',
    source: component.itemArry,
  },
  {
    data: 'partno',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
  },
  {
    data: 'itemname',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Item Name',
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
    source: component.unitArry,
  },
  {
    data: 'qty',
    type: 'numeric',
    label: 'Quantity',
    toolTip: 'Quantity',
    readOnly: false,
  },
  {
    data: 'description',
    type: 'text',
    label: 'Description',
    toolTip: 'Description',
    readOnly: false,
  },
];
