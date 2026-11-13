import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReportFilterModel } from '../domain/Masters/ReportFilterModel';
import { MasterApiService } from './master.api.services';

@Injectable({
  providedIn: 'root',
})
export class CrystalReportService {
  // CrystalbaseUrl: string = environment.crystalReportUrl;
  reporturl: string = environment.reportApiUrl;
  baseUrl: string = environment.apiRootURL;
  constructor(
    private httpClient: HttpClient,
    private masterApi: MasterApiService
  ) { }

  GetReportName(id) {
    return this.httpClient.get(this.baseUrl + `/master/GetReportName/${id}`);
  }

  public getreport2(data: any): Observable<any> {
    const rptOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'blob' as 'blob',
    };

    return this.httpClient.post(
      this.reporturl + 'cr/DynamicReportCall',
      data,
      rptOptions
    );
  }

  public getReportPrint(data: any, isByQuery: boolean) {
    const url = new URL(this.baseUrl);
    const host = url.hostname;
    const port = url.port;

    const clients =
      host === '194.233.95.37'
        ? this.getClientMapping1()
        : this.getClientMapping();

    const Client = clients[host] ?? clients[port] ?? clients['default'];

    const rptOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'blob' as 'blob',
    };

    if (isByQuery) {
      return this.httpClient.put(
        this.reporturl + 'Reports/getPrintByQuery/' + Client,
        data,
        rptOptions
      );
    } else {
      return this.httpClient.put(
        this.reporturl + 'Reports/getReportPrint/' + Client,
        data,
        rptOptions
      );
    }
  }

  downloadReport(data: ReportFilterModel) {
    const url = new URL(this.baseUrl);
    const host = url.hostname;
    const port = url.port;

    const clients =
      host === '194.233.95.37'
        ? this.getClientMapping1()
        : this.getClientMapping();

    const Client = clients[host] ?? clients[port] ?? clients['default'];

    const rptOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'blob' as const,
    };

    return this.httpClient.put(
      `${this.reporturl}reports/getReportPrint/${Client}`,
      data,
      rptOptions
    );
  }

  public getClientMapping(): Record<string, string> {
    return {
      '192.168.1.185': 'WaterBird',
      '8088': 'Hubco',
      '8094': 'InspireNc',
      '8096': 'Geomak',
      '8111': 'mexcio',
      '8302': 'Horizon',
      '8207': 'Demo',
      '8326': 'Springer',
      '8318': 'Technomak',
      '8018': 'SilverStar',
      '8015': 'AceVision',
      '8034': 'green',
      '8064': 'NGB',
      '8086': 'WaterBird',
      default: 'Demo',
    };
  }

  public getClientMapping1(): Record<string, string> {
    return {
      '8002': 'green',
      '8064': 'NGB',
      '8088': 'Hubco',
      '8111': 'mexcio',
      '8302': 'Horizon',
      '8207': 'Demo',
      '8326': 'Springer',
      '8318': 'Technomak',
      '8018': 'SilverStar',
      '8015': 'AceVision',
      '802': 'BetterBathware',
      '803': 'Universal',
      '806': 'Cosmo',
      '809': 'DemoNew',
      '811': 'Laundry',
      '885': 'AlRaedroad',
      default: 'Demo',
    };
  }
}
