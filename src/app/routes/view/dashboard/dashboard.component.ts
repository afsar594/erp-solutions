import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';
import {
  CustomersGraphData,
  PDCGraphData,
  SuppliersGraphData,
} from '../../domain/Administration/dashboard';
import { FormControl, FormBuilder } from '@angular/forms';
import { DashboardDataService } from '../../service/dashboard/dashboard.service';
import { MISService } from '../../service/mis/mis.service';
import { ApiResponse } from '../../domain/Masters/ApiResponse';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  suppliercols: any[];
  supplierData: SuppliersGraphData[];

  customercols: any[];
  customerData: CustomersGraphData[];

  pdcIssuecols: any[];
  pdcIssueData: PDCGraphData[];

  pdcReceivecols: any[];
  pdcReceiveData: PDCGraphData[];

  chartData: any;
  chartData2: any;
  chartData3: any;
  chartData4: any;

  items1: MenuItem[];
  label1: string = 'Current Month';

  items3: MenuItem[];
  label3: string = 'Current Month';

  items4: MenuItem[];
  label4: string = 'Current Month';

  Form = this.fb.group({
    Type: new FormControl(''),
    StartDate: [null],
    EndDate: [null],
  });
  summary1: any[] = [];
  summary2: any[] = [];

  financialStartpDate: Date = new Date();
  financialEndpDate: Date = new Date();
  BankBalance: any;
  mainCash: any;
  pdcIssue: any;
  pdcReceive: any;
  pdcIssuePer: any = 0;
  pdcReceiveper: any = 0;
  pdcIssueCount: any;
  pdcReceiveCount: any;
  pdcTotal: number;
  incomingPdcIssue: any;
  incomingPdcReceived: any;
  CurrentMonthPurchase: any;
  CurrentMonthSales: any;
  PrevMonthSales: any;
  PrevMonthPurchase: any;
  CurrMonthExpense: any;
  PrevMonthExpense: any;
  PurchaseOrderCount: any;
  PurchaseRequisitionCount: any;
  ApprovedOrdersCount: any;
  chartOptions: any;
  barChartOptions: any;
  selectedChart: any = 'SALES,PURCHASE';
  selectedPeriod: string = 'CURRENT_MONTH';

  today: string = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  greeting: string = 'Welcome back';
  userName: string = '';

  constructor(
    private misService: MISService,
    private dashbaordServce: DashboardDataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.resolveUserGreeting();
    this.initChartOptions();
    this.GetFinancialYear();
    this.getPDC('TOTAL');
    this.initMenuItems();

    this.suppliercols = [
      { field: 'MA_AccName', header: 'Supplier' },
      { field: 'Amount', header: 'Amount' },
    ];

    this.customercols = [
      { field: 'MA_AccName', header: 'Customer' },
      { field: 'Amount', header: 'Amount' },
    ];

    this.pdcIssuecols = [
      { field: 'PartyName', header: 'Party' },
      { field: 'PDate', header: 'Date' },
      { field: 'CAmount', header: 'Amount' },
    ];

    this.pdcReceivecols = [
      { field: 'PartyName', header: 'Party' },
      { field: 'PDate', header: 'Date' },
      { field: 'CAmount', header: 'Amount' },
    ];

    this.chartData4 = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Purchase',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderColor: '#2f80ed',
          backgroundColor: 'rgba(47, 128, 237, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          lineTension: 0.35,
        },
      ],
    };

    this.chartData2 = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Income',
          backgroundColor: '#0f8b8d',
          hoverBackgroundColor: '#0b6f7e',
          data: [65, 59, 80, 81, 56, 55, 40],
        },
        {
          label: 'Profit',
          backgroundColor: '#2f80ed',
          hoverBackgroundColor: '#1f66c9',
          data: [28, 48, 40, 19, 86, 27, 90],
        },
        {
          label: 'Expense',
          backgroundColor: '#f2994a',
          hoverBackgroundColor: '#dd842f',
          data: [34, 12, 20, 10, 50, 90, -27],
        },
      ],
    };
    this.chartData3 = {
      labels: ['Assets', 'Equity', 'Expenses', 'Income', 'Liabalities'],
      datasets: [
        {
          label: 'Account Group',
          backgroundColor: '#2f80ed',
          hoverBackgroundColor: '#1f66c9',
          data: [65, 59, 80, 81, 56],
        },
      ],
    };
    this.LoadTabs(0);
    this.GetDasboardSalesPurchaseLineChart('CURRENT_MONTH');
  }
  private resolveUserGreeting() {
    const credentials = this.loginService.GetCredentialData();
    this.userName = credentials?.userName || 'User';

    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 17) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
  }

  private initChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          fontColor: '#486581',
          fontSize: 11,
        },
      },
      tooltips: {
        backgroundColor: '#102a43',
        titleFontSize: 11,
        bodyFontSize: 11,
        xPadding: 10,
        yPadding: 8,
        cornerRadius: 6,
        displayColors: true,
      },
      scales: {
        xAxes: [
          {
            gridLines: { display: false, drawBorder: false },
            ticks: { fontColor: '#829ab1', fontSize: 11 },
          },
        ],
        yAxes: [
          {
            gridLines: { color: '#eef2f7', drawBorder: false, zeroLineColor: '#eef2f7' },
            ticks: {
              fontColor: '#829ab1',
              fontSize: 11,
              beginAtZero: true,
              padding: 6,
            },
          },
        ],
      },
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          fontColor: '#486581',
          fontSize: 11,
        },
      },
      tooltips: {
        backgroundColor: '#102a43',
        titleFontSize: 11,
        bodyFontSize: 11,
        xPadding: 10,
        yPadding: 8,
        cornerRadius: 6,
        displayColors: true,
      },
      scales: {
        xAxes: [
          {
            gridLines: { display: false, drawBorder: false },
            ticks: { fontColor: '#829ab1', fontSize: 11 },
          },
        ],
        yAxes: [
          {
            gridLines: { color: '#eef2f7', drawBorder: false, zeroLineColor: '#eef2f7' },
            ticks: {
              fontColor: '#829ab1',
              fontSize: 11,
              beginAtZero: true,
              padding: 6,
            },
          },
        ],
      },
    };
  }

  initMenuItems() {
    this.items1 = [
      {
        label: 'Current Month',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'CURRENT_MONTH';
          this.onPeriodChange('CURRENT_MONTH');
          this.GetTabsChart();
        },
      },
      {
        label: 'Previous Month',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'PREVIOUS_MONTH';
          this.onPeriodChange('PREVIOUS_MONTH');
          this.GetTabsChart();
        },
      },
      {
        label: 'Current Week',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'CURRENT_WEEK';
          this.onPeriodChange('CURRENT_WEEK');
          this.GetTabsChart();
        },
      },
      {
        label: 'Previous Week',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'PREVIOUS_WEEK';
          this.onPeriodChange('PREVIOUS_WEEK');
          this.GetTabsChart();
        },
      },
      {
        label: 'Financial Year',
        icon: 'pi pi-calendar',
        command: () => {
          this.selectedPeriod = 'FINANCIAL_YEAR';
          this.onPeriodChange('FINANCIAL_YEAR');
          this.GetTabsChart();
        },
      },
    ];
  }

  onPeriodChange(label: string) {
    this.label1 = label;
    this.GetDasboardSalesPurchaseLineChart(label);
  }

  GetDasboardSalesPurchaseLineChart(periodType: string) {
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = new Date(currentDate);

    switch (periodType) {
      case 'CURRENT_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        break;

      case 'PREVIOUS_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        break;

      case 'CURRENT_WEEK':
        const day = currentDate.getDay(); // Sunday = 0
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - day);
        break;

      case 'PREVIOUS_WEEK':
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        const prevStart = new Date(prev);
        prevStart.setDate(prevStart.getDate() - prevStart.getDay());
        startDate = prevStart;
        endDate = new Date(prevStart);
        endDate.setDate(prevStart.getDate() + 6);
        break;

      case 'Financial Year':
        const fyStartMonth = 6; // July (0-based index)
        if (currentDate.getMonth() < fyStartMonth) {
          startDate = new Date(currentDate.getFullYear() - 1, fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear(), fyStartMonth, 0);
        } else {
          startDate = new Date(currentDate.getFullYear(), fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear() + 1, fyStartMonth, 0);
        }
        break;

      default:
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }

    const req = {
      choice: this.selectedChart,
      periodType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    this.dashbaordServce
      .GetDasboardSalesPurchaseLineChart(req)
      .subscribe((res: any) => {
        if (!res || !res.result) return;
        this.chartData = {};
        this.chartData4 = {};
        const response = res.result;

        const labels = response.labels.split(',');
        const salesData = response.salesData
          .split(',')
          .map((x) => parseFloat(x));
        const purchaseData = response.purchaseData
          .split(',')
          .map((x) => parseFloat(x));

        this.chartData = {
          labels,
          datasets: [
            {
              label: 'Sales',
              data: salesData,
              borderColor: '#0f8b8d',
              backgroundColor: 'rgba(15, 139, 141, 0.12)',
              fill: false,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              lineTension: 0.35,
            },
          ],
        };

        this.chartData4 = {
          labels,
          datasets: [
            {
              label: 'Purchase',
              data: purchaseData,
              borderColor: '#2f80ed',
              backgroundColor: 'rgba(47, 128, 237, 0.12)',
              fill: false,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              lineTension: 0.35,
            },
          ],
        };

        this.chartData = { ...this.chartData };
        this.chartData4 = { ...this.chartData4 };
      });
  }
  selectedChoice = 0;
  GetTabsChart() {
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = new Date(currentDate);

    switch (this.selectedPeriod) {
      case 'CURRENT_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        break;

      case 'PREVIOUS_MONTH':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        break;

      case 'CURRENT_WEEK':
        const day = currentDate.getDay(); // Sunday = 0
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - day);
        break;

      case 'PREVIOUS_WEEK':
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        const prevStart = new Date(prev);
        prevStart.setDate(prevStart.getDate() - prevStart.getDay());
        startDate = prevStart;
        endDate = new Date(prevStart);
        endDate.setDate(prevStart.getDate() + 6);
        break;

      case 'Financial Year':
        const fyStartMonth = 6; // July (0-based index)
        if (currentDate.getMonth() < fyStartMonth) {
          startDate = new Date(currentDate.getFullYear() - 1, fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear(), fyStartMonth, 0);
        } else {
          startDate = new Date(currentDate.getFullYear(), fyStartMonth, 1);
          endDate = new Date(currentDate.getFullYear() + 1, fyStartMonth, 0);
        }
        break;

      default:
        startDate = new Date(currentDate);
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }
    const choice = this.selectedChoice;
    const req = {
      // choice: this.selectedChart,
      // periodType,
      Type: this.Form.controls['Type'].value,
      StartDate: startDate.toISOString().split('T')[0],
      EndDate: endDate.toISOString().split('T')[0],
    };
    this.dashbaordServce.GetTabsChart(req).subscribe((response) => {
      if (choice == 1) {
        this.customerData = response.resultSet;
      } else if (choice == 0) {
        this.supplierData = response.resultSet;
      } else if (choice == 2) {
        this.pdcIssueData = response.resultSet;
      } else if (choice == 3) {
        this.pdcReceiveData = response.resultSet;
      }
      this.cdr.detectChanges();
    });
  }

  LoadTabs(choice) {
    var type =
      choice == 0
        ? 'SUPPLIER'
        : choice == 1
        ? 'CUSTOMER'
        : choice == 2
        ? 'PDC_ISSUED'
        : 'PDC_RECEIVED';
    this.Form.controls['Type'].setValue(type);
    this.selectedChoice = choice;
    this.GetTabsChart();
  }

  getPDC(type) {
    this.Form.controls['Type'].setValue(type);

    this.dashbaordServce.getPDC().subscribe((response: any) => {
      this.pdcTotal = 0;
      let list = response.resultSet.data;
      let vouchers = response.resultSet.groupedData;

      //total summary
      let data = list?.filter((a) => a.type == 'TOTAL');
      //pdc issue
      const pdcIssueRecord = data?.filter(
        (a) => a.discription == 'Total Amount of PDC Issued'
      );
      this.pdcIssue = pdcIssueRecord[0]?.value ?? 0;

      const pdcIssueCountRecord = data?.filter(
        (a) => a.discription == 'Total No. of PDC Issued'
      );
      this.pdcIssueCount = pdcIssueCountRecord[0]?.value;

      // pdc received
      const pdcReceiveRecord = data?.filter(
        (a) => a.discription == 'Total Amount of PDC Received'
      );
      this.pdcReceive = pdcReceiveRecord[0]?.value ?? 0;
      const pdcReceiveCountRecord = data?.filter(
        (a) => a.discription == 'Total No. of PDC Received'
      );
      this.pdcReceiveCount = pdcReceiveCountRecord[0]?.value;

      const issuedValue = Number(this.pdcIssue) || 0;
      const receivedValue = Number(this.pdcReceive) || 0;
      this.pdcTotal = issuedValue + receivedValue;

      this.pdcIssuePer = this.pdcTotal
        ? ((issuedValue / this.pdcTotal) * 100).toFixed(2)
        : '0.00';
      this.pdcReceiveper = this.pdcTotal
        ? ((receivedValue / this.pdcTotal) * 100).toFixed(2)
        : '0.00';

      //cash balance and bank bakance
      const bankbalance = data?.filter(
        (a) => a.discription == 'Total Bank Balance'
      );
      this.BankBalance = bankbalance[0]?.value?.toFixed(2) ?? 0.0;

      const cashbalance = data?.filter(
        (a) => a.discription == 'Total Cash Balance'
      );
      this.mainCash = cashbalance[0]?.value?.toFixed(2) ?? 0.0;

      //split summary
      let query = list?.filter((a) => a.type == 'SPLIT');
      //incoming pdc in 5 days
      const incomingdaypdcIssue = query?.filter(
        (a) => a.discription == 'Incoming PDC Amt. (Issued) In 5 Days'
      );
      this.incomingPdcIssue = incomingdaypdcIssue[0]?.value?.toFixed(2) ?? 0.0;

      //incoming pdc in 5 days
      const incomingdaypdcReceived = query?.filter(
        (a) => a.discription == 'Incoming PDC Amt. (Received) In 5 Days'
      );
      this.incomingPdcReceived =
        incomingdaypdcReceived[0]?.value?.toFixed(2) ?? 0.0;

      //Current Month Purchase
      const currMonthPurchase = query?.filter(
        (a) => a.discription == 'Current Month Purchase'
      );
      this.CurrentMonthPurchase =
        currMonthPurchase[0]?.value?.toFixed(2) ?? 0.0;

      //Current Month Sales
      const currMonthSales = query?.filter(
        (a) => a.discription == 'Current Month Sales'
      );
      this.CurrentMonthSales = currMonthSales[0]?.value?.toFixed(2) ?? 0.0;

      // Prev. Month Sales
      const PreviousMonthSales = query?.filter(
        (a) => a.discription == 'Prev. Month Sales'
      );
      this.PrevMonthSales = PreviousMonthSales[0]?.value?.toFixed(2) ?? 0.0;

      // Prev. Month Purchase
      const PreviousMonthPurchase = query?.filter(
        (a) => a.discription == 'Prev. Month Purchase'
      );
      this.PrevMonthPurchase =
        PreviousMonthPurchase[0]?.value?.toFixed(2) ?? 0.0;

      //Current Month Expenses
      const CurrentMonthExpense = query?.filter(
        (a) => a.discription == 'Current Month Expenses'
      );
      this.CurrMonthExpense = CurrentMonthExpense[0]?.value?.toFixed(2) ?? 0.0;

      //Prev. Month Expenses
      const PreviousMonthExpense = query?.filter(
        (a) => a.discription == 'Prev. Month Expenses'
      );
      this.PrevMonthExpense = PreviousMonthExpense[0]?.value?.toFixed(2) ?? 0.0;

      // voucher section

      const PendingOrders = vouchers?.filter(
        (a) => a.voucherType == 'Purchase Order' && a.status == 'Pending'
      );
      this.PurchaseOrderCount = PendingOrders?.length;

      const PendingRequisition = vouchers?.filter(
        (a) => a.voucherType == 'Purchase Requisition' && a.status == 'Pending'
      );
      this.PurchaseRequisitionCount = PendingRequisition?.length;

      const ApprovedOrders = vouchers?.filter(
        (a) => a.voucherType == 'Purchase Order' && a.status == 'Approved'
      );
      this.ApprovedOrdersCount = ApprovedOrders?.length;

      this.cdr.detectChanges();
    });
  }

  getBankDetail(type) {
    this.Form.controls['Type'].setValue(type);

    this.dashbaordServce
      .GetDashboardBankBalance(this.Form.value)
      .subscribe((response: ApiResponse<any>) => {
        if (type == 'Bank_Balance') {
          this.BankBalance = response.result;
        } else if (type == 'Main_Cash') {
          this.mainCash = response.result;
        }
      });
  }
  OnChartChangeEvent(event, choice) {
    //
    let startpDate: any;
    let endpDate: any;
    const date = new Date();

    if (event == null || event.currentTarget.textContent == 'Current Month') {
      const firstDay = this.GetFirstDayOfMonth(
        date.getFullYear(),
        date.getMonth()
      );
      const lastDay = this.GetLastDayOfMonth(
        date.getFullYear(),
        date.getMonth()
      );
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    } else if (event.currentTarget.textContent == 'Financial Year') {
      startpDate = this.GetDate(this.financialStartpDate);
      endpDate = this.GetDate(this.financialEndpDate);
    } else if (event.currentTarget.textContent == 'Previous Week') {
      var beforeOneWeek = new Date(date.getTime() - 60 * 60 * 24 * 7 * 1000);
      var beforeOneWeek2 = new Date(beforeOneWeek);
      let day = beforeOneWeek.getDay();
      let diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
      let firstDay = new Date(beforeOneWeek.setDate(diffToMonday));
      let lastDay = new Date(beforeOneWeek2.setDate(diffToMonday + 6));
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    } else if (event.currentTarget.textContent == 'Current Week') {
      // ✅ Get the first day of the current week (Sunday)
      const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));

      // ✅ Get the last day of the current week (Saturday)
      const lastDay = new Date(
        date.setDate(date.getDate() - date.getDay() + 6)
      );
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    } else if (event.currentTarget.textContent == 'Previous Month') {
      const firstDay = this.GetFirstDayOfMonth(
        date.getFullYear(),
        date.getMonth() - 1
      );
      const lastDay = this.GetLastDayOfMonth(
        date.getFullYear(),
        date.getMonth() - 1
      );
      startpDate = this.GetDate(firstDay);
      endpDate = this.GetDate(lastDay);
    }
    this.Form.controls['Type'].setValue(choice);
    this.Form.controls['StartDate'].setValue(null);
    this.Form.controls['EndDate'].setValue(null);
    this.dashbaordServce
      .GetDashboardChart(this.Form.value)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          if ((choice = 'INC_EXP')) {
          } else if ((choice = 'SALES')) {
          } else if ((choice = 'ACCOUNT_GRP')) {
          } else if ((choice = 'PURCHASE')) {
          }
        }
      });
  }

  GetLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0);
  }

  GetFirstDayOfMonth(year, month) {
    return new Date(year, month, 1);
  }

  GetDate(Date: Date) {
    var dd = String(Date.getDate()).padStart(2, '0');
    var mm = String(Date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = Date.getFullYear();

    let returnpDate = yyyy + '-' + mm + '-' + dd;
    return returnpDate;
  }

  GetFinancialYear() {
    this.misService
      .GetFinancialYearResponse()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result != null) {
          this.financialStartpDate = response.result.financialPeriodsStartpDate;
          this.financialEndpDate = response.result.financialPeriodsEndpDate;
        }
      });
  }

  RouterNavigate(type, status) {
    window.sessionStorage.setItem('type', type);
    window.sessionStorage.setItem('status', status);
    this.router.navigate([`/procurement/po-approval`], {
      queryParams: {
        menu: 184,
      },
    });
  }
}
