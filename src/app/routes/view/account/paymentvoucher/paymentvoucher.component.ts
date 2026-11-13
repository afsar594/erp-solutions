import {
  Component,
  ElementRef,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { PaymentVoucher } from 'src/app/routes/domain/Accounts/PaymentVoucher';
import { PaymentVoucherDetails } from 'src/app/routes/domain/Accounts/PaymentVoucherDetails';
import { ChartofAccounts } from 'src/app/routes/domain/Masters/ChartofAccounts';
import { JobMaster } from 'src/app/routes/domain//Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain//Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ToWords } from 'to-words';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { CredentialKeys } from 'src/app/routes/Enums/loginInfo';
import { LoginService } from 'src/app/routes/service/login.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
@Component({
  selector: 'app-paymentvoucher',
  templateUrl: './paymentvoucher.component.html',
  styleUrls: ['./paymentvoucher.component.scss'],
})
export class PaymentvoucherComponent implements OnInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  rptFilter: ReportFilterModel;
  pdfSource: any;
  pipe = new DatePipe('en-US');
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string = null;
  index: number = 0;
  dataList: Array<any> = [];
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;
  CramtChk: number = 0;
  selectItem: any;
  CurrentselectedAccount: any;
  lookupGridColumns = [];
  sum: any = 0;
  sumwordsnew: string;
  fcrate: number = 0;
  rptPassstring: string;
  rptHeadstring: string;
  rptReportHead: string;
  date1: string;
  activeRow: { row: number; column: number };
  rptVrno: string;
  rptVrdt: string;
  rptAddess: string;
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  btnFlag: ButtonFlag = {
    new: true,
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
    print: false,
    printPreview: false,
  };
  currencyList: SelectItem[];
  currArry: string[] = [];
  control: AbstractControl;
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefCostCenterCheck: String;
  DefCostCenterId: string;

  DefLocCheck: string;
  DefLocid: string;

  DefAcc: string;
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;
  callDDLs: boolean = false;

  receivedAllocationData: any[] = [];
  accountTransactionList: AccountsTransactions[] = [];
  paymentVoucherarry: PaymentVoucher[] = [];
  _paymentVoucherDetails: PaymentVoucherDetails;
  savedPaymentVoucher: PaymentVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'paymtVouchrEntry';
  displayPrintPreview: boolean = false;
  Permission: any;
  ScreenId: number;
  filterArray: any;
  user: any;
  JOBCOST: boolean = true;
  defaultMasterAccount: any;

  itemList = [];
  clickedRowColumn = { row: -1, column: -1 };
  contraSettings: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private printService: FileSaverService,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService,

    private loginser: LoginService,
    private storage: LocalStorageService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.CramtChk = 0;
  }

  vNo: string = '';
  paymentvoucherentry: Handsontable.GridSettings;
  paymentVoucherFormGroup: FormGroup;
  PaymentVoucherFilterForm: FormGroup;
  cols;
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.vNo = params['vNo'];

      this.user = this.permission.getUser();
      this.stationmasterObj = this.permission.getStation();
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
      } else {
        this.router.navigate(['/login']);
      }
      if (this.vNo) {
        this.GetSavedPaymentDetails(this.vNo);
      }
    });

    this.cols = [
      { field: 'paymentVoucherVoucherNo', header: 'Voucher No' },
      { field: 'paymentVoucherDate', header: 'Date' },
      { field: 'paymentVoucherCrAcNo', header: 'Account' },
      { field: 'paymentVoucherCurrencyId', header: 'Currency' },
      { field: 'paymentVoucherDbAmount', header: 'Vchr.Debit' },
      { field: 'paymentVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'paymentVoucherNarration', header: 'Particulars' },
      { field: 'paymentVoucherDbAmount', header: 'Dtls.Debit' },
      { field: 'paymentVoucherCrAmount', header: 'Dtls.Credit' },
      { field: '', header: 'Action' },
    ];

    // let today = new Date();
    // this.date1 = today.getMonth() + '/' + today.getDate() + '/' + today.getFullYear();
    this.date1 = new Date().toLocaleDateString();

    this.initializeControls();
    this.paymentVoucherFormGroup = this.fb.group({
      paymentVoucherSno: 0,
      paymentVoucherVoucherNo: [{ value: null, disabled: true }],
      paymentVoucherDate: [null, [Validators.required]],
      paymentVoucherVoucherRef: [''],
      paymentVoucherCrAcNo: [-1, [DropDownValidator]],
      paymentVoucherCrAmount: 0,
      paymentvoucherCrAmt: 0,
      paymentVoucherDbAmount: 0,
      paymentVoucherNarration: [''],
      paymentVoucherCurrencyId: [-1, [DropDownValidator]],
    });
    this.paymentVoucherFormGroup.disable();
    this.PaymentVoucherFilterForm = this.fb.group({
      paymentVoucherAcNo: [null],
      isDate: [],
      paymentVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.storage.get(CredentialKeys.Login);

    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.paymentVoucherFormGroup.disable();
    this.bykeys();
  }

  bykeys() {
    this.utilityService
      .getProgramSettings(
        'Hide_Job_Detail,Hide_CostCenter_Detail,Add_JOB_IN_CONTRA'
      )
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );
        const contraSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Add_JOB_IN_CONTRA'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        this.contraSettings = contraSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }

  receiveData(data: any) {
    this.receivedAllocationData = [];
    data.forEach((e) => {
      if (e.IsSelected === true) {
        this.receivedAllocationData.push(e);
      }
    });
    // console.log('receivedAllocationData : ', this.receivedAllocationData);
  }

  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
  }

  get f() {
    return this.paymentVoucherFormGroup.controls;
  }

  initializeControls() {
    let cols = paymentVoucherColumnList(this);

    let hiddenColumn = [2, 3, 4, 6];

    this.paymentvoucherentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );

    this.paymentvoucherentry.afterSelection = (
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

      this.clickedRowColumn = { row, column };
      const hotInstance = this.hotRegisterer.getInstance(this.hotid);
      if (this.utilityService.isRowDisabled(row, hotInstance)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Notice',
          detail: 'Please fill the previous row first',
        });
        return;
      }

      if (column === 0 && this.paymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3 && this.paymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        this.showAccountLookUp = true;
        hotInstance.deselectCell();
        this.activeRow = { row, column };
      } else if (column === 4 && this.paymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
        this.dataList = this.costSetLookup;
        hotInstance.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else {
        this.showAccountLookUp = false;
        this.activeRow = { row, column };
      }
      if (x != null && this.dataList.length > 0) {
        this.selectItem = this.dataList?.find((k) => k.account == x);
      } else {
        this.selectItem = {};
      }
    };

    this.paymentvoucherentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.paymentvoucherentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.paymentvoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.itemList.splice(index, 1);
      this.ColumnSum();
    };

    this.paymentvoucherentry.afterValidate = (isValid, value, row, prop) => {
      if (!isValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Invalid entry'),
        });
      }
    };

    // this.paymentvoucherentry.afterChange = (r, c) => {
    //   // const  hotinstance = this.hotRegisterer.getInstance(this.hotid);
    //   // var data = hotinstance.getDataAtRow(r);
    //   console.log(r, c);

    // };
  }

  ColumnSum() {
    if (this.paymentvoucherentry.data.length > 0) {
      var value = 0;
      this.paymentvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.debit > 0) {
          value += elemt.debit;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.paymentVoucherFormGroup.controls.paymentVoucherDbAmount.setValue(
        value
      );
      //  this.sumwordsnew =  converter.toWords(this.sum);
    }
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  get accountSetLookup() {
    return this.accountArray.map((kl) => ({
      account: kl.maAccName,
      accountId: kl.maAccNo,
    }));
  }

  get jobSetLookup() {
    return this.jobList.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }

  get costSetLookup() {
    //console.log("this.costcenterArray", this.costcenterArray)
    return this.costcenterArray.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.utilityService.getPaymentDropdown().subscribe((m: any) => {
      //currency
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });

      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      // this.jobList.unshift({ label: '--Select--', value: -1 });

      //cost
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({ label: '--Select--', value: -1 });

      //account
      this.accountArraydropdown = m.resultSet.cashAccountList;
      this.accountListdropdown = m.resultSet.cashAccountList?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountListdropdown.unshift({ label: '--Select--', value: -1 });

      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
    });
  }

  savePaymentVoucher() {
    this.paymentVoucherFormGroup.markAllAsTouched();
    this.paymentVoucherFormGroup.controls['paymentVoucherDbAmount'].setValue(
      parseFloat(this.paymentVoucherFormGroup.value.paymentVoucherDbAmount)
    );

    const savedData: any = this.paymentvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const paymtVoucher: PaymentVoucher = this.paymentVoucherFormGroup
      .value as PaymentVoucher;
    paymtVoucher.paymentVoucherVoucherNo =
      this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo;
    paymtVoucher.paymentVoucherSno =
      this.paymentVoucherFormGroup.value.paymentVoucherSno != null
        ? parseInt(this.paymentVoucherFormGroup.value.paymentVoucherSno)
        : 0;
    paymtVoucher.paymentVoucherCrAmount =
      this.paymentVoucherFormGroup.value.paymentvoucherCrAmt;
    paymtVoucher.paymentVoucherFcCrAmount =
      this.paymentVoucherFormGroup.value.paymentvoucherCrAmt;
    paymtVoucher.paymentVoucherFsno = this.fsno;
    paymtVoucher.paymentVoucherUserId = this.usrid;
    paymtVoucher.paymentVoucherLocationId = this.locId;
    paymtVoucher.paymentVoucherAllocationId = 0;
    paymtVoucher.accountsTransactions = [];
    paymtVoucher.allocationDetails = this.receivedAllocationData;
    paymtVoucher.paymentVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          paymentVoucherDetailsId: k.id != null ? k.id : 0,
          // paymentVoucherDetailsId: k.id,
          paymentVoucherDetailsVoucherNo:
            this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo,
          paymentVoucherDetailsSno:
            this.paymentVoucherFormGroup.getRawValue().paymentVoucherSno,
          paymentVoucherDetailsAcNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          paymentVoucherDetailsDbAmount: k.debit,
          paymentVoucherDetailsDbFcAmount: k.debit,
          paymentVoucherDetailsCrAmount: k.credit,
          paymentVoucherDetailsCrFcAmount: k.credit,
          paymentVoucherDetailsJobId:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  ?.value
              : -1,
          paymentVoucherDetailsDepartmentId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName?.trim() ===
                    k.costcenter?.trim()
                )?.costCenterMasterCostCenterId
              : null,

          // paymentVoucherDetailsDepartmentId: 0,
          paymentVoucherDetailsNarration: k.narration,
          paymentVoucherDetailsFsno: this.fsno,
          paymentVoucherDetailsLocationId: this.locId,
          paymentVocherDetailsDelStatus: false,
        };
      });

    paymtVoucher.paymentVoucherDetails
      ?.filter((x) => x.paymentVocherDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.paymentVoucherDetailsAcNo,
          accountsTransactionsTransDate: this.f.paymentVoucherDate.value,
          accountsTransactionsParticulars:
            element.paymentVoucherDetailsNarration,
          accountsTransactionsDebit: element.paymentVoucherDetailsDbAmount,
          accountsTransactionsFcDebit: element.paymentVoucherDetailsDbAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo: element.paymentVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.paymentVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountsTransactionsFcRate: 1,
          accountsTransactionsCompanyId: 1,
          accountsTransactionsCurrencyId: this.f.paymentVoucherCurrencyId.value,
          accountsTransactionsFcAllocBalance: Number(
            this.f.paymentVoucherDbAmount.value
          ),
          accountsTransactionsAllocBalance: this.f.paymentVoucherDbAmount.value,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.paymentVoucherDetailsJobId,
          accountsTransactionsCostCenterId:
            element.paymentVoucherDetailsDepartmentId,
        };
        paymtVoucher.accountsTransactions.push(debitData);
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.paymentVoucherCrAcNo.value,
          accountsTransactionsTransDate: this.f.paymentVoucherDate.value,
          accountsTransactionsParticulars: this.f.paymentVoucherNarration.value,
          accountsTransactionsCredit: this.f.paymentVoucherDbAmount.value,
          accountsTransactionsFcCredit: this.f.paymentVoucherDbAmount.value,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo,
          accountsTransactionsDescription: this.f.paymentVoucherNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountsTransactionsFcRate: 1,
          accountsTransactionsCompanyId: 1,
          accountsTransactionsCurrencyId: this.f.paymentVoucherCurrencyId.value,
          accountsTransactionsFcAllocBalance: Number(
            this.f.paymentVoucherDbAmount.value
          ),
          accountsTransactionsAllocBalance: this.f.paymentVoucherDbAmount.value,
          accountstransactionsDelStatus: false,

          accountsTransactionsJobNo: this.contraSettings
            ? element.paymentVoucherDetailsJobId
            : -1,
          accountsTransactionsCostCenterId:
            element.paymentVoucherDetailsDepartmentId,
        };
        paymtVoucher.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(paymtVoucher);
    } else {
      paymtVoucher.accountsTransactions
        ?.filter((x) => x.accountsTransactionsDebit > 0)
        .forEach((element, index, arry) => {
          const acctTransEntry: AccountsTransactions =
            this.savedPaymentVoucher.accountsTransactions
              ?.filter((x) => x.accountsTransactionsDebit > 0)
              ?.find(
                (kl) =>
                  kl.accountsTransactionsVoucherNo ===
                    arry[index].accountsTransactionsVoucherNo &&
                  kl.accountsTransactionsAccNo ===
                    arry[index].accountsTransactionsAccNo
              );
          if (acctTransEntry) {
            arry[index].accountsTransactionsTransSno =
              acctTransEntry.accountsTransactionsTransSno;
            arry[index].accountsTransactionsStatus =
              acctTransEntry.accountsTransactionsStatus;
            arry[index].accountsTransactionsVoucherType =
              acctTransEntry.accountsTransactionsVoucherType;
          }
        });

      paymtVoucher.accountsTransactions
        ?.filter((x) => x.accountsTransactionsCredit > 0)
        .forEach((element, index, arry) => {
          const acctTransEntry: AccountsTransactions =
            this.savedPaymentVoucher.accountsTransactions
              ?.filter((x) => x.accountsTransactionsCredit > 0)
              ?.find(
                (kl) =>
                  kl.accountsTransactionsVoucherNo ===
                    arry[index].accountsTransactionsVoucherNo &&
                  kl.accountsTransactionsAccNo ===
                    arry[index].accountsTransactionsAccNo
              );
          if (acctTransEntry) {
            arry[index].accountsTransactionsTransSno =
              acctTransEntry.accountsTransactionsTransSno;
            arry[index].accountsTransactionsStatus =
              acctTransEntry.accountsTransactionsStatus;
            arry[index].accountsTransactionsVoucherType =
              acctTransEntry.accountsTransactionsVoucherType;
          }
        });

      this.updateVoucher(paymtVoucher);
    }
  }

  saveVoucher(paymtVoucher: PaymentVoucher) {
    if (this.paymentVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountapi.InsertPaymentVoucher(paymtVoucher).subscribe(
            (data: any) => {
              if (data.valid) {
                this.savedPaymentVoucher = data.result;
                this.updateFormGrid(data.result);
                this.userTrackingLog('Insert');
                this.btnFlag = {
                  new: true,
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  print: true,
                  printPreview: true,
                };
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('Alert'),
                  detail: this.translate.instant(data.message),
                });
              } else {
                const errorMsg =
                  data.errorMessage ||
                  data.message ||
                  data.exception ||
                  'An error occurred';
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('Alert'),
                  detail: errorMsg,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('Alert'),
                detail: this.translate.instant('Payment Voucher Save Failed'),
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('Alert'),
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.paymentVoucherFormGroup.markAllAsTouched();
      this.paymentVoucherFormGroup.markAsDirty();
    }
  }

  updateVoucher(paymtVoucher: PaymentVoucher) {
    if (this.paymentVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to update existing voucher?'
        ),
        accept: () => {
          this.accountapi.UpdatePaymentVoucher(paymtVoucher).subscribe(
            (data: any) => {
              if (data.valid) {
                this.btnFlag = {
                  new: true,
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  print: true,
                  printPreview: true,
                };
                this.updateFormGrid(data.result);
                this.userTrackingLog('Update');
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: this.translate.instant(
                    'Payment Voucher Updated Succesfully'
                  ),
                });
              } else {
                const errorMsg =
                  data.errorMessage ||
                  data.message ||
                  data.exception ||
                  'An error occurred';
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('Alert'),
                  detail: errorMsg,
                });
              }
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Payment Voucher Update Failed'),
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
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.paymentVoucherFormGroup.markAllAsTouched();
      this.paymentVoucherFormGroup.markAsDirty();
    }
  }

  getAllPaymentVouchrs() {
    this.accountapi.GetPaymentVouchers().subscribe((data) => {
      this.paymentVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j?.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.itemList = [];
    this.paymentVoucherFormGroup.reset();
    this.paymentVoucherFormGroup.enable();
    this.paymentvoucherentry.data = [];

    this.paymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.paymentvoucherentry);
    this.accountTransactionList = [];
    this.paymentVoucherFormGroup.get('paymentVoucherSno').setValue(0);
    this.paymentVoucherFormGroup.get('paymentVoucherCurrencyId').setValue(-1);
    this.paymentVoucherFormGroup.get('paymentVoucherDate').setValue(new Date());
    this.GetDefaultSettings();
    this.callDropdowns();
    this.btnFlag = {
      new: true,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
      printPreview: false,
    };
    this.search = null;
    this.index = 0;
    this.f.paymentVoucherVoucherNo.clearValidators();
    this.paymentVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllPaymentVouchrs();
    this.displayMaximizable = true;
  }

  GetDefaultSettings() {
    this.utilityService.GetProgramSettingsDropdown().subscribe((m: any) => {
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
          this.f.paymentVoucherCurrencyId.setValue(Number(this.DefCurrency));
        }
      }
      this.getACValue();
    });
  }
  getACValue() {
    this.utilityService
      .GetAllAccountsbyKey('CASH_AC_NO')
      .subscribe((res: any) => {
        const value = res.result[0].accountSettingsAccountTextValue.split('::');

        this.defaultMasterAccount = value[1]?.trim();
        this.f.paymentVoucherCrAcNo.setValue(this.defaultMasterAccount);
      });
  }

  updateFormGrid(pymt: PaymentVoucher) {
    this.search = null;
    this.paymentVoucherFormGroup.patchValue({
      paymentVoucherSno: pymt.paymentVoucherSno,
      paymentVoucherVoucherNo: pymt.paymentVoucherVoucherNo,
      paymentVoucherDate: new Date(pymt.paymentVoucherDate),
      paymentVoucherVoucherRef: pymt.paymentVoucherVoucherRef,
      paymentVoucherCrAcNo: pymt.paymentVoucherCrAcNo,
      paymentVoucherCrAmount: pymt.paymentVoucherDbAmount,
      paymentVoucherCrAmt: pymt.paymentVoucherCrAmount,
      paymentVoucherDbAmount: pymt.paymentVoucherDbAmount,
      paymentVoucherNarration: pymt.paymentVoucherNarration,
      paymentVoucherCurrencyId: pymt.paymentVoucherCurrencyId,
    });
    this.sum = pymt.accountsTransactions
      .map((k) => k.accountsTransactionsDebit)
      .reduce((num, curr) => num + curr, 0)
      .toFixed(2);
    const toWords = new ToWords();
    this.sumwordsnew = toWords.convert(this.sum, { currency: true });
    this.accountTransactionList = pymt.accountsTransactions;

    const gridData: GridData[] = pymt.paymentVoucherDetails.map((k) => {
      const accountId: string =
        k.paymentVoucherDetailsAcNo != null
          ? this.accountArray?.find((l) =>
              l.maAccNo.match(k.paymentVoucherDetailsAcNo)
            )?.maAccName
          : null;

      const jobId: string =
        k.paymentVoucherDetailsJobId != null
          ? this.jobList?.find((l) => l.value == k.paymentVoucherDetailsJobId)
              ?.label
          : null;

      const costcenterId: string =
        k.paymentVoucherDetailsDepartmentId != null
          ? this.costcenterList?.find(
              (l) => l.value == k.paymentVoucherDetailsDepartmentId
            ).label
          : null;
      return {
        account: accountId,
        debit: k.paymentVoucherDetailsDbAmount,
        credit: k.paymentVoucherDetailsCrAmount,
        jobname: jobId,
        costcenter: costcenterId,
        narration: k.paymentVoucherDetailsNarration,
        id: k.paymentVoucherDetailsId,
      };
    });
    this.paymentvoucherentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.paymentvoucherentry.readOnly = true;
    this.paymentVoucherFormGroup.disable();
    this.f.paymentVoucherVoucherNo.clearValidators();
    this.paymentVoucherFormGroup.updateValueAndValidity();
  }

  displayPrint() {
    this.displayPrintPreview = true;
    // this.getAllStationMaster();
  }

  showPrint() {
    this.rptFilter = {
      ReportName: 'PaymentVoucher',
      SelectionFormula:
        // '{SalesVoucher.SalesVoucherNo} = "' +
        // this.paymentVoucherFormGroup.getRawValue().paymentVoucherVoucherNo +
        // '"'
        '',
      Parameters: [
        // { Key: 'Head1', Value: 'Head1' },
        // { Key: 'Address', Value: 'Address' },
        // { Key: 'Tele', Value: 'Tele' },
        // { Key: 'InvDes', Value: 'InvDes' },
        // { Key: 'fax', Value: 'fax' },
        // { Key: 'Email', Value: 'Email@exmaple.com' },
      ],
      Queries: [
        `select * from vw_paymentvoucher where Payment_Voucher_Sno =${
          this.paymentVoucherFormGroup.getRawValue().paymentVoucherSno
        }`,
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

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getEmptyRowCount(length): number {
    const DetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - DetailsLength);
    } else {
      return;
    }
  }

  userTrackingLog(type) {
    let req = {
      page: 'Payment Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.paymentVoucherFormGroup.get('paymentVoucherVoucherNo').value,
      vpType: 'Payment Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 2) {
      if (this.savedPaymentVoucher?.paymentVoucherVoucherNo) {
        this.CurrentselectedAccount = {
          // ...this.savedPaymentVoucher.paymentVoucherDetails[0],
          ...this.savedPaymentVoucher.accountsTransactions[1],
          vType: 'PAYMENT',
          refNO:
            this.savedPaymentVoucher.paymentVoucherDetails[0]
              .paymentVoucherDetailsVoucherNo,
          accNO:
            this.savedPaymentVoucher.paymentVoucherDetails[0]
              .paymentVoucherDetailsAcNo,
        };
      }
    }
  }

  GetSavedPaymentDetails(id: string) {
    this.index = 0;

    this.accountapi.GetSavedPaymentDetails(id).subscribe(
      (data) => {
        if (data !== null) {
          this.btnFlag = {
            new: true,
            edit: true,
            cancel: true,
            save: false,
            update: false,
            delete: true,
            print: true,
            printPreview: true,
          };
          this.accountTransactionList = data.result.accountsTransactions;
          this.updateFormGrid(data.result);
          // this.CurrentselectedAccount = [data.result.paymentVoucherDetails[0], data.result.accountsTransactions];
          this.savedPaymentVoucher = data.result;
          this.paymentVoucherFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Payment voucher not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
        this.paymentVoucherFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.translate.instant('Do you want to delete voucher?'),
      accept: () => {
        this.accountapi
          .DeletePaymentVoucher(this.savedPaymentVoucher)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: this.translate.instant(
                  'Payment Voucher Deleted Succesfully'
                ),
              });
              this.new();
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: this.translate.instant('Failed'),
              });
            }
          );
      },
    });
  }

  cancel() {
    this.new();
  }

  edit() {
    //  this.hotRegisterer.getInstance(this.hotid).updateSettings({ readOnly: false });
    this.btnFlag = {
      new: false,
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      print: true,
      printPreview: false,
    };

    this.paymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.paymentvoucherentry);
    this.f.paymentVoucherVoucherNo.clearValidators();
    this.paymentVoucherFormGroup.enable();
    this.paymentVoucherFormGroup.controls.paymentVoucherVoucherNo.disable();

    this.paymentVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.paymentvoucherentry.data.length > 0) {
      // this.paymentvoucherentry.data.forEach((value: GridData, index, arry) => {
      //console.log(Object.values(this.paymentvoucherentry.data));
      return Object.values(this.paymentvoucherentry.data).some(
        (k: GridData) => k.account != null && k.debit != null
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
    if (this.clickedRowColumn.column == 0) {
      if (this.itemList.includes(evt.accountId)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Duplicate Entry',
          detail: `${evt.account} is already exists in this table`,
        });
        return;
      }
      this.itemList[this.clickedRowColumn.row] = evt.accountId;
    }
    const hot = this.hotRegisterer.getInstance(this.hotid);

    if (this.activeRow.column !== 1) {
      hot.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    }
    hot.selectCell(this.activeRow.row, 1);

    let u = {
      paymentVoucherDetailsAcNo: evt.accountId,
    };
    // this.CurrentselectedAccount = u;
    this.showAccountLookUp = false;
  }

  exit(evt) {
    this.showAccountLookUp = false;
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
    this.showAccountLookUp = false;
    this.formControlLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.accountId);
    this.elementReference.nativeElement.value = evt.account;
    this.formControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showAccountLookUp = false;
    this.formControlLookUp = false;
  }

  filter() {
    let filteredArray = this.filterArray;
    if (this.PaymentVoucherFilterForm.value.paymentVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentVoucherVoucherNo ===
          this.PaymentVoucherFilterForm.value.paymentVoucherNo.toUpperCase()
      );
    }

    if (
      this.PaymentVoucherFilterForm.value.paymentVoucherAcNo != null &&
      this.PaymentVoucherFilterForm.value.paymentVoucherAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.paymentVoucherCrAcNo ===
          this.PaymentVoucherFilterForm.value.paymentVoucherAcNo
      );
    }

    if (this.PaymentVoucherFilterForm.value.isDate) {
      const fromDateStr = this.PaymentVoucherFilterForm.value.fromDate;
      const toDateStr = this.PaymentVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.paymentVoucherDate);

        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        return (
          (voucherDate.getTime() >= fromDate.getTime() &&
            voucherDate.getTime() <= toDate.getTime()) ||
          voucherDate.getTime() === fromDate.getTime()
        );
      });

      // filteredArray = filteredArray?.filter((res) => {
      //   const voucherDate = new Date(res.paymentVoucherDate);
      //   voucherDate.setHours(0, 0, 0, 0);
      //   fromDate.setHours(0, 0, 0, 0);
      //   toDate.setHours(0, 0, 0, 0);
      //   return voucherDate >= fromDate && voucherDate <= toDate;
      // });

      this.paymentVoucherarry = filteredArray;
    }
    this.paymentVoucherarry = filteredArray;
  }

  ClearFilter() {
    this.PaymentVoucherFilterForm.reset();
    this.paymentVoucherarry = this.filterArray;
    this.PaymentVoucherFilterForm.get('fromDate').setValue(new Date());
    this.PaymentVoucherFilterForm.get('toDate').setValue(new Date());
  }

  updateTableConfiguration() {
    const hiddenColumns = [2, 6];

    if (this.hideJobDetail) {
      hiddenColumns.push(3);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(4);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }
}
export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
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
  account?: string;
  debit?: number;
  credit?: number;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  id?: number;
}

interface ButtonFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  print?: boolean;
  printPreview?: boolean;
}
export const paymentVoucherColumnList = (
  component: PaymentvoucherComponent
) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
    source: component.acctArry,
  },
  {
    data: 'debit',
    type: 'numeric',
    label: 'Debit',
    toolTip: 'Debit',
    readOnly: false,
    width: 80,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit',
    readOnly: false,
    width: 80,
  },
  {
    data: 'jobname',
    type: 'autocomplete',
    label: 'Job Name',
    toolTip: 'Job Name',
    source: component.jobArry,
  },
  {
    data: 'costcenter',
    type: 'autocomplete',
    label: 'Cost Center',
    toolTip: 'Cost Center',
    source: component.costcenterArry,
    width: 80,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    toolTip: 'Narration',
    readOnly: false,
  },
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Id',
    width: 50,
  },
];
