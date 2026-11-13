import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { SelectItem } from 'primeng';
import { ItemMaster, SupplierMaster } from 'src/app/routes/domain';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { ProcurementService } from 'src/app/routes/service/procurement/procurement.service';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-potracking',
  templateUrl: './potracking.component.html',
  styleUrls: ['./potracking.component.scss'],
})
export class PotrackingComponent implements OnInit {
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;

  locationArray: LocationMaster[] = [];
  locationArry: string[] = [];
  locationList: SelectItem[];

  supplierArray: SupplierMaster[] = [];
  supplierList: SelectItem[];
  supplierArry: string[] = [];
  jobList: Array<any>;
  jobarray: Array<any>;
  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  licensekey: any;
  gridHeader: string;
  assetsArray: Array<string>;
  invoiceType: Array<{ value: string }>;
  PTForm: FormGroup;
  index: number = 0;
  hotid = 'PoTracking';
  private hotRegisterer = new HotTableRegisterer();
  PoTracking: Handsontable.GridSettings;
  POType: string = 'GetPurchaseOrderTrackingSummary';

  allowDate: boolean = false;
  poTrackingList: Array<any> = [];
  pOrderList: SelectItem[] = [];
  ScreenId: number;
  Permission: any;
  defaultData: any;
  constructor(
    private activatedroute: ActivatedRoute,
    private masterApi: MasterApiService,
    private procurementApi: ProcurementService,
    private translate: TranslateService,
    private permission: PermissionsService,
    private datePipe: DatePipe,
    private utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      var rights = this.permission.getById(this.ScreenId);

      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Purchase Order Tracking') {
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
    });

    this.procurementApi.POTrackingDropdown().subscribe((m) => {
      //item
      this.ItemMasterArray = m.resultSet.itemMaster;
      this.ItemMasterList = m.resultSet.itemMaster.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: 0 });

      // location
      // this.locationList = m.resultSet.locationMaster?.filter((x) => x.locationMasterLocationStatus != false)
      this.locationArray = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: 0 });

      //supplier
      this.supplierArray = m.resultSet.suppliersMasterr;
      this.supplierList = m.resultSet.suppliersMaster.map((kl) => ({
        label: kl.suppliersMasterSupplierName,
        value: kl.suppliersMasterSupplierId,
      }));
      this.supplierList.unshift({ label: '--Select Supplier--', value: 0 });

      //job
      this.jobarray = m.resultSet.itemMaster;
      this.jobList = m.resultSet.jobMasters.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobList.unshift({ label: '--Select Job--', value: 0 });

      //PO
      this.pOrderList = m.resultSet.purchaseOrder.map((k) => ({
        label: k.purchaseOrderNo,
        value: k.purchaseOrderNo,
      }));
      this.pOrderList.unshift({ label: '--Select Po--', value: 0 });
    });
    this.initializeControls();
    this.PTForm = new FormGroup({
      DateFrom: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      DateTo: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear()))
      ),
      Job: new FormControl(''),
      Supplier: new FormControl(''),
      Item: new FormControl(''),
      Location: new FormControl(''),
      PONumber: new FormControl(''),
      POtype: new FormControl('summary'), // Default value for POtype
      StatusType: new FormControl(''), // Default value for StatusType
      isDate: new FormControl(),
    });
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.bykeys();
  }
  hideJobDetail: boolean = false;
  hideCostCenterDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail,Hide_CostCenter_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );
        const costCenterSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_CostCenter_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;
        this.hideCostCenterDetail =
          costCenterSetting?.programSettingsBoolValue ?? false;
        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }
  updateTableConfiguration() {
    const hiddenColumns = [];

    if (this.hideJobDetail) {
      hiddenColumns.push(7);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  showView(type) {
    this.POType =
      type == 'summary'
        ? 'GetPurchaseOrderTrackingSummary'
        : 'GetPurchaseOrderTrackingDetails';
  }

  initializeControls() {
    const hiddenColumns = [7];
    this.PoTracking = this.utilityService.getTableConfig(
      poTrackingColumnObjList(this),
      hiddenColumns
    );
  }

  getPoTracking() {
    if (
      this.PTForm.controls['PONumber'].value.purchaseOrderNo != null ||
      this.PTForm.controls['PONumber'].value.purchaseOrderNo == ''
    ) {
      var x = this.PTForm.controls['PONumber'].value.purchaseOrderNo;
      this.procurementApi
        .POTrackingBynumber({ purchaseOrderNo: x })
        .subscribe((response: any) => {
          this.poTrackingList = response;
          this.poTrackingList.forEach((element) => {
            element.Deliverystatus = 'Pending';
            element.purchase_Order_PO_Date =
              element?.purchase_Order_PO_Date?.split('T')[0];
          });
          console.log('poTrackingList', this.poTrackingList);
          this.hotRegisterer.getInstance(this.hotid).updateSettings({
            data: this.poTrackingList,
          });
        });
    } else {
      this.procurementApi.getPOTracking().subscribe((response: any) => {
        this.poTrackingList = response;
        this.poTrackingList.forEach((element) => {
          element.Deliverystatus = 'Pending';
          element.purchase_Order_PO_Date =
            element?.purchase_Order_PO_Date?.split('T')[0];
        });
        this.hotRegisterer.getInstance(this.hotid).updateSettings({
          data: this.poTrackingList,
        });
      });
    }
  }
  getPOTrackingNew() {
    if (this.PTForm.get('isDate').value === true) {
      this.defaultData = {
        fromDate: this.PTForm.value.DateFrom,
        toDate: this.PTForm.value.DateTo,
        format: 'string',
        totalCount: 0,
        query: 'string',
        search: 'string',
        costCenter: 'string',
        hideZeroTransactions: true,
        printGroupWise: 'string',
        financialMindate: 'string',
        supplierId: Number(this.PTForm.value.Supplier.suppliersMasterSupplierId)
          ? Number(this.PTForm.value.Supplier.suppliersMasterSupplierId)
          : 0,
        jobId: this.PTForm.value.Job.jobMasterJobId
          ? this.PTForm.value.Job.jobMasterJobId
          : 0,
        status: this.PTForm.value.StatusType,
        locationId: this.PTForm.value?.Location
          ? this.PTForm.value?.Location
          : 0,
        itemId: this.PTForm.value.Item.itemMasterItemId,
        pono: this.PTForm.value.PONumber ? this.PTForm.value.PONumber : '',
        isDateCheck: true,
      };
    } else {
      this.defaultData = {
        fromDate: null,
        toDate: null,
        format: 'string',
        totalCount: 0,
        query: 'string',
        search: 'string',
        costCenter: 'string',
        hideZeroTransactions: true,
        printGroupWise: 'string',
        financialMindate: 'string',
        supplierId: Number(this.PTForm.value.Supplier)
          ? Number(this.PTForm.value.Supplier)
          : 0,
        jobId: this.PTForm.value.Job.jobMasterJobId
          ? this.PTForm.value.Job.jobMasterJobId
          : 0,
        status: this.PTForm.value?.StatusType,
        locationId: this.PTForm.value?.Location
          ? this.PTForm.value?.Location
          : 0,
        itemId: this.PTForm.value?.Item?.itemMasterItemId,
        pono: this.PTForm.value.PONumber ? this.PTForm.value.PONumber : '',
        isDateCheck: false,
      };
    }
    this.procurementApi
      .getPOTrackingNew(this.defaultData, this.POType)
      .subscribe((response: any) => {
        this.poTrackingList = response.result;
        this.poTrackingList.forEach((element) => {
          element.Deliverystatus = 'Pending';
          element.purchase_Order_PO_Date =
            element?.purchase_Order_PO_Date?.split('T')[0];
        });
        this.hotRegisterer.getInstance(this.hotid).updateSettings({
          data: this.poTrackingList,
        });
      });
  }
  // Afsar 3/8/2024 end
  poNumbers: any = [];
  // getAllPONumber() {
  //   this.procurementApi.getAllPONumber().subscribe((response: any) => {
  //     this.poNumbers = response;
  //     console.table(response);
  //   });
  // }

  getAllPONumber() {
    this.procurementApi.GetPurchaseOrder().subscribe((data) => {
      this.pOrderList = data.result.map((k) => ({
        label: k.purchaseOrderNo,
        value: k.purchaseOrderNo,
      }));
    });
  }
  handleChange(e) {
    this.index = e.index;
  }

  get f() {
    return this.PTForm.controls;
  }

  dateRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if (value) {
      const formattedDate = this.datePipe.transform(value, 'dd/MM/yyyy');
      td.innerText = formattedDate ? formattedDate : '';
    } else {
      td.innerText = '';
    }
  }
}
export const poTrackingColumnObjList = (component: PotrackingComponent) => [
  {
    data: 'pono',
    type: 'text',
    label: 'Order#',
    toolTip: 'Purchase Order Number',
  },
  {
    data: 'poDate',
    type: 'date',
    label: 'Order Date',
    toolTip: 'Purchase Order Date',
  },
  {
    data: 'supplier',
    type: 'text',
    label: 'Supplier',
    toolTip: 'Supplier Name',
  },
  {
    data: 'itemId',
    type: 'text',
    label: 'Item Id',
    toolTip: 'Item Identification Number',
  },
  {
    data: 'partNO',
    type: 'text',
    label: 'Part No',
    toolTip: 'Item Part Number',
  },
  {
    data: 'itemName',
    type: 'text',
    label: 'Item Name',
    toolTip: 'Name of the Item',
  },
  {
    data: 'currency',
    type: 'text',
    label: 'Currency',
    toolTip: 'Transaction Currency',
  },
  {
    data: 'jobName',
    type: 'text',
    label: 'Job Name',
    toolTip: 'Associated Job/Project',
  },
  {
    data: 'poQuantity',
    type: 'text',
    label: 'Quantity',
    toolTip: 'Ordered Quantity',
  },
  {
    data: 'balanceQty',
    type: 'text',
    label: 'Balance Qty',
    toolTip: 'Remaining Quantity to be Delivered',
  },
  {
    data: 'deliveredQty',
    type: 'text',
    label: 'Delivered Qty',
    toolTip: 'Quantity Already Delivered',
  },
  {
    data: 'amount',
    type: 'text',
    label: 'Total Amount',
    toolTip: 'Total Order Amount',
  },
  {
    data: 'discountPerc',
    type: 'text',
    label: 'Discount%',
    toolTip: 'Applied Discount Percentage',
  },
  {
    data: 'poStatus',
    type: 'text',
    label: 'Delivery Status',
    toolTip: 'Current Delivery Status',
  },
];
