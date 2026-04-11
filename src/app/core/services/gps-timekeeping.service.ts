import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
    providedIn: 'root',
})
export class GpsTimekeepingService {
    constructor(private http: HttpLoadingService) {}
    getPaging(request: any = null): Observable<any> {
        return this.http.get('shift-catalog/paging', request);
    }

    getById(request: any = null): Observable<any> {
        return this.http.get('shift-catalog/get-by-id', request);
    }

    checkInStatus(reqquest: any = null): Observable<any> {
        return this.http.get('timekeeping-gps-log/checkin-status', reqquest);
    }

    create(request: any): Observable<any> {
        return this.http.postFormData('shift-catalog/create', request);
    }

    update(request: any): Observable<any> {
        return this.http.putFormData('banner/update', request);
    }

    updateBodyAndQueryParams(
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        return this.http.putBodyAndQueryParams(
            'shift-catalog/update',
            dataQueryParams,
            dataBody
        );
    }

    updateBodyAndQueryParamsStatus(
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        return this.http.putBodyAndQueryParams(
            'shift-catalog/update-status',
            dataQueryParams,
            dataBody
        );
    }
    delete(request: any): Observable<any> {
        return this.http.put('shift-catalog/delete', request);
    }

    deleteSoft(request: any): Observable<any> {
        return this.http.deleteSoft('shift-catalog/delete', request);
    }

    deleteRange(request: any): Observable<any> {
        return this.http.put('shift-catalog/delete-range', request);
    }
    checkInOut(request: any): Observable<any> {
        return this.http.post(
            'timekeeping-gps-log/checkin-checkout',
            request
        );
    }
}
