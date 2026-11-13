import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  SimpleChanges,
  OnChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment,
} from '@angular/router';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  SelectItem,
} from 'primeng/api';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import Handsontable from 'handsontable';
import { defaults } from 'src/app/shared/service/settings';
import { ItemStockType } from 'src/app/routes/domain/ItemStockType';
import { VendorMaster } from 'src/app/routes/domain/Masters/VendorMaster';
import { ItemSupplierDetails } from 'src/app/routes/domain/ItemSupplierDetails';
import { Subject, Subscription } from 'rxjs';
import { SupplierMaster } from 'src/app/routes/domain/Masters/SupplierMaster';
import { ItemMaster } from 'src/app/routes/domain/Masters/ItemMaster';
import { debounceTime, retryWhen } from 'rxjs/operators';
import { UnitMaster } from 'src/app/routes/domain/Masters/UnitMaster';
import { PriceLevelMaster } from 'src/app/routes/domain/Masters/PriceLevelMaster';
import { UnitDetails } from 'src/app/routes/domain/Masters/UnitDetails';
import { ItemPriceLevelDetails } from 'src/app/routes/domain/Masters/ItemPriceLevelDetails';
import { HotTableRegisterer } from '@handsontable/angular';
import { TaxMaster } from 'src/app/routes/domain/Masters/TaxMaster';
import { DatashareService } from 'src/app/datashare.service';
import { PreviousRouteService } from 'src/app/routes/service/common/previous-route.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { UtilityService } from 'src/app/routes/service/common/utility.service';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import { PagedRequest } from 'src/app/routes/domain/Sales/SalesVoucher';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
// import { TaxMaster } from 'src/app/routes/domain/Masters/TaxMaster';
@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EntryComponent implements OnInit, OnChanges {
  // look up controls declaration start
  elementReference: ElementRef;
  @ViewChild('brandCtrl', { static: false }) brandCtrol: ElementRef;
  @ViewChild('supplierCtrl', { static: false }) supplierCtrol: ElementRef;
  @ViewChild('acctCtrl', { static: false }) acctCtrol: ElementRef;

  lookupColumns = [];
  selectItem: any;
  activeRow: { row: number; column: number };
  showGridLookUp: boolean = false;
  showFormControlLookUp: boolean = false;
  supplierLookUp: boolean = false;
  control: AbstractControl;
  dataList: Array<any> = [];
  hotid;
  // look up controls declaration end
  @Input() ItemData: ItemMaster;
  @Input() listmode: boolean = true;
  title: string;
  url: any;
  btnFlag: ButtonFlag;
  breadcumbmodel: MenuItem[];
  licensekey: string;

  DefTax: string;
  DefTaxCheck: string;

  hotidPriceTbl: string;
  hotidUnitTbl: string;
  hotidSupplierTbl: string;

  supplierList: ItemSupplierDetails[] = [];

  ItemStockTypeArry: ItemStockType[] = [];
  brandArry: VendorMaster[] = [];
  newitemForm: FormGroup;

  taxMasterArray: TaxMaster[] = [];
  taxMasterArry: string[] = [];
  taxMasterList: SelectItem[];
  ItemStockList: SelectItem[] = [];
  brandList: SelectItem[] = [];
  supplierMasterListArry: SupplierMaster[] = [];
  supplierMasterList: SelectItem[] = [];

  itemGroup: SelectItem[] = [];

  unitLvlMasterGrid: string[] = [];
  unitLvlMaster: UnitMaster[] = [];

  priceLvlMasterGrid: string[] = [];
  priceLvlMaster: PriceLevelMaster[] = [];

  savedItemMaster: ItemMaster = null;
  private itemId: any;
  itemTableData: Subject<ItemMaster[]> = new Subject<ItemMaster[]>();
  private searchfilter: Subject<string> = new Subject();

  private hotRegisterer = new HotTableRegisterer();
  confirmDropDatabaseDialogVisible = false;
  selectedValue: any;
  selectedValues = [];
  selectedList: any;
  defaultVatValue: any;
  selectedStockSubscription: Subscription;
  selectedVatSubscription: Subscription;
  id: any;
  ScreenId: number;
  Permission: any;

  ItemMasterArray: ItemMaster[] = [];
  ItemMasterArry: string[] = [];
  ItemMasterList: SelectItem[];
  lookupGridColumns = [];
  isServerSearch = false;
  pagedRequest: PagedRequest;
  showItemMasterLookUp = false;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService,
    private translate: TranslateService,
    private router: Router,
    private previousRouteService: PreviousRouteService,
    private masterapi: MasterApiService,
    private datashare: DatashareService,
    private permission: PermissionsService,
    private utilityService: UtilityService,
    private accountapi: AccountApiService
  ) {
    this.licensekey = defaults.hotlicensekey;
  }

  priceTableSettings: Handsontable.GridSettings = this.BasicGridSettings();
  TableSettings: Handsontable.GridSettings = this.BasicGridSettings();
  unitTableSettings: Handsontable.GridSettings = this.BasicGridSettings();
  supplierTableSettings: Handsontable.GridSettings = this.BasicGridSettings();

  ngOnInit(): void {
    this.activatedroute.queryParams.subscribe((params) => {
      this.ScreenId = +params['menu'];
      this.itemId = +params['id'];
      var rights = this.permission.getById(this.ScreenId);
      this.masterapi.data$.subscribe((id) => {
        if (id != null) {
          this.getDetails(id);
        }
      });
      rights.forEach((res) => {
        if (res.workGroupPermissionsMenuName === 'Item Master') {
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

    this.newitemForm = this.fb.group({
      itemMasterAccountNo: [null],
      itemMasterItemId: [null],
      itemMasterItemName: [null, [Validators.required]],
      itemMasterItemType: [null],
      itemMasterStockType: [null],
      itemMasterCurrentStock: [null],
      itemMasterVenderId: [null],
      itemMasterSupplierId: [null],
      itemMasterSupplierCode: [null],
      itemMasterPartNo: [null],
      itemMasterReOrderLevel: [null],
      itemMasterItemSize: [null],
      itemMasterColor: [null],
      itemMasterShape: [null],
      itemMasterPacking: [null],
      itemMasterRef: [null],
      itemMasterRef1: [null],
      itemMasterRef2: [null],
      itemMasterUserId: [null],
      itemMasterLandingCost: [null],
      itemMasterVat: [null],
      itemMasterVatId: [null],
      itemMasterMaterialCode: [null],
      itemMasterImageBase64: [null],
      itemMasterInclusiveTax: [null],
    });
    this.selectedStockSubscription = this.datashare
      .getSelectedStockValue()
      .subscribe((value) => {
        this.newitemForm.get('itemMasterStockType').setValue(value?.keyValue);
      });

    this.selectedVatSubscription = this.datashare
      .getSelectedVatValue()
      .subscribe((value) => {
        this.newitemForm.get('itemMasterVat').setValue(value?.keyValue);
      });

    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };

    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });

    this.getDefaultTaxType();

    this.masterapi.LoadDropdownitem().subscribe((m) => {
      // item
      this.itemGroup = m.resultSet.itemMaster.map((k) => ({
        label: k.itemMasterItemName,
        value: k.itemMasterItemId,
      }));
      this.itemGroup.unshift({ label: 'Item Master', value: null });

      //  stock type
      this.ItemStockTypeArry = m.resultSet.stockTypes;
      this.ItemStockList = m.resultSet.stockTypes.map((k) => {
        return { label: k.itemStockTypeDescription, value: k.itemStockTypeId };
      });
      this.ItemStockList.unshift({ label: '--Select--', value: '-1' });
      if (!this.checkUrlSegment('edit')) {
        this.newitemForm
          .get('itemMasterStockType')
          .setValue(this.ItemStockList[3]?.value);
      }
      //brand

      this.brandArry = m.resultSet.vendorMasters?.filter(
        (x) => x.vendorMasterVendorStatus === false
      );
      // tax

      this.taxMasterArray = m.resultSet.taxMasters;
      this.taxMasterList = m.resultSet.taxMasters
        ?.filter((v) => v.tmId === Number(this.DefTax))
        .map((kl) => ({ label: kl.tmName, value: kl.tmId }));
      this.taxMasterList = m.resultSet.taxMasters.map((kl) => ({
        label: kl.tmName,
        value: kl.tmId,
      }));
      this.taxMasterList.unshift({ label: '--Select--', value: -1 });
      if (!this.checkUrlSegment('edit')) {
        this.newitemForm
          .get('itemMasterVat')
          .setValue(this.taxMasterList[1]?.value);
      }
      //supplier
      this.supplierMasterListArry = m.resultSet.suppliersMaster;

      // price
      this.priceLvlMasterGrid = m.resultSet.priceLevelMasters.map((k) =>
        k.priceLevelMasterPriceLevelName?.trim()
      );
      this.priceLvlMaster = m.resultSet.priceLevelMasters;

      //unit
      this.unitLvlMaster = m.resultSet.unitMasters;
      this.unitLvlMasterGrid = m.resultSet.unitMasters.map((k) =>
        k.unitMasterUnitFullName?.trim()
      );

      if (this.itemId != undefined && this.itemId != null) {
        if (this.itemId) {
          this.newitemForm.get('itemMasterAccountNo').setValue(this.itemId);
          this.acctCtrol.nativeElement.value = this.itemGroup?.find(
            (k) => k.value == this.itemId
          )?.label;
        }
        this.routeCheck();
      }
    });
    this.intializepriceTableSetings();
    this.intializeunitTableSettings();
    this.intializesupplierTableSettings();
  }

  navigateBack(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
    } else {
      // If there's no previous URL, navigate to a default route
      this.router.navigate(['/dashboard']);
    }
  }

  openAccount() {
    this.control = this.newitemForm.controls.itemMasterAccountNo;
    this.elementReference = this.acctCtrol;
    this.lookupColumns = ['Account', 'Account ID'];
    this.showFormControlLookUp = true;
    this.selectItem = {
      account: this.acctCtrol.nativeElement.value,
      accountId: this.newitemForm.controls.itemMasterAccountNo.value,
    };
    this.dataList = this.accountLookup;
  }

  openBrand() {
    this.control = this.newitemForm.controls.itemMasterVenderId;
    this.elementReference = this.brandCtrol;
    this.lookupColumns = ['Brand', 'Brand ID'];
    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot?.deselectCell();
    this.showFormControlLookUp = true;
    this.selectItem = {
      account: this.brandCtrol.nativeElement.value,
      accountId: this.newitemForm.controls.itemMasterVenderId.value,
    };
    this.dataList = this.brandLookup;
  }

  openSupplier() {
    this.control = this.newitemForm.controls.itemMasterSupplierId;
    this.elementReference = this.supplierCtrol;
    this.lookupColumns = ['Supplier', 'Supplier ID'];
    const hot = this.hotRegisterer.getInstance(this.hotid);
    hot?.deselectCell();
    this.showFormControlLookUp = true;
    this.selectItem = {
      account: this.supplierCtrol.nativeElement.value,
      accountId: this.newitemForm.controls.itemMasterSupplierId.value,
    };
    this.dataList = this.supplierLookup;
  }

  get supplierLookup() {
    return this.supplierMasterListArry.map((kl) => ({
      account: kl.suppliersMasterSupplierName,
      accountId: kl.suppliersMasterSupplierId,
    }));
  }

  get getUnitLvlSetLookup() {
    return this.unitLvlMaster.map((kl) => ({
      account: kl.unitMasterUnitFullName,
      accountId: kl.unitMasterUnitId,
    }));
  }

  get getPriceLvlSetLookup() {
    return this.priceLvlMaster.map((kl) => ({
      account: kl.priceLevelMasterPriceLevelName,
      accountId: kl.priceLevelMasterPriceLevelId,
    }));
  }

  get brandLookup() {
    return this.brandArry.map((kl) => ({
      account: kl.vendorMasterVendorName,
      accountId: kl.vendorMasterVendorId,
    }));
  }

  get accountLookup() {
    return this.itemGroup.map((kl) => ({
      account: kl.label,
      accountId: kl.value,
    }));
  }

  selectaccount(evt) {
    debugger;

    this.selectedValues.push(evt.accountId);
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.setDataAtCell(this.activeRow.row, this.activeRow.column, evt.account);
    this.hotRegisterer
      .getInstance(this.hotid)
      ?.setDataAtCell(this.activeRow.row, 2, this.selectedValues.length);
    this.showGridLookUp = false;
  }

  exit(evt) {
    this.showFormControlLookUp = false;
    this.showGridLookUp = false;
    this.supplierLookUp = false;
    this.showItemMasterLookUp = false;
  }

  clear(evt) {
    if (evt.elementRef != null) {
      (evt.elementRef as ElementRef).nativeElement.value = '';
      // this.elementReference.nativeElement.value ="";
      evt.formControl.setValue(null);
    } else {
      this.hotRegisterer
        .getInstance(this.hotid)
        ?.setDataAtCell(evt.cell.row, evt.cell.column, null);
    }
    this.showGridLookUp = false;
    this.showFormControlLookUp = false;
    this.supplierLookUp = false;
    this.showItemMasterLookUp = false;
  }

  selectControl(evt) {
    this.control.setValue(evt.accountId);
    this.elementReference.nativeElement.value = evt.account;
    this.showFormControlLookUp = false;
  }

  hide(evt: boolean) {
    this.showGridLookUp = false;
    this.showFormControlLookUp = false;
    this.supplierLookUp = false;
  }
  //look up methods end here

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ItemData.currentValue != null) {
      this.bindingValues({ result: changes.ItemData.currentValue });
      this.getSupplierList(
        (changes.ItemData.currentValue as ItemMaster).itemMasterItemId
      );
    }
  }

  // ngAfterViewInit() {
  //   this.routeCheck();
  // }

  routeCheck() {
    // mapping id t odefault
    if (this.checkUrlSegment('edit')) {
      this.btnFlag = {
        edit: true,
        cancel: false,
        save: false,
        update: true,
        delete: false,
      };
      this.newitemForm.disable();
      this.updateForms();
    }
  }

  checkUrlSegment(str: string): boolean {
    const tree: UrlTree = this.router.parseUrl(this.router.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g.segments;
    return s.some((k) => k.path === str);
  }

  edit() {
    this.hotRegisterer
      .getInstance(this.hotidPriceTbl)
      .updateSettings({ readOnly: false });
    this.hotRegisterer
      .getInstance(this.hotidUnitTbl)
      .updateSettings({ readOnly: false });
    this.newitemForm.enable();
    this.newitemForm.updateValueAndValidity();
    this.btnFlag = {
      edit: false,
      cancel: true,
      save: false,
      update: true,
      delete: true,
    };
  }
  getDetails(id) {
    this.masterapi.GetAllItemMasterById(id).subscribe((data) => {
      this.bindingValues({ result: data.result });
    });
  }
  updateForms() {
    this.activatedroute.paramMap.subscribe((params) => {
      var id = params.get('id');
      if (id) {
        this.itemId = id;
      }
      this.masterapi.GetAllItemMasterById(this.itemId).subscribe((data) => {
        this.bindingValues({ result: data.result });
        if (this.itemId != null) {
          this.getSupplierList(this.itemId);
        }
      });
    });
    // this.getSupplierList(itemmasterData.itemMasterItemId);
  }

  bindingValues(data: { result: ItemMaster }, isTemplate = false) {
    if (data?.result) {
      this.savedItemMaster = data.result;

      this.priceTableSettings.data = this.transformPriceLevelToGrid(
        data.result?.itemPriceLevelDetails,
        isTemplate
      );
      this.priceTableSettings.readOnly = true;
      this.hotRegisterer
        .getInstance(this.hotidPriceTbl)
        ?.updateSettings(this.priceTableSettings);
      this.unitTableSettings.data = this.tranformUnitDetilsToGrid(
        data.result.unitDetails,
        isTemplate
      );
      this.unitTableSettings.readOnly = true;
      this.hotRegisterer
        .getInstance(this.hotidUnitTbl)
        ?.updateSettings(this.unitTableSettings);
      if (data.result?.itemSupplierDetails) {
        const gridData: any[] = data.result?.itemSupplierDetails.map((k) => {
          return {
            id: k.itemSupplierDetailsItemSupplierDetailsId,
            supid: k.itemSupplierDetailsSupplierId,
            name: k.supplierName,
            itemId: k.itemSupplierDetailsItemId,
            rate: k.itemSupplierDetailsRate,
          };
        });

        this.supplierTableSettings.data = gridData;
      }
      this.hotRegisterer
        .getInstance(this.hotidSupplierTbl)
        ?.updateSettings(this.supplierTableSettings);
      this.newitemForm.patchValue(
        {
          itemMasterAccountNo: data.result.itemMasterAccountNo,
          itemMasterItemId: isTemplate ? null : data.result.itemMasterItemId,
          itemMasterMaterialCode: isTemplate
            ? null
            : data.result.itemMasterMaterialCode,
          itemMasterItemName: isTemplate
            ? null
            : data.result.itemMasterItemName,
          itemMasterStockType: data.result.itemMasterStockType,
          itemMasterItemType: data.result.itemMasterItemType,
          itemMasterSupplierId: data.result.itemMasterSupplierId,
          itemMasterVenderId: data.result.itemMasterVenderId,
          itemMasterSupplierCode: data.result.itemMasterSupplierCode,
          itemMasterPartNo: data.result.itemMasterPartNo,
          itemMasterReOrderLevel: data.result.itemMasterReOrderLevel,
          itemMasterItemSize: data.result.itemMasterItemSize,
          itemMasterColor: data.result.itemMasterColor,
          itemMasterShape: data.result.itemMasterShape,
          itemMasterPacking: data.result.itemMasterPacking,
          itemMasterRef2: data.result.itemMasterRef2,
          itemMasterRef1: data.result.itemMasterRef1,
          itemMasterUserId: data.result.itemMasterUserId,
          itemMasterLandingCost: data.result.itemMasterLandingCost,
          itemMasterCurrentStock: data.result.itemMasterCurrentStock,

          // itemMasterVat: data.result.itemMasterVat,
          itemMasterVat: this.taxMasterArray?.find(
            (k) => k.tmPercentage == data.result?.itemMasterVat
          )?.tmId,
          // itemMasterVat: data.result.itemMasterVATID,
          itemMasterImageBase64:
            data.result.itemImages.length > 0
              ? 'data:image/png;base64,' +
                data.result.itemImages[0].itemImagesItemImage
              : null,
        },
        { emitEvent: false }
      );
      if (data.result.itemMasterVenderId != null)
        this.brandCtrol.nativeElement.value = this.brandArry?.find(
          (k) => k.vendorMasterVendorId == data.result.itemMasterVenderId
        )?.vendorMasterVendorName;
      if (data.result.itemMasterSupplierId != null)
        if (this.supplierLookup) {
          this.supplierCtrol.nativeElement.value = this.supplierLookup?.find(
            (k) => k.accountId == data.result.itemMasterSupplierId
          )?.account;
        }

      if (data.result.itemMasterAccountNo != null)
        this.acctCtrol.nativeElement.value = this.itemGroup?.find(
          (k) => k.value == data.result.itemMasterAccountNo
        )?.label;
    }
  }

  onKeyUp(searchTextValue: string) {
    this.searchfilter.next(searchTextValue);
  }

  onSelectFile($event) {
    if ($event.target.files && $event.target.files[0]) {
      var reader = new FileReader();
      // let dovImage: DocumentImages;
      // dovImage.documentImageImage = event.target.files[0];
      reader.readAsDataURL($event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.url = event.target.result;
        this.newitemForm.controls.itemMasterImageBase64.setValue(
          event.target.result
        );
      };
    }
  }
  downloadImage() {
    const imageData = this.newitemForm.controls.itemMasterImageBase64.value;
    if (imageData) {
      const link = document.createElement('a');
      link.href = imageData; // The data URL of the image
      link.download = 'downloaded_image.png'; // Set the name of the downloaded file
      link.click(); // Programmatically click the link to trigger the download
    }
  }
  downloadImageBypdf() {
    const imageData = this.newitemForm.controls.itemMasterImageBase64.value;
    if (imageData) {
      const link = document.createElement('a');
      link.href = imageData; // The data URL of the image
      link.download = 'downloaded_file.pdf'; // Set the name of the downloaded file

      link.click(); // Programmatically click the link to trigger the download
    }
  }

  intializepriceTableSetings() {
    this.hotidPriceTbl = 'price_Grid';
    this.priceTableSettings = this.utilityService.getTableConfig(
      priceColumnObjList(this),
      [0],
      { height: '100px', minRows: 2 }
    );
    //look up start here
    this.priceTableSettings.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      this.hotid = this.hotidPriceTbl;
      // var x = this.hotRegisterer.getInstance(this.hotid)
      // .getDataAtCell(row, column);
      if (column === 1) {
        this.lookupColumns = ['Unit', 'Unit ID'];
        this.dataList = this.getPriceLvlSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showGridLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 3) {
        this.lookupColumns = ['Unit', 'Unit ID'];
        this.dataList = this.getUnitLvlSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showGridLookUp = true;
        this.activeRow = { row, column };
      }
    };
    // look up end here....
  }

  generateHiddenColumn(): number[] {
    if (this.checkUrlSegment('list')) {
      return [0, 5, 6];
    } else {
      return [0];
    }
  }

  intializeunitTableSettings() {
    this.hotidUnitTbl = 'unit_Grid';
    // this.unitTableSettings.columns = [
    //   {
    //     data: 'id',
    //     type: 'numeric',
    //     width: 0,
    //   },
    //   {
    //     data: 'unit',
    //     type: 'text',
    //     width: '100',
    //     readOnly: true,
    //   },
    //   {
    //     data: 'convType',
    //     type: 'numeric',
    //     width: '100',
    //   },
    //   {
    //     data: 'rate',
    //     type: 'numeric',
    //     numericFormat: {
    //       pattern: '0,0.00',
    //     },
    //     width: '100',
    //   },
    //   {
    //     data: 'barcode',
    //     type: 'text',
    //     width: '100',
    //     hiddenColumns: this.checkUrlSegment('list'),
    //   },
    //   {
    //     data: 'genBarcode',
    //     readOnly: true,
    //     width: '100',
    //     hiddenColumns: this.checkUrlSegment('list'),
    //     renderer: (instance, td, row, col, prop, value, cellProperties) => {
    //       const escaped = Handsontable.helper.stringify(value);
    //       let btn = null;

    //       btn = document.createElement('button');
    //       btn.innerHTML = 'Gen Barcode';

    //       var att = document.createAttribute('class'); // Create a "class" attribute
    //       att.value = 'ui-button btn'; // Set the value of the class attribute
    //       btn.setAttributeNode(att);
    //       btn.addEventListener(
    //         'click',
    //         function (event) {
    //           this.GenerateBarcode(instance, row, col);
    //           event.preventDefault();
    //         }.bind(this)
    //       );
    //       // Handsontable.dom.addEvent(btn, 'click', function (event) {
    //       //   alert(row+','+col);
    //       //   this.
    //       //   this.bindCustomValue(row,col+1);
    //       //   event.preventDefault();
    //       // });

    //       Handsontable.dom.empty(td);
    //       td.appendChild(btn);

    //       return td;
    //     },
    //   },
    //   {
    //     data: 'print',
    //     readOnly: true,
    //     width: '100',
    //     renderer: (instance, td, row, col, prop, value, cellProperties) => {
    //       const escaped = Handsontable.helper.stringify(value);
    //       let btn = null;
    //       btn = document.createElement('button');
    //       btn.innerHTML = 'Print';

    //       var att = document.createAttribute('class'); // Create a "class" attribute
    //       att.value = 'ui-button btn'; // Set the value of the class attribute
    //       btn.setAttributeNode(att);
    //       btn.addEventListener(
    //         'click',
    //         function (event) {
    //           // alert('print');
    //           this.printToCart('invoice-POS');
    //           event.preventDefault();
    //         }.bind(this)
    //       );

    //       // Handsontable.dom.addEvent(btn, 'click', function (event) {
    //       //   event.preventDefault();
    //       // });

    //       Handsontable.dom.empty(td);
    //       td.appendChild(btn);

    //       return td;
    //     },
    //   },

    //   {
    //     data: 'description',
    //     type: 'text',
    //     width: '100',
    //   },
    //   {
    //     data: 'costPrice',
    //     type: 'numeric',
    //     numericFormat: {
    //       pattern: '0,0.00',
    //     },
    //     width: '100',
    //   },
    //   {
    //     data: 'saleunit',
    //     type: 'text',
    //     width: '100',
    //     readOnly: true,
    //   },
    //   {
    //     data: 'purunit',
    //     type: 'text',
    //     width: '100',
    //     readOnly: true,
    //   },
    //   // {
    //   //   data: 'reorder',
    //   //   type: 'numeric',
    //   //   width: '100',
    //   // },
    //   {
    //     data: 'unitPrice',
    //     type: 'numeric',
    //     numericFormat: {
    //       pattern: '0,0.00',
    //     },
    //     width: '100',
    //   },
    //   {
    //     data: 'profitpercentage',
    //     type: 'numeric',
    //     numericFormat: {
    //       pattern: '0,0.00',
    //     },
    //     width: '100',
    //   },
    //   {
    //     data: 'overheadpercentage',
    //     type: 'numeric',
    //     numericFormat: {
    //       pattern: '0,0.00',
    //     },
    //     width: '100',
    //   },
    // ];

    // this.unitTableSettings.colHeaders = [
    //   'Id',
    //   'Unit',
    //   'Conv.Type',
    //   'Rate',
    //   'Barcode',
    //   'Gen Barcode',
    //   'Print',
    //   'Description',
    //   'Cost Price',
    //   'Sales Unit',
    //   'Purchase Unit',
    //   'Unit Price',
    //   'Profit(%)',
    //   'Overhead(%)',
    // ];
    // this.unitTableSettings.hiddenColumns = {
    //   columns: this.generateHiddenColumn(),
    //   indicators: false,
    // };
    this.unitTableSettings = this.utilityService.getTableConfig(
      unitColumnObjList(this),
      this.generateHiddenColumn(),
      { height: '220px', minRows: 4 }
    );

    //look up start here
    this.unitTableSettings.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      this.hotid = this.hotidUnitTbl;
      // var x = this.hotRegisterer.getInstance(this.hotid)
      // .getDataAtCell(row, column);
      if (column === 1) {
        this.lookupColumns = ['Unit', 'Unit ID'];
        this.dataList = this.getUnitLvlSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showGridLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 9) {
        this.lookupColumns = ['Unit', 'Unit ID'];
        this.dataList = this.getUnitLvlSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showGridLookUp = true;
        this.activeRow = { row, column };
      } else if (column === 10) {
        this.lookupColumns = ['Unit', 'Unit ID'];
        this.dataList = this.getUnitLvlSetLookup;
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.showGridLookUp = true;
        this.activeRow = { row, column };
      }
    };
    // look up end here....
  }

  //-------------------------------------
  intializesupplierTableSettings() {
    this.hotidSupplierTbl = 'supplier_Grid';

    this.supplierTableSettings = this.utilityService.getTableConfig(
      supplierColumnObjList(this),
      [0, 1, 3],
      { height: '100px', minRows: 2 }
    );
    //look up start here
    this.supplierTableSettings.afterSelection = (
      row,
      column,
      row2,
      column2,
      preventScrolling,
      selectionLayerLevel
    ) => {
      // setting if prevent scrolling after selection
      this.hotid = this.hotidSupplierTbl;
      const hot = this.hotRegisterer.getInstance(this.hotidSupplierTbl);
      const rowData: any = hot.getSourceDataAtRow(row);

      if (column === 1 || column === 2) {
        // this.showFormControlLookUp = true;
        this.supplierLookUp = true;
        this.lookupColumns = ['Supplier', 'Supplier ID'];
        this.dataList = this.supplierLookup.map((item) => ({
          ...item,
        }));
        this.selectItem = {
          account: this.supplierCtrol.nativeElement.value,
          accountId: this.newitemForm.controls.itemMasterSupplierId.value,
        };
        const hot = this.hotRegisterer.getInstance(this.hotid);
        hot.deselectCell();
        this.activeRow = { row, column };
      }
    };
  }
  selectSupplier(evt) {
    const hotInstance = this.hotRegisterer.getInstance(this.hotid);
    const row = this.activeRow.row;

    // Get all existing account IDs (except current editing row)
    const allIds = hotInstance.getDataAtCol(0); // column 0 = accountId
    const isDuplicate = allIds.some(
      (id, idx) => id === evt.accountId && idx !== row
    );

    if (isDuplicate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `${evt.account} Supplier already added in the table`,
      });
      return;
    }

    hotInstance.setDataAtCell(row, 1, evt.accountId);
    hotInstance.setDataAtCell(row, 2, evt.account);
    // hotInstance.setDataAtCell(row, 2, evt.selection);

    this.supplierLookUp = false;
  }

  //========================================
  GenerateBarcode(inst, row, col) {
    this.masterapi.getItemmasterMax().subscribe((d) => {
      inst.setDataAtCell(row, col - 1, d.result.toString() + '-' + (row + 1));
    });
  }

  public BasicGridSettings(
    colsWidth: string = 'auto',
    tablewidth: string = 'auto',
    tableheight: number = 200,
    tablerowHeights: number = 23
  ): Handsontable.GridSettings {
    return {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      minRows: 7,
      fillHandle: {
        direction: 'vertical',
        autoInsertRow: true,
      },
      enterMoves: { row: 0, col: 1 },
      colWidths: colsWidth,
      width: tablewidth,
      height: tableheight,
      rowHeights: tablerowHeights,
      autoRowSize: true,
      data: [],
      minSpareRows: 1,
      allowInsertRow: true,
      stretchH: 'all',
      manualRowResize: true,
      manualColumnResize: true,
      columns: [],
      colHeaders: [],

      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  getDefaultTaxType() {
    this.masterapi.GetOptionsSettingbyKey('DEFAULT_VAT').subscribe((data) => {
      if (data.result.length > 0) {
        this.DefTaxCheck = data.result[0]?.optionsMasterType;
        if (this.DefTaxCheck !== null) {
          // const splitText = this.DefTaxCheck?.split('::');
          this.DefTax = this.DefTaxCheck;
        }
      }
    });
  }
  isTemplate = false;
  onClickTemplateList(isTemplate = false) {
    this.isTemplate = isTemplate;
    this.onSearchItem('');
    this.isServerSearch = true;
    this.showItemMasterLookUp = true;
    this.lookupGridColumns = ['Item ID', 'Item Name'];
  }

  getAllItems() {
    this.masterapi.getItemsParentTreeNode().subscribe((data) => {
      let paramsID = this.activatedroute.snapshot.params['id'];
      this.itemGroup = data.result.map((k) => ({
        label: k.itemMasterItemName,
        value: k.itemMasterItemId,
      }));
      this.itemGroup.unshift({ label: 'Item Master', value: null });
      if (!this.checkUrlSegment('edit')) {
        this.itemId = paramsID;
        // this.newitemForm.controls.itemMasterAccountNo.setValue(Number(this.itemId));
        if (this.itemId != null) {
          this.newitemForm.get('itemMasterAccountNo').setValue(this.itemId);
          this.getSupplierList(this.itemId);
        }
        // });
      }
      // this.activatedroute.paramMap.subscribe((params) => {
      if (paramsID) {
        this.itemId = paramsID;

        // this.newitemForm.controls.itemMasterAccountNo.setValue(Number(this.itemId));
        this.newitemForm.get('itemMasterAccountNo').setValue(this.itemId);
        this.acctCtrol.nativeElement.value = this.itemGroup?.find(
          (k) => k.value == paramsID
        )?.label;
      }
      // });
    });
  }
  onSearchItem(term: string) {
    this.pagedRequest = {
      pageNumber: 1,
      pageSize: 30,
      searchTerm: term,
      sortColumn: 'Item_Master_Item_Name',
      sortDirection: 'asc',
    };
    this.accountapi
      .LoadFilteredItemMaster(this.pagedRequest)
      .subscribe((m: any) => {
        this.ItemMasterArray = m.resultSet.itemMaster;
        this.ItemMasterList = m.resultSet.itemMaster?.map((kl: any) => ({
          sales: kl?.itemMasterItemName,
          salesId: kl?.itemMasterItemId,
          barcode: kl?.itemMasterBarcode, //unitDetails[0]?.unitDetailsBarcode,
          size: kl?.itemMasterItemSize,
          brand: this.brandArry?.find(
            (x) => x?.vendorMasterVendorId === kl?.itemMasterVenderId
          )?.vendorMasterVendorName,
        }));
        this.dataList = this.itemSetLookup;
      });
  }
  get itemSetLookup() {
    return this.ItemMasterArray.map((kl) => ({
      procurementsId: kl.itemMasterItemName,
      procurements: kl?.itemMasterItemId,
    }));
  }

  selectedItem(item: any) {
    this.showItemMasterLookUp = false;
    this.masterapi.GetAllItemMasterById(item.procurements).subscribe((data) => {
      this.bindingValues({ result: data.result }, this.isTemplate);

      this.getSupplierList(item.procurements);
    });
  }

  search(event) {
    // const bander = [{label: 'Lag1', value: '-1'}, {label: 'Lag2', value: '-1'}, {label: 'Lag3', value: '-1'}];
    if (event.query?.trim() !== '') {
      this.brandList = this.brandArry
        ?.filter((k) =>
          k.vendorMasterVendorName
            .toLowerCase()
            .match(event.query.toLowerCase())
        )
        .map((x) => ({
          label: x.vendorMasterVendorName,
          value: x.vendorMasterVendorId,
        }));
    } else {
      this.brandList = this.brandArry.map((x) => ({
        label: x.vendorMasterVendorName,
        value: x.vendorMasterVendorId,
      }));
    }
  }

  getBrandById(id: number): { label: string; value: number } {
    if (id !== 0 && id != null) {
      let x = this.brandArry?.find((k) => k.vendorMasterVendorId === id);
      return { label: x.vendorMasterVendorName, value: x.vendorMasterVendorId };
    }
    return null;
  }

  getSupplierById(id: number): { label: string; value: number } {
    if (id !== 0 && id != null) {
      let x = this.supplierMasterListArry?.find(
        (k) => k.suppliersMasterSupplierId === id
      );
      return {
        label: x.suppliersMasterSupplierName,
        value: x.suppliersMasterSupplierId,
      };
    }
    return null;
  }

  searchBySupplier(event) {
    if (event.query?.trim() !== '') {
      this.supplierMasterList = this.supplierMasterListArry
        ?.filter((k) =>
          k.suppliersMasterSupplierName
            .toLowerCase()
            .match(event.query.toLowerCase())
        )
        .map((x) => ({
          label: x.suppliersMasterSupplierName,
          value: x.suppliersMasterSupplierId,
        }));
    } else {
      this.supplierMasterList = this.supplierMasterListArry.map((x) => ({
        label: x.suppliersMasterSupplierName,
        value: x.suppliersMasterSupplierId,
      }));
    }
  }

  getBrand() {
    this.masterapi.GetAllBrand().subscribe((data) => {
      this.brandArry = data;
    });
  }

  // getAllTax() {
  //   this.masterapi.GetAllTax().subscribe((k) => {
  //     this.taxMasterArray = k;
  //     this.taxMasterList = k
  //       ?.filter((v) => v.tmId === Number(this.DefTax))
  //       .map((kl) => ({ label: kl.tmName, value: kl.tmId }));
  //     this.taxMasterList = k.map((kl) => ({
  //       label: kl.tmName,
  //       value: kl.tmId,
  //     }));

  //     this.taxMasterList.unshift({ label: '--Select--', value: -1 });
  //     this.taxMasterArry = k.map(
  //       (ar) => ar.tmName?.trim() + '|' + ar.tmPercentage
  //     );
  //     if (!this.checkUrlSegment('edit')) {
  //       this.newitemForm
  //         .get('itemMasterVat')
  //         .setValue(this.taxMasterList[1]?.value);
  //     }
  //   });
  // }

  getSupplierList(id: number) {
    this.masterapi.GetSupplierDetailsByItemId(id).subscribe((data) => {
      this.supplierList = data.result;
    });
  }

  getSupplierMasterList() {
    this.masterapi.GetAllSupplier().subscribe((data) => {
      this.supplierMasterListArry = data;
    });
  }

  getItemyname(event) {
    this.masterapi
      .GetAllItemByName(event as string)
      .pipe(debounceTime(4000))
      .subscribe((data) => {
        this.itemTableData.next(data.result);
      });
  }

  getpricelevelGridMaster() {
    this.masterapi.GetAllPriceLevel().subscribe((data) => {
      this.priceLvlMasterGrid = data.map((k) =>
        k.priceLevelMasterPriceLevelName?.trim()
      );
      this.priceLvlMaster = data;
    });
  }

  getPriceLvlById(id: number): string {
    return this.priceLvlMaster?.find(
      (k) => k.priceLevelMasterPriceLevelId === id
    )?.priceLevelMasterPriceLevelName;
  }

  getUnitLvlById(id: number): string {
    return this.unitLvlMaster?.find((k) => k.unitMasterUnitId === id)
      ?.unitMasterUnitFullName;
  }

  getunitlevelGridMaster() {
    this.masterapi.GetAllUnit().subscribe((data) => {
      this.unitLvlMaster = data;
      this.unitLvlMasterGrid = data.map((k) =>
        k.unitMasterUnitFullName?.trim()
      );
    });
  }

  transformUnitLvlFromGrid(): UnitDetails[] {
    const unitGridData: IunitLevel[] = this.unitTableSettings
      .data as IunitLevel[];
    return unitGridData
      ?.filter((k) => k.unit != null)
      .map((k) => ({
        unitDetailsId: k.id ?? 0,
        unitDetailsUnitId:
          k.unit != null && k.unit !== ''
            ? this.unitLvlMaster?.find(
                (j) => j.unitMasterUnitFullName?.trim() === k.unit?.trim()
              ).unitMasterUnitId
            : null,
        unitDetailsConversionType: k.convType,
        unitDetailsRate: k.rate,
        unitDetailsPacking: k.packing,
        unitDetailsBarcode: k.barcode,
        unitDetailsDescrption: k.description,
        unitDetailsProfitPer: k.profitpercentage,
        unitDetailsHeight:
          k.height != null && k.height !== ''
            ? this.unitLvlMaster?.find(
                (j) => j.unitMasterUnitFullName?.trim() === k.unit?.trim()
              )?.unitMasterUnitId
            : null,
        unitDetailsWidth:
          k.width != null && k.width !== ''
            ? this.unitLvlMaster?.find(
                (j) => j.unitMasterUnitFullName?.trim() === k.unit?.trim()
              )?.unitMasterUnitId
            : null,
        unitDetailsReorder: k.reorder,
        unitDetailsDelStatus: null,
        unitDetailsUnitCost: k.costPrice,
        unitDetailsUnitPrice: k.unitPrice,
        unitDetailsOverhdPer: k.overheadpercentage,
      })) as UnitDetails[];
  }

  printToCart(printSectionId: string) {
    let popupWinindow;
    let innerContents = document.getElementById(printSectionId).innerHTML;
    popupWinindow = window.open(
      '',
      '_blank',
      'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no'
    );
    popupWinindow.document.open();
    popupWinindow.document.write(
      '<html><body onload="window.print()">' + innerContents + '</html>'
    );
    popupWinindow.document.close();
  }

  transformPriceLvlFromGrid(): ItemPriceLevelDetails[] {
    const priceGridData: IpriceLevel[] = this.priceTableSettings
      .data as IpriceLevel[];
    return priceGridData
      ?.filter((k) => k.level != null)
      .map((k) => ({
        itemPriceLevelId: k.id,
        itemId: null,
        levelId:
          k.level != null && k.level !== ''
            ? this.priceLvlMaster?.find(
                (j) =>
                  j.priceLevelMasterPriceLevelName?.trim() === k.level?.trim()
              ).priceLevelMasterPriceLevelId
            : null,
        levelRate: k.rate,
        levelAmt:
          k.amount != null && k.amount !== ''
            ? this.unitLvlMaster?.find(
                (j) => j.unitMasterUnitFullName?.trim() === k.amount?.trim()
              )?.unitMasterUnitId
            : null,
        unitId:
          k.unit != null && k.unit !== ''
            ? this.unitLvlMaster?.find(
                (j) => j.unitMasterUnitFullName?.trim() === k.unit?.trim()
              )?.unitMasterUnitId
            : null,
        item: null,
        level: null,
      }));
  }

  tranformUnitDetilsToGrid(
    data: UnitDetails[],
    isTemplate = false
  ): IunitLevel[] {
    const unitGrid: IunitLevel[] = data?.map((k) => ({
      id: isTemplate ? 0 : k.unitDetailsId,
      unit: this.unitLvlMaster?.find(
        (i) => i.unitMasterUnitId === k?.unitDetailsUnitId
      )?.unitMasterUnitFullName,
      convType: k.unitDetailsConversionType,
      rate: k.unitDetailsRate,
      packing: k.unitDetailsPacking,
      barcode: k.unitDetailsBarcode,
      description: k.unitDetailsDescrption,
      costPrice: k.unitDetailsUnitCost,
      unitPrice: k.unitDetailsUnitPrice,
      profitpercentage: k.unitDetailsProfitPer,
      overheadpercentage: k.unitDetailsOverhdPer,
      height: this.getUnitLvlById(k?.unitDetailsUnitId), // k.unitDetailsHeight,
      width: this.getUnitLvlById(k?.unitDetailsUnitId), //k.unitDetailsWidth,
      reorder: k?.unitDetailsReorder,
    }));
    return unitGrid;
  }

  transformPriceLevelToGrid(
    data: ItemPriceLevelDetails[],
    isTemplate = false
  ): IpriceLevel[] {
    const priceGrid: IpriceLevel[] = data.map((k) => ({
      level: this.getPriceLvlById(k.levelId),
      rate: k.levelRate,
      unit: k.unitId
        ? this.unitLvlMaster?.find((u) => u.unitMasterUnitId == k.unitId)
            .unitMasterUnitFullName
        : '',
      amount: this.getUnitLvlById(k.unitId), //k.levelAmt,
      id: isTemplate ? 0 : k.itemPriceLevelId,
    }));
    return priceGrid;
  }

  UpdateItemByImg() {
    this.newitemForm.controls.itemMasterImageBase64.setValue('');
    this.saveItem();
  }

  saveItem() {
    this.newitemForm.markAllAsTouched();
    if (this.newitemForm.invalid) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Fill the Item Field',
      });
      return;
    }
    const accountNo = this.newitemForm.value.itemMasterAccountNo;
    if (!accountNo || accountNo <= 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Item Group Must Be Selected',
      });
      return;
    }
    const savedData: any = this.supplierTableSettings.data?.filter((k) =>
      k?.hasOwnProperty('name')
    );

    const itemData: ItemMaster = {
      ...this.newitemForm.value,
      itemMasterAccountNo: Number(
        this.newitemForm.value.itemMasterAccountNo ?? 0
      ),
      itemMasterVenderId: this.newitemForm.value.itemMasterVenderId,
      itemMasterSupplierCode: this.newitemForm.value.itemMasterSupplierId,
      itemMasterSupplierId: this.newitemForm.value.itemMasterSupplierId,
      itemMasterReOrderLevel: Number(
        this.newitemForm.value.itemMasterReOrderLevel
      ),
      itemMasterLandingCost: Number(
        this.newitemForm.value.itemMasterLandingCost
      ),
      itemMasterUserId: null,
      itemMasterVATID: this.newitemForm.value.ItemMasterVat,
      itemMasterVat: Number(
        this.taxMasterArray?.find(
          (x) => x.tmId === (this.newitemForm.value.itemMasterVat ?? 1)
        )?.tmPercentage ?? 0
      ),
      itemMasterItemType: 'A',
      unitDetails: this.transformUnitLvlFromGrid(),

      itemPriceLevelDetails: this.transformPriceLvlFromGrid(),
    };
    itemData.itemSupplierDetails = savedData
      ?.filter((k) => k?.name != null)
      .map((k: any) => {
        return {
          itemSupplierDetailsItemSupplierDetailsId: k.id ?? 0,
          itemSupplierDetailsItemId: k.itemId ?? null,
          itemSupplierDetailsSupplierId: k.supid,
          itemSupplierDetailsRate: k.rate,
          supplierName: k.name ?? '',
          // itemSupplierDetailsDelStatus?:boolean;
        };
      });

    if (
      this.btnFlag.update &&
      this.newitemForm.controls.itemMasterImageBase64.value
    ) {
      itemData.itemImages =
        this.savedItemMaster.itemImages.length > 0
          ? this.savedItemMaster.itemImages
          : [{ itemImagesItemImage: null }];
      itemData.itemImages[0].itemImagesItemImage =
        this.newitemForm.controls.itemMasterImageBase64.value?.split(',')[1];
    }

    if (!itemData.unitDetails || itemData.unitDetails.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'Fill the Unit Field',
      });
      return;
    }
    const hasConversionTypeOne = itemData.unitDetails.some(
      (unit) => unit.unitDetailsConversionType === 1
    );

    if (!hasConversionTypeOne) {
      this.messageService.add({
        severity: 'info',
        summary: 'Alert',
        detail: 'One Unit Conversion Type must be 1',
      });
      return;
    }
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.btnFlag.save
        ? this.translate.instant('Do you want to save Item?')
        : this.translate.instant('Do you want to Update Item?'),
      accept: () => {
        this.masterapi.NewItem(itemData).subscribe({
          next: (data) => {
            if (data.valid) {
              this.messageService.add({
                severity: 'success',
                summary: 'Alert',
                detail: data.message,
              });
              this.bindingValues({ result: data.result });
              this.btnFlag = {
                edit: true,
                cancel: false,
                save: false,
                update: true,
                delete: false,
              };
              this.newitemForm.disable();
            } else {
              // Handle case where data.valid is false
              this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: data.message || 'Operation completed with warnings',
              });
            }
          },
          error: (error) => {
            // Handle HTTP errors or exceptions from the API
            console.error('Error creating item:', error);

            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                error.message || 'Failed to create item. Please try again.',
            });
          },
          complete: () => {
            // Optional: Code to run after completion
            console.log('Item creation process completed');
          },
        });
      },
    });
  }

  new() {
    this.newitemForm.reset();
    this.newitemForm.enable();
    this.acctCtrol.nativeElement.value = '';
    this.newitemForm
      .get('itemMasterStockType')
      .setValue(this.ItemStockList[3]?.value);
    // this.hotRegisterer.getInstance(this.hotidPriceTbl).updateSettings({ readOnly: false });
    // this.hotRegisterer.getInstance(this.hotidUnitTbl).updateSettings({ readOnly: false })
    this.priceTableSettings.data = [];
    this.priceTableSettings.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotidPriceTbl)
      ?.updateSettings(this.priceTableSettings);

    this.supplierTableSettings.data = [];
    this.supplierTableSettings.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotidSupplierTbl)
      ?.updateSettings(this.supplierTableSettings);

    this.unitTableSettings.data = [];
    this.unitTableSettings.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotidUnitTbl)
      ?.updateSettings(this.unitTableSettings);

    // this.newitemForm.get('itemMasterAccountNo').setValue(this.itemId);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
    };
    this.selectedValues = [];
    this.newitemForm.updateValueAndValidity();
  }

  cancel() {
    this.newitemForm.reset();
    this.priceTableSettings.data = [];
    this.priceTableSettings.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotidPriceTbl)
      ?.updateSettings(this.priceTableSettings);

    this.supplierTableSettings.data = [];
    this.supplierTableSettings.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotidSupplierTbl)
      ?.updateSettings(this.supplierTableSettings);

    this.unitTableSettings.data = [];
    this.unitTableSettings.readOnly = false;
    this.hotRegisterer
      .getInstance(this.hotidUnitTbl)
      .updateSettings(this.unitTableSettings);
    this.btnFlag = {
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: true,
    };
  }

  delete() {
    this.masterapi.DeleteNewItem(this.savedItemMaster).subscribe((data) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: data.message,
      });
    });
    this.new();
    // this.router.navigate(['/master/item/list']);
  }
}

interface ButtonFlag {
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
}

export interface IpriceLevel {
  level?: string;
  rate?: number;
  unit?: string;
  amount?: string;
  id?: number;
}
export interface IunitLevel {
  convType?: any;
  unit?: string;
  rate?: number;
  packing?: string;
  barcode?: string;
  description?: string;
  costPrice?: number;
  unitPrice?: number;
  profitpercentage?: number;
  overheadpercentage?: number;
  height?: string;
  width?: string;
  reorder?: number;
  id?: number;
}
export const priceColumnObjList = (component: EntryComponent) => [
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    width: 100,
  },
  {
    data: 'level',
    type: 'text',
    label: 'Level',
    width: 80,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    width: 80,
  },
  {
    data: 'unit',
    type: 'numeric',
    label: 'Unit',
    width: 80,
  },
];
export const unitColumnObjList = (component: EntryComponent) => [
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Unique Identifier',
    width: 80,
  },
  {
    data: 'unit',
    type: 'text',
    label: 'Unit',
    toolTip: 'Unit Name',
    width: 80,
  },
  {
    data: 'convType',
    type: 'numeric',
    label: 'Conv.Type',
    toolTip: 'Conversion Type',
    readOnly: false,
    width: 80,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'Conversion Rate',
    readOnly: false,
    width: 80,
  },
  {
    data: 'barcode',
    type: 'text',
    label: 'Barcode',
    toolTip: 'Barcode Number',
    readOnly: false,
    width: 80,
  },
  {
    data: 'genBarcode',
    label: 'Gen Barcode',
    toolTip: 'Generate Barcode',
    renderer: (instance, td, row, col, prop, value, cellProperties) => {
      const btn = document.createElement('button');
      btn.innerHTML = 'Gen Barcode';
      btn.className = 'ui-button btn';
      btn.addEventListener('click', (event) => {
        component.GenerateBarcode(instance, row, col);
        event.preventDefault();
      });
      Handsontable.dom.empty(td);
      td.appendChild(btn);
      return td;
    },
    width: 110,
  },
  {
    data: 'print',
    label: 'Print',
    toolTip: 'Print Barcode',
    renderer: (instance, td, row, col, prop, value, cellProperties) => {
      const btn = document.createElement('button');
      btn.innerHTML = 'Print';
      btn.className = 'ui-button btn';
      btn.addEventListener('click', (event) => {
        component.printToCart('invoice-POS');
        event.preventDefault();
      });
      Handsontable.dom.empty(td);
      td.appendChild(btn);
      return td;
    },
    width: 110,
  },
  {
    data: 'description',
    type: 'text',
    label: 'Description',
    toolTip: 'Unit Description',
    readOnly: false,
  },
  {
    data: 'costPrice',
    type: 'numeric',
    label: 'Cost Price',
    toolTip: 'Cost Price',
    readOnly: false,
    width: 80,
  },
  {
    data: 'saleunit',
    type: 'text',
    label: 'Sales Unit',
    toolTip: 'Sales Unit',
    width: 80,
  },
  {
    data: 'purunit',
    type: 'text',
    label: 'Purchase Unit',
    toolTip: 'Purchase Unit',
    width: 80,
  },
  {
    data: 'unitPrice',
    type: 'numeric',
    label: 'Unit Price',
    toolTip: 'Selling Unit Price',
    readOnly: false,
    width: 80,
  },
  {
    data: 'profitpercentage',
    type: 'numeric',
    label: 'Profit(%)',
    toolTip: 'Profit Percentage',
    readOnly: false,
    width: 80,
  },
  {
    data: 'overheadpercentage',
    type: 'numeric',
    label: 'Overhead(%)',
    toolTip: 'Overhead Percentage',
    width: 80,
  },
];
export const supplierColumnObjList = (component: EntryComponent) => [
  {
    data: 'id',
    type: 'numeric',
    label: 'Id',
    toolTip: 'Unique Identifier',
    width: 80,
  },
  {
    data: 'supid',
    type: 'numeric',
    label: 'Supplier Id',
    toolTip: 'Unique I',
    width: 80,
  },
  {
    data: 'name',
    type: 'text',
    label: 'Supplier Name',
    toolTip: 'Supplier Name',
    width: 100,
  },
  {
    data: 'itemId',
    type: 'numeric',
    label: ' itemId',
    toolTip: 'itemId I',
    width: 80,
  },
  {
    data: 'rate',
    type: 'numeric',
    label: 'Rate',
    toolTip: 'rate I',
    readOnly: false,
    width: 80,
  },
];
