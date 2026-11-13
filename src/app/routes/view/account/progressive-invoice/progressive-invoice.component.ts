import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
// import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService, SelectItem } from 'primeng';
import { ProgressiveInvoice } from 'src/app/routes/domain/Accounts/ProgressiveInvice';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ProgrssiveInvoiceService } from 'src/app/routes/service/progrssive-invoice.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-progressive-invoice',
  templateUrl: './progressive-invoice.component.html',
  styleUrls: ['./progressive-invoice.component.scss'],
})
export class ProgressiveInvoiceComponent implements OnInit {
  title: string = 'Progressive Invoice';
  subtitle: string = 'Progressive Invoice';
  dataset: any;
  licensekey: any;
  gridHeader: string;
  progressiveinvoiceFormGroup: FormGroup;
  hotid = 'progressiveinvoice';
  private hotRegisterer = new HotTableRegisterer();
  progressiveinvoice_entry: Handsontable.GridSettings;
  selectedView: string = 'Summary';
  Permission: any;
  ScreenId: number;
  user: any;
  stationmasterObj: StationMaster;
  btnFlag: ButtonFlag;
  callDDLs: boolean = false;
  progressiveInvoice: ProgressiveInvoice[] = [];

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  v_ModeList: SelectItem[];
  typeList: SelectItem[];
  custJobList: any;
  PIFilterForm: FormGroup;
  filterArray: any;
  cols: { field: string; header: string }[];
  FILL_COMBO() {
    //SelectItem API with label-value pairs
    this.v_ModeList = [
      { label: 'Select', value: '' },
      { label: 'CASH', value: 'CASH' },
      { label: 'CREDIT', value: 'CREDIT' },
      { label: 'CARD', value: 'CARD' },
    ];
    this.typeList = [
      { label: 'Select', value: '' },
      { label: 'ADVANCE', value: 'ADVANCE' },
      { label: 'INETERIM', value: 'INETERIM' },
      { label: 'FINAL', value: 'FINAL' },
    ];
  }
  CustomerMasterArray: CustomerMaster[] = [];
  CustomerMasterArry: string[] = [];
  CustomerMasterList: SelectItem[];

  displayMaximizable: boolean = false;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private permission: PermissionsService,
    private activatedroute: ActivatedRoute,
    private router: Router,
    private PIService: ProgrssiveInvoiceService,
    private messageService: MessageService,
    private accountapi: AccountApiService,
    private utilityService: UtilityService,
    private confirmation: ConfirmationService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

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
      } else {
        this.router.navigate(['/login']);
      }
    });
    this.cols = [
      { field: 'PIVoucherNo', header: 'Invoice No' },
      { field: 'PIPurchaseDate', header: 'Date' },
      { field: 'jobname', header: 'Job' },
      { field: 'Customer', header: 'Customer' },
      { field: 'progressiveInvoiceCurComplVal', header: 'Completed Value' },
      { field: 'progressiveInvoiceCurComplPer', header: 'Completed Per' },
      { field: 'actions', header: 'Actions' },
    ];
    this.PIFilterForm = this.fb.group({
      isDate: [],
      PINo: [null],
      purchaseGRNNo: [null],
      fromDate: [new Date()],
      toDate: [new Date()],
    });
    this.FILL_COMBO();
    this.progressiveinvoiceFormGroup = this.fb.group({
      progressiveInvoiceId: [0],
      progressiveInvoiceInvNo: [''],
      progressiveInvoiceCustId: [0, Validators.required],
      progressiveInvoiceJobId: [-1, Validators.required],
      progressiveInvoiceInvDate: ['', Validators.required],
      progressiveInvoiceIsVariation: [false],
      progressiveInvoiceInvoiceType: ['', Validators.required],
      progressiveInvoiceReference: [''],
      progressiveInvoiceTotAmount: [0],
      progressiveInvoiceStatus: [''],
      progressiveInvoiceDiscPercentage: [0],
      progressiveInvoiceDiscount: [0],
      progressiveInvoicePrintInv: [''],
      progressiveInvoiceLocationId: [-1],
      progressiveInvoicePayAppNo: [''],
      progressiveInvoiceDescription: [''],
      progressiveInvoiceProgress: [''],
      progressiveInvoiceCurComplVal: [0],
      progressiveInvoiceCurComplPer: [0],
      progressiveInvoicePrevComplVal: [0],
      progressiveInvoicePrevComplPer: [0],
      progressiveInvoiceCumilativeVal: [0],
      progressiveInvoiceCumilativePer: [0],
      progressiveInvoiceAmountDue: [0],
      progressiveInvoiceTotal: [0],
      progressiveInvoiceFsno: [0],
      progressiveInvoiceUserId: [0],
      progressiveInvoiceDescriptionId: [0],
      progressiveInvoicePlRetention: [0],
      progressiveInvoicePlTotalAmount: [0],
      jobValue: [0],
      VariationAmt: [0],
      totalJobValue: [0],
      VariationAmountDue: [0],
      lessAdvance: [0],
      Variance: [0],
      advanceAmount: [0],
      PreRetentionAmount: [0],
      variationInvoiced: [0],
      preAdvanceAmtDed: [0],
      cumRetentionAmt: [0],
      cumVariationAmt: [0],
      cumAdvAmtDed: [0],
      PIadvanceAmt: [0],
      grossAmt: [0],
      PIvatAmt: [0],
      PIvatPer: [0],
    });
    this.progressiveinvoiceFormGroup.disable();
    this.initializeControls();
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: true,
    };
  }

  get f() {
    return this.progressiveinvoiceFormGroup.controls;
  }

  callDropdowns() {
    if (!this.callDDLs) {
      this.LoadCustomerDDL();
      this.LoadJobDDL();
      this.callDDLs = true;
    }
  }
  LoadCustomerDDL() {
    this.accountapi.LoadCustomerDropdown().subscribe((m) => {
      this.CustomerMasterArray = m.resultSet.customerMasters;
      this.CustomerMasterList = m.resultSet.customerMasters?.map((kl) => ({
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
    });
  }

  LoadJobDDL() {
    this.accountapi.LoadDropdowjobMasters().subscribe((m) => {
      this.jobArray = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
    });
  }

  GetJOb(event: any) {
    this.PIService.JobBYCUSTID(event.value).subscribe((data: any) => {
      this.custJobList = data.resultSet;
      this.jobList = data.resultSet?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
    });
  }

  onjobSelect(event: any) {
    let job = this.custJobList?.find((i) => i.jobMasterJobId == event.value);
    this.f.VariationAmt.setValue(job.jobMasterJobVariationAmount);
    this.f.jobValue.setValue(job.jobMasterJobValue);
    this.f.advanceAmount.setValue(job.jobMasterJobAdvanceAmount);
  }

  GetSavedSalesVoucherDetails(id: string) {
    this.callDropdowns();
    this.PIService.GetById(id).subscribe(
      (data) => {
        if (data.valid) {
          this.updateFormGrid(data.result);
          this.progressiveInvoice = data.result;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: this.translate.instant('Progressive Invoice not found'),
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: this.translate.instant('Failed'),
        });
      }
    );
  }

  updateFormGrid(result: any) {
    this.progressiveinvoiceFormGroup.patchValue({
      progressiveInvoiceId: result?.progressiveInvoiceId,
      progressiveInvoiceInvNo: result?.progressiveInvoiceInvNo,
      progressiveInvoiceCustId: result?.progressiveInvoiceCustId,
      progressiveInvoiceJobId: result?.progressiveInvoiceJobId,
      progressiveInvoiceInvDate: result?.progressiveInvoiceInvDate,
      progressiveInvoiceIsVariation: result?.progressiveInvoiceIsVariation,
      progressiveInvoiceInvoiceType: result?.progressiveInvoiceInvoiceType,
      progressiveInvoiceReference: result?.progressiveInvoiceReference,
      progressiveInvoiceTotAmount: result?.progressiveInvoiceTotAmount,
      progressiveInvoiceStatus: result?.progressiveInvoiceStatus,
      progressiveInvoiceDiscPercentage:
        result?.progressiveInvoiceDiscPercentage,
      progressiveInvoiceDiscount: result?.progressiveInvoiceDiscount,
      progressiveInvoicePrintInv: result?.progressiveInvoicePrintInv,
      progressiveInvoiceLocationId: result?.progressiveInvoiceLocationId,
      progressiveInvoicePayAppNo: result?.progressiveInvoicePayAppNo,
      progressiveInvoiceDescription: result?.progressiveInvoiceDescription,
      progressiveInvoiceProgress: result?.progressiveInvoiceProgress,
      progressiveInvoiceCurComplVal: result?.progressiveInvoiceCurComplVal,
      progressiveInvoiceCurComplPer: result?.progressiveInvoiceCurComplPer,
      progressiveInvoicePrevComplVal:
        result?.previousSummary?.totalCompletedValue,
      progressiveInvoicePrevComplPer:
        result?.previousSummary?.totalCompletedPer,
      progressiveInvoiceCumilativeVal: result?.progressiveInvoiceCumilativeVal,
      progressiveInvoiceCumilativePer: result?.progressiveInvoiceCumilativePer,
      progressiveInvoiceAmountDue: result?.progressiveInvoiceAmountDue,
      progressiveInvoiceTotal: result?.progressiveInvoiceTotal,
      progressiveInvoiceFsno: result?.progressiveInvoiceFsno,
      progressiveInvoiceUserId: result?.progressiveInvoiceUserId,
      progressiveInvoiceDescriptionId: result?.progressiveInvoiceDescriptionId,
      progressiveInvoicePlRetention: result?.progressiveInvoicePlRetention,
      progressiveInvoicePlTotalAmount: result?.progressiveInvoicePlTotalAmount,
      jobValue: result?.variaAmount?.jobAmount,
      // VariationAmt:
      totalJobValue: result?.totalCompletedValue,
      // VariationAmountDue:
      // lessAdvance:
      // Variance:
      advanceAmount: result?.variaAmount?.advAmount,
      PreRetentionAmount: result?.previousSummary?.totalRetentionAmount,
      variationInvoiced: result?.previousSummary?.totalVariationAmount,
      preAdvanceAmtDed: result?.previousSummary?.totalAdvanceAmount,
      // cumRetentionAmt:
      // cumVariationAmt:
      // cumAdvAmtDed:
      // PIadvanceAmt:
      // grossAmt:
      // PIvatAmt:
      // PIvatPer:
    });
    const gridData: any[] = result?.prgInvoiceDetails?.map((k) => {
      return {
        InvNo: k.progressiveInvoiceInvNo,
        Progress: k.progressiveInvoiceProgress,
        CurValue: k.progressiveInvoiceCurComplVal,
        Currentper: k.progressiveInvoiceCurComplPer,
        PreValue: k.progressiveInvoicePrevComplVal,
        Preper: k.progressiveInvoicePrevComplPer,
        CumValue: k.progressiveInvoiceCumilativeVal,
        Cumper: k.progressiveInvoiceCumilativePer,
        VarationInvoice: k.variationInvoice,
        RetAmount: k.progressiveInvoiceVariationAmount,
        id: null,
      };
    });
    this.progressiveinvoiceFormGroup.disable();
    this.progressiveinvoice_entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.progressiveinvoiceFormGroup.disable();
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.PIService.DeleteProgressInvoice(this.progressiveInvoice).subscribe(
          (data) => {
            this.userTrackingLog('Delete');
            this.messageService.add({
              severity: 'success',
              summary: 'Alert',
              detail: this.translate.instant(
                'Progressive Invoice Deleted Succesfully'
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

  getList() {
    this.callDropdowns();
    this.PIService.GetProgressInvoiceReport().subscribe((res: any) => {
      this.progressiveInvoice = res.map((i) => {
        i.jobname =
          i.progressiveInvoiceJobId == -1
            ? ''
            : this.getJobName(i.progressiveInvoiceJobId);
        i.Customer =
          i.progressiveInvoiceCustId == -1
            ? ''
            : this.getcustName(i.progressiveInvoiceCustId);
        return i;
      });
      this.filterArray = res;
      this.displayMaximizable = true;
    });
  }

  public getJobName(unit: number): string {
    return this.jobList?.find((j) => j?.value === unit)?.label;
  }

  public getcustName(id: number): string {
    return this.CustomerMasterList?.find((j) => j?.value === id)?.label;
  }
  save() {
    const savedData: any = this.progressiveinvoice_entry.data?.filter((k) =>
      k.hasOwnProperty('itemname')
    );
    const PIVoucher_Save: ProgressiveInvoice = this.progressiveinvoiceFormGroup
      .value as ProgressiveInvoice;

    PIVoucher_Save.progressiveInvoiceId =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceId;
    PIVoucher_Save.progressiveInvoiceInvNo =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceInvNo;
    PIVoucher_Save.progressiveInvoiceCustId =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceCustId;
    PIVoucher_Save.progressiveInvoiceJobId =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceJobId;
    PIVoucher_Save.progressiveInvoiceInvDate =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceInvDate;
    PIVoucher_Save.progressiveInvoiceIsVariation =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceIsVariation;
    PIVoucher_Save.progressiveInvoiceInvoiceType =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceInvoiceType;
    PIVoucher_Save.progressiveInvoiceReference =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceReference;
    PIVoucher_Save.progressiveInvoiceTotAmount =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceTotAmount;
    PIVoucher_Save.progressiveInvoiceStatus =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceStatus;
    PIVoucher_Save.progressiveInvoiceDiscPercentage =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceDiscPercentage;
    PIVoucher_Save.progressiveInvoiceDiscount =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceDiscount;
    PIVoucher_Save.progressiveInvoicePrintInv =
      this.progressiveinvoiceFormGroup.value.progressiveInvoicePrintInv;
    PIVoucher_Save.progressiveInvoiceLocationId =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceLocationId;
    PIVoucher_Save.progressiveInvoicePayAppNo =
      this.progressiveinvoiceFormGroup.value.progressiveInvoicePayAppNo;
    PIVoucher_Save.progressiveInvoiceDescription =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceDescription;
    PIVoucher_Save.progressiveInvoiceProgress =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceProgress;
    PIVoucher_Save.progressiveInvoiceCurComplVal =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceCurComplVal;
    PIVoucher_Save.progressiveInvoiceCurComplPer =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceCurComplPer;
    PIVoucher_Save.progressiveInvoicePrevComplVal =
      this.progressiveinvoiceFormGroup.value.progressiveInvoicePrevComplVal;
    PIVoucher_Save.progressiveInvoicePrevComplPer =
      this.progressiveinvoiceFormGroup.value.progressiveInvoicePrevComplPer;
    PIVoucher_Save.progressiveInvoiceCumilativeVal =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceCumilativeVal;
    PIVoucher_Save.progressiveInvoiceCumilativePer =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceCumilativePer;
    PIVoucher_Save.progressiveInvoiceAmountDue =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceAmountDue;
    PIVoucher_Save.progressiveInvoiceTotal =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceTotal;
    PIVoucher_Save.progressiveInvoiceFsno =
      this.progressiveinvoiceFormGroup.value.progressiveInvoiceFsno;
    PIVoucher_Save.progressiveInvoiceUserId = this.user.userId;
    PIVoucher_Save.accountsTransactions = [];
    PIVoucher_Save.progressiveInvoiceDetails = savedData
      ?.filter((k) => k.itemname != null && k.netAmt != null)
      .map((k: any) => {
        return {
          progressiveInvoiceDetailsPrDetId:
            this.progressiveinvoiceFormGroup.value.progressiveInvoiceId,
          progressiveInvoiceDetailsId: k.id ? k.id : 0,
          progressiveInvoiceDetailsJobDecId: 0,
          progressiveInvoiceDetailsDescrId: 0,
          progressiveInvoiceDetailsAmount: k.RetAmount,
          progressiveInvoiceDetailsPerValue: k.PreValue,
          progressiveInvoiceDetailsRemarks: k.Progress,
        };
      });
    if (this.btnFlag.save) {
      this.saveVoucher(PIVoucher_Save);
    } else {
      this.updateVoucher(PIVoucher_Save);
    }
  }

  public get IsValidGrid(): boolean {
    if (this.progressiveinvoice_entry.data.length > 0) {
      // this.salesvoucher_entry.data.forEach((value: GridData, index, arry) => {
      return Object.values(this.progressiveinvoice_entry.data).some(
        (k: any) => k.InvNo != null
      );
      // });
    }
    return false;
  }

  saveVoucher(Voucher_Save: ProgressiveInvoice) {
    if (this.progressiveinvoiceFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to Save Progressive Invoice?'
        ),
        accept: () => {
          this.PIService.InsertProgressInvoice(Voucher_Save).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: true,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.progressiveInvoice = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Insert');
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
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
                  'Progressive Invoice Save Failed'
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
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.progressiveinvoiceFormGroup.markAllAsTouched();
    }
  }

  updateVoucher(Voucher_Save: ProgressiveInvoice) {
    if (this.progressiveinvoiceFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: this.translate.instant(
          'Do you want to Update Progressive Invoice?'
        ),
        accept: () => {
          this.PIService.UpdateProgressInvoice(Voucher_Save).subscribe(
            (data) => {
              this.btnFlag = {
                edit: true,
                cancel: true,
                save: false,
                update: true,
                delete: true,
                new: true,
              };
              this.progressiveInvoice = data.result;
              this.updateFormGrid(data.result);
              this.userTrackingLog('Update');
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
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
                  'Progressive Invoice Update Failed'
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
        detail: this.translate.instant('Please fill mandatory fields'),
      });
      this.progressiveinvoiceFormGroup.markAllAsTouched();
    }
  }

  userTrackingLog(type) {
    let req = {
      page: 'ProgressiveInvoice',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.progressiveinvoiceFormGroup.value.progressiveInvoiceId,
      vpType: 'ProgressiveInvoice',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  cancel() {}

  edit() {
    this.progressiveinvoiceFormGroup.enable();
    this.btnFlag = {
      edit: true,
      cancel: true,
      save: false,
      update: true,
      delete: true,
      new: false,
    };
    // this.progressiveinvoice_entry.readOnly = false;
    // this.hotRegisterer
    //   .getInstance(this.hotid)
    //   .updateSettings(this.progressiveinvoice_entry);
  }

  new() {
    this.progressiveinvoiceFormGroup.enable();
    this.progressiveinvoiceFormGroup.reset();
    this.progressiveinvoice_entry.data = [];
    this.f.progressiveInvoiceInvDate.setValue(new Date());

    // this.progressiveinvoice_entry.readOnly = false;
    // this.hotRegisterer
    //   .getInstance(this.hotid)
    //   .updateSettings(this.progressiveinvoice_entry);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      new: false,
    };
    this.callDropdowns();
  }

  initializeControls() {
    this.progressiveinvoice_entry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: [60, 70, 70, 70, 70, 60, 70, 70, 70, 70],
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
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [10],
        indicators: false,
      },
      columns: [
        {
          data: 'InvNo',
          type: 'text',
        },
        {
          data: 'Progress',
          type: 'numeric',
        },
        {
          data: 'CurValue',
          type: 'numeric',
        },
        {
          data: 'Currentper',
          type: 'numeric',
        },
        {
          data: 'PreValue',
          type: 'numeric',
        },
        {
          data: 'Preper',
          type: 'numeric',
        },
        {
          data: 'CumValue',
          type: 'numeric',
        },
        {
          data: 'Cumper',
          type: 'numeric',
        },
        {
          data: 'VarationInvoice',
          type: 'text',
        },
        {
          data: 'RetAmount',
          type: 'numeric',
        },
        {
          data: 'id',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Inv.No'),
        this.translate.instant('Progress'),
        this.translate.instant('Cur.Value'),
        this.translate.instant('Current%'),
        this.translate.instant('Pre.Value'),
        this.translate.instant('Pre.%'),
        this.translate.instant('Cum.Value'),
        this.translate.instant('Cum.%'),
        this.translate.instant('Varation Invoice'),
        this.translate.instant('Ret.Amount'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  filter() {
    let filteredArray = this.filterArray;
    if (
      this.PIFilterForm.value.purchaseGRNNo != null &&
      this.PIFilterForm.value.purchaseGRNNo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.PIPurID === Number(this.PIFilterForm.value.purchaseGRNNo)
      );
    }

    if (
      this.PIFilterForm.value.PINo != null &&
      this.PIFilterForm.value.PINo !== ''
    ) {
      filteredArray = filteredArray?.filter(
        (res) => res.PIVoucherNo === this.PIFilterForm.value.PINo
      );
    }

    if (this.PIFilterForm.value.isDate) {
      const fromDateStr = this.PIFilterForm.value.fromDate;
      const toDateStr = this.PIFilterForm.value.toDate; // Assuming toDate is part of the form

      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      filteredArray = filteredArray?.filter((res) => {
        const voucherDate = new Date(res.PIPurchaseDate);
        const fromDate = new Date(fromDateStr); // Ensure fromDateStr is in a valid date format
        const toDate = new Date(toDateStr);
        voucherDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        return voucherDate >= fromDate && voucherDate <= toDate;
      });

      this.progressiveInvoice = filteredArray;
    }
    this.progressiveInvoice = filteredArray;
  }

  ClearFilter() {
    this.PIFilterForm.reset();
    this.progressiveInvoice = this.filterArray;
    this.PIFilterForm.get('fromDate').setValue(new Date());
    this.PIFilterForm.get('toDate').setValue(new Date());
  }
}
interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  new?: boolean;
}
