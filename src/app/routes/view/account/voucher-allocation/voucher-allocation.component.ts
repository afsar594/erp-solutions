import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotTableRegisterer } from '@handsontable/angular';
import { TranslateService } from '@ngx-translate/core';
import Handsontable from 'handsontable';
import {
  DialogService,
  DynamicDialogRef,
  ConfirmationService,
  MessageService,
} from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { Allocations } from 'src/app/routes/Enums/Allocation';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { defaults } from 'src/app/shared/service/settings';
import Swal from 'sweetalert2';
import { VoucherAllocationListComponent } from './voucher-allocation-list/voucher-allocation-list.component';

@Component({
  selector: 'app-voucher-allocation',
  templateUrl: './voucher-allocation.component.html',
  styleUrls: ['./voucher-allocation.component.scss'],
})
export class VoucherAllocationComponent implements OnInit {
  btnFlag: ButtonFlag = {
    new: true,
    edit: false,
    cancel: false,
    save: true,
    update: false,
    delete: false,
    print: false,
    printPreview: false,
  };

  submitted: boolean = false;
  title: string;
  subtitle: string;
  dataset: any;
  cols: Array<any>;
  Date: Date;
  totalRecords: number = 0;
  location: Array<string>;
  licensekey: any;
  gridHeader: string;
  VAForm: FormGroup;
  index: number = 0;
  radioType: string = 'Suppliers';
  customerDropdown: any[] = [];
  voucherDate: Date = new Date();
  selectedCustomerDropdown: any[] = [];
  supplierDropdown: any[] = [];
  selectedsupplierDropdown: any[] = [];
  state: {
    Dir: string;
    Field: any;
    Skip: any;
    Take: any;
    Search: any;
    Filter: any;
  };
  search: any;
  filter: any;
  DataList: any;
  CheckAllSelected: any;
  IdsArray: any[] = [];
  totalDebit: any = 0;
  totalCredit: any = 0;
  totalBalance: any = 0;
  AV_Total_Debit: any = 0;
  AV_Total_Credit: any = 0;

  selectedRows: any[] = [];

  allocatedRows: any[] = [];
  ScreenId: number;
  Permission: any;
  datasetVoucher: any[] = [];
  netAllocated: number = null;
  DC: string = '';
  voucherFirst: boolean = false;
  debit: number = 0;
  value: number = 0;

  handleChange(e) {
    this.index = e.index;
  }

  hotid = 'VoucherAllocation';
  private hotRegisterer = new HotTableRegisterer();
  VoucherAllocation: Handsontable.GridSettings;
  initializeControls() {
    this.VoucherAllocation = {
      rowHeaders: true,
      viewportColumnRenderingOffset: 27,
      viewportRowRenderingOffset: 'auto',
      colWidths: 150,
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
      columns: [
        {
          data: 'ID',
          type: 'checkbox',
          checkedTemplate: 'yes',
          uncheckedTemplate: 'no',
          width: 80,
        },
        {
          data: 'accountsTransactionsTransDate',
          type: 'text',
          width: 80,
        },
        {
          data: 'accountsTransactionsVoucherNo',
          type: 'text',
          width: 80,
        },
        {
          data: 'accountsTransactionsVoucherType',
          type: 'text',
          width: 80,
        },
        {
          data: 'accountsTransactionsDebit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsCredit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsAllocCredit',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsAllocBalance',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'accountsTransactionsAllocationbalance',
          type: 'numeric',
          width: 80,
        },
        {
          data: 'NetAllocation',
          type: 'numeric',
          width: 80,
        },
      ],
      colHeaders: [
        this.translate.instant('ID'),
        this.translate.instant('Date'),
        this.translate.instant('V No'),
        this.translate.instant('Type'),
        this.translate.instant('Debit'),
        this.translate.instant('Credit'),
        this.translate.instant('Allocation Amt'),
        this.translate.instant('Balance'),
        this.translate.instant('Net Allocation'),
      ],
      manualRowMove: true,
      manualColumnMove: true,
      contextMenu: true,
      filters: true,
      dropdownMenu: true,
    };
  }

  constructor(
    private activatedroute: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accService: AccountstatementService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private confirmation: ConfirmationService,
    private messageService: MessageService,
    private permission: PermissionsService
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

    this.cols = [
      { field: 'accountsTransactionsTransSno', header: 'ID' },
      { field: 'accountsTransactionsTransDateString', header: 'Date' },
      { field: 'accountsTransactionsVoucherNo', header: 'V No' },
      { field: 'accountsTransactionsVoucherType', header: 'Type' },
      { field: 'accountsTransactionsDebit', header: 'Debit' },
      { field: 'accountsTransactionsCredit', header: 'Credit' },
      { field: 'accountsTransactionsAllocDebit', header: 'Allocation Amt' },
      { field: 'accountsTransactionsAllocationbalance', header: 'Balance' },
      { field: 'netAllocation', header: 'Net Allocation' },
    ];
    this.VAForm = this.fb.group({
      allocationVoucherVoucherNo: new FormControl('', Validators.required),
      allocationVoucherId: new FormControl(0, Validators.required),
      allocationVoucherVoucherDate: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      allocationVoucherVcreation: new FormControl('', Validators.required),
      SelectCustomerAC: new FormControl(''),
      SelectSupplierAC: new FormControl(''),
      allocationVoucherDescription: new FormControl('', Validators.required),
      AllocationVoucherTotalDebit: new FormControl(''),
      AllocationVoucherTotalCredit: new FormControl(''),
      AllocationVoucherTotal: new FormControl(''),
      allocationVoucherVoucherAccNo: new FormControl('', Validators.required),
      allocationVoucherVoucherAccType: new FormControl(''),
      RadioType: new FormControl('Suppliers'),
      VoucherAllocationDetails: this.fb.array([]),
    });
    this.VAForm.disable();
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
      this.subtitle = data.title;
      this.licensekey = defaults.hotlicensekey;
      this.gridHeader = 'No Data';
    });
    this.initializeControls();
    this.GetCustomerMasterDropdown();
    this.GetSupplierMasterDropdown();
  }
  get f() {
    return this.VAForm.controls;
  }

  cancel() {
    this.VAForm.reset;
    this.dataset = [];
  }

  onCheckboxChange(event, rowData) {
    if (event.checked) {
      this.selectedRows.push(rowData);
    } else {
      this.selectedRows = this.selectedRows?.filter((row) => row !== rowData);
    }
  }

  GetCustomerMasterDropdown() {
    this.accService
      .GetCustomerMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.customerDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
        }
      });
  }

  GetSupplierMasterDropdown() {
    this.accService
      .GetSupplierMasterDropdown()
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.supplierDropdown = response.result.map((data) => ({
            label: data.name,
            value: data.value,
          }));
        }
      });
  }

  IsSelectedInArray(data: any) {
    data.map((obj: any) => {
      obj.IsSelected = false;
      return obj;
    });
    return data;
  }

  SelectionRatio() {
    this.totalCredit = 0;
    this.totalBalance = 0;
    this.totalDebit = 0;
    this.dataset = [];
    this.datasetVoucher = [];
    this.VAForm.controls['SelectSupplierAC'].setValue(-1);
  }

  // Function to automatically allocate credits and debits
  autoAllocate() {
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.netAllocated = 0;
    if (this.VAForm.controls['RadioType'].value == 'Suppliers') {
      var debit = 0;
      var credit = 0;
      this.dataset.forEach((x: any) => {
        debit += x.accountsTransactionsAllocBalance ?? 0;
      });
      this.datasetVoucher.forEach((x: any) => {
        credit += x.accountsTransactionsAllocBalance ?? 0;
      });

      if (debit > credit) {
        this.netAllocated = credit;
        this.datasetVoucher.forEach((x: any) => {
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.dataset.forEach((x: any) => {
          if (credit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            debit -= x.netAllocation;
          } else {
            x.netAllocation = debit;
            x.isSelected = true;
          }
        });
      } else {
        this.netAllocated = debit;
        this.dataset.forEach((x: any) => {
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.datasetVoucher.forEach((x: any) => {
          if (credit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            credit -= x.netAllocation;
          } else {
            x.netAllocation = credit;
            x.isSelected = true;
          }
        });
      }
    } else {
      var debit = 0;
      var credit = 0;
      this.dataset.forEach((x: any) => {
        credit += x.accountsTransactionsAllocBalance ?? 0;
      });
      this.datasetVoucher.forEach((x: any) => {
        debit += x.accountsTransactionsAllocBalance ?? 0;
      });

      if (debit > credit) {
        this.netAllocated = credit;
        this.dataset.forEach((x: any) => {
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.datasetVoucher.forEach((x: any) => {
          if (credit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            credit -= x.netAllocation;
          } else {
            x.netAllocation = credit;
            x.isSelected = true;
          }
        });
      } else {
        this.netAllocated = debit;
        this.datasetVoucher.forEach((x: any) => {
          if (this.netAllocated > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            this.netAllocated -= x.netAllocation;
          } else {
            x.netAllocation = this.netAllocated;
            this.totalCredit += x.netAllocation;
            this.netAllocated = 0;
            x.isSelected = true;
          }
        });
        this.dataset.forEach((x: any) => {
          if (debit > x.accountsTransactionsAllocBalance) {
            x.isSelected = true;
            x.netAllocation = x.accountsTransactionsAllocBalance;

            debit -= x.netAllocation;
          } else {
            x.netAllocation = credit;
            x.isSelected = true;
          }
        });
      }
    }

    this.updateTotalBalance();
  }

  CheckEachCheckBox(event: any, id: number, from: string) {
    if (from === 'account') {
      this.dataset.forEach((x: any) => {
        this.DC = x.accountsTransactionsDebit > 0 ? 'D' : 'C';

        if (this.DC === 'C') {
          this.handleCreditForAccount(event, x, id);
        } else if (this.DC === 'D') {
          this.handleDebitForAccount(event, x, id);
        }
      });
    } else {
      this.datasetVoucher.forEach((x: any) => {
        this.DC = x.accountsTransactionsDebit > 0 ? 'D' : 'C';

        if (this.DC === 'C') {
          this.handleCreditForVoucher(event, x, id);
        } else if (this.DC === 'D') {
          this.handleDebitForVoucher(event, x, id);
        }
      });
    }

    this.updateTotalBalance();
  }

  private handleCreditForAccount(event: any, x: any, id: number) {
    if (x.accountsTransactionsTransSno === id) {
      if (event.target.checked) {
        x.netAllocation = x.accountsTransactionsAllocBalance;

        x.IsSelected = true;
        this.totalCredit += x.netAllocation ?? 0;
        this.netAllocated = this.totalCredit ?? 0;
        if (this.voucherFirst) {
          this.debit = 0;
          this.datasetVoucher.forEach((v: any) => {
            if (v.IsSelected) {
              if (this.netAllocated > v.accountsTransactionsAllocBalance) {
                v.netAllocation = v.accountsTransactionsAllocBalance;
                this.netAllocated -= v.netAllocation ?? 0;
                this.debit += v.netAllocation ?? 0;
              } else {
                v.netAllocation = this.netAllocated;
                this.debit += this.netAllocated ?? 0;
                this.netAllocated = 0;
              }
            }
            this.totalDebit = this.debit;
            // this.totalBalance = this.totalDebit - this.totalCredit;
          });
        }
      } else {
        this.resetAllocation(x);
        this.totalCredit = 0;
      }
    }
  }

  private handleDebitForAccount(event: any, x: any, id: number) {
    if (x.accountsTransactionsTransSno === id) {
      if (event.target.checked) {
        x.netAllocation = x.accountsTransactionsAllocBalance;

        x.IsSelected = true;

        this.totalDebit += x.netAllocation ?? 0;
        this.netAllocated = this.totalDebit ?? 0;
        if (this.voucherFirst) {
          this.debit = 0;
          this.datasetVoucher.forEach((v: any) => {
            if (v.IsSelected) {
              if (this.netAllocated > v.accountsTransactionsAllocBalance) {
                v.netAllocation = v.accountsTransactionsAllocBalance;
                this.netAllocated -= v.netAllocation ?? 0;
                this.debit += v.netAllocation ?? 0;
              } else {
                v.netAllocation = this.netAllocated;
                this.debit += this.netAllocated ?? 0;
                this.netAllocated = 0;
              }
            }
            this.totalCredit = this.debit;
            // this.totalBalance = this.totalDebit - this.totalCredit;
          });
        }
      } else {
        this.totalDebit -= x.netAllocation ?? 0;
        this.resetAllocation(x);
      }
    }
  }

  private handleCreditForVoucher(event: any, x: any, id: number) {
    if (x.accountsTransactionsTransSno === id) {
      if (event.target.checked) {
        if (this.netAllocated > x.accountsTransactionsAllocBalance) {
          x.netAllocation = x.accountsTransactionsAllocBalance;

          this.netAllocated -= x.netAllocation;
          this.totalCredit += x.netAllocation;
        } else if (this.netAllocated == null) {
          x.netAllocation = x.accountsTransactionsAllocBalance;

          this.totalCredit += x.netAllocation ?? 0;
          this.voucherFirst = true;
        } else if (this.netAllocated > 0) {
          x.netAllocation = this.netAllocated;

          this.netAllocated = 0;
          this.totalCredit += x.netAllocation ?? 0;
        }

        x.IsSelected = true;
      } else {
        this.totalCredit -= x.netAllocation ?? 0;
        this.resetAllocation(x);
      }
    }
  }

  private handleDebitForVoucher(event: any, x: any, id: number) {
    if (x.accountsTransactionsTransSno === id) {
      if (event.target.checked) {
        if (this.netAllocated > x.accountsTransactionsAllocBalance) {
          x.netAllocation = x.accountsTransactionsAllocBalance;

          this.netAllocated -= x.netAllocation;
          this.totalDebit += x.netAllocation;
        } else if (this.netAllocated == null) {
          x.netAllocation = x.accountsTransactionsAllocBalance;

          this.totalDebit += x.netAllocation ?? 0;
          this.voucherFirst = true;
        } else if (this.netAllocated > 0) {
          x.netAllocation = this.netAllocated;

          this.netAllocated = 0;
          this.totalDebit += x.netAllocation ?? 0;
        }
        x.IsSelected = true;
      } else {
        this.totalDebit -= x.netAllocation ?? 0;
        this.resetAllocation(x);
      }
    }
  }

  // Reset allocation when unchecked
  private resetAllocation(x: any) {
    if (this.dataset?.find((n) => n.netAllocation != 0)) {
      this.netAllocated += x.netAllocation ?? 0;
      x.netAllocation = 0;
    } else {
      x.netAllocation = 0;
    }

    x.IsSelected = false;
  }

  // Update the total balance
  private updateTotalBalance() {
    this.totalBalance = (this.totalCredit - this.totalDebit).toFixed(2);
  }

  onNetAllocationChange(event, selectrow, netallco: any, id) {
    var totalValue = 0;
    this.datasetVoucher.forEach((x: any) => {
      this.DC = x.accountsTransactionsDebit > 0 ? 'D' : 'C';
      if (this.DC == 'C') {
        if (x.accountsTransactionsTransSno === id && x.IsSelected) {
          if (x.accountsTransactionsAllocBalance >= netallco) {
            x.netAllocation = Number(netallco) ?? 0;
          } else {
            x.netAllocation = 0;
          }
        }
        if (x.netAllocation > 0 && x.IsSelected == true) {
          totalValue += Number(x.netAllocation) ?? 0;
        }
        this.totalCredit = 0;
        this.totalCredit = totalValue ?? 0;
      } else {
        if (x.accountsTransactionsTransSno === id && x.IsSelected) {
          if (x.accountsTransactionsAllocBalance >= netallco) {
            x.netAllocation = Number(netallco) ?? 0;
          } else {
            x.netAllocation = 0;
          }
        }
        if (x.netAllocation > 0 && x.IsSelected == true) {
          totalValue += Number(x.netAllocation) ?? 0;
        }

        this.totalDebit = 0;
        this.totalDebit = totalValue;
      }
    });

    this.updateTotalBalance();
  }

  CheckAllCheckBox(event: any) {
    this.dataset.forEach((c: any) => {
      if (event.target.checked) {
        this.DC = c.accountsTransactionsDebit > 0 ? 'D' : 'C';
        c.IsSelected = event.target.checked;
        c.netAllocation = c.accountsTransactionsAllocBalance;
        if (this.DC == 'C') {
          this.totalCredit += c.netAllocation;
        } else {
          this.totalDebit += c.netAllocation;
        }
      } else {
        this.DC = c.accountsTransactionsDebit > 0 ? 'D' : 'C';
        c.IsSelected = event.target.checked;
        c.netAllocation = 0;
        if (this.DC == 'C') {
          this.totalCredit = 0;
        } else {
          this.totalDebit = 0;
        }
      }
    });
    this.updateTotalBalance();
  }
  CheckAllCheckBoxVoucher(event: any) {
    this.datasetVoucher.forEach((c: any) => {
      if (event.target.checked) {
        this.DC = c.accountsTransactionsDebit > 0 ? 'D' : 'C';
        c.IsSelected = event.target.checked;
        c.netAllocation = c.accountsTransactionsAllocBalance;
        if (this.DC == 'C') {
          this.totalCredit += c.netAllocation;
        } else {
          this.totalDebit += c.netAllocation;
        }
      } else {
        this.DC = c.accountsTransactionsDebit > 0 ? 'D' : 'C';
        c.IsSelected = event.target.checked;
        c.netAllocation = 0;
        if (this.DC == 'C') {
          this.totalCredit = 0;
        } else {
          this.totalDebit = 0;
        }
      }
    });
    this.updateTotalBalance();
  }

  // auto alocation

  AutoAllocate() {
    // Reset allocation for all rows in both datasets
    this.resetAllAllocations();

    let netCredit = 0;
    let netDebit = 0;

    // Calculate total debit and credit
    this.dataset.forEach((x: any) => {
      netCredit +=
        x.accountsTransactionsCredit > 0
          ? x.accountsTransactionsCredit ?? 0
          : 0;
      netDebit +=
        x.accountsTransactionsDebit > 0 ? x.accountsTransactionsDebit ?? 0 : 0;
    });

    this.datasetVoucher.forEach((x: any) => {
      netCredit +=
        x.accountsTransactionsCredit > 0
          ? x.accountsTransactionsCredit ?? 0
          : 0;
      netDebit +=
        x.accountsTransactionsDebit > 0 ? x.accountsTransactionsDebit ?? 0 : 0;
    });

    // this.netAllocated = Math.abs(netCredit - netDebit);
    this.netAllocated = netCredit > netDebit ? netDebit : netCredit;
    let other = this.netAllocated;
    this.autoAllocates(this.netAllocated, other);

    this.updateTotalBalance();
  }

  private autoAllocates(allocate, other) {
    let A = allocate;
    let O = other;
    this.dataset.forEach((x: any) => {
      if (A > x.accountsTransactionsAllocBalance) {
        x.netAllocation = x.accountsTransactionsAllocBalance;
        A -= x.netAllocation ?? 0;
      } else {
        x.netAllocation = A;
        A = 0;
      }
      x.IsSelected = true;
      if (A == 0 && !x.netAllocation) {
        x.IsSelected = false;
      }

      if (x.accountsTransactionsDebit > 0) {
        this.totalDebit += x.netAllocation ?? 0;
      } else {
        this.totalCredit += x.netAllocation ?? 0;
      }
    });

    this.datasetVoucher.forEach((x: any) => {
      if (O > x.accountsTransactionsAllocBalance) {
        x.netAllocation = x.accountsTransactionsAllocBalance;
        O -= x.netAllocation ?? 0;
      } else {
        x.netAllocation = O;
        O = 0;
      }
      x.IsSelected = true;
      if (O == 0 && !x.netAllocation) {
        x.IsSelected = false;
      }
      if (x.accountsTransactionsDebit > 0) {
        this.totalDebit += x.netAllocation ?? 0;
      } else {
        this.totalCredit += x.netAllocation ?? 0;
      }
    });
  }

  // Reset all allocations
  private resetAllAllocations() {
    this.dataset.forEach((x: any) => {
      x.netAllocation = 0;
      x.IsSelected = false;
    });

    this.datasetVoucher.forEach((x: any) => {
      x.netAllocation = 0;
      x.IsSelected = false;
    });

    this.totalCredit = 0;
    this.totalDebit = 0;
    this.netAllocated = 0;
  }

  // auto allocation ----------------------

  GetGridListData(event: any) {
    this.state = {
      Dir: event != null ? (event.sortOrder == -1 ? 'asc' : 'desc') : 'desc',
      Field:
        event != null
          ? event.sortField != null && event.sortField != ''
            ? event.sortField
            : 'AccountsTransactions_TransSno'
          : 'AccountsTransactions_TransSno',
      Skip: event != null ? (event.first != null ? event.first : 0) : 0,
      Take: event != null ? (event.rows != null ? event.rows : 0) : 10000,
      Search: this.search,
      Filter: this.filter,
    };
    this.accService
      .GetAccountTransactionsVoucherAllocation(this.state)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.data.length > 0) {
          var data = response.result.data;
          var voucherList = response.result.data?.filter((transaction) =>
            Object.values(Allocations).includes(
              transaction.accountsTransactionsVoucherType
            )
          );
          var accountVList = data?.filter(
            (transaction) =>
              !Object.values(Allocations).includes(
                transaction.accountsTransactionsVoucherType
              )
          );

          this.dataset = this.IsSelectedInArray(accountVList);
          this.datasetVoucher = this.IsSelectedInArray(voucherList);
        }
      });
  }

  patchValues(e: any) {
    return this.fb.group({
      AccountsTransactionsTransSno: e.accountsTransactionsTransSno, // [acSno],
      AccountsTransactionsAllocBalance: e.accountsTransactionsAllocBalance, //[balance],
      AllocationVoucherDetailsVno: e.accountsTransactionsVoucherNo, // [vNo],
      AllocationVoucherDetailsAllocDebit: e.accountsTransactionsDebit, // [debit],
      AllocationVoucherDetailsAllocCredit: e.accountsTransactionsCredit, // [credit],
      AllocationVoucherDetailsRefVType: e.accountsTransactionsVoucherType, // [vType],
      AllocationVoucherDetailsNetAllocation: parseFloat(e?.netAllocation),
    });
  }

  VoucherAllocationFormSubmit() {
    if (this.totalBalance == 0) {
      const control = <FormArray>this.VAForm.get('VoucherAllocationDetails');
      const data = this.dataset;
      data.push(...this.datasetVoucher);
      data.forEach((x) => {
        if (x.IsSelected) {
          control.push(this.patchValues(x));
        }
      });
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Save?',
        accept: () => {
          this.accService
            .AddEditVoucherAllocation(this.VAForm.value)
            .subscribe((response: ApiResponse<any>) => {
              if (response.valid && response.result) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Alert',
                  detail: response.message,
                });
                this.btnFlag = {
                  new: true,
                  edit: true,
                  cancel: false,
                  save: false,
                  update: true,
                  delete: true,
                  print: true,
                  printPreview: true,
                };
                this.dataset = [];
                this.datasetVoucher = [];
              }
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Alert',
        detail: 'Balance ammount must be 0',
      });
    }
  }

  LoadAccountTransaction() {
    if (
      this.f.SelectCustomerAC.value == '' &&
      this.f.SelectSupplierAC.value == ''
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Select the Customer /Supplier',
      });
      return;
    }
    let query = this.GetCustomerSupplierFilter();
    this.filter = query;
    this.dataset = [];
    this.datasetVoucher = [];
    this.voucherFirst = false;
    this.totalBalance = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.debit = 0;
    this.netAllocated = null;
    this.voucherFirst = false;
    this.GetGridListData(null);
  }

  GetCustomerSupplierFilter() {
    let queryString = '';
    if (this.VAForm.controls['RadioType'].value == 'Suppliers') {
      if (this.VAForm.controls['SelectSupplierAC'].valid) {
        this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(
          this.VAForm.controls['SelectSupplierAC'].value
        );
        queryString +=
          ` &&  AccountsTransactionsAllocBalance > 0 && (AccountsTransactionsAccNo.Contains("` +
          this.VAForm.controls['SelectSupplierAC'].value +
          `"))`;
      }
    } else {
      if (this.VAForm.controls['SelectCustomerAC'].valid) {
        this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(
          this.VAForm.controls['SelectCustomerAC'].value
        );
        queryString +=
          `  && AccountsTransactionsAllocBalance > 0  && (AccountsTransactionsAccNo.Contains("` +
          this.VAForm.controls['SelectCustomerAC'].value +
          `"))`;
      }
    }

    return queryString;
  }

  LoadVoucherAllocationList() {
    const ref = this.dialogService.open(VoucherAllocationListComponent, {
      data: {
        id: '51gF3',
      },
      header: 'Voucher Allocation List',
      width: '70%',
    });
    ref.onClose.subscribe((data) => {
      this.btnFlag = {
        new: true,
        edit: true,
        cancel: true,
        save: false,
        update: false,
        delete: true,
        print: true,
        printPreview: true,
      };
      this.GetSpecificVoucherAllocation(data);
    });
  }

  ReleaseAllocations() {
    let voucherNo = 'yascbakbc';
    if (voucherNo === '' || voucherNo === null || voucherNo === undefined) {
      Swal.fire({
        title: 'Error',
        text: 'You must have a selected Voucher to Delete.',
        icon: 'error',
      });
      return;
    } else {
      this.confirmation.confirm({
        key: 'confirm-key',
        message: 'Do you want to Deleted?',
        accept: () => {
          this.accService
            .DeleteAllocationVoucher(
              this.VAForm.value.allocationVoucherVoucherNo,
              'Allocation'
            )
            .subscribe((res: ApiResponse<any>) => {
              if (res.valid) {
                Swal.fire({
                  title: 'Success',
                  text: 'Selected Voucher Allocation were Deleted Successfully.',
                  icon: 'success',
                });
              } else {
                Swal.fire({
                  title: 'Error',
                  text: 'Selected Voucher Allocation were not Deleted Successfully.',
                  icon: 'error',
                });
              }
            });
        },
      });
    }
  }

  GetSpecificVoucherAllocation(id) {
    this.accService
      .GetSpecificVoucherAllocation(id)
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid) {
          this.VAForm.reset();
          this.VAForm.controls['allocationVoucherVcreation'].setValue(
            response.result.allocationVoucherVcreation
          );
          this.VAForm.controls['allocationVoucherVoucherNo'].setValue(
            response.result.allocationVoucherVoucherNo
          );
          this.VAForm.controls['allocationVoucherId'].setValue(
            response.result.allocationVoucherId
          );
          this.VAForm.controls['allocationVoucherVoucherAccNo'].setValue(
            response.result.allocationVoucherVoucherAccNo
          );
          this.VAForm.controls['allocationVoucherVoucherAccType'].setValue(
            response.result.allocationVoucherVoucherAccType
          );

          var data = response.result.accountsTransactions;
          var voucherList = response.result.accountsTransactions?.filter(
            (transaction) =>
              Object.values(Allocations).includes(
                transaction.accountsTransactionsVoucherType
              )
          );
          var accountVList = data?.filter(
            (transaction) =>
              !Object.values(Allocations).includes(
                transaction.accountsTransactionsVoucherType
              )
          );

          this.dataset = this.IsSelectedInArray(accountVList);
          this.datasetVoucher = this.IsSelectedInArray(voucherList);
        }
      });
  }

  new() {
    this.VAForm.reset();
    this.VAForm.enable();
    this.dataset = [];
    this.datasetVoucher = [];
    this.totalBalance = 0;
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.btnFlag = {
      new: true,
      edit: false,
      cancel: false,
      save: true,
      update: false,
      delete: false,
      print: false,
      printPreview: false,
    };
    this.VAForm.controls['RadioType'].setValue('Suppliers');
    this.VAForm.controls['allocationVoucherVoucherDate'].setValue(new Date());
  }
  edit() {
    this.VAForm.enable();
  }
}
interface ButtonFlag {
  new?: boolean;
  edit?: boolean;
  cancel?: boolean;
  update?: boolean;
  save?: boolean;
  delete?: boolean;
  print?: boolean;
  printPreview?: boolean;
}
