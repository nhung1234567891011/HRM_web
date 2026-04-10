import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
    providedIn: 'root',
})
export class PayrollInquiryService {
    constructor(private http: HttpLoadingService) {}
    getPaging(request: any = null): Observable<any> {
        return this.http.get('payroll-inquiry/paging', request);
    }

    getById(request: any = null): Observable<any> {
        return this.http.get('payroll-detail/get-by-id', request);
    }

    create(request: any): Observable<any> {
        return this.http.post('payroll-inquiry/create', request);
    }

    update(request: any): Observable<any> {
        return this.http.put('payroll-inquiry/update', request);
    }

    updateBodyAndQueryParams(
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        return this.http.putBodyAndQueryParams(
            'payroll-inquiry/update',
            dataQueryParams,
            dataBody
        );
    }
}
