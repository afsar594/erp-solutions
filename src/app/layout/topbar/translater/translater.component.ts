import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'src/app/shared/service/settings.service';
import { AppComponent } from 'src/app/app.component';
import { MenuItem } from 'primeng/api/menuitem';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { AppDirectionality } from 'src/app/shared/service/directionality.service';
@Component({
  selector: 'app-translater',
  templateUrl: './translater.component.html',
  styleUrls: ['./translater.component.scss']
})
export class TranslaterComponent implements OnInit {
  items: MenuItem[];
  constructor(public translate: TranslateService, private settings: SettingsService,
              public app: AppComponent) {
    translate.addLangs(['en-US', 'ar-SA']);
    translate.setDefaultLang('en-US');

    const browserLang = navigator.language;
    translate.use(browserLang.match(/en-US|ar-SA/) ? browserLang : 'en-US');
  }

  ngOnInit(): void {
    this.items = [
          {label: 'English', icon: 'pi pi-fw pi-microsoft', command: () => this.useLanguage('en-US', 'ltr')},
          {label: 'رمز قصير', icon: 'pi pi-fw pi-microsoft', command: () => this.useLanguage('ar-SA' , 'rtl')},
          {label: 'മലയാളം', icon: 'pi pi-fw pi-microsoft', command: () => this.useLanguage('ml-MA' , 'ltr')},
       ];
  }
  useLanguage(language: string, direction: Direction = 'ltr') {
    this.translate.use(language);
    this.settings.setLanguage(language, direction);
    this.settings._notify$.next({lang: language,dir:direction});
  }

}
