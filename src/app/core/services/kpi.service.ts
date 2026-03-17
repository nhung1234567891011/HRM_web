import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
  providedIn: 'root'
})
export class KpiService {

  constructor(private http: HttpLoadingService) { }

  getPaging(request: any = null): Observable<any> {
    return this.http.get('kpi-table/paging', request);
  }
  getPagingDetailKpi(request: any = null): Observable<any> {
    return this.http.get('kpi-table-detail/paging', request);
  }

  getById(request: any = null): Observable<any> {
    return this.http.get('kpi-table/get-by-id', request);
  }

  create(request: any): Observable<any> {
    return this.http.postFormData('kpi-table/create', request);
  }

  update(kpiTableId:number, request: any): Observable<any> {
    return this.http.put(`kpi-table/update?kpiTableId=${kpiTableId}`, request);
  }

  updateRateKpi(KpiTableDetailId:number, request: any): Observable<any> {
    return this.http.put(`kpi-table-detail/update?KpiTableDetailId=${KpiTableDetailId}`, request);
  }

  deleteKpiTable(id: number): Observable<any> {
    return this.http.delete(`kpi-table/hard-delete?Id=${id}`);
  }
  
}
