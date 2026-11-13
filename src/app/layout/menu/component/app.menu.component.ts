import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Menu } from 'src/app/routes/domain/Administration/menu';
import { MegaMenuItem, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { Router } from '@angular/router';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { LoginService } from 'src/app/routes/service/login.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrls: ['./app.menu.component.scss'],
})
export class AppMenuComponent implements OnInit {
  @Input() itemMenu: MegaMenuItem[] = [];
  model: Menu[] = [];

  items: MegaMenuItem[] = [];
  workGroupId: any;
  tree: TreeNode[] = [];
  constructor(
    public router: Router,
    public app: AppComponent,
    private loginser: LoginService,
    private messageService: MessageService,
    private masterApi: MasterApiService,
    private _local: LocalStorageService,
    private _permission: PermissionsService
  ) {}

  ngOnInit() {
    this.workGroupId = this.loginser.GetCredentialData().workGroupId;
    this.getMenuByGroup(this.workGroupId);
    this.PermissionSetting(this.workGroupId);
  }
  toCurrency() {
    this.router.navigateByUrl('/master/currency');
  }
  PermissionSetting(id: number) {
    this.masterApi.PermissionSetting(id).subscribe((response: any) => {
      const result = response.result;
      const encryptedData = this._permission.encryptData(result);
      this._local.remove('List');
      this._local.set('List', encryptedData);
    });
  }
  getMenuByGroup(id: number) {
    let menuList = JSON.parse(localStorage.getItem('MenuById'));
    if (menuList && menuList.groupId == id) {
      this.items = this.mapMenuItems(menuList?.items);
      return;
    }
    this.masterApi.getMenuByGroup(id).subscribe((response: any) => {
      const result = {
        groupId: id,
        items: response.result,
      };
      this.items = this.mapMenuItems(result.items);
      localStorage.setItem('MenuById', JSON.stringify(result));
    });
  }

  mapMenuItems(result: any[]): MegaMenuItem[] {
    const megaMenuItems: MegaMenuItem[] = [];

    for (const item of result) {
      const megaMenuItem: MegaMenuItem = {
        label: item.label,
        icon: item.icon,
        url: '#$/dashboard',
        target: '_self',
      };
      if (item.items && item.items.length > 0) {
        megaMenuItem.items = this.mapSubItems(item.items);
      }
      megaMenuItems.push(megaMenuItem);
    }

    return megaMenuItems;
  }

  mapSubItems(items: any[]): MenuItem[][] {
    return items.map((item) => {
      const menuItem: MenuItem = {
        label: item.label,
        icon: item.icon,
        id: item.id,
        items: this.mapSubsubItems(item.items),
        target: '_self',
      };
      return [menuItem];
    });
  }

  mapSubsubItems(items: any[]): MenuItem[] {
    return items.map((item) => {
      const menusubItem: MenuItem = {
        label: item.label,
        icon: item.icon,
        id: item.id,
        url: item.url ? `#${item.url}?menu=${item.id}` : undefined,
        items: this.mapSubsubItems(item.items),
        target: '_self',
      };
      return menusubItem;
    });
  }
}
