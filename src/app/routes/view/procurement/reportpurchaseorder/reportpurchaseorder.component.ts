import { DatePipe } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng';
import {
  ChartofAccounts,
  DepartmentMaster,
  ItemMaster,
} from 'src/app/routes/domain';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { ViewAccountsTransactionsVoucherType } from 'src/app/routes/domain/Accounts/ViewAccountsTransactionsVoucherType';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { SalesManMaster } from 'src/app/routes/domain/Masters/SalesManMaster';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { PurchaseOrderReportParameters } from 'src/app/routes/domain/Procurements/PurchaseOrderReportParameters';
import { ReportPurchaseOrder } from 'src/app/routes/domain/Procurements/ReportPurchaseOrder';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { DatefilterComponent } from 'src/app/shared/component/datefilter/datefilter.component';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-reportpurchaseorder',
  templateUrl: './reportpurchaseorder.component.html',
  styleUrls: ['./reportpurchaseorder.component.scss'],
})
export class ReportpurchaseorderComponent implements OnInit {
  @ViewChild(DatefilterComponent) datefilterComponent!: DatefilterComponent;
  confirmDropDatabaseDialogVisible = false;

  TotRunningBalanceCreditDebit: string;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  SalesManMasterArray: SalesManMaster[] = [];
  SalesManMasterArry: string[] = [];
  SalesManMasterList: SelectItem[];

  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  DepartmentMasterArray: DepartmentMaster[] = [];
  DepartmentMasterArry: string[] = [];
  DepartmentMasterList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];

  V_TYPEArray: ViewAccountsTransactionsVoucherType[] = [];
  V_TYPEArry: string[] = [];
  V_TYPEList: SelectItem[];

  VendorMasterArray: ItemMaster[] = [];
  VendorMasterArry: string[] = [];
  VendorMasterList: SelectItem[];

  ItemMasterGroupArray: ItemMaster[] = [];
  ItemMasterGroupArry: string[] = [];
  ItemMasterGroupList: SelectItem[];

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  reportSalesVoucher: ReportPurchaseOrder[] = [];
  Permission: any;
  ScreenId: number;
  v_typeList: SelectItem[];
  v_RoundoffList: SelectItem[];
  MainItemMasterList: any[];
  initialControlLoaded = false;

  FILL_COMBO() {
    this.v_typeList = [
      { label: 'ALL', value: { name: 'ALL' } },
      { label: 'CASH', value: { name: 'CASH' } },
      { label: 'CREDIT', value: { name: 'CREDIT' } },
    ];
    this.v_RoundoffList = [
      { label: '+', value: { name: '+' } },
      { label: '-', value: { name: '-' } },
    ];
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,

    private formatDateService: ReportDateFormatService,
    private datepipes: DatePipe,
    private permission: PermissionsService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService,
    private crystalReportService: CrystalReportService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'reportpurchaseorder_HotEntry';
  reportpurchaseorder_entry: Handsontable.GridSettings;
  reportPurchaseOrderFormGroup: FormGroup;
  reportpurchaseorder_entryDataset = [];
  cols;

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
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
    this.FILL_COMBO();

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.initializeControls();
    this.reportPurchaseOrderFormGroup = this.fb.group({
      rptSummary: [{ value: false, disabled: true }],
      rptDetails: [{ value: true, disabled: true }],
      rptDateRange: [{ value: false, disabled: true }],
      rptDtpFrom: [{ value: [null], disabled: true }],
      rptDtpTo: [{ value: [null], disabled: true }],
      rptPrintGroupByItem: [{ value: true, disabled: true }],
      rptJob: [{ value: [-1], disabled: true }],
      rptLocation: [{ value: [-1], disabled: true }],
      rptSupplier: [{ value: [-1], disabled: true }],
      rptBrand: [{ value: [-1], disabled: true }],
      rptItemGroup: [{ value: [-1], disabled: true }],
      rptItem: [{ value: [-1], disabled: true }],
      rptCurrency: [{ value: [-1], disabled: true }],
      rptSalesMan: [{ value: [-1], disabled: true }],
      rptInvoiceType: [{ value: 'ALL', disabled: true }],

      rptNetAmt: [{ value: [null], disabled: true }],
      rptDiscAmt: [{ value: [null], disabled: true }],
      rptSuppInvNo: [{ value: [''], disabled: true }],
    });

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.new();

    this.reportPurchaseOrderFormGroup.disable();
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').setValue(new Date());
  }

  showPrint() {
    let isDate = this.enableDate;
    let currency = this.reportPurchaseOrderFormGroup.get('rptCurrency')?.value;
    let item = this.reportPurchaseOrderFormGroup.get('rptItem')?.value;
    let rptSuppInvNo =
      this.reportPurchaseOrderFormGroup.get('rptSuppInvNo')?.value;
    let supplier = this.reportPurchaseOrderFormGroup.get('rptSupplier')?.value;
    let location = this.reportPurchaseOrderFormGroup.get('rptLocation')?.value;
    let invoiceType =
      this.reportPurchaseOrderFormGroup.get('rptInvoiceType')?.value;
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();
    let query = 'select * from vw_po where 1 = 1';

    // ✅ Apply filters dynamically (all scenarios)
    if (isDate) {
      query += ` AND PurchaseOrderDate BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    if (currency && currency != -1) {
      query += ` AND PurchaseOrderCurrency = ${currency}`;
    }

    if (supplier && supplier != -1) {
      query += ` AND PurchaseOrderSupplierId = ${supplier}`;
    }

    if (rptSuppInvNo && rptSuppInvNo.trim() !== '') {
      query += ` AND SupplierInvoiceNo = '${rptSuppInvNo}'`;
    }

    if (item && item != -1) {
      query += ` AND ItemId = ${item}`;
    }

    if (location && location != -1) {
      query += ` AND PurchaseOrderLocationId = ${location}`;
    }

    if (invoiceType && invoiceType != 'ALL') {
      query += ` AND PurchaseOrderType = ${invoiceType}`;
    }

    this.rptFilter = {
      ReportName: this.Summary
        ? 'PurchaseOrderReportSummary'
        : 'PurchaseOrderReportDetails',
      SelectionFormula: '',
      Parameters: [],
      Queries: [query],
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

  get f() {
    return this.reportPurchaseOrderFormGroup.controls;
  }

  initializeControls() {
    if (this.initialControlLoaded) return;

    this.accountapi.PurchaseLoadDropdown().subscribe((m) => {
      this.initialControlLoaded = true;
      //supplier
      this.SupplierMasterArray = m.resultSet.suppliersMaster;
      this.SupplierMasterList = m.resultSet.suppliersMaster?.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.SupplierMasterList.unshift({
        label: '--Select Supplier--',
        value: -1,
      });
      //currency
      this.currArry = m.resultSet.currencyMasters;
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
      }));
      this.currencyList.unshift({ label: '--Select Currency--', value: -1 });
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      //location
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl.itemMasterItemId,
        partNo: kl.itemMasterPartNo,
        //stock: kl.itemMasterStockType,
        //barcode: kl.itemMasterBarcode,
        AccNo: kl.itemMasterAccountNo,
      }));
      this.MainItemMasterList = this.ItemMasterList;
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      //item group
      this.ItemMasterGroupArray = m.resultSet.itemMasterGroup;
      this.ItemMasterGroupList = m.resultSet.itemMasterGroup?.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterGroupList.unshift({
        label: '--Select Item Group--',
        value: -1,
      });
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters?.map((kl) => ({
        label: kl.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      //voucher type
      this.V_TYPEArray = m.resultSet.vouchers;
      this.V_TYPEList = m.resultSet.vouchers?.map((kl) => ({
        label: kl.accountsTransactionsVoucherType,
        value: kl.accountsTransactionsVoucherType,
      }));
    });

    this.reportpurchaseorder_entry = this.utilityService.getTableConfig(
      purchaseOrderColumnObjList(this),
      []
    );

    this.reportpurchaseorder_entry.beforeChangeRender = (change, source) => {
      //this.ColumnSum();

      index: Number;
      this.index = Number(change[0]);

      debitMinusCredit: Number;
      PrevRunningBal: Number;
      CurrRunningBal: Number;
    };

    this.reportpurchaseorder_entry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      // console.log('beforeRemove: index: %d, amount: %d', index, amount);
      // console.log(this.hotRegisterer.getInstance(this.hotid).getDataAtRow(index));
      this.ColumnSum();
    };

    this.reportpurchaseorder_entry.afterValidate = (
      isValid,
      value,
      row,
      prop
    ) => {
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
    if (this.Details) {
      const sum1 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderDetailsNetAmt != null)
        .reduce((sum, current) => sum + current.purchaseOrderDetailsNetAmt, 0);

      this.reportPurchaseOrderFormGroup.controls.rptNetAmt.setValue(
        Number(sum1)
      );

      const sum2 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderDetailsDiscAmount != null)
        .reduce(
          (sum, current) => sum + current.purchaseOrderDetailsDiscAmount,
          0
        );
      this.reportPurchaseOrderFormGroup.controls.rptDiscAmt.setValue(sum2);
      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }

      // this.reportPurchaseVoucherFormGroup.controls.rptTotRunningBalanceCreditDebit.setValue(CreditDebitDiff);
    } else {
      const sum1 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderNetAmount != null)
        .reduce((sum, current) => sum + current.purchaseOrderNetAmount, 0);

      this.reportPurchaseOrderFormGroup.controls.rptNetAmt.setValue(
        Number(sum1)
      );
      const sum2 = (this.reportpurchaseorder_entry.data as PurchaseOrder[])
        ?.filter((item) => item.purchaseOrderDetailsDiscAmount != null)
        .reduce(
          (sum, current) => sum + current.purchaseOrderDetailsDiscAmount,
          0
        );
      this.reportPurchaseOrderFormGroup.controls.rptDiscAmt.setValue(sum2);

      const CreditDebitDiff = sum1 - sum2;

      if (Number(CreditDebitDiff) == 0) {
        this.TotRunningBalanceCreditDebit = '0 Balance';
      } else if (Number(CreditDebitDiff) < 0) {
        this.TotRunningBalanceCreditDebit =
          'Credit Balance ' + CreditDebitDiff * -1;
      } else {
        this.TotRunningBalanceCreditDebit = 'Debit Balance ' + CreditDebitDiff;
      }
    }
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.reportPurchaseOrderFormGroup.enable();
    this.reportPurchaseOrderFormGroup.updateValueAndValidity();
  }

  new() {
    this.enableDate = false;
    this.reportPurchaseOrderFormGroup.reset();
    this.initializeControls();
    if (this.reportpurchaseorder_entry) {
      this.reportpurchaseorder_entry.data = [];
      this.reportpurchaseorder_entry.readOnly = false;
    }
    this.reportPurchaseOrderFormGroup.get('rptSummary').setValue(false);
    this.reportPurchaseOrderFormGroup.get('rptDetails').setValue(true);
    this.reportPurchaseOrderFormGroup.get('rptDateRange').setValue(false);
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').setValue(new Date());
    this.reportPurchaseOrderFormGroup
      .get('rptPrintGroupByItem')
      .setValue(false);
    this.reportPurchaseOrderFormGroup.get('rptJob').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptSupplier').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptLocation').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptBrand').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptItemGroup').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptItem').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptCurrency').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptSalesMan').setValue(-1);
    this.reportPurchaseOrderFormGroup.get('rptInvoiceType').setValue('ALL');
    this.reportPurchaseOrderFormGroup.get('rptNetAmt').setValue(null);
    this.reportPurchaseOrderFormGroup.get('rptDiscAmt').setValue(null);
    this.reportPurchaseOrderFormGroup.get('rptDetails').setValue(true);
    this.reportPurchaseOrderFormGroup.get('rptSuppInvNo').setValue('');

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.reportPurchaseOrderFormGroup.enable();
    //  this.f.purchaseVoucherNo.clearValidators();
    this.reportPurchaseOrderFormGroup.updateValueAndValidity();
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').disable();
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').disable();
  }

  ZeroVatOnly: boolean = false;
  ChangeZeroVatOnly() {
    if (this.ZeroVatOnly == false) {
      this.ZeroVatOnly = true;
    } else {
      this.ZeroVatOnly = false;
    }
  }
  Details: boolean = true;
  Summary: boolean = false;

  makeDetailsTrue() {
    this.Details = true;
    this.Summary = false;
    this.List_REPORT();
  }

  makeSummaryTrue() {
    this.Summary = true;
    this.Details = false;
    this.List_REPORT();
  }

  AsOnDate: boolean = true;
  enableDate: boolean = false;
  PrintGroupByItem: boolean = false;
  makeAsOnDateTrue() {
    this.AsOnDate = true;
    this.enableDate = false;
  }

  makePrintGroupByItemTrue() {
    if (this.PrintGroupByItem == true) {
      this.PrintGroupByItem = false;
    } else {
      this.PrintGroupByItem = true;
    }
    //  this.enableDate == true;
    //   this.AsOnDate = false;
  }

  makeDateRangeTrue() {
    if (this.enableDate == true) {
      this.enableDate = false;
      this.reportPurchaseOrderFormGroup.get('rptDtpFrom').disable();
      this.reportPurchaseOrderFormGroup.get('rptDtpTo').disable();
    } else {
      this.enableDate = true;

      this.reportPurchaseOrderFormGroup.get('rptDtpFrom').enable();
      this.reportPurchaseOrderFormGroup.get('rptDtpTo').enable();
    }
    this.reportPurchaseOrderFormGroup.get('rptDtpFrom').setValue(new Date());
    this.reportPurchaseOrderFormGroup.get('rptDtpTo').setValue(new Date());
    //  this.enableDate == true;
    //   this.AsOnDate = false;
  }

  validateDate(): boolean {
    if (this.enableDate == true) {
      if (this.reportPurchaseOrderFormGroup.getRawValue().rptDtpFrom == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No From Date',
        });
        return false;
      }
      if (this.reportPurchaseOrderFormGroup.getRawValue().rptDtpTo == null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'No To Date',
        });
        return false;
      }
      if (
        this.reportPurchaseOrderFormGroup.getRawValue().rptDtpTo <
        this.reportPurchaseOrderFormGroup.getRawValue().rptDtpFrom
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'To Date Less Than From Date',
        });
        return false;
      }
    }

    return true;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  List_REPORT() {
    const { fromDate, toDate } = this.datefilterComponent.onApplyDateFilter();

    if (this.validateDate()) {
      const purchaseVoucherReportParameters_Save: PurchaseOrderReportParameters =
        this.reportPurchaseOrderFormGroup
          .value as PurchaseOrderReportParameters;

      purchaseVoucherReportParameters_Save.rptSummary = this.Summary;
      purchaseVoucherReportParameters_Save.rptDetails = this.Details;
      purchaseVoucherReportParameters_Save.rptDateRange = this.enableDate;
      purchaseVoucherReportParameters_Save.rptDtpFrom = fromDate;
      purchaseVoucherReportParameters_Save.rptDtpTo = toDate;
      purchaseVoucherReportParameters_Save.rptPrintGroupByItem =
        this.PrintGroupByItem;
      purchaseVoucherReportParameters_Save.rptJob =
        this.reportPurchaseOrderFormGroup.value.rptJob;
      purchaseVoucherReportParameters_Save.rptSupplier =
        this.reportPurchaseOrderFormGroup.value.rptSupplier;
      purchaseVoucherReportParameters_Save.rptLocation =
        this.reportPurchaseOrderFormGroup.value.rptLocation;

      purchaseVoucherReportParameters_Save.rptBrand = -1; // this.reportPurchaseVoucherFormGroup.value.rptBrand;
      purchaseVoucherReportParameters_Save.rptItemGroup =
        this.reportPurchaseOrderFormGroup.value.rptItemGroup;
      purchaseVoucherReportParameters_Save.rptItem =
        this.reportPurchaseOrderFormGroup.value.rptItem;
      purchaseVoucherReportParameters_Save.rptCurrency =
        this.reportPurchaseOrderFormGroup.value.rptCurrency;
      purchaseVoucherReportParameters_Save.rptSalesMan = -1; //this.reportPurchaseVoucherFormGroup.value.rptSalesMan;
      purchaseVoucherReportParameters_Save.rptDpt = -1; //this.reportPurchaseVoucherFormGroup.value.rptDpt;
      purchaseVoucherReportParameters_Save.rptInvoiceType =
        this.reportPurchaseOrderFormGroup.value.rptInvoiceType.name !=
          undefined ||
        this.reportPurchaseOrderFormGroup.value.rptInvoiceType.name != null
          ? this.reportPurchaseOrderFormGroup.value.rptInvoiceType.name
          : 'ALL';
      //purchaseVoucherReportParameters_Save.rptInvoiceType = "ALL";
      purchaseVoucherReportParameters_Save.rptSuppInvNo =
        this.reportPurchaseOrderFormGroup.value.rptSuppInvNo;

      purchaseVoucherReportParameters_Save.viewStockTransferType = [];
      this.accountapi
        .MainReport_GetReportPurchaseOrder_PARAM_CLASS(
          purchaseVoucherReportParameters_Save
        )
        .subscribe((data) => {
          this.reportSalesVoucher = data.result;
          this.updateHot_Report(data.result);
          this.ColumnSum();
        });
    }
  }

  updateHot_Report(reportSalesVoucher_update: ReportPurchaseOrder[]) {
    const gridData: GridData[] = reportSalesVoucher_update.map((k) => {
      return {
        purchaseOrderId: k.purchaseOrderId,
        purchaseOrderNo: k.purchaseOrderNo,
        purchaseOrderDate: this.datepipes.transform(
          k.purchaseOrderDate,
          'dd/MM/yyyy'
        ),
        purchaseOrderType: k.purchaseOrderType,
        purchaseOrderTotalGrossAmount: k.purchaseOrderTotalGrossAmount,
        purchaseOrderTotalDisAmount: k.purchaseOrderTotalDisAmount,
        purchaseOrderSupInvNo: k.purchaseOrderSupInvNo,
        purchaseOrderVatAmt: k.purchaseOrderVatAmt,
        purchaseOrderVatRountAmt: k.purchaseOrderVatRountAmt,
        purchaseOrderTotalItemDisAmount:
          k.purchaseOrderTotalItemDisAmount != null
            ? k.purchaseOrderTotalItemDisAmount
            : 0,
        purchaseOrderNetDisAmount: k.purchaseOrderNetDisAmount,
        itemMasterItemId: k.itemMasterItemId,
        ///purchaseOrderDetailsNetAmt: k.purchaseOrderDetailsNetAmt,
        //  purchaseVoucherDetailsDiscAmount: k.purchaseOrderTotalItemDisAmount != null ? k.purchaseOrderTotalItemDisAmount : 0,// k.purchaseVoucherDetailsDiscAmount !=null ? k.purchaseVoucherDetailsDiscAmount :0,

        suppliersMasterSupplierName: k.suppliersMasterSupplierName,
        purchaseOrderpartyName: k.purchaseOrderpartyName,
        purchaseOrderpartyAddress: k.purchaseOrderpartyAddress,

        // itemBrandName: k.itemBrandName,
        purchaseOrderDetailsQuantity: k.purchaseOrderDetailsQuantity,
        // itemGroupName: k.itemGroupName,
        // salesVoucherExcludeVat: k.salesVoucherExcludeVat,
        //  departmentMasterDepartmentName: k.departmentMasterDepartmentName,
        locationName: k.locationName,
        itemMasterItemName: k.matDesc,
        unitMasterUnitShortName: k.unitName,
        currencyName: k.currencyName,
        purchaseOrderDetailsRate: k.purchaseOrderDetailsRate,
        //  salesManMasterSalesManName: k.salesManMasterSalesManName,
        partno: k.partno,
        //  purchaseOrderSupInvNo: k.purchaseOrderSupInvNo,

        //  purchaseVoucherPono: k.purchaseOrderNo,
        purchaseOrderpartyVatNo: k.purchaseOrderpartyVatNo,
        purchaseOrderDetailsMatId: k.itemMasterItemId,
        purchaseOrderVatper: k.purchaseOrderVatper,
        //// purchaseOrderVatAmt: k.purchaseOrderVatAmt,

        purchaseOrderFsno: k.purchaseOrderFsno,
        purchaseOrderLocationId: k.purchaseOrderLocationId,
        purchaseOrderDelStatus: k.purchaseOrderDelStatus,
        purchaseOrderDetailsGrossAmount:
          k.purchaseOrderDetailsQuantity * k.purchaseOrderDetailsRate,
        purchaseOrderDetailsDiscAmount:
          k.purchaseOrderDetailsDiscAmount != null
            ? k.purchaseOrderDetailsDiscAmount
            : 0,

        purchaseOrderDetailsNetAmt:
          k.purchaseOrderDetailsNetAmt != null
            ? k.purchaseOrderDetailsNetAmt
            : 0,

        purchaseOrderNetAmount:
          k.purchaseOrderDetailsNetAmt + k.purchaseOrderVatAmt,
      };
    });

    this.reportpurchaseorder_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.reportPurchaseOrderFormGroup.disable();
    // this.f.purchaseVoucherNo.clearValidators();
    this.reportPurchaseOrderFormGroup.updateValueAndValidity();

    this.edit();
    this.ColumnSum();

    if (this.Details) {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [3, 6, 7],
          indicators: false,
        },
      });
    } else {
      this.hotRegisterer.getInstance(this.hotid).updateSettings({
        hiddenColumns: {
          columns: [3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          indicators: false,
        },
      });
    }
  }
}

interface PurchaseOrder {
  purchaseOrderDetailsNetAmt?: number;
  purchaseOrderDetailsDiscAmount: number;
  purchaseOrderNetAmount: number;
}

interface GridData {
  purchaseOrderId?: number;
  purchaseOrderNo?: string;
  purchaseOrderDate?: string;
  purchaseOrderType?: string;
  ///purchaseOrderpartyId?:number;
  purchaseOrderpartyName?: string;
  purchaseOrderpartyAddress?: string;
  purchaseOrderpartyVatNo?: string;
  purchaseOrderRefNo?: string;
  purchaseOrderSupInvNo?: string;
  purchaseOrderGrno?: string;
  purchaseOrderGrdate?: Date;
  purchaseOrderLpono?: string;
  purchaseOrderLpodate?: Date;
  purchaseOrderQtnNo?: string;
  purchaseOrderQtnDate?: Date;
  purchaseOrderDescription?: string;
  purchaseOrderExcludeVat?: Boolean;
  purchaseOrderpono?: string;
  purchaseOrderBatchCode?: string;
  purchaseOrderDayBookNo?: string;
  purchaseOrderLocationId?: number;
  purchaseOrderUserId?: number;
  purchaseOrderCurrencyId?: number;
  purchaseOrderCompanyId?: number;
  purchaseOrderJobId?: number;
  purchaseOrderFsno?: number;
  purchaseOrderFcRate?: number;
  purchaseOrderStatus?: string;
  purchaseOrderTotalGrossAmount?: number;
  purchaseOrderTotalItemDisAmount?: number;
  purchaseOrderTotalActualAmount?: number;
  purchaseOrderTotalDisper?: number;
  purchaseOrderTotalDisAmount?: number;
  purchaseOrderVatAmt?: number;
  purchaseOrderVatper?: number;
  purchaseOrderVatRoundSign?: string;
  purchaseOrderVatRountAmt?: number;
  purchaseOrderNetDisAmount?: number;
  purchaseOrderNetAmount?: number;
  purchaseOrderTransportCost?: number;
  purchaseOrderHandlingcharges?: number;
  purchaseOrderIssueId?: string;
  purchaseOrderJobDirectpur?: Boolean;
  purchaseOrderDelStatus?: Boolean;
  purchaseOrderIndentNo?: string;
  purchaseOrderContperson?: string;
  purchaseOrderpreparedBy?: string;
  purchaseOrderRecommendedBy?: string;
  purchaseOrderApproveEnable?: Boolean;
  purchaseOrderApproveDate?: Date;
  purchaseOrderApproveStatus?: string;
  purchaseOrderApproveUserId?: number;
  purchaseOrderHeader?: string;
  purchaseOrderDelivery?: string;
  purchaseOrderNotes?: string;
  purchaseOrderFooter?: string;
  purchaseOrderpaymentTerms?: string;
  purchaseOrderSubject?: string;
  purchaseOrderContent?: string;
  purchaseOrderRemarks1?: string;
  purchaseOrderRemarks2?: string;
  purchaseOrderRemarks3?: string;
  purchaseOrderDelivFromDate?: Date;
  purchaseOrderDelivToDate?: Date;
  purchaseOrderDelivStatus?: string;
  purchaseOrderDelivplace?: string;
  SuppliersMasterSupplierName?: string;
  JobMasterJobName?: string;
  partno?: string;
  matDesc?: string;
  itemMasterItemId?: number;
  purchaseOrderDetailsQuantity?: number;
  purchaseOrderDetailsRate?: number;
  purchaseOrderDetailsDiscAmount?: number;
  purchaseOrderDetailsNetAmt?: number;
  locationName?: string;
  unitname?: string;
  currencyName?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const purchaseOrderColumnObjList = (
  component: ReportpurchaseorderComponent
) => [
  {
    data: 'purchaseOrderNo',
    type: 'text',
    label: 'VoucherNo',
    toolTip: 'Purchase Order Number',
    width: '35%',
  },
  {
    data: 'purchaseOrderDate',
    type: 'date',
    label: 'Date',
    toolTip: 'Order Date',
  },
  {
    data: 'purchaseOrderType',
    type: 'text',
    label: 'Type',
    toolTip: 'Order Type',
  },
  {
    data: 'purchaseOrderSupInvNo',
    type: 'text',
    label: 'Supp. Inv. #',
    toolTip: 'Supplier Invoice Number',
  },
  {
    data: 'locationName',
    type: 'text',
    label: 'Location',
    toolTip: 'Location Name',
  },
  {
    data: 'suppliersMasterSupplierName',
    type: 'text',
    label: 'Supplier',
    toolTip: 'Supplier Name',
  },
  {
    data: 'purchaseOrderDetailsMatId',
    type: 'numeric',
    label: 'Item.Id',
    toolTip: 'Item ID',
  },
  {
    data: 'partno',
    type: 'text',
    label: 'Part No.',
    toolTip: 'Item Part Number',
  },
  {
    data: 'itemMasterItemName',
    type: 'text',
    label: 'Item',
    toolTip: 'Item Name',
  },
  {
    data: 'unitMasterUnitShortName',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit of Measurement',
  },
  {
    data: 'purchaseOrderDetailsQuantity',
    type: 'numeric',
    label: 'Qty',
    toolTip: 'Quantity',
  },
  {
    data: 'purchaseOrderDetailsRate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Item Rate',
  },
  {
    data: 'purchaseOrderDetailsGrossAmount',
    type: 'numeric',
    label: 'Gross.Amt.',
    toolTip: 'Gross Amount',
  },
  {
    data: 'purchaseOrderDetailsDiscAmount',
    type: 'numeric',
    label: 'Disc Amt.',
    toolTip: 'Discount Amount',
  },
  {
    data: 'purchaseOrderDetailsNetAmt',
    type: 'numeric',
    label: 'Net.Amt.',
    toolTip: 'Net Amount',
  },
  {
    data: 'purchaseOrderVatAmt',
    type: 'numeric',
    label: 'VAT.Amt.',
    toolTip: 'VAT Amount',
  },
  {
    data: 'purchaseOrderVatRountAmt',
    type: 'numeric',
    label: 'Round.Amt.',
    toolTip: 'Round Amount',
  },
  {
    data: 'purchaseOrderNetAmount',
    type: 'numeric',
    label: 'Total Amt',
    toolTip: 'Total Amount',
  },
];
