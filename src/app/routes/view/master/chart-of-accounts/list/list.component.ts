import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import {
  MenuItem,
  TreeNode,
  MessageService,
  SelectItem,
  ConfirmationService,
} from 'primeng/api';
import { ChartofAccounts } from 'src/app/routes/domain';
import { TranslateService } from '@ngx-translate/core';
import { AccountApiService } from 'src/app/routes/service/account.api.service';
import { AccountMasterStatus } from 'src/app/routes/Enums/ChartofAccount';
import { DialogService, DynamicDialogRef } from 'primeng';
import { EntryComponent } from '../entry/entry.component';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  accountData: ChartofAccounts;
  displayBasic: boolean;
  title: string;
  G: boolean = false;
  // S: boolean = false;
  A: boolean = true;
  items: any[] = [
    {
      label: 'New  Account Group',
      icon: 'pi pi-align-left',
      command: (event) => {
        this.AccountMasterGrpFormGroup.reset();
        debugger;
        let data: ChartofAccounts =
          this.selectedFile.data != null
            ? (this.selectedFile.data as ChartofAccounts)
            : { maAccNo: null };
        this.AccountMasterGrpFormGroup.controls.itemMasterAccountNo.setValue(
          data.maAccNo
        );
        this.AccountMasterGrpFormGroup.controls.itemMasterAccountName.setValue(
          data.maAccName
        );
        this.gChange = false;
        this.showBasicDialog('add');
      },

      disabled: false,
    },
    {
      label: 'Edit Account Group',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.AccountMasterGrpFormGroup.reset();

        this.AccountMasterGrpFormGroup.patchValue({
          maAccNo: this.selectedFile.data.maAccNo,
          maAccName: this.selectedFile.data.maAccName,
          itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
          maManualCode: this.selectedFile.data.maManualCode,
          itemMasterAccountName:
            this.selectedFile.data.maRelativeNo == '0'
              ? 'Account Master'
              : this.accountList?.find(
                  (i) => i.value == this.selectedFile.data.maRelativeNo
                )?.label,
        });
        this.gChange = false;
        this.showBasicDialog('edit');
      },
      disabled: false,
    },

    {
      label: 'New Account',
      icon: 'pi pi-plus',
      command: (event) => {
        this.ref = this.dialogService.open(EntryComponent, {
          data: {
            button: false,
            pageType: 'add',
            maAccNo: this.selectedFile.data.maAccNo,
            allGroup: this.allGroups,
            itemMasterAccountName:
              this.selectedFile.data.maRelativeNo == '0'
                ? 'Account Master'
                : this.accountList?.find(
                    (i) => i.value == this.selectedFile.data.maRelativeNo
                  )?.label,
          },
          header: 'New Account',
          width: '50%',
          baseZIndex: 1,
        });
        this.ref.onClose.subscribe((item: any) => {
          if (item) {
            this.getAllAccounts();
          }
        });
      },

      disabled: false,
    },

    {
      label: 'Edit Account',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.selectedFile.data;
        this.ref = this.dialogService.open(EntryComponent, {
          data: {
            button: false,
            pageType: 'edit',
            maAccNo: this.selectedFile.data.maAccNo,
            itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
            itemMasterAccountName:
              this.selectedFile.data.maRelativeNo == '0'
                ? 'Account Master'
                : this.accountList?.find(
                    (i) => i.value == this.selectedFile.data.maRelativeNo
                  )?.label,

            allGroup: this.allGroups,
          },
          header: 'Edit Account',
          width: '50%',
          baseZIndex: 1,
        });
        this.ref.onClose.subscribe((item: any) => {
          if (item) {
            this.getAllAccounts();
          }
        });
      },
      disabled: false,
    },
    {
      label: 'Change Parent Group',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.AccountMasterGrpFormGroup.patchValue({
          maAccNo: this.selectedFile.data.maAccNo,
          maAccName: this.selectedFile.data.maAccName,
          itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
          itemMasterAccountName:
            this.selectedFile.data.maRelativeNo == '0'
              ? 'Account Master'
              : this.accountList?.find(
                  (i) => i.value == this.selectedFile.data.maRelativeNo
                )?.label,
        });
        this.gChange = true;
        this.showBasicDialog('edit');
      },
      disabled: false,
      visible: () =>
        this.selectedFile.data.maAccType == 'G' &&
        this.selectedFile.data.maAccType == 'S',
    },
    {
      label: 'Change Account Group',
      icon: 'pi pi-user-edit',
      command: (event) => {
        this.ref = this.dialogService.open(EntryComponent, {
          data: {
            button: false,
            pageType: 'edit',
            maAccNo: this.selectedFile.data.maAccNo,
            itemMasterAccountNo: this.selectedFile.data.maRelativeNo,
            itemMasterAccountName:
              this.selectedFile.data.maRelativeNo == '0'
                ? 'Account Master'
                : this.accountList?.find(
                    (i) => i.value == this.selectedFile.data.maRelativeNo
                  )?.label,

            allGroup: this.allGroups,
            changeG: true,
          },
          header: 'Change Account Group',
          width: '50%',
          baseZIndex: 1,
        });
        this.ref.onClose.subscribe((item: any) => {
          if (item) {
            this.getAllGroups();
          }
        });
      },
      visible: () =>
        this.selectedFile.data.maAccType !== 'G' &&
        this.selectedFile.data.maAccType !== 'S',

      disabled: false,
    },
  ];

  url: any;
  btnFlag: ButtonFlag;
  breadcumbmodel: MenuItem[];
  parentGroup: SelectItem[] = [];
  itemGroup: SelectItem[] = [];
  accountArray: ChartofAccounts[] = [];
  accountList: SelectItem[] = [];
  AccountMasterGrpFormGroup: FormGroup;
  AccountMasterGrpForm: FormGroup;
  accountGroupSub: SelectItem[] = [];
  ParentAccountList: any[] = [];
  AllAccountList: any[] = [];
  MainAllAccountList: any[] = [];
  allGroups: any;
  gChange: boolean = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private activatedroute: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private confirmation: ConfirmationService,
    private accountapi: AccountApiService,
    private masterapi: MasterApiService,
    public dialogService: DialogService
  ) {}
  files: TreeNode[];
  selectedFile: TreeNode;
  findItem: string;
  findGroup: string;

  ngOnInit(): void {
    this.AccountMasterGrpFormGroup = this.fb.group({
      maAccNo: [null],
      maAccName: [null],
      itemMasterAccountNo: [null],
      itemMasterAccountName: [null],
      maManualCode: [null],
    });

    this.getAllAccount();
    this.breadcumbmodel = this.router.url
      .slice(1)
      .split('/')
      .map((k) => ({ label: k }));
    this.activatedroute.data.subscribe((data) => {
      this.title = data.title;
    });
    this.getAllAccounts();
    this.getAllGroups();
  }

  getAllAccounts() {
    this.masterapi.getAccountParentTreeNode().subscribe((data) => {
      this.ParentAccountList = data.result;
      this.files = [
        {
          label: 'Account Master',
          key: 'Account Master',
          data: null,
          expandedIcon: 'pi pi-folder-open',
          expanded: true,
          collapsedIcon: 'pi pi-folder',
          children: data.result.map((k) => {
            return {
              label: k.maAccName,
              key: k.maAccNo,
              data: k,
              expandedIcon: 'pi pi-folder-open',
              collapsedIcon: 'pi pi-folder',
              children: [],
              leaf: false,
            };
          }),
          leaf: false,
        },
      ];
    });
  }

  getAllGroups() {
    this.masterapi.getAllGroup().subscribe((data) => {
      this.allGroups = data.result;
      this.accountGroupSub = data.result.map((k) => ({
        label: k.maAccName,
        value: k.maAccNo,
      }));
      this.accountGroupSub.unshift({ label: 'Account Master', value: null });
    });
  }

  onRightClick($event: any, cm: any) {
    const selectedNode = $event.node.data;
    cm.model.forEach((item, index) => {
      if (selectedNode.maAccType === 'G' || selectedNode.maAccType === 'S') {
        switch (index) {
          case 0:
          case 1:
          case 2:
            item.disabled = false;
            break;
          case 3:
            item.disabled = true;
            break;
          default:
            break;
        }
      } else {
        switch (index) {
          case 0:
          case 1:
          case 2:
            item.disabled = true;
            break;
          case 3:
            item.disabled = false;
            break;
          default:
            break;
        }
      }
      if (selectedNode.maAccType === 'G' || selectedNode.maAccType === 'S') {
        switch (index) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
            item.visible = true;
            break;
          case 5:
            item.visible = false;
          default:
            break;
        }
      } else {
        switch (index) {
          case 0:
          case 1:
          case 2:
          case 3:
            break;
          case 4:
            item.visible = false;
            break;
          case 5:
            item.visible = true;
          default:
            break;
        }
      }
    });
  }

  loadNode(event) {
    if (event.node) {
      this.masterapi
        .getAccountChildrenByParentTreeNode(event.node.data.maAccNo)
        .subscribe((data) => {
          event.node.children = [];
          for (const item of data.result) {
            event.node.children.push({
              label: item.maAccName,
              key: item.maAccNo,
              data: item,
              icon:
                item.maAccType === AccountMasterStatus.SubGroup
                  ? 'pi pi-folder'
                  : 'fa fa-file-o',
              leaf:
                item.maAccType === AccountMasterStatus.SubGroup ? false : true,
            });
          }
        });
    }
  }

  getItemData($event) {
    const itemmasterData = this.selectedFile.data as ChartofAccounts;

    this.accountData = itemmasterData;
    this.G =
      this.accountData.maAccType == 'G'
        ? true
        : this.accountData.maAccType == 'S'
        ? true
        : false;
    this.A = this.accountData.maAccType == 'A' ? true : false;
  }

  findAccount() {
    if (this?.findGroup) {
      this.AllAccountList = this.MainAllAccountList?.filter(
        (a) => a.maAccName.includes(this?.findGroup) && a.maAccType != 'A'
      );
      if (this?.findItem) {
        this.AllAccountList = this.AllAccountList?.filter(
          (a) => a.maAccName.includes(this?.findItem) && a.maAccType == 'A'
        );
        //  this.files = this.AllAccountList;
      } else {
        this.AllAccountList = this.AllAccountList;
        // this.files = this.AllAccountList;
      }
    } else if (this?.findItem) {
      this.AllAccountList = this.MainAllAccountList?.filter(
        (a) => a.maAccName.includes(this?.findItem) && a.maAccType == 'A'
      );
      //  this.files = this.AllAccountList;
    } else {
      // this.files = this.ParentAccountList;
    }
  }

  getAllAccount() {
    this.accountapi.GetAllAcounts().subscribe((k) => {
      this.accountArray = k.result;
      this.MainAllAccountList = k.result;
      this.accountList = k.result.map((kl) => ({
        label: kl.maAccName,
        value: kl.maAccNo,
      }));
      this.accountList.unshift({ label: '--Select--', value: -1 });
    });
  }

  showBasicDialog(type) {
    if (type == 'add') {
      this.btnFlag = { save: true };
    } else {
      this.btnFlag = { save: false };
    }
    this.displayBasic = true;
  }

  ExitNew() {
    this.router.navigate(['/dashboard']);
  }

  saveGroup() {
    const accountData: ChartofAccounts = this.AccountMasterGrpFormGroup
      .value as ChartofAccounts;
    accountData.maSno = this.selectedFile?.data?.maSno;
    accountData.maRelativeNo = this.AccountMasterGrpFormGroup.value
      .itemMasterAccountNo
      ? this.AccountMasterGrpFormGroup.value.itemMasterAccountNo
      : '0';
    accountData.maManualCode =
      this.AccountMasterGrpFormGroup.value.maManualCode ?? '';
    accountData.maAccNo = accountData.maAccNo ?? '';
    if (accountData.maRelativeNo == '0') {
      accountData.maAccType = 'G';
    } else {
      accountData.maAccType = AccountMasterStatus.SubGroup;
    }
    this.confirmation.confirm({
      key: 'confirm-key',
      message: this.btnFlag.save
        ? this.translate.instant('Do you want to save Account Group?')
        : this.translate.instant('Do you want to Update Account?'),
      accept: () => {
        this.masterapi.InsertAccount(accountData).subscribe((data) => {
          if (accountData != null) {
            this.getAllAccounts();
            this.getAllGroups();
          }
          this.files = [
            {
              label: 'Item Master',
              key: 'Item Master',
              data: null,
              expandedIcon: 'pi pi-folder-open',
              expanded: true,
              collapsedIcon: 'pi pi-folder',
              children: data.result.map((k) => ({
                label: k.maAccName,
                key: k.maAccNo,
                data: k,
                expandedIcon: 'pi pi-folder-open',
                collapsedIcon: 'pi pi-folder',
                children: [],
                leaf: false,
              })),
              leaf: false,
            },
          ];

          // Update selectedFile.data after successful insertion/update
          setTimeout(() => {
            this.selectedFile.data = data.result?.find(
              (k) => k.maAccNo === this.selectedFile.data.maAccNo
            );
          }, 0);

          // Show success message
          this.messageService.add({
            severity: 'success',
            summary: 'Alert',
            detail: 'Item Group is added',
          });
        });
      },
      // Handle rejection or cancel if needed
    });
  }

  delete() {
    const accountData: ChartofAccounts = this.selectedFile
      .data as ChartofAccounts;

    this.masterapi.DeleteAccount(accountData).subscribe((data) => {
      this.files = [
        {
          label: 'Item Master',
          key: 'Item Master',
          data: null,
          expandedIcon: 'pi pi-folder-open',
          expanded: true,
          collapsedIcon: 'pi pi-folder',
          children: data.result.map((k) => {
            return {
              label: k.maAccName,
              key: k.maAccNo,
              data: k,
              expandedIcon: 'pi pi-folder-open',
              collapsedIcon: 'pi pi-folder',
              children: [],
              leaf: false,
            };
          }),
          leaf: false,
        },
      ];
      this.messageService.add({
        severity: 'success',
        summary: 'Alert',
        detail: data.message,
      });
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
