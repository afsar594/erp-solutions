import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  MessageService,
  MegaMenuItem,
  MenuItem,
  Menu,
  TreeNode,
} from 'primeng';
import { AppComponent } from 'src/app/app.component';
import { StationMaster } from 'src/app/routes/domain/StationMaster';
import { LoginService } from 'src/app/routes/service/login.service';
import { MasterApiService } from 'src/app/routes/service/master.api.services';
import { NotificationService } from 'src/app/shared/service/notification.service';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { LocalStorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.scss'],
})
export class AppTopBarComponent implements OnInit, AfterViewInit {
  model: Menu[] = [];
  items: MegaMenuItem[] = [];
  workGroupId: any;
  tree: TreeNode[] = [];
  user: any;
  companyDetails: StationMaster;
  @Output() menuToggle = new EventEmitter<void>(); // Emit event to parent component
 
  toggleMenu() {
    this.menuToggle.emit(); // Emit the event to toggle the menu
  }
  userData: any;
  constructor(
    public app: AppComponent,
    private loginser: LoginService,

    private permission: PermissionsService,
    private masterApi: MasterApiService,
    private _local: LocalStorageService,
    public router: Router,
    public notificationService:NotificationService
  ) {
    this.workGroupId = this.loginser.GetCredentialData().workGroupId;
  }
  ngOnInit() {
    this.userData = this.loginser.GetCredentialData();
    this.notificationService.getNotifications();
  }

 

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.companyDetails = this.permission.getStation();
      this.user = this._local.get('Login').userName;
      this.userData = this.loginser.GetCredentialData();
    }, 2000);
  }
  // getMenuByGroup(id: number) {
  //   this.masterApi.getMenuByGroup(id).subscribe((response: any) => {
  //     const result = response.result;
  //     this.items = this.mapMenuItems(result);
  //   });

  // }

  mapMenuItems(result: any[]): MegaMenuItem[] {
    const megaMenuItems: MegaMenuItem[] = [];

    for (const item of result) {
      const megaMenuItem: MegaMenuItem = {
        label: item.label,
        icon: item.icon,
        url: item.url ? `#${item.url}` : undefined,
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
        url: item.url ? `#${item.url}` : undefined,
        items: this.mapSubsubItems(item.items),
        target: '_self',
      };
      return menusubItem;
    });
  }
}
