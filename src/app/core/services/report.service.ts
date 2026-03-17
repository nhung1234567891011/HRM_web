import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
    constructor(private http: HttpLoadingService) { }

    getHrDistribution(request: any = null): Observable<any> {
        return this.http.get('report/hr-distribution', request);
    }

    getMonthlyIncome(request: any = null): Observable<any> {
        return this.http.get('report/monthly-income', request);
    }

    getPerformance(request: any = null): Observable<any> {
        return this.http.get('report/performance', request);
    }

    getAttendance(request: any = null): Observable<any> {
        return this.http.get('report/attendance', request);
    }
}
