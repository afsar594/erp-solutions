import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import { MenuItem } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { JobMaster } from 'src/app/routes/domain/Masters/JobMaster';
import { LocationMaster } from 'src/app/routes/domain/Masters/LocationMaster';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { StockAdjustment } from 'src/app/routes/domain/Store/StockAdjustment';
import { StockAdjustmentDetails } from 'src/app/routes/domain/Store/StockAdjustmentDetails';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { StockApiService } from 'src/app/routes/service/stock-api/stock-api.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';

@Component({
  selector: 'app-stock-adjustment',
  templateUrl: './stock-adjustment.component.html',
  styleUrls: ['./stock-adjustment.component.scss'],
})
export class StockAdjustmentComponent implements OnInit {
  confirmDropDatabaseDialogVisible = false;
  btnFlag: ButtonFlag;
  search: string = null;
  index: number = 0;
  displayMaximizable: boolean;
  breadcumbmodel: MenuItem[];
  dataset: any;

  showItemList: boolean = false;
  showUnitList: boolean = false;
  locationArray: LocationMaster[] = [];
  locationList: SelectItem[] = [];
  locationArry: string[] = [];

  conversion_Type: number = 0;

  unitAry: any;
  unitListt: any;
  units: any;
  JOBCOST: boolean = true;
  licensekey: string;
  itemListcols: Array<any> = [];
  itemList: Array<any> = [];
  unitListcols: Array<any> = [];
  DefLocation: string;
  DefLocationCheck: string;
  selectedItem: any;
  currentIndex: number = 0;
  unitArray: UnitMaster[] = [];
  unitArry: string[] = [];
  unitList: SelectItem[];
  jobArray: JobMaster[] = [];
  jobList: SelectItem[] = [];
  jobArry: string[] = [];
  stockAdjustmentarry: any;
  ItemMasterGroupList: SelectItem[];
  // stockAdjustmentarry: StockAdjustment[] = [];
  savedStockAdjustment: any;
  private hotRegisterer = new HotTableRegisterer();
  hotid = 'stockAdjustmentEntry';
  lookupGridColumns: any;
  activeRow: { row: number; column: number };
  ScreenId: number;
  Permission: any;
  user: any;
  showJobList: boolean = false;
  ItemMasterArrayByName: any;
  unitDetailID: any;

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private confirmation: ConfirmationService,
    private masterApi: MasterApiService,
    private translate: TranslateService,
    private masterapi: MasterApiService,
    private stockApi: StockApiService,
    private utilityService: UtilityService,

    private permission: PermissionsService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  title: string;
  stockAdjustmententry: Handsontable.GridSettings;
  StockAdjustmentFormGroup: FormGroup;
  originalData: any;

  cols;

  ngOnInit(): void {
    this.StockAdjustmentFormGroup = this.fb.group({
      stockAdjustmentVoucherSaId: [''],
      stockAdjustmentVoucherSaNo: [''],
      stockAdjustmentVoucherSaDate: [new Date(), [Validators.required]],
      stockAdjustmentVoucherSAAsOnDate: [new Date(), [Validators.required]],

      stockAdjustmentVoucherLocationId: [null],
      stockAdjustmentGroupId: [null],
      stockAdjustmentVoucherSaRemarks: [''],
      stockAdjustmentVoucherFsno: [null],
      stockAdjustmentVoucherStVno: [{ value: null, disabled: true }],
      stockAdjustmentVoucherDelStatus: [null],
      stockAdjustmentVoucherTotAmount: [0],
      stockAdjustmentVoucherTotQty: [0],
    });
    this.StockAdjustmentFormGroup.disable();
    this.cols = [
      // { field: 'stockAdjustmentBarCode', header: 'BarCode'},
      { field: 'stockAdjustmentVoucherSaNo', header: 'VoucherNo' },
      { field: 'stockAdjustmentVoucherSaDate', header: 'Date' },
      // { field: 'locationMasterLocationId', header: 'LoctionId'},
      { field: 'stockAdjustmentVoucherSaRemarks', header: 'Remarks' },
      { field: 'action', header: 'Action' },
    ];

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      list: true,
    };
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

    this.itemListcols = [
      { field: 'itemMasterItemId', header: 'Item Code' },
      { field: 'itemMasterBarcode', header: 'Bar Code' },
      { field: 'itemMasterItemName', header: 'Item Name' },

      // { field: "item_Master_Part_No", header: "Part No" },
      { field: 'itemMasterCurrentStock', header: 'Stock' },
    ];
    this.unitListcols = [
      { field: 'unitMasterUnitId', header: 'Unit Code' },
      { field: 'unitMasterUnitFullName', header: 'Unit Name' },
    ];
    this.initializeControls();

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.bykeys();
  }

  get f() {
    return this.StockAdjustmentFormGroup.controls;
  }

  GetStockByLocation() {
    const id = this.f.stockAdjustmentVoucherLocationId.value;
    const groupId = this.f.stockAdjustmentGroupId.value;
    const date = new Date(this.f.stockAdjustmentVoucherSAAsOnDate.value);
    const formattedDate = date.toISOString().split('T')[0];
    this.stockApi.GetStockByLocation(id, formattedDate).subscribe((m: any) => {
      const gridData: any = m.resultSet.map((k) => {
        const ItemMaster = this.itemList?.find(
          (l) => l.itemMasterItemId == k?.stockRegisterMaterialID
        );

        const jobId = this.jobList?.find(
          (j) => j.value == k?.stockRegisterJobID[0]
        )?.label;
        const UnitId = this.unitListt?.find(
          (l) => l.unitMasterUnitId == k?.stockRegisterUnitID[0]
        )?.unitMasterUnitShortName;
        this.currentIndex + 1;
        return {
          MatId: k?.stockRegisterMaterialID,
          BaseUnit: UnitId,
          MaterialName: ItemMaster?.itemMasterItemName,
          Job: jobId,
          OrignalStock: k.stockRegisterQuantity,
          rate: k.stockRegisterRate,
          groupId: ItemMaster?.itemMasterAccountNo,
        };
      });

      this.stockAdjustmententry.data = gridData;
      this.originalData = gridData;
      this.onItemGroupChange({ value: groupId });
      // this.hotRegisterer
      //   .getInstance(this.hotid)
      //   .updateSettings({ data: gridData });
    });
  }
  hideJobDetail: boolean = false;
  bykeys() {
    this.utilityService
      .getProgramSettings('Hide_Job_Detail')
      .subscribe((res: any) => {
        const jobSetting = res?.find(
          (x) => x.programSettingsKeyValue === 'Hide_Job_Detail'
        );

        this.hideJobDetail = jobSetting?.programSettingsBoolValue ?? false;

        setTimeout(() => {
          this.updateTableConfiguration();
        }, 1000);
      });
  }
  updateTableConfiguration() {
    const hiddenColumns = [10];
    if (this.hideJobDetail) {
      hiddenColumns.push(4);
    }
    this.hotRegisterer.getInstance(this.hotid).updateSettings({
      hiddenColumns: {
        columns: hiddenColumns,
        indicators: true,
      },
    });
  }

  initializeControls() {
    this.stockApi.StockAdjustmentDropdownByLocation().subscribe((m: any) => {
      //job
      this.jobArray = m.resultSet.jobMasters;
      this.jobArry = m.resultSet.jobMasters;
      this.jobList = m.resultSet.jobMasters?.map((kl) => ({
        label: kl.jobMasterJobNumber + ' -- ' + kl.jobMasterJobName,
        value: kl.jobMasterJobId,
      }));
      this.jobArry = m.resultSet.jobMasters.map((ar) =>
        ar.jobMasterJobName?.trim()
      );

      //item
      this.itemList = m.resultSet.itemMaster;
      //location
      this.locationArray = m.resultSet.locationMaster;
      this.locationArry = m.resultSet.locationMaster;
      this.locationList = m.resultSet.locationMaster
        ?.filter((x) => x.locationMasterLocationStatus != false)
        .map((kl) => ({
          label: kl.locationMasterLocationName,
          value: kl.locationMasterLocationId,
        }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      //unit
      this.unitArray = m.resultSet.unitMasters;
      this.unitArry = m.resultSet.unitMasters;
      this.unitList = m.resultSet.unitMasters;
      this.unitListt = m.resultSet.unitMasters;
      this.units = m.resultSet.unitMasters;
      this.ItemMasterGroupList = m.resultSet.itemGroup.map((kl) => ({
        label: kl.itemMasterItemName,
        value: kl.itemMasterItemId,
      }));
    });

    let cols = stockAdjustmentColumnList(this);
    let hiddenColumn = [4, 10];

    this.stockAdjustmententry = this.utilityService.getTableConfig(
      cols,
      hiddenColumn
    );
    (this.stockAdjustmententry.beforeOnCellMouseUp = (event, coords, TD) => {
      this.currentIndex = coords.row;
      if (coords.col.valueOf() === 0) {
        this.showItemList = true;
      } else if (coords.col.valueOf() === 3) {
        const hotinstance = this.hotRegisterer.getInstance(this.hotid);
        var data = hotinstance.getDataAtRow(coords.row);
        this.masterapi.GetUnitDetails(data[0]).subscribe((res) => {
          this.unitArray = res.result;
          this.unitList = res.result;
          this.unitArry = res.result.map((ar) =>
            ar.unitMasterUnitShortName?.trim()
          );
          this.showUnitList = true;
        });
      } else if (coords.col.valueOf() === 4) {
        this.showJobList = true;
      }
    }),
      (this.stockAdjustmententry.afterSelection = (
        row,
        column,
        row2,
        column2,
        preventScrolling,
        selectionLayerLevel
      ) => {
        this.currentIndex = row;
        this.ColumnSum();
      });
    this.stockAdjustmententry.beforeChangeRender = (changes, source) => {
      const hotinstance = this.hotRegisterer.getInstance(this.hotid);

      if (changes) {
        changes.forEach(([row, prop, oldValue, newValue]) => {
          if (row === this.currentIndex) {
            var data = hotinstance.getDataAtRow(changes[0][0]);
            const column5 = parseFloat(data[5]);
            const column6 = parseFloat(data[6]);

            if (
              data[5] != null &&
              data[6] != null &&
              (changes[0][1] == 'CurrentStock' || changes[0][1] == 'rate')
            ) {
              const sum = column6 - column5;

              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 7, sum);

              const amt = sum * (data[8] ? data[8] : 0);
              this.hotRegisterer
                .getInstance(this.hotid)
                .setDataAtCell(changes[0][0], 9, amt);
              this.ColumnSum();
            }
          }
          this.ColumnSum();
        });
      }
    };

    this.stockAdjustmententry.afterRemoveRow = (
      index: number,
      amount: number
    ) => {
      this.ColumnSum();
    };
  }
  selectJOb(job) {
    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.currentIndex, 4, job.jobMasterJobName);

    this.hotRegisterer
      .getInstance(this.hotid)
      .setDataAtCell(this.currentIndex, 10, job.jobMasterJobId);
    this.showJobList = false;
  }

  ColumnSum() {
    //
    var amt = 0;
    this.stockAdjustmententry.data.forEach((elemt: any) => {
      if (elemt.rate && elemt.Adjustment) {
        amt += elemt.rate ? elemt.Adjustment * elemt.rate : 0;
      }
    });
    amt = parseFloat(amt.toFixed(2));
    this.StockAdjustmentFormGroup.controls.stockAdjustmentVoucherTotAmount.setValue(
      amt
    );

    var value = 0;
    this.stockAdjustmententry.data.forEach((elemt: any) => {
      if (elemt && elemt.Adjustment) {
        value += elemt.Adjustment;
      }
    });
    value = parseFloat(value.toFixed(2));
    this.StockAdjustmentFormGroup.controls.stockAdjustmentVoucherTotQty.setValue(
      value
    );

    // this.GetTotal();
  }
  getStockItemsList() {
    this.stockApi.getStockItemsList().subscribe((data: any) => {
      this.itemList = data.result;
    });
  }

  getAllLocation() {
    this.masterapi.GetAllLocation().subscribe((k) => {
      this.locationArray = k;
      this.locationList = k.map((kl) => ({
        label: kl.locationMasterLocationName,
        value: kl.locationMasterLocationId,
      }));
      this.locationList.unshift({ label: '--Select Location--', value: -1 });
      this.locationArry = k.map((ar) => ar.locationMasterLocationName?.trim());
    });
  }

  cancelAll() {
    this.StockAdjustmentFormGroup.reset();
    this.btnFlag.cancel = true;
    this.btnFlag.edit = true;
    this.btnFlag.save = true;
    // this.StockAdjustmentFormGroup.controls["VoucherDate"].setValue(new Date(new Date().setFullYear(new Date().getFullYear())));
  }

  onItemGroupChange(event: any): void {
    const filterData = this.originalData?.filter(
      (i) => i.groupId == event.value
    );
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: filterData });
  }

  saveStockAdjustment() {
    this.StockAdjustmentFormGroup.markAllAsTouched();

    const savedData: any[] = this.stockAdjustmententry.data?.filter(
      (k) => k.hasOwnProperty('MatId') && k.hasOwnProperty('CurrentStock')
    );
    const stockAdjustment: StockAdjustment = this.StockAdjustmentFormGroup
      .value as StockAdjustment;
    (stockAdjustment.stockAdjustmentVoucherSaId =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaId),
      (stockAdjustment.stockAdjustmentVoucherSaNo =
        this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaNo);
    stockAdjustment.stockAdjustmentVoucherSaDate =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaDate;
    stockAdjustment.stockAdjustmentVoucherSAAsOnDate =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSAAsOnDate;

    stockAdjustment.stockAdjustmentVoucherSaRemarks =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherSaRemarks;
    (stockAdjustment.stockAdjustmentVoucherFsno = 456),
      (stockAdjustment.stockAdjustmentVoucherStVno =
        this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherStVno);
    stockAdjustment.stockAdjustmentVoucherLocationId =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherLocationId;
    (stockAdjustment.stockAdjustmentVoucherDelStatus = false),
      (stockAdjustment.stockAdjusmentVoucherTotQty =
        this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherTotQty);
    stockAdjustment.stockAdjusmentVoucherTotAmount =
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentVoucherTotAmount;
    stockAdjustment.stockAdjustmentVoucherDetails = savedData
      ?.filter((k) => k.MatId != null)
      .map((k: any) => {
        const UnitId = this.unitListt?.find(
          (l) => l.unitMasterUnitShortName?.trim() == k?.BaseUnit
        )?.unitMasterUnitId;
        return {
          stockAdjustmentVoucherDetailsDetId: 0,
          stockAdjustmentVoucherDetailsSaNo: null,
          stockAdjustmentVoucherDetailsMaterialId: k?.MatId,
          stockAdjustmentVoucherDetailsManualQty: k.OrignalStock,
          stockAdjustmentVoucherDetailsAdjQty: k?.Adjustment,
          stockAdjustmentVoucherDetailsLocationId:
            this.StockAdjustmentFormGroup.getRawValue()
              .stockAdjustmentVoucherLocationId,
          stockAdjustmentVoucherDetailsJobId: k.Jobid ?? -1,

          stockAdjustmentVoucherDetailsSaId: null,
          stockAdjustmentVoucherDetailsCosePrice: k?.rate,
          stockAdjustmentVoucherDetailsIsEdit: false,
          stockAdjustmentVoucherDetailsUnitId: UnitId,
          stockAdjustmentVoucherDetailsBatchCode: null,
          stockAdjustmentVoucherDetailsExpDate: null,
          stockAdjustmentVoucherDetailsDelStatus: false,
        };
      });

    if (this.btnFlag.save) {
      this.saveAdjustment(stockAdjustment);
    } else {
      this.updateAdjustment(stockAdjustment);
    }
  }

  saveAdjustment(StockAdjustment: StockAdjustment) {
    if (this.StockAdjustmentFormGroup.valid && this.IsValidGrid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to save voucher?',
        accept: () => {
          this.stockApi.InsertStockAdjustment(StockAdjustment).subscribe(
            (data: any) => {
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: true,
              };
              this.savedStockAdjustment = data.result;
              this.updateFormGrid(data.result);
              if (data.valid) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: data.message,
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
                detail: 'Stock Adjustment Save Failed',
              });
            }
          );
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.StockAdjustmentFormGroup.markAllAsTouched();
      this.StockAdjustmentFormGroup.markAsDirty();
    }
  }

  updateAdjustment(stockAdjustment: any) {
    if (this.StockAdjustmentFormGroup.valid) {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to update existing voucher?',
        accept: () => {
          this.stockApi.UpdateStockAdjustment(stockAdjustment).subscribe(
            (data: any) => {
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
                detail: 'Stock Adjustment Updated Succesfully',
              });
            },
            (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: 'Stock Adjustment Update Failed',
              });
            }
          );
        },
      });
    } else {
      // const msg1 = 'Please fill mandatory fields';
      // const msg2 = 'Please fill Empyt Debit account details';
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Please fill mandatory fields',
      });
      this.StockAdjustmentFormGroup.markAllAsTouched();
      this.StockAdjustmentFormGroup.markAsDirty();
    }
  }

  getAllStockAdjustment() {
    this.stockApi.GetAllStockAdjustment().subscribe((data: any) => {
      this.stockAdjustmentarry = data.result;
    });
  }

  selectItem(item: any) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    this.selectedItem = item;

    this.masterapi
      .GetItemMasterById({ id: item?.itemMasterItemId })
      .subscribe((k) => {
        this.ItemMasterArrayByName = k.resultSet?.itemMaster;
        const hotInstance = this.hotRegisterer.getInstance(this.hotid);

        const unitDetails = this.ItemMasterArrayByName.unitDetails;
        this.unitDetailID = unitDetails?.unitDetailsId;
        if (unitDetails) {
          const unitId = unitDetails.unitDetailsUnitId;
          const unitLabel =
            unitId != null
              ? this.unitListt?.find((l) => l.unitMasterUnitId == unitId)
                  ?.unitMasterUnitShortName
              : null;

          hotInstance.setDataAtCell(
            this.currentIndex,
            0,
            this.ItemMasterArrayByName.itemMasterItemId
          );
          hot.setDataAtCell(this.currentIndex, 2, item?.itemMasterItemName);
          hotInstance.setDataAtCell(
            this.currentIndex,
            2,
            this.ItemMasterArrayByName.itemMasterItemName
          );
          hotInstance.setDataAtCell(this.currentIndex, 3, unitLabel);
          hotInstance.setDataAtCell(
            this.currentIndex,
            5,
            this.ItemMasterArrayByName.currentItemStock
          ); // Stock

          this.hotRegisterer
            .getInstance(this.hotid)
            .selectCell(this.currentIndex, 6);
        }
      });

    this.showItemList = false;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  newForm() {
    this.StockAdjustmentFormGroup.reset();
    this.stockAdjustmententry.data = [];
    this.stockAdjustmententry.readOnly = false;
    this.StockAdjustmentFormGroup.get(
      'stockAdjustmentVoucherSAAsOnDate'
    ).setValue(new Date());
    this.StockAdjustmentFormGroup.get('stockAdjustmentVoucherSaDate').setValue(
      new Date()
    );
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      list: true,
    };
    this.GetDefaultSettings();
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings(this.stockAdjustmententry);

    this.search = null;
    this.index = 0;
    this.StockAdjustmentFormGroup.enable();
    // this.f.stockTransferVoucherNo.clearValidators();
    this.updateTableConfiguration();
    this.StockAdjustmentFormGroup.updateValueAndValidity();
  }

  LOCKlOCATION: boolean = false;
  GetDefaultSettings() {
    this.masterapi.GetProgramSettingsDropdown().subscribe((m) => {
      let list = m.resultSet.generalSettings;
      //location
      var DEFAULT_LOCATION = list?.filter(
        (a) => a.generalSettingsKeyValue == 'DEFAULT_LOCATION'
      );

      if (DEFAULT_LOCATION != null) {
        this.DefLocationCheck = DEFAULT_LOCATION[0].generalSettingsTextValue;
        if (this.DefLocationCheck !== null) {
          const splitText = this.DefLocationCheck.split('::');
          this.DefLocation = splitText[1]?.trim();
          var userLocation = list?.filter(
            (a) => a.generalSettingsKeyValue == 'USER_LOCK_LOCATION'
          );
          this.LOCKlOCATION = userLocation[0]?.generalSettingsBoolValue;
          this.f.stockAdjustmentVoucherLocationId.setValue(
            Number(this.LOCKlOCATION ? this.user.locationId : this.DefLocation)
          );
          this.f.stockAdjustmentGroupId.setValue(
            this.ItemMasterGroupList[0].value
          );

          this.GetStockByLocation();
        }
      }
    });
  }

  showMaximizableDialog() {
    this.getAllStockAdjustment();
    this.displayMaximizable = true;
  }

  updateFormGrid(StockAdju: StockAdjustment) {
    this.search = null;
    this.StockAdjustmentFormGroup.patchValue({
      stockAdjustmentVoucherSaId: StockAdju.stockAdjustmentVoucherSaId,
      stockAdjustmentVoucherSaNo: StockAdju.stockAdjustmentVoucherSaNo,
      stockAdjustmentVoucherSaDate: new Date(
        StockAdju.stockAdjustmentVoucherSaDate
      ),
      stockAdjustmentVoucherSAAsOnDate: new Date(
        StockAdju.stockAdjustmentVoucherSAAsOnDate
      ),

      stockAdjustmentVoucherSaRemarks:
        StockAdju.stockAdjustmentVoucherSaRemarks,
      stockAdjustmentVoucherFsno: StockAdju.stockAdjustmentVoucherFsno,
      stockAdjustmentVoucherStVno: StockAdju.stockAdjustmentVoucherStVno,
      stockAdjustmentVoucherLocationId:
        StockAdju.stockAdjustmentVoucherLocationId,
      stockAdjustmentVoucherDelStatus:
        StockAdju.stockAdjustmentVoucherDelStatus,
      stockAdjustmentVoucherTotAmount: StockAdju.stockAdjusmentVoucherTotAmount,
      stockAdjustmentVoucherTotQty: StockAdju.stockAdjusmentVoucherTotQty,
    });

    const gridData: any = StockAdju.stockAdjustmentVoucherDetails.map((k) => {
      const ItemId = this.itemList?.find(
        (l) => l.itemMasterItemId == k?.stockAdjustmentVoucherDetailsMaterialId
      )?.itemMasterItemName;

      const jobId = this.jobArray?.find(
        (j) => j.jobMasterJobId == k.stockAdjustmentVoucherDetailsJobId
      )?.jobMasterJobName;
      const UnitId = this.unitListt?.find(
        (l) => l.unitMasterUnitId == k?.stockAdjustmentVoucherDetailsUnitId
      )?.unitMasterUnitShortName;
      return {
        stockAdjustmentVoucherDetailsDetId:
          k?.stockAdjustmentVoucherDetailsDetId,
        stockAdjustmentVoucherDetailsSaNo: k?.stockAdjustmentVoucherDetailsSaNo,
        MatId: k?.stockAdjustmentVoucherDetailsMaterialId,
        BaseUnit: UnitId,
        MaterialName: ItemId,
        Adjustment: k?.stockAdjustmentVoucherDetailsAdjQty,
        Job: jobId,
        Jobid: k.stockAdjustmentVoucherDetailsJobId,
        OrignalStock: k.stockAdjustmentVoucherDetailsManualQty,
        stockAdjustmentVoucherDetailsBatchCode: null,
        stockAdjustmentVoucherDetailsExpDate: null,
        CurrentStock:
          k.stockAdjustmentVoucherDetailsManualQty +
          k?.stockAdjustmentVoucherDetailsAdjQty,
        rate: k.stockAdjustmentVoucherDetailsCosePrice,
        stockAdjustmentVoucherDetailsDelStatus:
          k?.stockAdjustmentVoucherDetailsDelStatus,
        amt:
          k.stockAdjustmentVoucherDetailsCosePrice *
          k?.stockAdjustmentVoucherDetailsAdjQty,
      };
    });

    this.stockAdjustmententry.data = gridData;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ data: gridData, readOnly: true });
    this.StockAdjustmentFormGroup.disable();
    this.StockAdjustmentFormGroup.updateValueAndValidity();
  }

  handleChange(e) {
    this.index = e.index;
  }

  GetSavedStockAdjustmentDetails(id: string) {
    this.index = 0;
    this.stockApi.GetSavedStockAdjustmentDetailsById(id).subscribe(
      (data: any) => {
        if (data !== null) {
          this.btnFlag = {
            edit: true,
            cancel: true,
            save: false,
            update: true,
            delete: true,
          };
          this.updateFormGrid(data.result);
          this.savedStockAdjustment = data.result;
          this.StockAdjustmentFormGroup.disable();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Stock Adjustment not found',
          });
        }
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alert',
          detail: 'Failed',
        });
        this.StockAdjustmentFormGroup.updateValueAndValidity();
      }
    );
  }

  delete() {
    this.confirmation.confirm({
      key: 'confirm-key',
      message: 'Do you want to delete voucher?',
      accept: () => {
        this.stockApi
          .DeleteStockAdjustmentVoucher(this.savedStockAdjustment)
          .subscribe(
            (data) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: 'Stock Adjustment Deleted Succesfully',
              });
              this.newForm();
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
    this.GetSavedStockAdjustmentDetails(
      this.StockAdjustmentFormGroup.getRawValue().stockAdjustmentSAId
    );
  }

  edit() {
    this.StockAdjustmentFormGroup.enable();
    this.stockAdjustmententry.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotid)
      .updateSettings({ readOnly: false });
    this.f.stockAdjustmentSAId.clearValidators();
    this.updateTableConfiguration();
    this.StockAdjustmentFormGroup.updateValueAndValidity();
  }

  public get IsValidGrid(): boolean {
    if (this.stockAdjustmententry.data.length > 0) {
      return Object.values(this.stockAdjustmententry.data).some(
        (k: any) => k.MatId != null && k.Adjustment != null
      );
    }
    return false;
  }

  selectUnit(item: any) {
    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot.setDataAtCell(this.currentIndex, 3, item?.unitMasterUnitShortName);
    this.showUnitList = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        .setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showUnitList = false;
  }

  exit(evt) {
    this.showUnitList = false;
  }

  hide(evt: boolean) {
    this.showUnitList = false;
  }

  getAllUnit() {
    this.masterapi.GetAllUnit().subscribe((k) => {
      this.units = k;
      this.unitListt = k.map((kl) => ({
        label: kl?.unitMasterUnitShortName,
        value: kl.unitMasterUnitId,
      }));
      this.unitListt.unshift({ label: '--Select Unit--', value: -1 });
      this.unitArry = k.map((ar) => ar?.unitMasterUnitShortName?.trim());
    });
  }

  userTrackingLog(type) {
    let req = {
      page: 'StockAdjustment',
      isActive: false,
      isDeleted: false,
      otherType: type,
      Entity: type,
      vpNo: this.StockAdjustmentFormGroup.get('stockAdjustmentVoucherNo').value,
      vpType: 'StockAdjustment',
      vpUserId: this.user?.userId,
    };
    this.utilityService.AddUserTrackingLog(req).subscribe((res) => {
      //console.log('Response:', res);
    });
  }
}

export const vchrnoAsyncValidator = (
  acctService: AccountApiService,
  time: number = 800
) => {
  return (input: FormControl) => {
    if (input.value != null && input.value?.trim() !== '') {
      return timer(time).pipe(
        switchMap(() => acctService.CheckVnoExist(input.value)),
        map((res) => {
          return res.result === false ? null : { Exist: true };
        })
      );
    }
  };
};

interface GridData {
  MatId?: any;
  PartNo?: any;
  MaterialName?: any;
  brand?: any;
  packing?: any;
  origin?: any;
  Job?: any;
  baseunit?: any;
  origstock?: any;
  CurrentStock?: any;
  adjustment?: any;
  id?: any;
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  list?: boolean;
}
export const stockAdjustmentColumnList = (
  component: StockAdjustmentComponent
) => [
  {
    data: 'MatId',
    type: 'text',
    label: 'Mat Id',
    toolTip: 'Material ID',
    width: 50,
    readOnly: true,
  },
  {
    data: 'PartNo',
    type: 'text',
    label: 'Part No',
    toolTip: 'Part Number',
    width: 80,
  },
  {
    data: 'MaterialName',
    type: 'text',
    label: 'Material Name',
    toolTip: 'Material Name',
    width: 150,
    readOnly: true,
  },
  {
    data: 'BaseUnit',
    type: 'autocomplete',
    label: 'Base Unit',
    toolTip: 'Base Unit of Material',
    source: component.unitArry,
    width: 80,
  },
  {
    data: 'Job',
    type: 'dropdown',
    label: 'Job Name',
    toolTip: 'Related Job Name',
    source: component.jobArry,
    width: 100,
  },
  {
    data: 'OrignalStock',
    type: 'numeric',
    label: 'Original Stock',
    toolTip: 'Original Stock Quantity',
    readOnly: true,
    width: 90,
    numericFormat: {
      pattern: '0,0.00',
    },
  },
  {
    data: 'CurrentStock',
    type: 'numeric',
    label: 'Current Stock',
    toolTip: 'Current Stock Quantity',
    width: 90,
    numericFormat: {
      pattern: '0,0.00',
    },
    readOnly: false,
  },
  {
    data: 'Adjustment',
    type: 'numeric',
    label: 'Adjustment',
    toolTip: 'Stock Adjustment Quantity',
    width: 90,
    numericFormat: {
      pattern: '0,0.00',
    },
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Item Rate',
    width: 80,
    numericFormat: {
      pattern: '0,0.00',
    },
    readOnly: false,
  },
  {
    data: 'amt',
    type: 'numeric',
    label: 'Amount',
    toolTip: 'Calculated Amount',
    readOnly: true,
    width: 90,
    numericFormat: {
      pattern: '0,0.00',
    },
  },
  {
    data: 'Jobid',
    type: 'numeric',
    label: 'Job Id',
    toolTip: 'Job Identifier',
    readOnly: true,
    width: 60,
  },
];
