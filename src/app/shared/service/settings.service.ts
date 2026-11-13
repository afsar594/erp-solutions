import { Direction } from '@angular/cdk/bidi';
import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { defaults, AppSettings } from './settings';


@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private notice$ = new Subject<any>();

  private options = defaults;

  public _notify$ = new BehaviorSubject<any>('ltr');

  get notice(): Observable<any> {
    return this.notice$.asObservable();
  }

  public notify(): Observable<any> {
    return this._notify$.asObservable();
  }
  setLayout(options?: AppSettings): AppSettings {
    this.options = Object.assign(defaults, options);
    return this.options;
  }

  setNavState(type: string, value: boolean) {
    this.notice$.next({ type, value } as any);
  }

  getOptions(): AppSettings {
    return this.options;
  }
  setLanguage(lang: string, dir: Direction) {
    this.options.language = lang;
    this.options.dir = dir;
    this._notify$.next({lang: lang,dir:dir});
  }
  
}
