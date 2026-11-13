import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HotTableRegisterer } from '@handsontable/angular';
import { defaults } from 'src/app/shared/service/settings';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ReportService } from 'src/app/routes/service/report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ExportdocumentService } from 'src/app/routes/service/ExportDocument/exportdocument.service';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { CostCenterMaster } from 'src/app/routes/domain/Masters/CostCenterMaster';
import { DepartmentMaster, ItemMaster } from 'src/app/routes/domain';
type SheetData = any[][];
@Component({
  selector: 'app-issue-report',
  templateUrl: './issue-report.component.html',
  styleUrls: ['./issue-report.component.scss'],
})
export class IssueReportComponent implements OnInit {
  title: string;
  subtitle: string;
  btnlabel: string = 'Submit';
  cols: any;
  dataJson: string;
  data: SheetData;
  ItemFormGroup: FormGroup;
  JobWiseIssueReport: any;
  licensekey: string;
  DetailWiseIssueReport: any;
  stockLedgerReport: any;
  HIDEJOBCOST: boolean = false;
  constructor(
    private fb: FormBuilder,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    public _MasterApiService: MasterApiService,
    public _ReportService: ReportService,
    private router: Router,
    public _ExportdocumentService: ExportdocumentService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  JobMasterArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  JobMasterArry: string[] = [];

  CostCentreArray: CostCenterMaster[] = [];
  costcenterList: SelectItem[] = [];
  costcenterArry: string[] = [];

  DepartmentMasterArray: DepartmentMaster[] = [];
  departmentList: SelectItem[] = [];
  departmentArry: string[] = [];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  ngOnInit(): void {
    this.getAllJobs();
    this.getAllCostCenter();
    this.getAllDepartment();
    this.getAllItemMaster();
    this.GetGeneralSettingbyKey();

    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.cols = [];
    this.initForm();
  }

  initForm() {
    this.ItemFormGroup = this.fb.group({
      ItemGroup: new FormControl(null),
      ItemName: new FormControl(null),
      DateFrom: new FormControl(new Date()),
      DateTo: new FormControl(new Date()),
      Job: new FormControl(null),
      PartNo: new FormControl(null),
      DepId: new FormControl(null),
      CostCentre: new FormControl(null),
      Type: new FormControl('details'),
      isDate: new FormControl(false),
    });
  }

  getAllJobs() {
    this._MasterApiService.GetAllJob().subscribe((k) => {
      this.JobMasterArray = k.result;
      this.jobList = k.result.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: -1 });
      this.JobMasterArry = k.result; //.map(ar => ar.jobMasterJobName.trim());
    });
  }

  getAllCostCenter() {
    this._MasterApiService.GetAllCostCenter().subscribe((k) => {
      this.CostCentreArray = k;
      this.costcenterList = k.map((kl) => ({
        label: kl.costCenterMasterCostCenterName,
        value: kl.costCenterMasterCostCenterId,
      }));
      this.costcenterList.unshift({
        label: '--Select CostCenter--',
        value: -1,
      });
      this.costcenterArry = k.map((ar) =>
        ar.costCenterMasterCostCenterName.trim()
      );
    });
  }
  public getJobName(job: number): string {
    const foundLoc = this.JobMasterArray?.find((j) => j.jobMasterJobId === job);
    if (foundLoc) {
      return foundLoc.jobMasterJobName;
    } else {
      return ''; // or handle the case when the unit is not found
    }
  }

  getAllDepartment() {
    this._MasterApiService.GetAllDepartment().subscribe((k) => {
      this.DepartmentMasterArray = k;
      this.departmentList = k.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentId,
      }));
      this.departmentList.unshift({
        label: '--Select Department--',
        value: -1,
      });
      this.departmentArry = k.map((ar) =>
        ar.departmentMasterDepartmentName.trim()
      );
    });
  }

  getAllItemMaster() {
    this._MasterApiService.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k.result;
      this.ItemMasterList = k.result.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k.result.map(
        (ar) => ar.itemMasterItemName.trim() + '|' + ar.itemMasterItemId
      );
    });
  }

  ChangeItem() {
    this.ItemFormGroup.controls.PartNo.setValue(
      this.ItemFormGroup.controls.ItemName.value?.itemMasterPartNo
    );
  }

  GenerateReport() {
    if (this.ItemFormGroup.get('isDate').value === true) {
      var formObj = this.ItemFormGroup.value;
      var dataObj = {
        isDate: true,
        costCentreId: formObj.CostCentre
          ? formObj.CostCentre?.costCenterMasterCostCenterId
          : null,
        dateFrom: formObj.DateFrom,
        toDate: formObj.DateTo,
        departmentId: formObj.DepId
          ? formObj.DepId?.departmentMasterDepartmentId
          : null,
        itemId: formObj.ItemName ? formObj.ItemName?.itemMasterItemId : null,
        jobId: formObj.Job ? formObj.Job.jobMasterJobId : null,
        partNo: formObj.PartNo,
        type: formObj.Type,
      };
    } else {
      var formObj = this.ItemFormGroup.value;
      var dataObj = {
        isDate: false,
        costCentreId: formObj.CostCentre
          ? formObj.CostCentre?.costCenterMasterCostCenterId
          : null,
        dateFrom: formObj.DateFrom,
        toDate: formObj.DateTo,
        departmentId: formObj.DepId
          ? formObj.DepId?.departmentMasterDepartmentId
          : null,
        itemId: formObj.ItemName ? formObj.ItemName?.itemMasterItemId : null,
        jobId: formObj.Job ? formObj.Job.jobMasterJobId : null,
        partNo: formObj.PartNo,
        type: formObj.Type,
      };
    }
    if (dataObj.type == 'details') {
      this.DetailWiseIssueReport = [];
      this._ReportService
        .GetDetailWiseIssueVoucherReport(dataObj)
        .subscribe((m) => {
          this.DetailWiseIssueReport = m.resultSet;
        });
    }
    if (dataObj.type == 'summary') {
      this._ReportService.GetSummaryWiseIssueReport(dataObj);
    }
    if (dataObj.type == 'jobwise') {
      this.JobWiseIssueReport = [];
      this._ReportService
        .GetJobWiseIssueVoucherReport(dataObj)
        .subscribe((m) => {
          this.JobWiseIssueReport = m.resultSet;
        });
    }
  }
  GetGeneralSettingbyKey() {
    this._MasterApiService
      .GetGeneralSettingbyKey('HIDE_JOBCOST')
      .subscribe((res) => {
        this.HIDEJOBCOST = res.result[0].generalSettingsBoolValue;

        // this.cardAcc = value[1]?.trim();
      });
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }
  onClear() {
    this.initForm();
    this.DetailWiseIssueReport = [];
  }

  onPrint() {
    if (this.ItemFormGroup.controls.Type.value == 'details') {
      this._ExportdocumentService.PrintPDF('detailPrint', '');
      return;
    }
    if (this.ItemFormGroup.controls.Type.value == 'summary') {
      this._ExportdocumentService.PrintPDF('summaryPrint', '');
      return;
    }
    if (this.ItemFormGroup.controls.Type.value == 'jobwise') {
      this._ExportdocumentService.PrintPDF('jobwisePrint', '');
      return;
    }
  }
}
