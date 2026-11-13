import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MenuItem } from 'primeng/api/menuitem';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { BankPaymentVoucher } from 'src/app/routes/domain/Accounts/BankPaymentVoucher';
import { BankPaymentVoucherDetails } from 'src/app/routes/domain/Accounts/BankPaymentVoucherDetails';
import { ChartofAccounts } from 'src/app/routes/domain';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { AccountsTransactions } from 'src/app/routes/domain/Accounts/AccountsTransactions';
import { HotTableRegisterer } from '@handsontable/angular';
import { LoginService } from 'src/app/routes/service/login.service';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ToWords } from 'to-words';
import { TranslateService } from '@ngx-translate/core';
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';

@Component({
  selector: 'app-bankpaymentvoucher',
  templateUrl: './bankpaymentvoucher.component.html',
  styleUrls: ['./bankpaymentvoucher.component.scss'],
})
export class BankPaymentvoucherComponent implements OnInit, AfterViewInit {
  bankpaymentVoucherFilterForm: FormGroup;
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  CurrentselectedAccount: any;
  confirmDropDatabaseDialogVisible = false;
  title: string;
  search: string;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  lookupGridColumns = [];
  dataList: Array<any> = [];
  showAccountLookUp: boolean = false;
  formControlLookUp: boolean = false;
  activeRow: { row: number; column: number };
  selectItem: any;
  control: AbstractControl;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string = '01001002';
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  date = new Date();
  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];
  receivedAllocationData: any[] = [];
  accountTransactionList: AccountsTransactions[] = [];
  bankPaymentVoucherarry: BankPaymentVoucher[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedBankPaymentVoucher: BankPaymentVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'bankPaymtVouchrEntry';
  displayPrintPreview: boolean = false;
  debitword: any = '';
  vNo: string = '';
  ScreenId: number;
  callDDLs: boolean = false;
  Permission: any;
  filterArray: any;
  cols;
  user: any;
  JOBCOST: boolean = true;
  pdfSource: string;
  getbankMasterAccount: any;
  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];
  contraSettings: boolean = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private loginser: LoginService,
    private masterapi: MasterApiService,
    private accountapi: AccountApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private permission: PermissionsService,
    private crystalReportService: CrystalReportService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  bankPaymentvoucherentry: Handsontable.GridSettings;
  bankPaymentVoucherFormGroup: FormGroup;
  // accountTransactionDataset = [];
  ngAfterViewInit() {}
  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
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
      }
    });

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedBankPaymentDetails(this.vNo);
    }

    this.initializeControls();
    this.bankPaymentVoucherFormGroup = this.fb.group({
      bankPaymentVoucherVoucherNo: [{ value: null, disabled: true }],
      bankPaymentVoucherVDt: [null],
      bankPaymentVoucherRefNo: [''],
      bankPaymentVoucherCrAcNo: [-1, [DropDownValidator]],
      bankPaymentVoucherCrAmount: [null],
      bankPaymentVoucherDrAmount: 0,
      bankPaymentVoucherNarration: [''],
      bankPaymentVoucherCurrencyId: [-1],
      bankPaymentVoucherSno: [0],
    });
    this.bankPaymentVoucherFormGroup.disable();
    this.bankpaymentVoucherFilterForm = this.fb.group({
      bankPaymentVoucherAcNo: [null],
      isDate: [],
      bankPaymentVoucherNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    var user = this.loginser.GetCredentialData();
    this.usrid = user?.userId;
    this.fsno = user?.financialPeriodsFsno;
    this.locId = user?.locId;

    this.cols = [
      { field: 'bankPaymentVoucherVoucherNo', header: 'Voucher No' },
      { field: 'bankPaymentVoucherVDt', header: 'Date' },
      { field: 'bankPaymentVoucherCrAcNo', header: 'Account' },
      { field: 'bankPaymentVoucherCurrencyId', header: 'Currency' },
      { field: 'bankPaymentVoucherDrAmount', header: 'Vchr.Debit' },
      { field: 'paymentVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'bankPaymentVoucherNarration', header: 'Particulars' },
      { field: 'bankPaymentVoucherDrAmount', header: 'Dtls.Debit' },
      { field: 'bankPaymentVoucherCrAmount', header: 'Dtls.Credit' },

      { field: 'action', header: '' },
    ];
    this.getbankACValue();
    this.bykeys();
  }

  get f() {
    return this.bankPaymentVoucherFormGroup.controls;
  }
  getbankACValue() {
    this.masterapi.GetAllAccountsbyKey('BANK_MASTER_AC_NO').subscribe((res) => {
      const value = res.result[0].accountSettingsAccountTextValue.split('::');

      this.getbankMasterAccount = value[1]?.trim();
    });
  }

  getACValue() {
    this.masterapi.GetAllAccountsbyKey('BANK_AC_NO').subscribe((res) => {
      const value = res.result[0].accountSettingsAccountTextValue.split('::');

      this.f.bankPaymentVoucherCrAcNo.setValue(value[1]?.trim());
    });
  }

  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
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

  initializeControls() {
    let cols = bankPVoucherColumnList(this);

    let hiddenColumn = [4, 5];

    this.bankPaymentvoucherentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );
    this.bankPaymentvoucherentry.afterSelection = (
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

      if (column === 0 && this.bankPaymentvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 4 &&
        this.bankPaymentvoucherentry.readOnly === false
      ) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 5 &&
        this.bankPaymentvoucherentry.readOnly === false
      ) {
        this.lookupGridColumns = ['Cost Center', 'Cost Center ID'];
        this.dataList = this.costSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
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

    this.bankPaymentvoucherentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      // setting if prevent scrolling after selection
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.bankPaymentvoucherentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.bankPaymentvoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };

    this.bankPaymentvoucherentry.afterValidate = (
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

  receiveData(data: any) {
    this.receivedAllocationData = [];
    data.forEach((e) => {
      if (e.IsSelected === true) {
        this.receivedAllocationData.push(e);
      }
    });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  ColumnSum() {
    if (this.bankPaymentvoucherentry.data.length > 0) {
      var value = 0;
      this.bankPaymentvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.debit) {
          value += elemt.debit;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.bankPaymentVoucherFormGroup.controls.bankPaymentVoucherDrAmount.setValue(
        value
      );
    }
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }

  LoadCurruncyDDL() {
    this.utilityService.LoadDropdowCurrencyMaster().subscribe((m: any) => {
      this.currencyList = m.resultSet.currencyMasters?.map((kl) => ({
        label: kl.currencyMasterCurrencyName,
        value: kl.currencyMasterCurrencyId,
        value1: kl.currencyMasterCurrencyRate,
      }));
      this.currencyList.unshift({ label: '--Select--', value: -1 });
    });
  }

  LoadJobDDL() {
    this.utilityService.LoadDropdowjobMasters().subscribe((m: any) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
    });
  }

  LoadCostCenterDDL() {
    this.utilityService.LoadDropdowncostcenterMasters().subscribe((m: any) => {
      this.costcenterArray = m.resultSet.costcenterMasters;
      this.costcenterList = m.resultSet.costcenterMasters?.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
    });
  }

  LoadChartOfAccountDDL() {
    this.utilityService.LoadDropdowchartofAccounts().subscribe((m: any) => {
      this.accountArray = m.resultSet.masterAccountsTables;
      this.accountList = m.resultSet.masterAccountsTables?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
      const acc = m.resultSet.masterAccountsTables?.filter(
        (item) => item.maRelativeNo === this.getbankMasterAccount
      );

      this.accountArraydropdown = acc;
      this.accountListdropdown = acc?.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountListdropdown.unshift({ label: '--Select--', value: -1 });
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Bank Payment Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.bankPaymentVoucherFormGroup.get('bankPaymentVoucherVoucherNo')
        .value,
      vpType: 'Bank Payment Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 10) {
      return Math.max(0, 10 - salesVoucherDetailsLength);
    } else {
      return;
    }
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
    return this.costcenterArray.map((kl) => ({
      account: kl.costCenterMasterCostCenterName,
      accountId: kl.costCenterMasterCostCenterId,
    }));
  }

  saveBankPaymentVoucher() {
    const savedData: any = this.bankPaymentvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const bankPaymentVoucher: BankPaymentVoucher = this
      .bankPaymentVoucherFormGroup.value as BankPaymentVoucher;
    bankPaymentVoucher.bankPaymentVoucherVoucherNo =
      this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherVoucherNo;
    bankPaymentVoucher.bankPaymentVoucherSno =
      this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherSno;
    bankPaymentVoucher.bankPaymentVoucherCrAmount = 0;
    bankPaymentVoucher.bankPaymentVoucherFrCrAmount = 0;
    bankPaymentVoucher.bankPaymentVoucherFsno = this.fsno;
    bankPaymentVoucher.bankPaymentVoucherUserId = this.usrid;
    bankPaymentVoucher.bankPaymentVoucherLocationId = this.locId;
    bankPaymentVoucher.bankPaymentVoucherAllocId = 0;
    bankPaymentVoucher.accountsTransactions = [];
    bankPaymentVoucher.AllocationDetails = this.receivedAllocationData;
    bankPaymentVoucher.bankPaymentVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.debit != null)
      .map((k: GridData) => {
        return {
          bankPaymentVoucherSno:
            this.bankPaymentVoucherFormGroup.getRawValue()
              .bankPaymentVoucherSno,
          bankPaymentVoucherDetailsId: k.id != null ? k.id : 0,
          bankPaymentVoucherDetailsVoucherNo:
            this.bankPaymentVoucherFormGroup.getRawValue()
              .bankPaymentVoucherVoucherNo,
          bankPaymentVoucherDetailsSno: 0,
          bankPaymentVoucherDetailsAcNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          bankPaymentVoucherDetailsDrAmount: k.debit,
          bankPaymentVoucherDetailsDrFcAmount: k.debit,
          bankPaymentVoucherDetailsCrAmount: 0,
          bankPaymentVoucherDetailsCrFcAmount: 0,
          bankPaymentVoucherDetailsJobNo:
            k.jobname != null && k.jobname !== '' && this.contraSettings
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  .value
              : -1,
          bankPaymentVoucherDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName?.trim() ===
                    k.costcenter?.trim()
                ).costCenterMasterCostCenterId
              : null,

          // bankPaymentVoucherDetailsCostCenterId: 0,
          bankPaymentVoucherDetailsNarration: k.narration,
          bankPaymentVoucherDetailsFsno: this.fsno,
          bankPaymentVoucherDetailsChequeDate: k.chequedate
            ? new Date(
                k.chequedate.split('/').reverse().join('-')
              ).toISOString()
            : null,
          bankPaymentVoucherDetailsChequeNo: Number(k.chequeno),
          bankPaymentVoucherDetailsDelStatus: false,
          bankPaymentVoucherDetailsPdc: k.pdc,
        };
      });

    bankPaymentVoucher.bankPaymentVoucherDetails
      ?.filter((x) => x.bankPaymentVoucherDetailsDelStatus === false)
      .forEach((element) => {
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: element.bankPaymentVoucherDetailsAcNo,
          accountsTransactionsTransDate: this.f.bankPaymentVoucherVDt.value,
          accountsTransactionsParticulars:
            element.bankPaymentVoucherDetailsNarration,
          accountsTransactionsDebit: element.bankPaymentVoucherDetailsDrAmount,
          accountsTransactionsFcDebit:
            element.bankPaymentVoucherDetailsDrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            element.bankPaymentVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.bankPaymentVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.bankPaymentVoucherDetailsJobNo,
          accountsTransactionsCostCenterId:
            element.bankPaymentVoucherDetailsCostCenterId,
        };
        bankPaymentVoucher.accountsTransactions.push(debitData);
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.bankPaymentVoucherCrAcNo.value,
          accountsTransactionsTransDate: this.f.bankPaymentVoucherVDt.value,
          accountsTransactionsParticulars:
            this.f.bankPaymentVoucherNarration.value,
          accountsTransactionsCredit: this.f.bankPaymentVoucherDrAmount.value,
          accountsTransactionsFcCredit: this.f.bankPaymentVoucherDrAmount.value,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.bankPaymentVoucherFormGroup.getRawValue()
              .bankPaymentVoucherVoucherNo,
          accountsTransactionsDescription:
            this.f.bankPaymentVoucherNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,

          accountsTransactionsJobNo: element.bankPaymentVoucherDetailsJobNo,
          accountsTransactionsCostCenterId:
            element.bankPaymentVoucherDetailsCostCenterId,
        };
        bankPaymentVoucher.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(bankPaymentVoucher);
    } else {
      bankPaymentVoucher.accountsTransactions
        ?.filter((x) => x.accountsTransactionsDebit > 0)
        .forEach((element, index, arry) => {
          const acctTransEntry: AccountsTransactions =
            this.savedBankPaymentVoucher.accountsTransactions
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

      bankPaymentVoucher.accountsTransactions
        ?.filter((x) => x.accountsTransactionsCredit > 0)
        .forEach((element, index, arry) => {
          const acctTransEntry: AccountsTransactions =
            this.savedBankPaymentVoucher.accountsTransactions
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

      this.updateVoucher(bankPaymentVoucher);
    }
  }

  saveVoucher(bankPaymentVoucher: BankPaymentVoucher) {
    this.bankPaymentVoucherFormGroup.markAllAsTouched();
    if (this.bankPaymentVoucherFormGroup.invalid) return;
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to save voucher?',
      accept: () => {
        this.accountapi.InsertBankPaymentVoucher(bankPaymentVoucher).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.savedBankPaymentVoucher = data.result;
            this.updateFormGrid(data.result);
            this.userTrackingLog('Insert');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Saved Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Save Failed',
            });
          }
        );
      },
    });
  }

  updateVoucher(bankPaymentVoucher: BankPaymentVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.accountapi.UpdateBankPaymentVoucher(bankPaymentVoucher).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.updateFormGrid(data.result);
            this.userTrackingLog('Update');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Updated Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Bank Payment Voucher Update Failed',
            });
          }
        );
      },
    });
  }
  // getAllAccountTransaction() {
  //   this.accountapi.GetAllAcountTransactions().subscribe((data) => {
  //     this.accountTransactionList = data.result;
  //   });
  // }

  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllBankPaymentVouchrs() {
    this.accountapi.GetBankPaymentVouchers().subscribe((data) => {
      this.bankPaymentVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }

  new() {
    this.callDropdowns();
    this.bankPaymentVoucherFormGroup.reset();
    this.bankPaymentVoucherFormGroup.enable();
    this.bankPaymentvoucherentry.data = [];
    this.bankPaymentvoucherentry.readOnly = false;
    //this.bankPaymentvoucherentry.hiddenColumns['columns'].push(4);
    this.bankPaymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.bankPaymentvoucherentry);
    this.accountTransactionList = [];
    this.bankPaymentVoucherFormGroup.updateValueAndValidity();

    this.bankPaymentVoucherFormGroup
      .get('bankPaymentVoucherCrAcNo')
      .setValue(-1);
    this.bankPaymentVoucherFormGroup.get('bankPaymentVoucherSno').setValue(0);
    this.bankPaymentVoucherFormGroup
      .get('bankPaymentVoucherVDt')
      .setValue(new Date());
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.GetDefaultSettings();
    this.updateTableConfiguration();
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
          this.f.bankPaymentVoucherCurrencyId.setValue(
            Number(this.DefCurrency)
          );
        }
      }

      this.getACValue();
    });
  }
  updateTableConfiguration() {
    const hiddenColumns = [];
    if (this.hideJobDetail) {
      hiddenColumns.push(4);
    }
    if (this.hideCostCenterDetail) {
      hiddenColumns.push(5);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllBankPaymentVouchrs();
    this.displayMaximizable = true;
  }
  rptFilter: ReportFilterModel;

  getReport() {
    this.rptFilter = {
      ReportName: 'BankPaymentVoucher',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from vw_bankpaymentvoucher where Bank_Payment_Voucher_SNo =${
          this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherSno
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

  updateFormGrid(pymt: BankPaymentVoucher) {
    this.bankPaymentVoucherFormGroup.patchValue({
      bankPaymentVoucherVoucherNo: pymt.bankPaymentVoucherVoucherNo,
      bankPaymentVoucherVDt: new Date(pymt.bankPaymentVoucherVDt),
      bankPaymentVoucherRefNo: pymt.bankPaymentVoucherRefNo,
      bankPaymentVoucherCrAcNo: pymt.bankPaymentVoucherCrAcNo,
      bankPaymentVoucherCrAmount: pymt.bankPaymentVoucherDrAmount,
      bankPaymentVoucherDrAmount: pymt.bankPaymentVoucherDrAmount,
      bankPaymentVoucherNarration: pymt.bankPaymentVoucherNarration,
      bankPaymentVoucherCurrencyId: pymt.bankPaymentVoucherCurrencyId,
      bankPaymentVoucherSno: pymt.bankPaymentVoucherSno,
    });
    const toWords = new ToWords();
    this.debitword = this.convertNumberToWordsWithDecimal(
      pymt.bankPaymentVoucherDrAmount
    );
    this.accountTransactionList = pymt.accountsTransactions;
    const gridData: GridData[] = pymt.bankPaymentVoucherDetails.map((k) => {
      const accountId: string =
        k.bankPaymentVoucherDetailsAcNo != null
          ? this.accountArray?.find((l) =>
              l.maAccNo.match(k.bankPaymentVoucherDetailsAcNo)
            )?.maAccName
          : null;

      const jobId: string =
        k.bankPaymentVoucherDetailsJobNo != null
          ? this.jobList?.find(
              (l) => l.value == k.bankPaymentVoucherDetailsJobNo
            )?.label
          : null;

      const CostCentid: string =
        k.bankPaymentVoucherDetailsCostCenterId != null
          ? this.costcenterList?.find(
              (l) => l.value == k.bankPaymentVoucherDetailsCostCenterId
            )?.label
          : null;

      return {
        account: accountId,
        debit: k.bankPaymentVoucherDetailsDrAmount,
        chequeno: k.bankPaymentVoucherDetailsChequeNo,
        chequedate: k.bankPaymentVoucherDetailsChequeDate,
        jobname: jobId,
        costcenter: CostCentid,
        narration: k.bankPaymentVoucherDetailsNarration,
        pdc: k.bankPaymentVoucherDetailsPdc,
        id: k.bankPaymentVoucherDetailsId,
      };
    });
    this.bankPaymentvoucherentry.data = gridData;
    this.bankPaymentvoucherentry.readOnly = true;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.bankPaymentVoucherFormGroup.disable();
    this.f.bankPaymentVoucherVoucherNo.clearAsyncValidators();
    this.bankPaymentVoucherFormGroup.updateValueAndValidity();
  }

  convertNumberToWordsWithDecimal(number: number): string {
    const toWords = new ToWords();

    const [integerPart, decimalPart] = number.toFixed(2).split('.');

    const integerWords = toWords.convert(parseInt(integerPart, 10));
    const decimalWords = toWords.convert(parseInt(decimalPart || '0', 10));

    let result = `${integerWords} `;

    if (decimalWords !== 'zero') {
      result += ` point ${decimalWords} `;
    }

    return result;
  }

  handleChange(e) {
    this.index = e.index;
    if (this.index == 2) {
      if (this.savedBankPaymentVoucher?.bankPaymentVoucherVoucherNo) {
        this.CurrentselectedAccount = {
          // ...this.savedReceiptVoucher.receiptVoucherDetails[0],
          ...this.savedBankPaymentVoucher.accountsTransactions[1],
          vType: 'BANK PAYMENT',
          refNO:
            this.savedBankPaymentVoucher.bankPaymentVoucherDetails[0]
              .bankPaymentVoucherDetailsVoucherNo,
          accNO:
            this.savedBankPaymentVoucher.bankPaymentVoucherDetails[0]
              .bankPaymentVoucherDetailsAcNo,
        };
      }
    }
  }

  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadCurruncyDDL();
    this.LoadCostCenterDDL();
    this.LoadChartOfAccountDDL();
  }

  GetSavedBankPaymentDetails(id: string) {
    this.index = 0;
    this.accountapi.GetSavedBankPaymentDetails(id).subscribe(
      (data) => {
        this.btnFlag = {
          edit: true,
          cancel: true,
          save: false,
          update: true,
          delete: true,
        };
        this.accountTransactionList = data.result.accountsTransactions;

        this.updateFormGrid(data.result);
        this.savedBankPaymentVoucher = data.result;
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.accountapi
          .DeleteBankPaymentVoucher(this.savedBankPaymentVoucher)
          .subscribe(
            (data) => {
              this.userTrackingLog('Delete');
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Payment Voucher Deleted Succesfully',
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
    this.GetSavedBankPaymentDetails(
      this.bankPaymentVoucherFormGroup.getRawValue().bankPaymentVoucherVoucherNo
    );
  }

  edit() {
    this.bankPaymentvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.bankPaymentVoucherVoucherNo.clearValidators();
    this.bankPaymentVoucherFormGroup.enable();
    this.bankPaymentVoucherFormGroup.controls.bankPaymentVoucherVoucherNo.disable();
    this.bankPaymentVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.bankPaymentvoucherentry.data.length > 0) {
      return Object.values(this.bankPaymentvoucherentry.data).some(
        (k: GridData) => k.account != null && k.debit != null
      );
      // });
    }
    return false;
  }

  selectaccount(evt) {
    const hot = this.hotRegisterer.getInstance(this.hotid);

    if (this.activeRow.column !== 1) {
      hot.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    }
    hot.selectCell(this.activeRow.row, 1);

    this.showAccountLookUp = false;
  }
  public getCurrency(id): string {
    return this.currencyList?.find((k) => k.value === id)?.label;
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
    if (this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankPaymentVoucherVoucherNo ===
          this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherNo.toUpperCase()
      );
    }

    if (
      this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherAcNo != null &&
      this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankPaymentVoucherCrAcNo ===
          this.bankpaymentVoucherFilterForm.value.bankPaymentVoucherAcNo
      );
    }

    if (this.bankpaymentVoucherFilterForm.value.isDate) {
      const fromDateStr = this.bankpaymentVoucherFilterForm.value.fromDate;
      const toDateStr = this.bankpaymentVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);
      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.bankPaymentVoucherVDt);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });
    }
    this.bankPaymentVoucherarry = filteredArray;
  }
  ClearFilter() {
    this.bankpaymentVoucherFilterForm.reset();
    this.bankPaymentVoucherarry = this.filterArray;
    this.bankpaymentVoucherFilterForm.get('fromDate').setValue(new Date());
    this.bankpaymentVoucherFilterForm.get('toDate').setValue(new Date());
  }
}

interface GridData {
  account?: string;
  debit?: number;
  chequeno?: number;
  chequedate?: any;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  pdc?: boolean;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
export const bankPVoucherColumnList = (
  component: BankPaymentvoucherComponent
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
    numericFormat: {
      pattern: '0,0.00',
    },
    width: 80,
  },
  {
    data: 'chequeno',
    type: 'numeric',
    label: 'Cheque No',
    toolTip: 'Cheque No',
    readOnly: false,
    numericFormat: {
      pattern: '0,0',
    },
    width: 80,
  },
  {
    data: 'chequedate',
    type: 'date',
    label: 'Cheque Date',
    readOnly: false,
    toolTip: 'Cheque Date',
    width: 100,
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
    width: 100,
  },
  {
    data: 'narration',
    type: 'text',
    label: 'Narration',
    readOnly: false,
    toolTip: 'Narration',
    width: 150,
  },
  {
    data: 'pdc',
    type: 'checkbox',
    label: 'PDC',
    toolTip: 'Post Dated Cheque',
    width: 60,
  },
];
