import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService, SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { DialogModule } from 'primeng/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveApplicationStatus } from 'src/app/core/enums/leave-application-status.enum';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SummaryTimesheetNameEmployeeConfirmService } from 'src/app/core/services/summary-timesheet-name-employee-confirm.service';
import { LeaveApplicationService } from 'src/app/core/services/leave-application.service';
import { TimeSheetService } from 'src/app/core/services/time-sheet.service';
import { an } from '@fullcalendar/core/internal-common';
import {
    SummaryTimesheetNameEmployeeConfirmStatus,
    TimekeepingMethod,
    WorkStatus,
} from 'src/app/core/enums/summary-timesheet-name-employee-confirm-status.enum';
import { TimeKeepingLeaveStatus } from 'src/app/core/enums/time-keeping.enum';
@Component({
    selector: 'app-detail-time-sheet',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        CheckboxModule,
        ButtonModule,
        PaginatorModule,
        InputTextModule,
        DropdownModule,
        ToolbarModule,
        BreadcrumbModule,
        TreeSelectModule,
        DialogModule,
        FormsModule,
        AutoCompleteModule,
        UtilityModule,
        CalendarModule,
        InputTextareaModule,
    ],
    providers: [DatePipe],
    templateUrl: './detail-time-sheet.component.html',
    styleUrl: './detail-time-sheet.component.scss',
})
export class DetailTimeSheetComponent implements OnInit {
    //enum
    summaryTimesheetNameEmployeeConfirmStatus =
        SummaryTimesheetNameEmployeeConfirmStatus;
    timekeepingMethod = TimekeepingMethod;
    workStatus = WorkStatus;
    //var
    breadcrumbs: any[];
    user: any;
    dialogMessage: any = '';
    timeSheet: any = {};
    timeSheetByShiftWork: any[] = [];
    startDate = new Date();
    endDate = new Date();
    monthDays: any[] = [];
    weekDays = [
        'Thứ 2',
        'Thứ 3',
        'Thứ 4',
        'Thứ 5',
        'Thứ 6',
        'Thứ 7',
        'Chủ nhật',
    ];
    workingDays: any[] = [];
    showDialogSetting: any = false;
    isShowFullCalendar: any = false;
    showRejectTimeSheet: any = false;
    note: any = '';
    totalNumberOfDaysOff: any = {};
    timesheetDurationLateOrEarly: any = {};
    statusByEmployee: any = {};
    totalShiftWork: any = 0; // số ca đã đi làm
    scheduledDayOffsCount: any = 0;
    schedule: any[] = [];
    totalShiftInTime: any = 0; // số ca đi làm theo lịch tổng
    holidays: any[] = [];
    constructor(
        private router: Router,
        private datePipe: DatePipe,
        private route: ActivatedRoute,
        private authService: AuthService,
        private messageService: MessageService,
        private leaveApplicationService: LeaveApplicationService,
        private summaryTimesheetNameEmployeeConfirmService: SummaryTimesheetNameEmployeeConfirmService,
        private timeSheetService: TimeSheetService
    ) {
        this.authService.userCurrent.subscribe((user) => {
            this.user = user;
        });
    }

    @ViewChild(ConfirmDialogComponent)
    confirmDialogComponent!: ConfirmDialogComponent;

    ngOnInit(): void {
        this.breadcrumbs = [
            { label: 'Bảng công' },
            { label: 'Danh sách bảng công', routerLink: '/time-sheet' },
            { label: 'Chi tiết' },
        ];
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                employeeId: params['employeeId']
                    ? params['employeeId']
                    : this.user.employee.id,
                startDate: params['startDate']
                    ? params['startDate']
                    : new Date(),
                endDate: params['endDate'] ? params['endDate'] : new Date(),
            };
            this.startDate = this.convertToDate(request.startDate);
            this.endDate = this.convertToDate(request.endDate);
            request.startDate = this.convertDate(request.startDate);
            request.endDate = this.convertDate(request.endDate);
            // this.getTimeSheet(request);
            this.getTotalNumberOfDaysOff(request);
            this.getTimesheetDurationLateOrEarly(request);
            this.getTimeSheetByShiftWork(request);
            this.getCountScheduledDayOffs(request);
            this.getSchedule(request);
            // this.getDayHoliday(request);
        });
        this.route.paramMap.subscribe((params) => {
            const request = {
                sumaryTimeSheetId: params.get('id'),
                employeeId: this.user.employee.id,
            };
            this.getStatusByEmployee(request);
        });
    }

    //get data
    getTimeSheet(request) {
        this.summaryTimesheetNameEmployeeConfirmService
            .getDetail(request)
            .subscribe((res) => {
                this.timeSheet = res.data;
                // this.workingDays = res.data.map(item => new Date(item.date));
                this.workingDays = res.data.map((item) => {
                    return {
                        date: new Date(item.date),
                        startTime: item.startTime,
                        endTime: item.endTime,
                    };
                });
                this.generateCalendar();
            });
    }
    getTimeSheetByShiftWork(request) {
        this.summaryTimesheetNameEmployeeConfirmService
            .getDetailByShiftWork(request)
            .subscribe((res) => {
                this.timeSheetByShiftWork = res.data;
                this.workingDays = res.data.map((item) => {
                    // if(item.shifts.)
                    if (
                        item.shifts[0].timeKeepingLeaveStatus !==
                        TimeKeepingLeaveStatus.LeaveNotPermission
                    ) {
                        this.totalShiftWork += item.shifts.length;
                    }
                    return {
                        date: new Date(item.date),
                        shifts: item.shifts,
                    };
                });
                this.getDayHoliday(request);
                // this.generateCalendar();
            });
    }
    getTotalNumberOfDaysOff(request) {
        this.leaveApplicationService
            .getTotalNumberOfDaysOff(request)
            .subscribe((res) => {
                this.totalNumberOfDaysOff = res.data;
            });
    }
    getCountScheduledDayOffs(request) {
        this.leaveApplicationService
            .getCountScheduledDayOffs(request)
            .subscribe((res) => {
                if (res.status == true) {
                    this.scheduledDayOffsCount = res.data;
                }
            });
    }
    getSchedule(request) {
        this.timeSheetService.getSchedule(request).subscribe((res) => {
            if (res.status == true) {
                this.schedule = res.data;
                this.schedule.forEach((item) => {
                    this.totalShiftInTime += item.shifts.length;
                    console.log('this.totalShiftInTime', this.totalShiftInTime);
                });
            }
        });
    }
    getTimesheetDurationLateOrEarly(request) {
        this.timeSheetService
            .getTimesheetDurationLateOrEarly(request)
            .subscribe((res) => {
                this.timesheetDurationLateOrEarly = res.data;
            });
    }

    getStatusByEmployee(request) {
        this.summaryTimesheetNameEmployeeConfirmService
            .getStatusByEmployee(request)
            .subscribe((res) => {
                this.statusByEmployee = res.data;
            });
    }

    getDayHoliday(request) {
        this.timeSheetService.getDayHoliday(request).subscribe((res) => {
            this.holidays = res.data;
            // this.workingDays = res.data.map(item => {
            // 	return {
            // 		date: new Date(item.date),
            // 		startTime: item.startTime,
            // 		endTime: item.endTime
            // 	}
            // });
            // this.generateCalendar();
            this.generateCalendar();
        });
    }

    //handle
    handleOpenDialogSetting() {
        this.showDialogSetting = true;
    }

    handleUpdateStatus(status: any) {
        const request = {
            summaryTimesheetNameId:
                this.statusByEmployee.summaryTimesheetNameId,
            employeeId: this.statusByEmployee.employeeId,
            status: status,
            note: this.note,
            date: this.statusByEmployee.date,
        };
        this.dialogMessage = `Bạn có muốn ${
            status === SummaryTimesheetNameEmployeeConfirmStatus.Confirm
                ? 'xác nhận'
                : 'từ chối'
        } bảng chấm công không?`;
        if (status == SummaryTimesheetNameEmployeeConfirmStatus.Confirm) {
            this.confirmDialogComponent.showDialog(() => {
                this.summaryTimesheetNameEmployeeConfirmService
                    .createOrUpdate(request)
                    .subscribe((res) => {
                        if (res.status == true) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thành công',
                                detail: 'Xác nhận bảng công thành công',
                            });
                            this.statusByEmployee.status = status;
                        }
                    });
            });
        } else {
            this.showRejectTimeSheet = true;
        }
    }

    handleUpdateStatusRejectConfirm() {
        const request = {
            summaryTimesheetNameId:
                this.statusByEmployee.summaryTimesheetNameId,
            employeeId: this.statusByEmployee.employeeId,
            status: SummaryTimesheetNameEmployeeConfirmStatus.Reject,
            note: this.note,
            date: this.statusByEmployee.date,
        };
        this.summaryTimesheetNameEmployeeConfirmService
            .createOrUpdate(request)
            .subscribe((res) => {
                if (res.status == true) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Xác nhận bảng công thành công',
                    });
                    this.statusByEmployee.status =
                        SummaryTimesheetNameEmployeeConfirmStatus.Reject;
                    this.showRejectTimeSheet = false;
                }
            });
    }

    //generate
    generateCalendar() {
        // console.log(this.holidays);
        let currentDate = new Date(this.startDate.getTime());
        currentDate.setDate(
            currentDate.getDate() -
                currentDate.getDay() +
                (currentDate.getDay() === 0 ? -6 : 1)
        );
        while (currentDate <= this.endDate) {
            if (currentDate >= this.startDate) {
                const isWorkingDay = this.workingDays.some(
                    (d) =>
                        d.date.getDate() === currentDate.getDate() &&
                        d.date.getMonth() === currentDate.getMonth() &&
                        d.date.getFullYear() === currentDate.getFullYear()
                );
                let workingDay = this.workingDays.find(
                    (d) =>
                        d.date.getDate() === currentDate.getDate() &&
                        d.date.getMonth() === currentDate.getMonth() &&
                        d.date.getFullYear() === currentDate.getFullYear()
                );

                this.monthDays.push({
                    date: new Date(currentDate),
                    shifts: workingDay ? workingDay.shifts : null,
                    isHoliday: this.holidays.some(
                        (holiday) =>
                            new Date(holiday).toDateString() ==
                            new Date(currentDate).toDateString()
                    ),
                    status: workingDay
                        ? workingDay.shifts.timeKeepingLeaveStatus
                        : null,
                });
            } else {
                this.monthDays.push({
                    date: new Date(currentDate),
                    shifts: null,
                    isHoliday: false,
                    status: null,
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    timeKeepingLeaveStatus = TimeKeepingLeaveStatus;

    //handle compare
    getWorkStatus(startTime: string, endTime: string): WorkStatus {
        if (startTime === '00:00' && endTime === '00:00') {
            return WorkStatus.UnpaidLeave;
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const totalMinutes =
            endHour * 60 + endMinute - (startHour * 60 + startMinute);

        if (totalMinutes >= 555) {
            // 8 tiếng = 480 phút //9 tiếng 15p =555  phút
            return WorkStatus.FullWork;
        } else if (totalMinutes >= 1) {
            return WorkStatus.MissingWork;
        }

        return WorkStatus.UnpaidLeave;
    }

    //handlle convert
    // convert string yyyy-MM-dd
    convertDate(date: string): string | null {
        const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
        const match = date.match(datePattern);
        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];

            const formattedDate = `${year}-${month}-${day}`;

            return formattedDate;
        }

        return null;
    }
    //convert to date
    convertToDate(dateString: string): Date | null {
        if (!dateString) return null;

        const [day, month, year] = dateString.split('-').map(Number);
        if (
            !day ||
            !month ||
            !year ||
            month < 1 ||
            month > 12 ||
            day < 1 ||
            day > 31
        ) {
            console.error('Invalid date format or value.');
            return null;
        }

        return new Date(year, month - 1, day);
    }

    //convet to hh:mm
    getHourAndMinute(timeString: string): any {
        if (timeString == null) {
            return '';
        }
        const [hour, minute] = timeString.split(':');
        // return { hour, minute };
        return `${hour}:${minute}`;
    }

    calculateDaysBetweenDates(startDate: Date, endDate: Date): number {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const diffTime = end.getTime() - start.getTime();

        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}
