import { Component, OnInit, ViewChild } from '@angular/core';
import { LeaveApplicationService } from 'src/app/core/services/leave-application.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { LeaveApplicationStatus } from 'src/app/core/enums/leave-application-status.enum';
import { DatePipe, formatDate } from '@angular/common';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OnPaidLeaveStatus } from 'src/app/core/enums/on-paid-leave-status.enum';
import { LeavePermissionService } from 'src/app/core/services/leave-permission.service';

@Component({
    selector: 'app-detail-leave-application',
    standalone: true,
    imports: [
        SharedModule,
        UtilityModule
    ],
    providers: [DatePipe],
    templateUrl: './detail-leave-application.component.html',
    styleUrl: './detail-leave-application.component.scss'
})
export class DetailLeaveApplicationComponent implements OnInit {

    //enum
    leaveApplicationStatus = LeaveApplicationStatus;
    //var 
    leaveApplication: any = {
        typeOfLeave: {},
    };
    user: any;
    typeOfLeaveEmployee: any = {};
    daysRemaining: any = { daysRemaining: 0 };
    breadcrumbs: any[];
    approverNote: any = '';
    dialogMessage: any = '';
    leavePermissionByEmployee: any = 0;

    constructor(private leaveApplicationService: LeaveApplicationService,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private datePipe: DatePipe,
        private router: Router,
        private authService:AuthService,
        private leavePermissionService:LeavePermissionService
    ) {
        this.authService.userCurrent.subscribe((user) => {
			this.user = user;
		});
    }

    @ViewChild(ConfirmDialogComponent) confirmDialogComponent!: ConfirmDialogComponent;



    ngOnInit(): void {

        this.breadcrumbs = [
            { label: 'Đơn từ' },
            { label: 'Đơn xin nghỉ', routerLink: '/leave-application' },
            { label: 'Chi tiết' },
        ];

        //get data
        this.route.paramMap.subscribe((params) => {
            const request = {
                id: params.get('id'),
            };
            this.leaveApplicationService.getById(request).subscribe((result: any) => {
                let statusLabel = '';
                switch (result.data.status) {
                    case LeaveApplicationStatus.Pending:
                        statusLabel = 'Đang chờ duyệt';
                        break;
                    case LeaveApplicationStatus.Approved:
                        statusLabel = 'Đã được phê duyệt';
                        break;
                    case LeaveApplicationStatus.Rejected:
                        statusLabel = 'Bị từ chối';
                        break;
                }

                const formattedStartDate = this.datePipe.transform(result.data.startDate, 'dd-MM-yyyy hh:mm a');
                const formattedEndDate = this.datePipe.transform(result.data.endDate, 'dd-MM-yyyy hh:mm a');
                const formattedCreatedAt = this.datePipe.transform(result.data.createdAt, 'dd-MM-yyyy hh:mm a');
                const employeeName = result.data.employee.lastName + ' ' + result.data.employee.firstName
                this.leaveApplication = result.data;
                this.leaveApplication.startDate = formattedStartDate;
                this.leaveApplication.endDate = formattedEndDate;
                this.leaveApplication.employeeName = employeeName;
                this.leaveApplication.createdAt = formattedCreatedAt;
                this.daysRemaining = { daysRemaining: 0 };
                this.typeOfLeaveEmployee.daysRemaining = 0;

                const requestT = {
                    employeeId: result.data.employeeId,
                    typeOfLeaveId: result.data.typeOfLeaveId,
                    year: this.extractYear(result.data.startDate)
                }
                this.leaveApplicationService.getTypeOfLeaveEmployee(requestT).subscribe(res => {
                    this.typeOfLeaveEmployee = res.data;
                    this.daysRemaining = res.data;
                })
                this.getLeavePermissionByEmployee();


            });


        });
    }

    //handle update

    handleUpdateStatus(leaveApplication: any, status: any) {
        const employeeName = '|' + leaveApplication.employee.lastName + ' ' + leaveApplication.employee.firstName + '|';
        this.dialogMessage = `Bạn có muốn ${status === this.leaveApplicationStatus.Approved ? 'duyệt' : 'từ chối'} đơn xin nghỉ của nhân viên ${employeeName} không?`;
        const params = {
            id: leaveApplication.id
        }
        const request = {
            status: status,
            updateDaysRemainingTypeOfLeaveEmployeeRequest: {
                daysRemaining: leaveApplication.numberOfDays,
                employeeId: leaveApplication.employeeId,
                typeOfLeaveId: leaveApplication.typeOfLeaveId,
                year: this.extractYear(leaveApplication.startDate)
            },
            approverNote: this.approverNote
        }
        this.confirmDialogComponent.showDialog(() => {
            this.leaveApplicationService.updateStatus(params, request).subscribe(res => {
                if (res.status == true) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: res.message,
                    });
                    this.leaveApplication.status = status;
                    this.router.navigate(['/leave-application']);
                }
            })
        });

    }

    getLeavePermissionByEmployee() {
        const request = {
            id: this.leaveApplication.employeeId,
        };
        this.leavePermissionService.GetLeavePermissionByEmployee(request).subscribe((res) => {
            this.leavePermissionByEmployee = res.data;
        });
    }


    //convert
    handleConvertDatetimeFormat(date: any) {
        if (date instanceof Date && date != null) {
            date = formatDate(date, 'yyyy-MM-dd', 'en-US');
        } else if (typeof date === 'string' && date != null) {
            date = formatDate(new Date(date), 'yyyy-MM-dd', 'en-US');
        } else {
            if (date != null) {
                date = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
            }
        }
        return date;
    }


    //function compare
    isApprover(leaveApp: any) {
        return leaveApp.leaveApplicationApprovers.map(item => item.approverId).includes(this.user.employee.id);
    }


    //function extract
    extractYear(dateString) {
        const dateRaw = (dateString || '').toString().trim();
        const yyyyMatch = dateRaw.match(/^(\d{4})/);
        if (yyyyMatch) {
            return Number(yyyyMatch[1]);
        }
        const parsedDate = new Date(dateString);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getFullYear();
        }
        const regex = /\d{2}-(\d{2})-(\d{4})/;
        const match = dateRaw.match(regex);
        if (match) {
            return Number(match[2]);
        }
        return new Date().getFullYear();
    }

    //data front end

    getOnPaidLeaveStatusLabel(status:OnPaidLeaveStatus){
        if(status === OnPaidLeaveStatus.Yes){
            return "Nghỉ trừ ngày phép hưởng lương"
        }
        if(status === OnPaidLeaveStatus.No){
            return "Nghỉ không trừ ngày phép hưởng lương"
        }
        return "Không xác định"
    }

    getLeaveApplicationStatus(status: LeaveApplicationStatus): {
        text: string;
        color: string;
        bgColor: string;
    } {
        switch (status) {
            case LeaveApplicationStatus.Rejected:
                return {
                    text: 'Bị từ chối',
                    color: '#721c24', // màu đỏ đậm
                    bgColor: '#f8d7da', // màu đỏ nhạt
                };
            case LeaveApplicationStatus.Pending:
                return {
                    text: 'Chờ xác nhận',
                    color: '#856404', // màu cam nâu
                    bgColor: '#fff3cd', // màu cam nhạt
                };
            case LeaveApplicationStatus.Approved:
                return {
                    text: 'Được chấp nhận',
                    color: '#155724', // màu xanh lá đậm
                    bgColor: '#d4edda', // màu xanh lá nhạt
                };
        }
    }

}
