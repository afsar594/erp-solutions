import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { PdfExportService } from 'src/app/shared/service/pdf-export.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-ageingreport',
  templateUrl: './ageingreport.component.html',
  styleUrls: ['./ageingreport.component.scss']
})
export class AgeingreportComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  keyword: string = "";
  location: Array<string>;
  supplier: Array<string>;
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  ARform: FormGroup;
  index: number = 0;
  state: { Dir: string; Field: any; Skip: any; Take: any; Search: any; Filter: any; ToDate?: any; ShowUnallocated?: boolean; };
  // filter: any;
  selectedcustomer: string = `'10103'`; // Default to Customers
  customer: any[] = [{ label: "Customers", value: `'10103'` }, { label: "Suppliers", value: `'20101'` }];
  showUnallocated: boolean = false;
  selectedAsOnDate: Date = new Date();
  pdfSource: string;
  ScreenId: number;
  Permission: any;
  handleChange(e) {
    this.index = e.index;
  }


  hotid = 'AgeingReport';
  private hotRegisterer = new HotTableRegisterer();
  AgeingReport: Handsontable.GridSettings;
  initializeControls() {
    this.AgeingReport = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: '150px',

      // colWidths: ['90px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '50px', '70px'],
      minRows: 3,
      width: 'auto',
      height: 300,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,

      stretchH: "all",
      manualRowResize: true,
      manualColumnResize: true,
      columns: [
        {
          data: 'name',
          type: 'text'
        },
        {
          data: 'crLimit',
          type: 'text',
        },
        {
          data: 'crDys',
          type: 'text'
        },
        {
          data: 'zeroThirty',
          type: 'text'
        },
        {
          data: 'thirtyOneSixty',
          type: 'text',
        },
        {
          data: 'sixtyOneNinety',
          type: 'text'
        },
        {
          data: 'ninetyOneToOneEighty',
          type: 'text',
        },
        {
          data: 'oneEightOneToTwoSeventy',
          type: 'text'
        },
        {
          data: 'twoSeventyOneToThreeSixty',
          type: 'text',
        },
        {
          data: 'overThreeSixty',
          type: 'text'
        },
        {
          data: 'crBal',
          type: 'text',
        },
        {
          data: 'unAllocated',
          type: 'text'
        },
        {
          data: 'outBalance',
          type: 'text'
        },
        {
          data: 'accNo',
          type: 'text'
        },
        {
          data: 'contact_Person',
          type: 'text'
        },
        {
          data: 'cT_Name',
          type: 'text'
        },
        {
          data: 'tel1',
          type: 'text'
        },
        {
          data: 'mobile',
          type: 'text'
        },
        {
          data: 'remarks',
          type: 'text'
        },
      ],
      colHeaders: [
        this.translate.instant('Name'),
        this.translate.instant('CrLimit'),
        this.translate.instant('CrDys'),
        this.translate.instant('0-30'),
        this.translate.instant('31-60'),
        this.translate.instant('61-90'),
        this.translate.instant('91-180'),
        this.translate.instant('181-270'),
        this.translate.instant('271-360'),
        this.translate.instant('OV360'),
        this.translate.instant('CrBal'),
        this.translate.instant('UnAllocated'),
        this.translate.instant('outBalance'),
        this.translate.instant('accNo'),
        this.translate.instant('contact_Person'),
        this.translate.instant('cT_Name'),
        this.translate.instant('tel1'),
        this.translate.instant('mobile'),
        this.translate.instant('remarks'),


      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    }
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accService: AccountstatementService,
    private permission: PermissionsService,
    private pdf: PdfExportService
  ) {

  }

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Ageing Report') {
          this.Permission = {
            Allow: res?.workGroupPermissionsUallow,
            Add: res?.workGroupPermissionsUadd,
            Delete: res?.workGroupPermissionsUdelete,
            Edit: res?.workGroupPermissionsUedit,
            Print: res?.workGroupPermissionsUprint,
            View: res?.workGroupPermissionsUview
          };
        }
      });
    });
    this.ARform = new FormGroup({
      Customer: new FormControl('', Validators.required),
      Date: new FormControl(new Date(new Date().setFullYear(new Date().getFullYear())), Validators.required),
      KeyWord: new FormControl('', Validators.required),
    });
    this.activatedroute.data.subscribe(data => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = "No Data";

    });
    this.initializeControls()
  }


  showPrint(event: any) {

     this.state = {
      Dir: event ? (event.sortOrder === -1 ? 'desc' : 'asc') : 'asc',
      Field: event && event.sortField ? event.sortField : 'Name',
      Skip: event?.first ?? 0,
      Take: event?.rows ?? 100,
      Search: this.keyword ?? '',
      Filter: this.selectedcustomer ? String(this.selectedcustomer) : '',   // ✅ always string
      ToDate: this.selectedAsOnDate ?? new Date(),
      ShowUnallocated: this.showUnallocated ?? false
    };
    this.accService.AgeingReportPrint(this.state).subscribe((response: any) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      this.pdfSource = URL.createObjectURL(blob);
      window.open(this.pdfSource);
    })

  }

  GetGridListData(event: any, isPrint: boolean = false) {
    // this.state = {
    //   Dir: event != null ? event.sortOrder == -1 ? 'asc' : 'desc' : 'desc',
    //   Field: event != null ? event.sortField != null && event.sortField != '' ? event.sortField : 'AccountsTransactions_TransSno' : 'AccountsTransactions_TransSno',
    //   Skip: event != null ? event.first != null ? event.first : 0 : 0,
    //   Take: event != null ? event.rows != null ? event.rows : 0 : 10000,
    //   Search: this.search,
    //   Filter: this.filter
    // }
    this.state = {
      Dir: event ? (event.sortOrder === -1 ? 'desc' : 'asc') : 'asc',
      Field: event && event.sortField ? event.sortField : 'Name',
      Skip: event?.first ?? 0,
      Take: event?.rows ?? 100,
      Search: this.keyword ?? '',
      Filter: this.selectedcustomer ? String(this.selectedcustomer) : '',   // ✅ always string
      ToDate: this.selectedAsOnDate ?? new Date(),
      ShowUnallocated: this.showUnallocated ?? false,
    };
    this.accService.GetAgeingReport(this.state).subscribe((response: ApiResponse<any>) => {
      this.dataset = [];
      if (response.valid && response.result.details.length > 0) {
        this.dataset = response.result.details;
      }
    })
    if (isPrint) {
     this.pdf.generateAgeingReport(this.dataset);
    }
  }

  GetDate(date: Date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    let returnDate = yyyy + '-' + mm + '-' + dd;
    return returnDate;
  }

  ASOnDateFilter() {
    let queryString = '';
    let max = this.GetDate(this.selectedAsOnDate);
    if (this.selectedAsOnDate) {
      // queryString += ` and (act.AccountsTransactions_TransDate <= cast('` + max + `'as Date))`;

      queryString += `and  CONVERT(DATE, act.AccountsTransactions_TransDate) <= '${max}'`;
      return queryString;
    }
  }

  ApplyFilters(type) {
    const isPrint = type == 'print' ? true : false;
    this.GetGridListData(null,isPrint);
  }
  get f() {
    return this.ARform.controls;
  }
} 
