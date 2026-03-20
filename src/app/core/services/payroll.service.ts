import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
    providedIn: 'root',
})
export class PayrollService {
    constructor(private http: HttpLoadingService) {}
    getPaging(request: any = null): Observable<any> {
        return this.http.get('payroll/paging', request);
    }

    getPagingForCustomer(request: any = null): Observable<any> {
        return this.http.get('payroll/paging-for-employee', request);
    }

    getById(request: any = null): Observable<any> {
        return this.http.get('payroll/get-by-id', request);
    }

    create(request: any): Observable<any> {
        return this.http.post('payroll/create', request);
    }

    update(request: any): Observable<any> {
        return this.http.putFormData('payroll/update', request);
    }

    updateBodyAndQueryParams(
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        return this.http.putBodyAndQueryParams(
            'payroll/update',
            dataQueryParams,
            dataBody
        );
    }

    updateBodyAndQueryParamsStatus(
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        return this.http.putBodyAndQueryParams(
            'payroll/update-status',
            dataQueryParams,
            dataBody
        );
    }

    delete(request: any): Observable<any> {
        return this.http.put('payroll/delete', request);
    }

    deleteDl(id: number): Observable<any> {
        return this.http.delete(`payroll/delete`, {
            params: { id: id.toString() },
        });
    }

    deleteSoft(request: any): Observable<any> {
        return this.http.deleteSoft('payroll/delete', request);
    }

    deleteRange(request: any): Observable<any> {
        return this.http.put('payroll/delete-range', request);
    }

    togglePayrollStatus(payrollId: number): Observable<any> {
        return this.http.postBodyAndQueryParams(
            'payroll/toggle-payroll-status',
            { payrollId },
            null
        );
    }

    isPayrollLocked(payrollId: number): Observable<any> {
        return this.http.get('payroll/is-payroll-locked', { payrollId });
    }
}
