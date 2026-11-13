import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import {
  ConfirmationService,
  DialogService,
  DynamicDialogRef,
  MessageService,
} from 'primeng';
import { ApiResponse } from 'src/app/routes/domain/ApiResponse';
import { AccountstatementService } from 'src/app/routes/service/accountstatement.service';

@Component({
  selector: 'app-allocations',
  templateUrl: './allocations.component.html',
  styleUrls: ['./allocations.component.scss'],
})
export class AllocationsComponent implements OnInit {
  @Input() data: any;
  submitted: boolean = false;
  severity: string;
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
  totalDebit: number = 0;
  totalCredit: number = 0;
  totalBalance: number = 0;
  total_Debit: number = 0;
  total_Credit: number = 0;
  voucherNo: any;
  @Output() dataEvent = new EventEmitter<any>();
  fromVoucher: any;
  refNO: any;
  accNO: any;
  totalAllocated: number = 0;
  remainingBalance: number = 0;
  confirmDropDatabaseDialogVisible: boolean = false;
  voucherID: number;
  constructor(
    private fb: FormBuilder,

    private messageService: MessageService,
    private accService: AccountstatementService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnChanges() {
    this.fromVoucher = this.data.vType;
    this.accNO = this.data.accNO;
    this.refNO = this.data.refNO;
    this.total_Debit = this.data.accountsTransactionsAllocBalance;

    this.totalDebit = this.total_Debit;
    this.voucherNo = this.data.accountsTransactionsVoucherNo;
    if (this.data) this.getAllocationDetails();
    this.total_Credit = 0;
  }
  ngOnInit(): void {
    this.cols = [
      { field: 'isSelected', header: 'Select' },
      { field: 'transNo', header: 'ID' },
      { field: 'transDate', header: 'Date' },
      { field: 'voucherNo', header: 'V No' },
      { field: 'type', header: 'Type' },
      { field: 'debit', header: 'Debit' },
      { field: 'credit', header: 'Credit' },
      { field: 'allocAmount', header: 'Allocation Amt' },
      { field: 'balance', header: 'Balance' },
      { field: 'netAllocation', header: 'Net Allocation' },
      { field: 'remainingBalance', header: 'Remaining Balance' },
      { field: 'allocationStatus', header: 'Allo. Status' },
    ];
    this.loadVAForm();
  }

  loadVAForm() {
    this.VAForm = this.fb.group({
      allocationVoucherVoucherNo: new FormControl(''),
      allocationVoucherId: new FormControl(0),
      allocationVoucherVoucherDate: new FormControl(
        new Date(new Date().setFullYear(new Date().getFullYear())),
        Validators.required
      ),
      allocationVoucherVcreation: new FormControl(''),
      SelectCustomerAC: new FormControl(
        this.fromVoucher == 'PAYMENT' ? '' : this.accNO
      ),
      SelectSupplierAC: new FormControl(
        this.fromVoucher == 'PAYMENT' ? this.accNO : ''
      ),
      AllocationVoucherTotalDebit: new FormControl(''),
      AllocationVoucherTotalCredit: new FormControl(''),
      AllocationVoucherTotal: new FormControl(''),
      allocationVoucherVoucherAccNo: new FormControl(''),
      allocationVoucherVoucherAccType: new FormControl(''),
      allocationVoucherDescription: new FormControl(''),
      VoucherAllocationDetails: this.fb.array([]),
    });
  }

  isSelectedInArray(data: any) {
    data.map((obj: any) => {
      obj.isSelected = false;
      obj.tempbalance = obj.balance;
      return obj;
    });
    return data;
  }

  isDisabled(row: any): boolean {
    if (
      (row.type.toUpperCase() === 'PURCHASEVOUCHER' ||
        row.type.toUpperCase() === 'SalesVoucher') &&
      Number(row.allocAmount || 0) > 0
    ) {
      return true;
    }
    // if (
    //   row.type.toUpperCase() === 'PAYMENT' &&
    //   Number(row.remainingDebit || 0) === 0
    // ) {
    //   return true;
    // }
    return false;
  }

  CheckAllCheckBox(event: any) {
    this.dataset.forEach((c: any) => {
      c.isSelected = event.target.checked;
      if (event.target.checked) {
        if (!this.IdsArray.includes(c.transNo)) {
          this.IdsArray.push(c.transNo);
        }
      } else {
        this.IdsArray = [];
      }
    });
  }
  // onNetAllocationChange(
  //   event: any,
  //   isSelected: boolean,
  //   newValue: number,
  //   transNo: number
  // ) {
  //   debugger;
  //   const enteredValue = Number(newValue) || 0;

  //   const upperVoucher = this.fromVoucher?.toUpperCase();
  //   const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

  //   const fromTypes = isPaymentFlow
  //     ? ['PAYMENT', 'BANK PAYMENT']
  //     : ['RECEIPT', 'BANK RECEIPT'];

  //   const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

  //   // --- Find the row being edited first ---
  //   const currentRow: any = this.dataset?.find(
  //     (r: any) => r.transNo === transNo
  //   );
  //   if (!currentRow) return;

  //   // Prevent typing on source vouchers (user must edit target vouchers only)
  //   if (fromTypes.includes((currentRow.type || '').toUpperCase())) {
  //     this.messageService.add({
  //       severity: 'error',
  //       summary: 'Error',
  //       detail:
  //         'Cannot enter allocation on source voucher. Select a target voucher to allocate against.',
  //     });
  //     return;
  //   }

  //   // --- Find selected source vouchers ---
  //   const fromVouchers = this.dataset?.filter(
  //     (v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected
  //   );

  //   if (!fromVouchers || fromVouchers.length === 0) {
  //     this.messageService.add({
  //       severity: 'error',
  //       summary: 'Error',
  //       detail:
  //         'Please select at least one source account before entering allocation.',
  //     });
  //     return;
  //   }

  //   // Find the minimum available balance among selected from vouchers
  //   const remainingKey = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';
  //   const minFromBalance = Math.min(
  //     ...fromVouchers.map((v) => Number(v[remainingKey] || 0))
  //   );

  //   const maxAllocatable = fromVouchers.reduce((sum, v) => {
  //     return sum + Number(v[remainingKey] || 0);
  //   }, 0);

  //   // --- Track total allocations excluding current row ---
  //   let totalAllocated = 0;
  //   this.dataset.forEach((row: any) => {
  //     if (row.transNo !== transNo && row.isSelected && row.netAllocation > 0)
  //       totalAllocated += Number(row.netAllocation || 0);
  //   });

  //   // --- Validation for entered value ---
  //   if (enteredValue <= 0) {
  //     currentRow.isSelected = false;
  //     currentRow.netAllocation = 0;
  //   } else {
  //     // Ensure we use the target row's available balance (fall back to 0)
  //     const targetBalance = Number(currentRow.balance || 0);
  //     const cappedByBalance = Math.min(enteredValue, targetBalance);
  //     const allowedRemaining = Math.max(0, maxAllocatable - totalAllocated);
  //     const finalValue = Math.min(cappedByBalance, allowedRemaining);

  //     // If enteredValue > any single source's available (minFromBalance), fail
  //     if (enteredValue > minFromBalance) {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail:
  //           'Entered amount exceeds available balance in selected source account(s).',
  //       });
  //       currentRow.netAllocation = 0;
  //       currentRow.isSelected = false;
  //       return;
  //     }

  //     if (enteredValue > cappedByBalance || enteredValue > allowedRemaining) {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail:
  //           'Entered amount exceeds allowable limits (target balance or source availability).',
  //       });
  //       currentRow.netAllocation = 0;
  //       currentRow.isSelected = false;
  //       return;
  //     }

  //     currentRow.isSelected = finalValue > 0;
  //     currentRow.netAllocation = finalValue;
  //   }

  //   // --- Update totals dynamically ---
  //   this.totalAllocated = this.dataset.reduce(
  //     (sum, v) => (v.isSelected ? sum + Number(v.netAllocation || 0) : sum),
  //     0
  //   );

  //   // --- Update remaining balance (from side) ---
  //   const usedValue = this.totalAllocated;
  //   fromVouchers.forEach((v) => {
  //     const base = isPaymentFlow ? v.debit : v.credit;
  //     v[remainingKey] = Math.max(0, Number(base || 0) - usedValue);
  //   });

  //   // --- Refresh footer totals ---
  //   this.recalculateTotals();

  //   // --- Emit updated dataset if needed ---
  //   this.dataEvent.emit(this.dataset);
  // }

  onNetAllocationChange(
    event: any,
    isSelected: boolean,
    newValue: number,
    transNo: number
  ) {
    const enteredValue = Number(newValue) || 0;

    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];

    const currentRow = this.dataset?.find((r) => r.transNo === transNo);
    if (!currentRow) return;

    const rowType = (currentRow.type || '').toUpperCase();

    if (fromTypes.includes(rowType)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Allocation can only be entered on target vouchers.',
      });
      return;
    }

    const fromVouchers = this.dataset.filter(
      (v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected
    );

    if (!fromVouchers.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Select at least one source voucher first.',
      });
      currentRow.netAllocation = 0;
      currentRow.isSelected = false;
      return;
    }

    const baseTargetBalance = isPaymentFlow
      ? Number(currentRow.credit || 0)
      : Number(currentRow.debit || 0);

    if (enteredValue > baseTargetBalance) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Entered amount exceeds target voucher balance.',
      });

      currentRow.netAllocation = 0;
      currentRow.isSelected = false;
      currentRow.balance = currentRow.tempbalance;
      this.recalculateTotals();
      return;
    }

    currentRow.netAllocation = enteredValue;
    currentRow.balance =
      enteredValue == 0
        ? currentRow.tempbalance
        : Number((baseTargetBalance - enteredValue).toFixed(2));
    currentRow.isSelected = enteredValue > 0;

    this.recalculateTotals();

    this.dataEvent.emit(this.dataset);
  }

  patchValues(e: any) {
    return this.fb.group({
      AccountsTransactionsTransSno: e.transNo,
      AccountsTransactionsAllocBalance: e.balance,
      AllocationVoucherDetailsVno: e.voucherNo,
      AllocationVoucherDetailsAllocDebit: e.debit,
      AllocationVoucherDetailsAllocCredit: e.credit,
      AllocationVoucherDetailsRefVType: e.type,
      AllocationVoucherDetailsNetAllocation: parseFloat(e?.netAllocation) || 0,
      RefSPDate: e.transDate,
      AllocationVoucherDetailsAccNo: this.accNO,
      RefSPAccountNo: this.accNO,
    });
  }

  ReleaseVoucherAllocation() {
    if (!this.isValidVouchers()) return;
    const data = this.dataset?.filter((x) => x.isSelected == true);

    const control = <FormArray>this.VAForm.get('VoucherAllocationDetails');
    control.clear();
    data.forEach((x) => {
      if (x.isSelected) {
        control.push(this.patchValues(x));
        this.VAForm.get('allocationVoucherId').setValue(x.allocationId);
      }
    });
    //

    this.confirmationService.confirm({
      key: 'confirm-key',
      message: 'Do you want to Release the selected voucher?',
      accept: () => {
        this.accService
          .ReleaseVoucherAllocation(this.VAForm.value)
          .subscribe((response: ApiResponse<any>) => {
            if (response.valid && response.result) {
              this.totalDebit = 0;
              this.totalCredit = 0;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: response.message,
              });
              this.getAllocationDetails();
            }
          });
      },
    });
  }

  isValidVouchers(): boolean {
    const isPaymentFlow =
      this.fromVoucher?.toUpperCase() === 'PAYMENT' ||
      this.fromVoucher?.toUpperCase() === 'BANK PAYMENT';

    const expectedType1 = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';
    const expectedType2 = isPaymentFlow
      ? this.fromVoucher?.toUpperCase() === 'PAYMENT'
        ? 'PAYMENT'
        : 'BANK PAYMENT'
      : this.fromVoucher?.toUpperCase() === 'RECEIPT'
      ? 'RECEIPT'
      : 'BANK RECEIPT';
    const selected = this.dataset?.filter((row: any) => row.isSelected);

    if (selected.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Please select vouchers to allocate.`,
      });
      return false;
    }

    const hasType1 = selected.some(
      (r) => r.type?.toUpperCase() === expectedType1
    );
    const hasType2 = selected.some(
      (r) => r.type?.toUpperCase() === expectedType2
    );

    if (!hasType1 || !hasType2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Please select both ${expectedType1} and ${expectedType2} vouchers to release allocation.`,
      });
      return false;
    }

    if (selected.length === 1) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `You must select exactly two vouchers — one ${expectedType1} and one ${expectedType2}.`,
      });
      return false;
    }

    return true;
  }

  VoucherAllocationFormSubmit() {
    if (this.remainingBalance > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Remaining balance is not zero.',
      });
      return;
    }
    this.VAForm.get('allocationVoucherId').setValue(0);
    if (
      this.total_Credit > 0 &&
      this.total_Debit > 0 &&
      this.total_Credit === this.total_Debit
    ) {
      const data = this.dataset?.filter((x) => x.isSelected == true);
      const control = <FormArray>this.VAForm.get('VoucherAllocationDetails');
      control.clear();
      data.forEach((x) => {
        if (x.isSelected) {
          const isPaymentOrReceipt = [
            'PAYMENT',
            'BANK PAYMENT',
            'RECEIPT',
            'BANK RECEIPT',
          ].includes(x.type?.toUpperCase());

          x.netAllocation = isPaymentOrReceipt
            ? this.totalAllocated
            : x.netAllocation;
          control.push(this.patchValues(x));
        }
      });

      this.confirmationService.confirm({
        key: 'confirm-key',
        message: 'Do you want to Save the selected voucher?',
        accept: () => {
          this.accService
            .AddEditVoucherAllocation(this.VAForm.value)
            .subscribe((response: ApiResponse<any>) => {
              if (response.valid && response.result) {
                this.totalDebit = 0;
                this.totalCredit = 0;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message,
                });
                this.getAllocationDetails();
              }
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Sorry! Debit and Credit do not match.',
      });
    }
  }

  getAllocationDetails() {
    this.accService
      .getPaymentAllocationVoucherDetails(
        this.accNO,
        this.refNO,
        this.fromVoucher
      )
      .subscribe((response: ApiResponse<any>) => {
        if (response.valid && response.result.length > 0) {
          this.totalCredit = 0;
          this.totalDebit = 0;
          this.total_Credit = 0;
          this.total_Debit = 0;
          this.totalAllocated = 0;
          this.totalBalance = 0;
          this.dataset = [];
          this.dataset = this.isSelectedInArray(response.result);
        } else {
          this.dataset = response.result;
        }
      });
  }

  AutoAllocateVouchers() {
    // --- Auto Allocate Logic (follow VoucherAllocationFormSubmit logic) ---
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);
    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];
    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

    // Reset all allocations and selections
    (this.dataset || []).forEach((v) => {
      v.isSelected = false;
      v.netAllocation = 0;
      if (['PAYMENT', 'BANK PAYMENT'].includes((v.type || '').toUpperCase())) {
        v.remainingDebit = Number(Number(v.debit || 0).toFixed(2));
      } else if (
        ['RECEIPT', 'BANK RECEIPT'].includes((v.type || '').toUpperCase())
      ) {
        v.remainingCredit = Number(Number(v.credit || 0).toFixed(2));
      } else if ((v.type || '').toUpperCase() === 'PURCHASEVOUCHER') {
        v.balance = Number(Number(v.credit || 0).toFixed(2));
      } else if ((v.type || '').toUpperCase() === 'SALESVOUCHER') {
        v.balance = Number(Number(v.debit || 0).toFixed(2));
      }
    });

    // Select all from vouchers
    const fromVouchers = (this.dataset || []).filter((v) =>
      fromTypes.includes(v.type?.toUpperCase())
    );
    fromVouchers.forEach((v) => (v.isSelected = true));

    // Select all to vouchers
    const toVouchers = (this.dataset || []).filter(
      (v) => v.type?.toUpperCase() === toType
    );
    toVouchers.forEach((v) => (v.isSelected = false)); // will be set true if allocated

    let totalAllocated = 0;
    for (const to of toVouchers) {
      let balance = Number(to.balance || 0);
      if (balance <= 0) {
        to.balance = Number(0).toFixed(2);
        continue;
      }
      for (const from of fromVouchers) {
        const remainingKey = isPaymentFlow
          ? 'remainingDebit'
          : 'remainingCredit';
        let remaining = Number(from[remainingKey] || 0);
        if (remaining <= 0) continue;
        const allocateNow = Math.min(balance, remaining);
        from[remainingKey] = Number((remaining - allocateNow).toFixed(2));
        balance = Number((balance - allocateNow).toFixed(2));
        to.netAllocation = Number(
          ((to.netAllocation || 0) + allocateNow).toFixed(2)
        );
        totalAllocated += allocateNow;
        if (balance <= 0) break;
      }
      to.isSelected = to.netAllocation > 0;
      to.balance = Number(balance.toFixed(2));
    }

    // --- After allocation, subtract netAllocation from balance for each to voucher ---
    // for (const to of toVouchers) {
    //   if (to.isSelected && to.netAllocation > 0) {
    //     to.balance = Number(
    //       // ((Number(to.balance) || 0) - Number(to.netAllocation)).toFixed(2)
    //     );
    //   }
    // }

    this.totalAllocated = Number(totalAllocated.toFixed(2));
    this.recalculateTotals();
    this.dataEvent.emit(this.dataset);
  }
  private selectionCounter = 0;
  onVoucherSelectionChange(row: any) {
    const upperType = row.type?.toUpperCase();

    // Assign order when selected
    if (row.isSelected) {
      row.selectionOrder = ++this.selectionCounter;
    } else {
      delete row.selectionOrder;
    }

    // --- Your existing code continues below ---
    const isSelected = row.isSelected;

    const voucherConfig: any = {
      PAYMENT: {
        pair: 'PURCHASEVOUCHER',
        balanceKey: 'remainingDebit',
        amountKey: 'debit',
      },
      BANK_PAYMENT: {
        pair: 'PURCHASEVOUCHER',
        balanceKey: 'remainingDebit',
        amountKey: 'debit',
      },
      RECEIPT: {
        pair: 'SALESVOUCHER',
        balanceKey: 'remainingCredit',
        amountKey: 'credit',
      },
      BANK_RECEIPT: {
        pair: 'SALESVOUCHER',
        balanceKey: 'remainingCredit',
        amountKey: 'credit',
      },
      PURCHASEVOUCHER: { balanceKey: 'credit' },
      SALESVOUCHER: { balanceKey: 'debit' },
    };

    const config = voucherConfig[upperType];
    if (!config) return;

    if (
      ['PAYMENT', 'BANK PAYMENT', 'RECEIPT', 'BANK RECEIPT'].includes(
        upperType
      ) &&
      !isSelected
    ) {
      row[config.balanceKey] = Number(row[config.amountKey] || 0);

      const anySelected = this.dataset.some(
        (v) => v.type?.toUpperCase() === upperType && v.isSelected
      );

      if (!anySelected) {
        this.resetVoucherAllocations(config.pair);
      }

      this.recalculateAllocation();
      return;
    }

    if (
      !isSelected &&
      ['PURCHASEVOUCHER', 'SALESVOUCHER'].includes(upperType)
    ) {
      row.netAllocation = 0;
      row.balance = Number(row[config.balanceKey] || 0);
      this.recalculateAllocation();
      return;
    }

    this.recalculateAllocation();
  }

  private resetVoucherAllocations(type: string) {
    this.dataset.forEach((v) => {
      if (v.type.toUpperCase() === type) {
        v.isSelected = false;
        v.netAllocation = 0;
        v.balance =
          type === 'PURCHASEVOUCHER'
            ? Number(v.credit || 0)
            : Number(v.debit || 0);
      }
    });
  }

  // private recalculateAllocation() {
  //   const upperVoucher = this.fromVoucher?.toUpperCase();
  //   const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

  //   const fromTypes = isPaymentFlow
  //     ? ['PAYMENT', 'BANK PAYMENT']
  //     : ['RECEIPT', 'BANK RECEIPT'];
  //   const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

  //   const fromVouchers = (this.dataset || [])
  //     .filter((v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected)
  //     .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));
  //   if (!fromVouchers.length) {
  //     this.messageService.add({
  //       severity: 'error',
  //       summary: 'Error',
  //       detail: 'Select at least one source voucher first.',
  //     });
  //     return;
  //   }

  //   const toVouchers = (this.dataset || [])
  //     .filter((v) => v.type?.toUpperCase() === toType && v.isSelected)
  //     .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

  //   // Reset allocation values
  //   (this.dataset || []).forEach((v) => {
  //     const t = (v.type || '').toUpperCase();

  //     v.netAllocation = 0;

  //     if (['PAYMENT', 'BANK PAYMENT'].includes(t)) {
  //       v.remainingDebit = Number(Number(v.debit || 0).toFixed(2));
  //     } else if (['RECEIPT', 'BANK RECEIPT'].includes(t)) {
  //       v.remainingCredit = Number(Number(v.credit || 0).toFixed(2));
  //     } else if (t === 'PURCHASEVOUCHER') {
  //       v.balance = Number(Number(v.credit || 0).toFixed(2));
  //     } else if (t === 'SALESVOUCHER') {
  //       v.balance = Number(Number(v.debit || 0).toFixed(2));
  //     } else {
  //       v.remainingDebit = Number(Number(v.remainingDebit || 0).toFixed(2));
  //       v.remainingCredit = Number(Number(v.remainingCredit || 0).toFixed(2));
  //       v.balance = Number(Number(v.balance || 0).toFixed(2));
  //     }
  //   });

  //   // Nothing selected
  //   if (!fromVouchers.length && !toVouchers.length) {
  //     this.totalAllocated = 0;
  //     this.remainingBalance = 0;
  //     this.recalculateTotals();
  //     return;
  //   }

  //   let totalAllocated = 0;

  //   // Allocation logic
  //   for (const to of toVouchers) {
  //     let balance = Number(to.balance || 0);

  //     if (balance <= 0) {
  //       to.balance = Number(0).toFixed(2);
  //       continue;
  //     }

  //     for (const from of fromVouchers) {
  //       const remainingKey = isPaymentFlow
  //         ? 'remainingDebit'
  //         : 'remainingCredit';
  //       let remaining = Number(from[remainingKey] || 0);

  //       if (remaining <= 0) continue;

  //       const allocateNow = Math.min(balance, remaining);

  //       // subtract from source
  //       from[remainingKey] = Number((remaining - allocateNow).toFixed(2));

  //       // update target balance
  //       balance = Number((balance - allocateNow).toFixed(2));

  //       // update net allocation
  //       to.netAllocation = Number(
  //         ((to.netAllocation || 0) + allocateNow).toFixed(2)
  //       );

  //       totalAllocated += allocateNow;
  //     }

  //     // final remaining balance on TO voucher
  //     to.balance = Number(balance.toFixed(2));
  //   }

  //   // Remaining balance from FROM vouchers
  //   const remainingBalance = fromVouchers.reduce((sum, f) => {
  //     const key = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';
  //     return sum + Number(f[key] || 0);
  //   }, 0);

  //   this.totalAllocated = Number(totalAllocated.toFixed(2));
  //   this.remainingBalance = Number(remainingBalance.toFixed(2));

  //   this.recalculateTotals();
  // }
  private recalculateAllocation() {
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];

    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

    const fromVouchers = (this.dataset || [])
      .filter((v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    if (!fromVouchers.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Selection Required',
        detail: 'Select at least one source voucher first.',
      });

      this.resetVoucherAllocations(toType);

      this.totalAllocated = 0;
      this.remainingBalance = 0;

      this.recalculateTotals();
      return;
    }

    const toVouchers = (this.dataset || [])
      .filter((v) => v.type?.toUpperCase() === toType && v.isSelected)
      .sort((a, b) => (a.selectionOrder || 0) - (b.selectionOrder || 0));

    // --- Reset allocation values ---
    (this.dataset || []).forEach((v) => {
      const t = (v.type || '').toUpperCase();

      v.netAllocation = 0;

      if (['PAYMENT', 'BANK PAYMENT'].includes(t)) {
        v.remainingDebit = Number(Number(v.debit || 0).toFixed(2));
      } else if (['RECEIPT', 'BANK RECEIPT'].includes(t)) {
        v.remainingCredit = Number(Number(v.credit || 0).toFixed(2));
      } else if (t === 'PURCHASEVOUCHER') {
        v.balance = Number(Number(v.credit || 0).toFixed(2));
      } else if (t === 'SALESVOUCHER') {
        v.balance = Number(Number(v.debit || 0).toFixed(2));
      }
    });

    // Nothing selected on target side
    if (!toVouchers.length) {
      this.totalAllocated = 0;
      this.remainingBalance = fromVouchers.reduce((sum, f) => {
        const key = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';
        return sum + Number(f[key] || 0);
      }, 0);

      this.recalculateTotals();
      return;
    }

    let totalAllocated = 0;

    // --- Allocation logic ---
    for (const to of toVouchers) {
      let balance = Number(to.balance || 0);

      for (const from of fromVouchers) {
        const remainingKey = isPaymentFlow
          ? 'remainingDebit'
          : 'remainingCredit';

        const remaining = Number(from[remainingKey] || 0);
        if (remaining <= 0 || balance <= 0) continue;

        const allocateNow = Math.min(balance, remaining);

        from[remainingKey] = Number((remaining - allocateNow).toFixed(2));
        balance = Number((balance - allocateNow).toFixed(2));

        to.netAllocation = Number(
          ((to.netAllocation || 0) + allocateNow).toFixed(2)
        );

        totalAllocated += allocateNow;
      }

      to.balance = Number(balance.toFixed(2));
    }

    const remainingBalance = fromVouchers.reduce((sum, f) => {
      const key = isPaymentFlow ? 'remainingDebit' : 'remainingCredit';
      return sum + Number(f[key] || 0);
    }, 0);

    this.totalAllocated = Number(totalAllocated.toFixed(2));
    this.remainingBalance = Number(remainingBalance.toFixed(2));

    this.recalculateTotals();
  }

  private recalculateTotals() {
    const upperVoucher = this.fromVoucher?.toUpperCase();
    const isPaymentFlow = ['PAYMENT', 'BANK PAYMENT'].includes(upperVoucher);

    const fromTypes = isPaymentFlow
      ? ['PAYMENT', 'BANK PAYMENT']
      : ['RECEIPT', 'BANK RECEIPT'];

    const toType = isPaymentFlow ? 'PURCHASEVOUCHER' : 'SALESVOUCHER';

    // --- Filter selected vouchers ---
    const fromList =
      this.dataset?.filter(
        (v) => fromTypes.includes(v.type?.toUpperCase()) && v.isSelected
      ) || [];

    const toList =
      this.dataset?.filter(
        (v) => v.type?.toUpperCase() === toType && v.isSelected
      ) || [];

    // --- Safe numeric extractor ---
    const num = (v: any, field: string) => Number(v?.[field] || 0);

    // --- Calculate debit and credit totals based on flow ---
    const totalDebitSource = isPaymentFlow ? fromList : toList;
    const totalCreditSource = isPaymentFlow ? toList : fromList;

    this.totalDebit = totalDebitSource.reduce(
      (sum, v) => sum + num(v, 'debit'),
      0
    );
    this.totalCredit = totalCreditSource.reduce(
      (sum, v) => sum + num(v, 'credit'),
      0
    );

    // --- Allocation total ---
    this.totalAllocated = toList.reduce(
      (sum, v) => sum + num(v, 'netAllocation'),
      0
    );

    // --- Compute remaining balance for each 'from' record ---
    this.remainingBalance = fromList.reduce((sum, v) => {
      const baseBalance = num(
        v,
        isPaymentFlow ? 'remainingDebit' : 'remainingCredit'
      );
      return sum + baseBalance;
    }, 0);

    // --- Compute capped balance ---
    const totalLimit = isPaymentFlow ? this.totalCredit : this.totalDebit;
    const cappedBalance = fromList.reduce((sum, v) => {
      const balance = num(v, 'balance');
      return sum + Math.min(balance, totalLimit);
    }, 0);

    // --- Assign final Debit/Credit totals ---
    if (isPaymentFlow) {
      this.total_Debit = this.totalAllocated;
      this.total_Credit = Math.min(this.totalCredit, cappedBalance);
    } else {
      this.total_Debit = Math.min(this.totalDebit, cappedBalance);
      this.total_Credit = this.totalAllocated;
    }

    // --- Update form controls ---
    const controls = this.VAForm.controls;
    controls['AllocationVoucherTotalDebit'].setValue(this.total_Debit);
    controls['AllocationVoucherTotalCredit'].setValue(this.total_Credit);
  }
}
