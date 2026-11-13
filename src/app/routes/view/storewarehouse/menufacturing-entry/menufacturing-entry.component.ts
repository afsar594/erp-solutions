import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  SelectItem,
} from 'primeng';
import {
  DepartmentMaster,
  ChartofAccounts,
  ItemMaster,
} from 'src/app/routes/domain';
import { CustomerMaster } from 'src/app/routes/domain/Masters/CustomerMaster';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { FileSaverService } from 'src/app/routes/service/FileSaverService/file-saver.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { defaults } from 'src/app/shared/service/settings';
import { StationMaster } from '../../../domain/Administration/StationMaster';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import {
  ManufactureItemDetail,
  menufacturingEntry,
} from 'src/app/routes/domain/Store/menufacturingEntry';
import { manufactureListDetails } from 'src/app/routes/domain/Store/manufactureListDetails';
@Component({
  selector: 'app-menufacturing-entry',
  templateUrl: './menufacturing-entry.component.html',
  styleUrls: ['./menufacturing-entry.component.scss'],
})
export class MenufacturingEntryComponent implements OnInit {
  displayPrintPreview: boolean = false;
  currentIndex: number = 0;
  ScreenId: number;
  Permission: any;
  // savedmenufacturingEntry: menufacturingEntry;
  // departmentList: any;

  constructor(
    private router: Router,
    private activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmation: ConfirmationService,
    private permission: PermissionsService,
    private masterApi: MasterApiService,
    private printService: FileSaverService,
    private utilityService: UtilityService,
    private stockApi: StockApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
    this.showCustomerList = false;
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
  }

  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  breadcumbmodel: MenuItem[];

  customerList: Array<CustomerMaster>;
  customerArry: any[] = [];
  dataset: any;
  selectedJob: string;
  showCustomerList: boolean;
  cols: Array<any> = [];
  licensekey: string;
  response: any;
  subtitle: string;
  menufacturingEntryGroup: FormGroup;
  menufacturingEntry?: menufacturingEntry;
  menufacturingEntryarry: menufacturingEntry[] = [];

  menufacturingEntry_Entry: Handsontable.GridSettings;
  title: string;
  selectedCustomer: any;
  customerDesc: boolean;
  voucherNumber: any;
  hotid = 'menufacturingEntry';

  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];

  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];
  departmentList: Array<DepartmentMaster>;
  departmentArray: DepartmentMaster[] = [];
  departmentLists: SelectItem[] = [];
  departmentArry: string[] = [];

  accountArray: ChartofAccounts[] = [];
  acctArry: string[] = [];
  accountList: SelectItem[];

  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];

  ///////   New Vars   /////////
  itemList: Array<any> = [];
  itemListcols: Array<any> = [];
  menufacturingEntryListcols: Array<any> = [];
  menufacturingEntryList: Array<any> = [];
  showmenufacturingEntryList: boolean = false;
  showEditListing: boolean = false;
  showItemList: boolean = false;
  showUnitList: boolean = false;
  hotRegisterer: HotTableRegisterer = new HotTableRegisterer();

  unitListcols: Array<any> = [];
  stockEditListcols: Array<any> = [];
  selectedUnit: UnitMaster;
  selectedItem: any;
  user: any;
  updatedQuantity: number = 0;

  ngOnInit(): void {
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
    });
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.user = this.permission.getUser();
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

    this.menufacturingEntryGroup = new FormGroup({
      menufacturingEntryNo: new FormControl({ value: '', disabled: true }),
      menufacturingEntryStDate: new FormControl({ value: '', disabled: true }),
      menufacturingEntryCustomer: new FormControl({
        value: '',
        disabled: true,
      }),
      menufacturingEntryJobId: new FormControl({ value: '', disabled: true }),
      menufacturingEntryLocationIdFrom: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      menufacturingEntryLocationIdTo: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      menufacturingEntryUserId: new FormControl({ value: '', disabled: true }),
      menufacturingEntryApprovedBy: new FormControl({
        value: '',
        disabled: true,
      }),
      menufacturingEntryNarration: new FormControl({
        value: '',
        disabled: true,
      }),
    });
    this.customerDesc = true;
    this.cols = [
      { field: 'customerTitle', header: 'Title' },
      { field: 'customerName', header: 'Name' },
      { field: 'customerEmail', header: 'Email Address' },
      { field: 'customerContact', header: 'Contact No.' },
    ];
    this.itemListcols = [
      { field: 'item_Master_Batch_Code', header: 'Item Code' },
      { field: 'item_Master_Part_No', header: 'Part No' },
      { field: 'item_Master_Barcode', header: 'Bar Code' },
      { field: 'item_Master_Item_Name', header: 'Item Name' },
      { field: 'stock', header: 'Stock' },
    ];
    this.unitListcols = [
      { field: 'unitMasterUnitId', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];
    this.stockEditListcols = [
      { field: 'menufacturingEntryId', header: 'ID' },
      { field: 'menufacturingEntryVoucherNo', header: 'Voucher No' },
      { field: 'menufacturingEntryStDate', header: 'Date' },
      { field: 'menufacturingEntryLocationIdFrom', header: 'Location From' },
      { field: 'menufacturingEntryLocationIdTo', header: 'Location To' },
      { field: 'menufacturingEntryUserId', header: 'User' },
      { field: '', header: 'Actions' },
    ];
    this.menufacturingEntryListcols = [
      { field: 'menufacturingEntryId', header: 'ID' },
      { field: 'menufacturingEntryVoucherNo', header: 'Voucher No' },
      { field: 'menufacturingEntryStDate', header: 'Date' },
      { field: 'menufacturingEntryLocationIdFrom', header: 'Location From' },
      { field: 'menufacturingEntryLocationIdTo', header: 'Location To' },
      { field: 'menufacturingEntryUserId', header: 'User' },
    ];
    this.initializeControls();
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    //console.log("customer##", this.selectedCustomer)
    // this.customerList?.find(j => j.customerMasterCustomerNo === customer.customerMasterCustomerNo)?.customerMasterCustomerName;
    // .map(ar => ar.customerMasterCustomerName?.trim() + '|' + ar.customerMasterCustomerNo);
    // this.menufacturingEntry.customer = customer.customerMasterCustomerName;
    this.menufacturingEntryGroup.controls[
      'menufacturingEntryCustomer'
    ].setValue(customer.customerMasterCustomerName);

    this.menufacturingEntryGroup.controls['menufacturingEntryUserId'].setValue(
      customer.customerMasterCustomerNo
    );
    this.showCustomerList = false;
    this.customerDesc = false;
  }

  initializeControls() {
    this.menufacturingEntry_Entry = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: undefined,
      minRows: 3,
      width: '100%',
      height: 150,
      rowHeights: 23,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      afterChange: (changes, source) => {
        let x = changes;
        if (x != null && x[0][1] === 'quantity') {
          this.updatedQuantity = parseInt(String(x[0][3]));
        }
      },
      beforeOnCellMouseUp: (event, coords, TD) => {
        if (coords.col.valueOf() === 0) {
          // this.createNew();
          this.showItemList = true;
        } else if (coords.col.valueOf() === 3) {
          this.showUnitList = true;
        }
      },
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      hiddenColumns: {
        columns: [],
        indicators: false,
      },
      columns: [
        {
          data: 'itemId',
          type: 'numeric',
        },
        {
          data: 'code',
          type: 'numeric',
        },
        {
          data: 'des',
          type: 'text',
        },
        {
          data: 'quantity',
          type: 'numeric',
        },
        {
          data: 'unit',
          type: 'text',
        },

        {
          data: 'Price',
          type: 'numeric',
        },
        {
          data: 'ammount',
          type: 'numeric',
        },
        {
          data: 'remarks',
          type: 'numeric',
        },
      ],
      colHeaders: [
        this.translate.instant('Item Id'),
        this.translate.instant('Code'),
        this.translate.instant('Description'),
        this.translate.instant('Quantity'),
        this.translate.instant('Unit'),
        this.translate.instant('Price'),
        this.translate.instant('Amount'),
        this.translate.instant('Remarks'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };

    this.menufacturingEntry_Entry.afterValidate = (
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
    this.menufacturingEntry_Entry.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      this.currentIndex = row;
      var x = this.hotRegisterer
        .getInstance(this.hotid)
        .getDataAtCell(row, column);
    };
    this.menufacturingEntry_Entry.beforeChangeRender = (change, source) => {
      // console.log(change)
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);
      var data = hotinstance.getDataAtRow(change[0][0]);

      if (change != null) {
        if (data[4] != null && data[5] != null) {
          var totalSum = data[4] * data[5];
          this.hotRegisterer
            .getInstance(this.hotid)
            .setDataAtCell(change[0][0], 6, totalSum);
        }
      }

      // this.ColumnSum();

      // this.GetTotal();
    };

    // this.menufacturingEntry_Entry.data = this.hotRegisterer.getInstance(this.hotid).getData();
  }
  getVoucherNumber() {
    this.stockApi.getVoucherNumber().subscribe((response: any) => {
      this.voucherNumber = response; //vouchersNumbersVNoNu
      // console.log(this.voucherNumber);
      this.menufacturingEntryGroup.controls['VoucherNo'].setValue(
        this.voucherNumber[0].vouchersNumbersVNoNu + 1
      );
    });
  }

  /////done/////
  createNew() {
    this.menufacturingEntryGroup.reset();
    this.menufacturingEntryGroup.enable();
    this.menufacturingEntryGroup
      .get('menufacturingEntryStDate')
      .setValue(new Date());

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.menufacturingEntry_Entry.data = [];
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.menufacturingEntry_Entry);
    // this.hotRegisterer.getInstance(this.hotid).clear();
    // this.hotRegisterer.getInstance(this.hotid).updateSettings(this.salesvoucher_entry);
  }

  selectItem(item: any) {
    //console.log('Select Item : ', item);
    this.selectedItem = item;

    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot.setDataAtCell(this.currentIndex, 0, item.item_Master_Item_Id);
    hot.setDataAtCell(this.currentIndex, 1, item.item_Master_Part_No);
    hot.setDataAtCell(this.currentIndex, 2, item.item_Master_Item_Name);
    hot.setDataAtCell(this.currentIndex, 5, item.itemMasterLastPurchasePrice);
    this.showItemList = false;
    if (this.currentIndex > 1) {
      hot.alter('insert_row', this.currentIndex + 1, 1);
    }
    // this.selectedItem = x;
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: [x] });
  }

  getAllJobs() {
    this.masterApi.GetJobMaster().subscribe((k) => {
      this.jobArray = k?.result;
      //console.log(k);
      this.jobList = k?.result.map((kl) => ({
        label: kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = k?.result.map((ar) => ar.jobMasterJobName?.trim());
      //console.log(this.jobArray);
    });
  }

  getAllLocation() {
    this.masterApi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      //console.log(k);

      this.locationList = k?.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationArry = k?.map((ar) => ar.locationMasterLocationName);
    });
  }

  // getAllAccount() {

  //   this.accountapi.GetAllAcounts().subscribe(k => {
  //     this.accountArray = k?.result;
  //     this.accountList = k?.result?.filter(v => v.maRelativeNo?.trim())
  //       .map((kl) => ({ label: kl.maAccName, value: kl.maAccNo }));
  //     this.accountList.unshift({ label: '--Select--', value: -1 });
  //     this.acctArry = k?.result.map(ar => ar.maAccName?.trim());
  //   });
  // }

  getAllItemMaster() {
    this.masterApi.GetAllItemNotGroup().subscribe((k) => {
      this.ItemMasterArray = k?.result;
      this.ItemMasterList = k?.result.map((kl) => ({
        label: kl?.itemMasterItemName,
        value: kl?.itemMasterItemId,
      }));
      this.ItemMasterList.unshift({ label: '--Select Item--', value: -1 });
      this.ItemMasterArry = k?.result.map(
        (ar) => ar?.itemMasterItemName?.trim() + '|' + ar?.itemMasterItemId
      );
    });
  }

  getAllUnit() {
    this.masterApi.GetAllUnit().subscribe((data: any) => {
      //console.log('Unit : ', data);
      this.unitList = data;
    });
  }

  getAllDepartments() {
    this.masterApi.GetAllDepartment().subscribe((k) => {
      this.departmentArray = k;
      this.departmentLists = k.map((kl) => ({
        label: kl.departmentMasterDepartmentName,
        value: kl.departmentMasterDepartmentName,
      }));
      this.departmentLists.unshift({
        label: '--Select department--',
        value: -1,
      });
      this.departmentArry = k?.map(
        (ar) =>
          ar.departmentMasterDepartmentName?.trim() +
          '|' +
          ar.departmentMasterDepartmentId
      );
    });
  }

  selectUnit(item) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot.setDataAtCell(this.currentIndex, 3, item.unitMasterUnitShortName);
    this.selectedUnit = item;
    // this.selectedItem.unit = this.selectedUnit.unitMasterUnitFullName
    // this.hotRegisterer.getInstance(this.hotid).updateSettings({ data: this.selectedItem });
    this.showUnitList = false;
    // }
  }

  /////done/////
  showAllCustomers() {
    this.masterApi.GetAllCustomer().subscribe((data) => {
      this.customerList = data;
    });
    this.showCustomerList = true;
  }
  menufacturingEntryStDate: any;

  onSave() {
    const savedData: any = this.menufacturingEntry_Entry.data?.filter((k) =>
      k?.hasOwnProperty('materialName')
    );
    const menufacturingEntry: menufacturingEntry = this.menufacturingEntryGroup
      .value as menufacturingEntry;
    menufacturingEntry.manufactureItemsMasterDetails = savedData
      ?.filter((k) => k.hasOwnProperty('materialName'))
      .map((k: any) => {
        return {
          mI_Details_VocherNo:
            this.menufacturingEntryGroup.getRawValue().menufacturingEntryNo,
          // miD_Id_N: number;
          // mI_Id_N: number;
          miD_ItemId_N: k.itemId,
          miD_Description_V: k.des,
          miD_UnitId_N:
            this.unitArray?.find(
              (x) =>
                x?.unitMasterUnitShortName?.trim() === (k.unit?.trim() || '')
            )?.unitMasterUnitId || null,

          miD_QTY_N: k.quantity,
          miD_Price_N: k.Price,
          // miD_DelQty_N: number;
          miD_Amt_N: k.ammount,
          miD_Remarks_V: k.remarks,
          // menufacturingEntryDetailsMaterialId: k.code,
          // menufacturingEntryDetailsQty: k.quantity,
          // menufacturingEntryDetailsRate: k.costPrice,
          // menufacturingEntryDetailsRemarks: k.remarks,
          // menufacturingEntryDetailsUnitId:
        };
      });

    // if (this.btnFlag.update) {
    //   deletedGridData = this.menufacturingEntry?.ManufactureItemsMasterDetails?.filter((k) => {
    //     if (!(menufacturingEntry.ManufactureItemsMasterDetails
    //       .some(l => l.menufacturingEntryDetailsStid === k?.menufacturingEntryDetailsStid))) {
    //       k.menufacturingEntryDetailsDelStatus = true;
    //       return k;
    //     }
    //   });
    //   if (deletedGridData?.length > 0) {
    //     menufacturingEntry.ManufactureItemsMasterDetails.push(...deletedGridData);
    //   }

    // }

    // if (this.btnFlag.save) {
    //   this.savemenufacturingEntry(menufacturingEntry);
    // } else {
    //   this.updatemenufacturingEntry(menufacturingEntry);
    // }
  }

  // savemenufacturingEntry(menufacturingEntry: menufacturingEntry) {
  //   if (this.menufacturingEntryGroup.valid) {
  //     this.confirmation.confirm({
  //       key: 'confirm-key',
  //       message: 'Do you want to update existing voucher?',
  //       accept: () => {
  //         this.stockApi.sa(menufacturingEntry).subscribe((data) => {
  //           this.btnFlag = { edit: true, cancel: false, save: false, update: true, delete: true };
  //           this.updateFormGrid(data.result);
  //           this.messageService.add({ severity: 'success', summary: 'Alert', detail: ' Updated Succesfully' });
  //         }, (err) => {
  //           this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Update Failed' });
  //         });
  //       }
  //     });
  //   } else {
  //     // const msg1 = 'Please fill mandatory fields';
  //     // const msg2 = 'Please fill Empyt Debit account details';
  //     this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
  //     this.menufacturingEntryGroup.markAllAsTouched();
  //     this.menufacturingEntryGroup.markAsDirty();
  //   }
  // }

  // updatemenufacturingEntry(menufacturingEntry: menufacturingEntry) {
  //   if (this.menufacturingEntryGroup.valid) {
  //     this.confirmation.confirm({
  //       key: 'confirm-key',
  //       message: 'Do you want to update existing voucher?',
  //       accept: () => {
  //         this.stockApi.UpdatemenufacturingEntry(menufacturingEntry).subscribe((data) => {
  //           this.btnFlag = { edit: true, cancel: false, save: false, update: true, delete: true };
  //           this.updateFormGrid(data.result);
  //           this.messageService.add({ severity: 'success', summary: 'Alert', detail: ' Updated Succesfully' });
  //         }, (err) => {
  //           this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Update Failed' });
  //         });
  //       }
  //     });
  //   } else {
  //     // const msg1 = 'Please fill mandatory fields';
  //     // const msg2 = 'Please fill Empyt Debit account details';
  //     this.messageService.add({ severity: 'error', summary: 'Alert', detail: 'Please fill mandatory fields' });
  //     this.menufacturingEntryGroup.markAllAsTouched();
  //     this.menufacturingEntryGroup.markAsDirty();
  //   }
  // }

  updateFormGrid(menufacturingEntry_update: any) {
    this.menufacturingEntryGroup.patchValue({
      menufacturingEntryId: menufacturingEntry_update?.menufacturingEntryId,
      menufacturingEntryNo: menufacturingEntry_update?.menufacturingEntryNo,
      menufacturingEntryVoucherNo:
        menufacturingEntry_update?.menufacturingEntryVoucherNo,
      menufacturingEntryLocationIdFrom:
        menufacturingEntry_update?.menufacturingEntryLocationIdFrom,
      menufacturingEntryLocationIdTo:
        menufacturingEntry_update?.menufacturingEntryLocationIdTo,
      menufacturingEntryApprovedBy:
        menufacturingEntry_update?.menufacturingEntryApprovedBy,
      menufacturingEntryStDate: new Date(
        menufacturingEntry_update?.menufacturingEntryStDate
      ),
      menufacturingEntryCustomer:
        menufacturingEntry_update && this.customerList
          ? this.customerList?.find(
              (j) =>
                j.customerMasterCustomerNo ===
                menufacturingEntry_update.menufacturingEntryUserId
            )?.customerMasterCustomerName
          : null,
      menufacturingEntryJobId: this.jobArray?.find(
        (j) =>
          j.jobMasterJobId == menufacturingEntry_update?.menufacturingEntryJobId
      )?.jobMasterJobName,
    });

    const gridData: any =
      menufacturingEntry_update.menufacturingEntryDetails.map((k) => {
        const ItemId =
          k?.menufacturingEntryDetailsMaterialId != null
            ? this.ItemMasterList?.find(
                (l) => l.value == k?.menufacturingEntryDetailsMaterialId
              )?.label
            : null;
        const UnitId =
          k?.menufacturingEntryDetailsUnitId != null
            ? this.unitList?.find(
                (l) => l.value == k?.menufacturingEntryDetailsUnitId
              )?.label
            : null;

        return {
          materialName: ItemId,
          unit: UnitId,
          // id: k?.menufacturingEntryDetailsStid,
          code: k?.menufacturingEntryDetailsMaterialId,
          quantity: k?.menufacturingEntryDetailsQty,
          costPrice: k?.menufacturingEntryDetailsRate,
          remarks: k?.menufacturingEntryDetailsRemarks,
        };
      });

    this.menufacturingEntry_Entry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.menufacturingEntryGroup.disable();
    // this.f?.menufacturingEntryNo.clearValidators();
    // this.menufacturingEntryFormGroup.updateValueAndValidity();
  }

  cancelAll() {
    this.menufacturingEntryGroup.reset();
    this.btnFlag.cancel = true;
    this.btnFlag.edit = true;
    this.btnFlag.save = true;
    this.menufacturingEntryGroup.controls['VoucherDate'].setValue(
      new Date(new Date().setFullYear(new Date().getFullYear()))
    );
  }

  get f() {
    return this.menufacturingEntryGroup.controls;
  }

  displayPrint() {
    this.displayPrintPreview = true;
  }

  userTrackingLog(type) {
    let req = {
      page: 'MenufacturingEntry',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.menufacturingEntryGroup.get('menufacturingEntryNo').value,
      vpType: 'MenufacturingEntry',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }

  printAsPDF() {
    let html: any = document.getElementById('print');
    this.printService.saveAsPDF(html);
    this.userTrackingLog('PDF');
  }

  stationmasterArray: Array<StationMaster> = [];
  stationmasterObj: StationMaster;
  displayMaximizeable: boolean = false;

  getAllStationMaster() {
    this.masterApi.getAllStationMaster().subscribe((response) => {
      this.stationmasterObj = response[0];
    });
  }
}
interface GridData {
  code?: string;
  partno?: number;
  materialName?: string;
  unit?: string;
  quantity?: number;
  costPrice?: number;
  amount?: number;
  remark?: string;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}
