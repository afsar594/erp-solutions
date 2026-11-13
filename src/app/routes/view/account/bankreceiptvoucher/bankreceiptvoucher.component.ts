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
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { BankReceiptVoucher } from 'src/app/routes/domain/Accounts/BankReceiptVoucher';
import { BankReceiptVoucherDetails } from 'src/app/routes/domain/Accounts/BankReceiptVoucherDetails';
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
import { DropDownValidator } from 'src/app/shared/validator/customvalidtor';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';

@Component({
  selector: 'app-bankreceiptvoucher',
  templateUrl: './bankreceiptvoucher.component.html',
  styleUrls: ['./bankreceiptvoucher.component.scss'],
})
export class BankReceiptvoucherComponent implements OnInit, AfterViewInit {
  elementReference: ElementRef;
  @ViewChild('acctCtrl', { static: false }) accountCtrol: ElementRef;
  @ViewChild('currCtrl', { static: false }) currencyCtrol: ElementRef;
  BankReceiptVoucherFilterForm: FormGroup;
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

  DefCurrency: string;
  DefCurCheck: string;

  DefLocation: string;
  DefLocationCheck: string;

  DefAcc: string = '01001002';
  DefAccCheck: string;

  usrid: number;
  fsno: number;
  locId: number;

  btnFlag: ButtonFlag;
  currencyList: SelectItem[];
  currArry: string[] = [];
  CurrentselectedAccount: any;

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  getbankMasterAccount: any;
  accountArraydropdown: ChartofAccounts[] = [];
  acctArrydropdown: string[] = [];
  accountListdropdown: SelectItem[];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  costcenterArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  accountTransactionList: AccountsTransactions[] = [];
  bankReceiptVoucherarry: BankReceiptVoucher[] = [];
  // savedPaymentVoucherGridData: GridData[] = [];
  savedBankReceiptVoucher: BankReceiptVoucher;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'bankRcptVouchrEntry';
  displayPrintPreview: boolean = false;
  craditword: string = '';
  date = new Date();
  receivedAllocationData: any[] = [];
  ScreenId: number;
  Permission: any;
  filterArray: any;
  callDDLs: boolean = false;
  user: any;
  JOBCOST: boolean = true;
  cols;
  pdfSource: string;
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

  bankReceiptvoucherentry: Handsontable.GridSettings;
  bankReceiptVoucherFormGroup: FormGroup;
  // accountTransactionDataset = [];
  vNo: string = '';
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

    this.cols = [
      { field: 'bankReceiptVoucherVoucherNo', header: 'Voucher No' },
      { field: 'bankReceiptVoucherVDate', header: 'Date' },
      { field: 'bankReceiptVoucherDrAcNo', header: 'Account' },
      { field: 'bankReceiptVoucherDrAmount', header: 'Vchr.Debit' },
      { field: 'bankReceiptVoucherCrAmount', header: 'Vchr.Credit' },
      { field: 'bankReceiptVoucherNarration', header: 'Particulars' },
      { field: 'bankReceiptVoucherDrAmount', header: 'Dtls.Debit' },
      { field: 'bankReceiptVoucherCrAmount', header: 'Dtls.Credit' },
      { field: 'action', header: '' },
    ];
    this.initializeControls();
    this.vNo = this.activatedroute.snapshot.queryParamMap.get('vNo');
    if (this.vNo) {
      this.GetSavedBankReceiptDetails(this.vNo);
    }

    this.bankReceiptVoucherFormGroup = this.fb.group({
      bankReceiptVoucherVoucherNo: [{ value: null, disabled: true }],
      bankReceiptVoucherVDate: [null],
      bankReceiptVoucherRefNo: [''],
      bankReceiptVoucherDrAcNo: [-1, [DropDownValidator]],
      bankReceiptVoucherCrAmount: [null],
      bankReceiptVoucherDrAmount: 0,
      bankReceiptVoucherNarration: [''],
      bankReceiptVoucherSno: [0],
    });
    this.bankReceiptVoucherFormGroup.disable();
    this.BankReceiptVoucherFilterForm = this.fb.group({
      BankReceiptVoucherAcNo: [null],
      isDate: [],
      BankReceiptVoucherNo: [null],
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
    this.bankReceiptVoucherFormGroup.disable();
    this.getbankACValue();

    this.bykeys();
  }

  get f() {
    return this.bankReceiptVoucherFormGroup.controls;
  }
  rptFilter: ReportFilterModel;
  getReport() {
    this.rptFilter = {
      ReportName: 'BankRecieptVoucher',
      SelectionFormula: '',
      Parameters: [],
      Queries: [
        `select * from VW_BankRecieptVoucher where Bank_Receipt_Voucher_SNo =${
          this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherSno
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

  initializeControls() {
    let cols = bankRVoucherColumnList(this);

    let hiddenColumn = [4, 5];

    this.bankReceiptvoucherentry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );

    this.bankReceiptvoucherentry.afterSelection = (
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

      if (column === 0 && this.bankReceiptvoucherentry.readOnly === false) {
        this.lookupGridColumns = ['Account', 'Acccount ID'];
        this.dataList = this.accountSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 4 &&
        this.bankReceiptvoucherentry.readOnly === false
      ) {
        this.lookupGridColumns = ['Job', 'Job ID'];
        this.dataList = this.jobSetLookup;

        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showAccountLookUp = true;
        this.activeRow = { row, column };
      } else if (
        column === 5 &&
        this.bankReceiptvoucherentry.readOnly === false
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

    this.bankReceiptvoucherentry.beforeChange = (
      change: Handsontable.CellChange[]
    ) => {
      this.showAccountLookUp = false;
      if (change[0][1] === 0) {
        this.showAccountLookUp = true;
        this.activeRow = { row: change[0][0], column: change[0][1] };
      }
    };

    this.bankReceiptvoucherentry.beforeChangeRender = (change, source) => {
      this.ColumnSum();
    };
    this.bankReceiptvoucherentry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };

    this.bankReceiptvoucherentry.afterValidate = (
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

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  receiveData(data: any) {
    this.receivedAllocationData = [];
    data.forEach((e) => {
      if (e.IsSelected === true) {
        this.receivedAllocationData.push(e);
      }
    });
  }
  ColumnSum() {
    if (this.bankReceiptvoucherentry.data.length > 0) {
      var value = 0;
      this.bankReceiptvoucherentry.data.forEach((elemt: any) => {
        if (elemt && elemt.credit > 0) {
          value += elemt.credit;
        }
      });
      value = parseFloat(value.toFixed(2));
      this.bankReceiptVoucherFormGroup.controls.bankReceiptVoucherCrAmount.setValue(
        value
      );
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

  saveBankReceiptVoucher() {
    this.bankReceiptVoucherFormGroup.markAllAsTouched();
    const savedData: any = this.bankReceiptvoucherentry.data?.filter((k) =>
      k.hasOwnProperty('account')
    );
    const bankReceiptVoucher: BankReceiptVoucher = this
      .bankReceiptVoucherFormGroup.value as BankReceiptVoucher;
    bankReceiptVoucher.bankReceiptVoucherVoucherNo =
      this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherVoucherNo;
    bankReceiptVoucher.bankReceiptVoucherCrAmount =
      this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherCrAmount;
    bankReceiptVoucher.bankReceiptVoucherFrCrAmount = 0;
    bankReceiptVoucher.bankReceiptVoucherFsno = this.fsno;
    bankReceiptVoucher.bankReceiptVoucherUserId = this.usrid;
    bankReceiptVoucher.bankReceiptVoucherLocationId = this.locId;
    bankReceiptVoucher.bankReceiptVoucherAllocId = 0;
    bankReceiptVoucher.accountsTransactions = [];
    bankReceiptVoucher.AllocationDetails = this.receivedAllocationData;
    // bankReceiptVoucher.bankReceiptVoucherSno = this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherSno,
    bankReceiptVoucher.bankReceiptVoucherDetails = savedData
      ?.filter((k) => k.account != null && k.credit != null)
      .map((k: GridData) => {
        return {
          bankReceiptVoucherDetailsId: k.id != null ? k.id : 0,
          bankReceiptVoucherDetailsVoucherNo:
            this.bankReceiptVoucherFormGroup.getRawValue()
              .bankReceiptVoucherVoucherNo,
          bankReceiptVoucherDetailsSno: 0,
          bankReceiptVoucherSno:
            this.bankReceiptVoucherFormGroup.getRawValue()
              .bankReceiptVoucherSno,
          bankReceiptVoucherDetailsAcNo: this.accountArray?.find(
            (x) => x.maAccName?.trim() === k.account?.trim()
          ).maAccNo,
          bankReceiptVoucherDetailsDrAmount: 0,
          bankReceiptVoucherDetailsDrFcAmount: 0,
          bankReceiptVoucherDetailsCrAmount: k.credit,
          bankReceiptVoucherDetailsCrFcAmount: k.credit,
          bankReceiptVoucherDetailsJobNo:
            k.jobname != null && k.jobname !== ''
              ? this.jobList?.find((j) => j.label?.trim() === k.jobname?.trim())
                  ?.value
              : -1,
          bankReceiptVoucherDetailsCostCenterId:
            k.costcenter != null && k.costcenter !== ''
              ? this.costcenterArray?.find(
                  (j) =>
                    j.costCenterMasterCostCenterName?.trim() ===
                    k.costcenter?.trim()
                ).costCenterMasterCostCenterId
              : null,
          // bankReceiptVoucherDetailsCostCenterId: 0,
          bankReceiptVoucherDetailsNarration: k.narration,
          bankReceiptVoucherDetailsFsno: this.fsno,
          bankReceiptVoucherDetailsChequeDate: k.chequedate
            ? new Date(
                k.chequedate.split('/').reverse().join('-')
              ).toISOString()
            : null,
          bankReceiptVoucherDetailsChequeNo: Number(k.chequeno),
          bankReceiptVoucherDetailsDelStatus: false,
          bankReceiptVoucherDetailsPdc: k.pdc,
        };
      });

    bankReceiptVoucher.bankReceiptVoucherDetails
      ?.filter((x) => x.bankReceiptVoucherDetailsDelStatus === false)
      .forEach((element) => {
        const creditData: AccountsTransactions = {
          accountsTransactionsAccNo: element.bankReceiptVoucherDetailsAcNo,
          accountsTransactionsTransDate: this.f.bankReceiptVoucherVDate.value,
          accountsTransactionsParticulars:
            element.bankReceiptVoucherDetailsNarration,
          accountsTransactionsCredit: element.bankReceiptVoucherDetailsCrAmount,
          accountsTransactionsFcCredit:
            element.bankReceiptVoucherDetailsCrAmount,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            element.bankReceiptVoucherDetailsVoucherNo,
          accountsTransactionsDescription:
            element.bankReceiptVoucherDetailsNarration,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: element.bankReceiptVoucherDetailsJobNo,
          accountsTransactionsCostCenterId:
            element.bankReceiptVoucherDetailsCostCenterId,
        };
        const debitData: AccountsTransactions = {
          accountsTransactionsAccNo: this.f.bankReceiptVoucherDrAcNo.value,
          accountsTransactionsTransDate: this.f.bankReceiptVoucherVDate.value,
          accountsTransactionsParticulars:
            this.f.bankReceiptVoucherNarration.value,
          accountsTransactionsDebit:
            this.f.bankReceiptVoucherCrAmount.value || 0,
          accountsTransactionsFcDebit:
            this.f.bankReceiptVoucherCrAmount.value || 0,
          accountsTransactionsVoucherType: null,
          accountsTransactionsTstamp: new Date(),
          accountsTransactionsVoucherNo:
            this.bankReceiptVoucherFormGroup.getRawValue()
              .bankReceiptVoucherVoucherNo,
          accountsTransactionsDescription:
            this.f.bankReceiptVoucherNarration.value,
          accountsTransactionsStatus: null,
          accountsTransactionsUserId: this.usrid,
          accountsTransactionsFsno: this.fsno,
          accountstransactionsDelStatus: false,
          accountsTransactionsJobNo: this.contraSettings
            ? element.bankReceiptVoucherDetailsJobNo
            : -1,
          accountsTransactionsCostCenterId:
            element.bankReceiptVoucherDetailsCostCenterId,
        };
        bankReceiptVoucher.accountsTransactions.push(debitData);
        bankReceiptVoucher.accountsTransactions.push(creditData);
      });

    if (this.btnFlag.save) {
      this.saveVoucher(bankReceiptVoucher);
    } else {
      this.updateVoucher(bankReceiptVoucher);
    }
  }

  saveVoucher(bankReceiptVoucher: BankReceiptVoucher) {
    this.bankReceiptVoucherFormGroup.markAllAsTouched();
    if (this.bankReceiptVoucherFormGroup.invalid) return;

    if (this.bankReceiptVoucherFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant('Do you want to save voucher?'),
        accept: () => {
          this.accountapi
            .InsertBankReceiptVoucher(bankReceiptVoucher)
            .subscribe(
              (data) => {
                this.btnFlag = {
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                };
                this.savedBankReceiptVoucher = data.result;
                this.updateFormGrid(data.result);
                if (data.valid) {
                  this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('Alert'),
                    detail: this.translate.instant(data.message),
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
                  detail: this.translate.instant(
                    'Bank Receipt Voucher Save Failed'
                  ),
                });
              }
            );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: this.translate.instant('Bank Receipt Voucher Save Failed'),
      });
      this.bankReceiptVoucherFormGroup.markAllAsTouched();
      this.bankReceiptVoucherFormGroup.markAsDirty();
    }
  }

  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;
  getAllStationMaster() {
    this.masterapi.GetAllStation().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'Bank Receipt Voucher',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.bankReceiptVoucherFormGroup
        .get('bankReceiptVoucherVoucherNo')
        .value?.toString(),
      vpType: 'Bank Receipt Voucher',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {});
  }

  updateVoucher(bankReceiptVoucher: BankReceiptVoucher) {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to update existing voucher?',
      accept: () => {
        this.accountapi.UpdateBankReceiptVoucher(bankReceiptVoucher).subscribe(
          (data) => {
            this.btnFlag = {
              edit: true,
              cancel: false,
              save: false,
              update: true,
              delete: true,
            };
            this.updateFormGrid(data.result);
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: 'Bank Receipt Voucher Saved Succesfully',
            });
          },
          (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Bank Receipt Voucher Save Failed',
            });
          }
        );
      },
    });
  }

  getEmptyRowCount(length): number {
    const salesVoucherDetailsLength = length || 0;
    if (length < 12) {
      return Math.max(0, 12 - salesVoucherDetailsLength);
    } else {
      return;
    }
  }
  getAllAccountTransaction() {
    this.accountapi.GetAllAcountTransactions().subscribe((data) => {
      this.accountTransactionList = data.result;
    });
  }

  getAllBankReceiptVouchrs() {
    this.accountapi.GetBankReceiptVouchers().subscribe((data) => {
      this.bankReceiptVoucherarry = data.result;
      this.filterArray = data.result;
    });
  }

  public getAccountName(acctnumber: string): string {
    return this.accountArray?.find(
      (j) => j.maAccNo?.trim() === acctnumber?.trim()
    )?.maAccName;
  }
  callDropdowns(isRefresh = false) {
    if (isRefresh) this.utilityService.initializeAllStorage();
    this.LoadJobDDL();
    this.LoadCurruncyDDL();
    this.LoadCostCenterDDL();
    this.LoadChartOfAccountDDL();
    this.callDDLs = true;
  }

  new() {
    this.bankReceiptVoucherFormGroup.reset();
    this.bankReceiptVoucherFormGroup.enable();
    this.bankReceiptvoucherentry.data = [];
    this.bankReceiptvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.bankReceiptvoucherentry);
    this.accountTransactionList = [];
    this.bankReceiptVoucherFormGroup.get('bankReceiptVoucherSno').setValue(0);

    this.bankReceiptVoucherFormGroup
      .get('bankReceiptVoucherVDate')
      .setValue(new Date());

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.index = 0;
    this.callDropdowns();
    this.GetDefaultSettings();
    this.updateTableConfiguration();
  }

  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;

      var DEFAULTCURRENCY = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULTCURRENCY'
      );
      if (DEFAULTCURRENCY != null) {
        this.DefCurCheck = DEFAULTCURRENCY[0].generalSettingsTextValue;
        if (this.DefCurCheck !== null) {
          const splitText = this.DefCurCheck.split('::');
          this.DefCurrency = splitText[1]?.trim();
        }
      }
    });
    this.getACValue();
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

      this.f.bankReceiptVoucherDrAcNo.setValue(value[1]?.trim());
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

  showMaximizableDialog() {
    this.callDropdowns();
    this.getAllBankReceiptVouchrs();
    this.displayMaximizable = true;
  }

  updateFormGrid(pymt: BankReceiptVoucher) {
    this.bankReceiptVoucherFormGroup.patchValue({
      bankReceiptVoucherVoucherNo: pymt.bankReceiptVoucherVoucherNo,
      bankReceiptVoucherVDate: new Date(pymt.bankReceiptVoucherVDate),
      bankReceiptVoucherRefNo: pymt.bankReceiptVoucherRefNo,
      bankReceiptVoucherDrAcNo: pymt.bankReceiptVoucherDrAcNo,
      bankReceiptVoucherCrAmount: pymt.bankReceiptVoucherCrAmount,
      bankReceiptVoucherDrAmount: pymt.bankReceiptVoucherDrAmount,
      bankReceiptVoucherNarration: pymt.bankReceiptVoucherNarration,

      bankReceiptVoucherSno: pymt.bankReceiptVoucherSno,
    });

    this.accountTransactionList = pymt.accountsTransactions;

    this.craditword = this.convertNumberToWordsWithDecimal(
      pymt?.bankReceiptVoucherCrAmount
    );
    const gridData: GridData[] = pymt.bankReceiptVoucherDetails.map((k) => {
      const accountId: string =
        k.bankReceiptVoucherDetailsAcNo != null
          ? this.accountArray?.find((l) =>
              l.maAccNo.match(k.bankReceiptVoucherDetailsAcNo)
            )?.maAccName
          : null;
      const jobId: string =
        k.bankReceiptVoucherDetailsJobNo != null
          ? this.jobList?.find(
              (l) => l.value == k.bankReceiptVoucherDetailsJobNo
            )?.label
          : null;

      const CostCentid: string =
        k.bankReceiptVoucherDetailsCostCenterId != null
          ? this.costcenterList?.find(
              (l) => l.value == k.bankReceiptVoucherDetailsCostCenterId
            )?.label
          : null;

      return {
        account: accountId,
        credit: k.bankReceiptVoucherDetailsCrAmount,
        chequeno: k.bankReceiptVoucherDetailsChequeNo,
        chequedate: k.bankReceiptVoucherDetailsChequeDate,

        jobname: jobId,
        costcenter: CostCentid,
        narration: k.bankReceiptVoucherDetailsNarration,
        id: k.bankReceiptVoucherDetailsId,
        pdc: k.bankReceiptVoucherDetailsPdc,
      };
    });
    this.bankReceiptvoucherentry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
  }

  handleChange(e) {
    this.index = e.index;
    // if (this.index == 0) {
    //   this.initializeControls();
    // }
    if (this.index == 2) {
      if (this.savedBankReceiptVoucher?.bankReceiptVoucherVoucherNo) {
        this.CurrentselectedAccount = {
          ...this.savedBankReceiptVoucher.accountsTransactions[1],
          refNO:
            this.savedBankReceiptVoucher.bankReceiptVoucherDetails[0]
              .bankReceiptVoucherDetailsVoucherNo,
          accNO:
            this.savedBankReceiptVoucher.bankReceiptVoucherDetails[0]
              .bankReceiptVoucherDetailsAcNo,
          vType: 'BANK RECEIPT',
        };
      }
    }
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

  GetSavedBankReceiptDetails(id: string) {
    this.index = 0;
    this.accountapi.GetSavedBankReceiptDetails(id).subscribe(
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
        this.savedBankReceiptVoucher = data.result;
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
          .DeleteBankReceiptVoucher(this.savedBankReceiptVoucher)
          .subscribe(
            (data) => {
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
    this.GetSavedBankReceiptDetails(
      this.bankReceiptVoucherFormGroup.getRawValue().bankReceiptVoucherVoucherNo
    );
  }

  edit() {
    this.bankReceiptvoucherentry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });

    this.f.bankReceiptVoucherVoucherNo.clearValidators();
    this.bankReceiptVoucherFormGroup.enable();
    this.bankReceiptVoucherFormGroup.controls.bankReceiptVoucherVoucherNo.disable();
    this.bankReceiptVoucherFormGroup.updateValueAndValidity();
    this.updateTableConfiguration();
  }

  public get IsValidGrid(): boolean {
    if (this.bankReceiptvoucherentry.data.length > 0) {
      return Object.values(this.bankReceiptvoucherentry.data).some(
        (k: GridData) => k.account != null && k.credit != null
      );
    }
    return false;
  }
  selectaccount(evt) {
    const hot = this.hotRegisterer.getInstance(this.hotid);

    if (this.activeRow.column !== 1) {
      hot.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    } else {
      hot.selectCell(this.activeRow.row, 1);
    }

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
    if (this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherNo != null) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankReceiptVoucherVoucherNo ===
          this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherNo.toUpperCase()
      );
    }

    if (
      this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherAcNo != null &&
      this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherAcNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) =>
          res.bankReceiptVoucherDrAcNo ===
          this.BankReceiptVoucherFilterForm.value.BankReceiptVoucherAcNo
      );
    }

    if (this.BankReceiptVoucherFilterForm.value.isDate) {
      const fromDateStr = this.BankReceiptVoucherFilterForm.value.fromDate;
      const toDateStr = this.BankReceiptVoucherFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.bankReceiptVoucherVDate);

        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);

        return (
          (voucherDate.getTime() >= fromDate.getTime() &&
            voucherDate.getTime() <= toDate.getTime()) ||
          voucherDate.getTime() === fromDate.getTime()
        );
      });
      this.bankReceiptVoucherarry = filteredArray;
    }
    this.bankReceiptVoucherarry = filteredArray;
  }
  ClearFilter() {
    this.BankReceiptVoucherFilterForm.reset();
    this.bankReceiptVoucherarry = this.filterArray;
    this.BankReceiptVoucherFilterForm.get('fromDate').setValue(new Date());
    this.BankReceiptVoucherFilterForm.get('toDate').setValue(new Date());
  }
}

interface GridData {
  account?: string;
  credit?: number;
  chequeno?: number;
  chequedate?: any;
  jobname?: string;
  costcenter?: string;
  narration?: string;
  pdc: boolean;
  id?: number;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
('');
export const bankRVoucherColumnList = (
  component: BankReceiptvoucherComponent
) => [
  {
    data: 'account',
    type: 'autocomplete',
    label: 'Account',
    toolTip: 'Account',
    source: component.acctArry,
  },
  {
    data: 'credit',
    type: 'numeric',
    label: 'Credit',
    toolTip: 'Credit',
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
