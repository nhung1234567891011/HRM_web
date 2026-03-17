import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
  providedIn: 'root'
})
export class RevenueCommissionPolicyService {
  constructor(private http: HttpLoadingService) {}

  paging(request: any = null): Observable<any> {
    return this.http.get('revenue-commission-policy/paging', request);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`revenue-commission-policy/get-by-id?Id=${id}`, {});
  }

  create(request: any): Observable<any> {
    return this.http.post('revenue-commission-policy/create', request);
  }

  update(id: number, request: any): Observable<any> {
    return this.http.put(`revenue-commission-policy/update?id=${id}`, request);
  }

  updateStatus(id: number, status: number): Observable<any> {
    return this.http.put(`revenue-commission-policy/update-status?id=${id}&status=${status}`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`revenue-commission-policy/delete?Id=${id}`);
  }

  hardDelete(id: number): Observable<any> {
    return this.http.delete(`revenue-commission-policy/hard-delete?Id=${id}`);
  }
}

