import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpLoadingService } from '../https/http-loading.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckinCheckoutService {

  constructor(private http: HttpLoadingService, private httpld: HttpClient) {}
      getPaging(request: any = null): Observable<any> {
          return this.http.get('checkin-checkout-application/paging', request);
      }

      getAll(request: any = null): Observable<any> {
          return this.http.get('staff-title/get-all', request);
      }

      create(request: any): Observable<any> {
        return this.http.post('checkin-checkout-application/create', request)
      }
      update(Id: number, resquest: any): Observable<any> {
        return this.http.put(`checkin-checkout-application/update?id=${Id}`, resquest)
      }

      getById(id: number): Observable<any> {
        return this.httpld.get<any>(`/checkin-checkout-application/get-by-id?Id=${id}`);
      }

      updateCheckInCheckOutStatus(id: number, status: number): Observable<any> {
        const dataQueryParams = { id };
        const dataBody = status;
        return this.http.putBodyAndQueryParams(
          'checkin-checkout-application/update-status',
          dataQueryParams,
          dataBody
        );
      }

      exportExcel(request: any = null): Observable<Blob> {
          return this.http.getBlob('checkin-checkout-application/export-excel', request);
      }

      updateBodyAndQueryParams(
          dataQueryParams: any,
          dataBody: any
      ): Observable<any> {
          return this.http.putBodyAndQueryParams(
              'staff-title/update',
              dataQueryParams,
              dataBody
          );
      }

      delete(request: any): Observable<any> {
          return this.http.put('staff-title/delete', request);
      }

      deleteSoft(request: any): Observable<any> {
          return this.http.deleteSoft('staff-title/delete', request);
      }
}
