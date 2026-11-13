import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debug } from 'console';
import { MenuItem } from 'primeng';
import {
  ExportFormatType,
  ReportFilterModel,
} from 'src/app/routes/domain/Masters/ReportFilterModel';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { MISService } from 'src/app/routes/service/mis/mis.service';
import { PdfExportService } from 'src/app/shared/service/pdf-export.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-balance-sheet-adv',
  templateUrl: './balance-sheet-adv.component.html',
  styleUrls: ['./balance-sheet-adv.component.scss'],
})
export class BalanceSheetAdvComponent implements OnInit {
  title: string;
  financialStartDate: Date = new Date();
  financialEndDate: Date = new Date();
  byDate = false;
  isSummaryView = true;
  includeZero = false;
  balanceSheetData: any[] = [];
  balanceSheetSummary: any;
  index = 0;
  subtitle: any;
  licensekey: string;
  gridHeader: string;

  rptFilter: ReportFilterModel;
  constructor(
    private misService: MISService,
    private pdf: PdfExportService,

    private masterApi: MasterApiService,
    private crystalReportService: CrystalReportService,
    private activatedroute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.subtitle;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.loadBalanceSheet();
  }

  printbtn: MenuItem[];
  getReportType() {
    this.masterApi.General('trialBalance').subscribe((res: any) => {
      this.printbtn = res.map((r: any) => ({
        label: r.reportTypeDescription,
        command: () => this.printSimpleReport(r.reportTypeFileName),
      }));
    });
  }

  pdfSource: any;
  printSimpleReport(type) {
    // this.rptFilter = {
    //   ReportName: type,
    //   SelectionFormula: '',
    //   Parameters: [
    //     {
    //       Key: 'Head1',
    //       Value: this.stationmasterObj.stationMasterStationName,
    //     },
    //     {
    //       Key: 'PeriodRange',
    //       Value: daterange,
    //     },
    //     {
    //       Key: 'InvDes',
    //       Value: this.selectedView,
    //     },
    //     {
    //       Key: 'Tele',
    //       Value: 'Tel: ' + this.stationmasterObj.stationMasterTele1,
    //     },
    //     {
    //       Key: 'Address',
    //       Value: this.stationmasterObj?.stationMasterAddress,
    //     },
    //   ],
    //   Queries: ['SELECT *  FROM tmptrialbalance'],
    //   SP_Queries: [
    //     {
    //       SP_Name: 'usp_GetTrialBalance_Advanced',
    //       Parameters: [
    //         {
    //           Key: '@FromDate',
    //           Value: this.isDate
    //             ? this.GetDate(this.startDate)
    //             : this.GetDate(new Date(this.financialStartDate)),
    //         },
    //         {
    //           Key: '@ToDate',
    //           Value: this.isDate
    //             ? this.GetDate(this.endDate)
    //             : this.GetDate(new Date(this.financialEndDate)),
    //         },
    //         {
    //           Key: '@CostCenterId',
    //           Value: `${this.costcenter}`,
    //         },
    //         {
    //           Key: '@IncludeZero',
    //           Value: `${this.isChecked}`,
    //         },
    //         {
    //           Key: '@IsSummaryView',
    //           Value: `${this.selectedView == 'Summary' ? 1 : 0}`,
    //         },
    //         {
    //           Key: '@IsFullYear',
    //           Value: '',
    //         },
    //       ],
    //     },
    //   ],
    //   ExportType: ExportFormatType.PortableDocFormat,
    // };
    this.crystalReportService
      .downloadReport(this.rptFilter)
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfSource = URL.createObjectURL(blob);
        window.open(this.pdfSource);
      });
  }
  loadBalanceSheet() {
    const params: MisReportParams = {
      fromDate: this.byDate ? this.financialStartDate : null,
      toDate: this.byDate ? this.financialEndDate : null,
      includeZero: this.includeZero === true ? false : true,
      isSummaryView: this.isSummaryView,
      locationId: null,
      costCenterId: null,
      mode: '',
      isMonthly: false,
      isFullYear: false,
      isGroupWise: false,
    };

    this.misService.getBalanceSheetAdv(params).subscribe(
      (res) => {
        if (res.valid) {
          this.balanceSheetData = res?.result.details;
          this.balanceSheetSummary = res?.result.summary;
        }
      },
      (err) => {
        console.error('Error fetching Balance Sheet:', err);
      }
    );
  }

  handleChange(event: any) {
    this.index = event.index;
  }

  exportToPdf() {
    const headers = ['Head Type', 'Sub Head', 'Account Name', 'Amount'];
    const body = this.balanceSheetData.map((r) => [
      r.headType,
      r.subHead,
      r.accountName || '-',
      this.formatAmount(r.netAmount || r.totalAmount),
    ]);

    const summary = [
      {
        label: 'Total Assets',
        value: this.formatAmount(this.balanceSheetSummary?.totalAssets),
      },
      {
        label: 'Total Liabilities',
        value: this.formatAmount(this.balanceSheetSummary?.totalLiabilities),
      },
      {
        label: 'Total Equity',
        value: this.formatAmount(this.balanceSheetSummary?.totalEquity),
      },
      {
        label: 'Liabilities + Equity',
        value: this.formatAmount(
          this.balanceSheetSummary?.liabilitiesPlusEquity
        ),
      },
      {
        label: 'Difference',
        value: this.formatAmount(this.balanceSheetSummary?.difference),
      },
      { label: 'Final Result', value: this.balanceSheetSummary?.finalResult },
    ];

    const periodText = `Period: ${this.financialStartDate.toLocaleDateString()} - ${this.financialEndDate.toLocaleDateString()}`;

    this.pdf.generateFinancialReport(
      'Balance Sheet Report',
      headers,
      body,
      summary,
      periodText
    );
  }

  private formatAmount(val: number): string {
    return (val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
export interface MisReportParams {
  fromDate?: Date | null;
  toDate?: Date | null;
  includeZero: boolean;
  isSummaryView: boolean;
  locationId: number | null;
  costCenterId: number | null;
  mode: string;
  isMonthly: boolean;
  isFullYear: boolean;
  isGroupWise: boolean;
}

export interface BalanceSheetDto {
  headType: string;
  subHead: string;
  accountName?: string;
  totalAmount: number;
}

export interface BalanceSheetSummaryDto {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  liabilitiesPlusEquity: number;
  difference: number;
  finalResult: string;
}

export interface BalanceSheetResponse {
  details: BalanceSheetDto[];
  summary: BalanceSheetSummaryDto;
}
