import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
    providedIn: 'root',
})
export class SummaryTimesheetService {
    constructor(private http: HttpLoadingService) {}
    getPaging(request: any = null): Observable<any> {
        return this.http.get('summary-time-sheet/paging', request);
    }
    getPagingSummaryTimeSheet(request: any = null): Observable<any> {
        return this.http.get(
            'summary-time-sheet/get-summary-time-sheet-with-employee',
            request
        );
    }
    getSelectSummaryTimeSheetForPayroll(request: any = null): Observable<any> {
        return this.http.get(
            'summary-time-sheet/get-summary-select-for-payroll',
            request
        );
    }
    getById(request: any = null): Observable<any> {
        return this.http.get('summary-time-sheet/get-by-id', request);
    }

    create(request: any): Observable<any> {
        return this.http.post('summary-time-sheet/create', request);
    }

    update(shiftWorkId: number, request: any): Observable<any> {
        return this.http.put(
            `summary-time-sheet/update?shiftWorkId=${shiftWorkId}`,
            request
        );
    }

    delete(id: number): Observable<any> {
        return this.http.put(`summary-time-sheet/delete?id=${id}`, {});
    }

    exportSummaryTimeSheetWithEmployeeToExcel(request: any = null): Observable<Blob> {
        return this.http.getBlob(
            'summary-time-sheet/export-summary-time-sheet-with-employee',
            request
        );
    }
}
