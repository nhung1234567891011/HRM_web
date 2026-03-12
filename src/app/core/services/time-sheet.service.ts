import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TimeSheetService {

    constructor(private http: HttpLoadingService,
        private httpCl: HttpClient
    ) { }

    getDayHoliday(request: any ): Observable<any> {
        return this.http.get('holiday/get-day-holiday-by-employee', request);
    }

    getTimesheetDurationLateOrEarly(request: any): Observable<any> {
        return this.http.get('time-sheet/get-time-sheet-duration-late-or-early', request);
    }

    getSchedule(request: any): Observable<any> {
        return this.http.get('shift-work/get-schedule', request);
    }

    paging(request: any = null): Observable<any> {
        return this.http.get('time-sheet/paging', request);
    }

    getById(request: any = null): Observable<any> {
        return this.http.get('time-sheet/get-by-id', request);
    }

    update(id: number, request: any): Observable<any> {
        return this.http.put(`time-sheet/update?id=${id}`, request);
    }

    create(request: any): Observable<any> {
        return this.http.post('time-sheet/create', request);
    }

    getByShiftWorkdId(request: any = null): Observable<any> {
        return this.http.get('time-sheet/get-by-shiftworkid', request);
    }

    getTimesheet(request: any = null): Observable<any> {
        return this.http.get('detail-timesheet/get-detail-time-sheet-with-time-sheet', request);
    }

    // Lấy chi tiết chấm công theo DetailTimeSheetId (không phân trang)
    getTimesheetByDetailSheet(request: any = null): Observable<any> {
        return this.http.get('detail-timesheet/get-detail-time-sheet', request);
    }

    getTimesheetData(request: any = null): Observable<any> {
        return this.http.get('detail-timesheet/statistic-detail-time-sheet', request);
    }

    getTimeSheetData(request: any = null): Observable<any> {
        const fakeApiData = {
            "status": true,
            "message": "Successful",
            "data": {
                "items": [
                    {
                        "id": 1,
                        "name": "Bảng chấm công tháng 01/2024",
                        "time": "01-01-2024=>30-01-2024",
                        "type": "Theo giờ",
                        "applyObject": "Phòng nhân sự",
                        "position": "Nhân viên",
                        "status": 0,
                    },
                    {
                        "id": 2,
                        "name": "Bảng chấm công tháng 02/2024",
                        "time": "01-02-2024=>30-02-2024",
                        "type": "Theo giờ",
                        "applyObject": "Phòng kỹ thuật",
                        "position": "Kỹ sư",
                        "status": 1,
                    },
                    {
                        "id": 3,
                        "name": "Bảng chấm công tháng 03/2024",
                        "time": "01-03-2024=>30-03-2024",
                        "type": "Theo giờ",
                        "applyObject": "Phòng kinh doanh",
                        "position": "Trưởng phòng",
                        "status": 2,
                    }
                ],
                "pageIndex": 1,
                "pageSize": 10,
                "sortBy": "startDate",
                "orderBy": "asc",
                "totalRecords": 10,
                "totalPages": 1
            }
        };
        return of(fakeApiData);
    }

    /** Xóa bảng chấm công chi tiết (soft delete). Backend nhận id qua query param. */
    delete(id: number): Observable<any> {
        return this.http.putBodyAndQueryParams('detail-timesheet/delete', { id }, null);
    }
}
