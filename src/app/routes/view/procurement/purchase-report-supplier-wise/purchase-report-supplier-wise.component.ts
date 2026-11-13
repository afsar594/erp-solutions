import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng';
import { ReportFilterModel } from 'src/app/routes/domain/Masters/ReportFilterModel';
import { SuppliersMaster } from 'src/app/routes/domain/Masters/SuppliersMaster';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { CrystalReportService } from 'src/app/routes/service/crystal-report.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { ReportDateFormatService } from 'src/app/shared/service/report-date-format.service';

@Component({
  selector: 'app-purchase-report-supplier-wise',
  templateUrl: './purchase-report-supplier-wise.component.html',
  styleUrls: ['./purchase-report-supplier-wise.component.scss'],
})
export class PurchaseReportSupplierWiseComponent implements OnInit {
  Permission: any;
  ScreenId: number;
  btnFlag: ButtonFlag;
  SupplierMasterArray: SuppliersMaster[] = [];
  SupplierMasterArry: string[] = [];
  SupplierMasterList: SelectItem[];
  loadList: any;
  supplier: any;
  pdfSource: string;
  dateFrom: string | Date = null;
  dateTo: string | Date = null;
  type: string = 'Details';
  enableDate: boolean;
  constructor(
    private permission: PermissionsService,
    private activatedroute: ActivatedRoute,
    private accountapi: AccountApiService,
    private crystalReportService: CrystalReportService,
    private formatDateService: ReportDateFormatService,
    private datePipe: DatePipe,
    private utilityService: UtilityService
  ) {}

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
    this.LoadSupplierDDL();
  }

  toggleDate() {
    this.enableDate = !this.enableDate;
    if (!this.enableDate) {
      this.dateFrom = null;
      this.dateTo = null;
    } else {
      this.dateFrom = new Date();
      this.dateTo = new Date();
    }
  }

  rptFilter: ReportFilterModel;
  showPrint() {
    let isDate = this.enableDate;

    let supplier = this.supplier;

    let fromDateControl = this.utilityService.fromAndToDateformater(
      this.dateFrom,
      'from'
    );
    let toDateControl = this.utilityService.fromAndToDateformater(
      this.dateTo,
      'to'
    );
    // const fromDate = this.datePipe.transform(fromDateControl, 'dd/MM/yyyy');
    // const toDate = this.datePipe.transform(toDateControl, 'dd/MM/yyyy');
    let query = 'SELECT * FROM vw_purchase WHERE 1 = 1';

    if (supplier) {
      query += ` AND Suppliers_Master_Supplier_ID = ${supplier}`;
    }
    if (isDate && fromDateControl && toDateControl) {
      query += ` AND Purchase_Voucher_Purchase_Date BETWEEN '${fromDateControl} ' AND '${toDateControl} '`;
    }
    this.rptFilter = {
      ReportName:
        this.type == 'Details'
          ? 'SupplierSalesDetails'
          : this.type == 'Monthly'
          ? 'SupplierMonthlySales'
          : this.type == 'Summary'
          ? 'SupplierSalesSummary'
          : this.type == 'All'
          ? 'AllPurchases'
          : 'SuppliersalesDetailsMaterialWise',
      SelectionFormula: '',
      Parameters: [
        {
          Key: 'Period',
          Value: isDate
            ? `for the period from  ${fromDateControl} to ${toDateControl}`
            : '',
        },
      ],
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

  LoadSupplierDDL() {
    this.accountapi.LoadDropdownSuppliersMaster().subscribe((r) => {
      this.loadList = r.resultSet;
      if (this.loadList.suppliersMaster) {
        this.SupplierMasterArray = this.loadList.suppliersMaster;

        this.SupplierMasterList = this.loadList.suppliersMaster.map((kl) => ({
          label: kl.suppliersMasterSupplierName,
          value: kl.suppliersMasterSupplierId,
        }));
        this.SupplierMasterList.unshift({
          label: '--Select Supplier--',
          value: -1,
        });
        this.SupplierMasterArry = this.loadList.suppliersMaster.map(
          (ar) =>
            ar.suppliersMasterSupplierName.trim() +
            '|' +
            ar.suppliersMasterSupplierId
        );
      }
    });
  }
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
