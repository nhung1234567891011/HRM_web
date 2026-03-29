import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem, TreeNode } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeSelectModule } from 'primeng/treeselect';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { LeaveApplicationService } from 'src/app/core/services/leave-application.service';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { MessageService } from 'primeng/api';
import { LeaveApplicationStatus } from 'src/app/core/enums/leave-application-status.enum';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { dateRangeValidator } from 'src/app/core/helpers/validatorHelper';
import {
    OnPaidLeaveStatus,
    OnPaidLeaveStatusConstant,
} from 'src/app/core/enums/on-paid-leave-status.enum';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { ShiftWorkService } from 'src/app/core/services/shift-work.service';
import { TypeOfLeaveService } from 'src/app/core/services/type-of-leave.service';
import { LeavePermissionService } from 'src/app/core/services/leave-permission.service';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';

@Component({
    selector: 'app-edit-leave-application',
    standalone: true,
    imports: [
        CalendarModule,
        FormsModule,
        InputTextareaModule,
        ButtonModule,
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        CheckboxModule,
        PaginatorModule,
        InputTextModule,
        DropdownModule,
        ToolbarModule,
        BreadcrumbModule,
        TreeSelectModule,
        DialogModule,
        MultiSelectModule,
        SharedModule,
        UtilityModule,
        RadioButtonModule,
    ],
    providers: [DatePipe],
    templateUrl: './edit-leave-application.component.html',
    styleUrl: './edit-leave-application.component.scss',
})
export class EditLeaveApplicationComponent implements OnInit {
    @ViewChild(ConfirmDialogComponent) confirmDialogComponent!: ConfirmDialogComponent;
    breadcrumbs: any;
    leaveApplicationForm: FormGroup;
    typeOfLeaves: any[];
    numberOfDays: any;
    daysRemaining: any;
    typeOfLeaveSelected: any = {};
    leavePermissionByEmployee: any = 0;
    onPaidLeaveStatusConstant = OnPaidLeaveStatusConstant;
    eployees: any = [];
    shiftWorks: any = [];
    scheduledDayOffsCount: any;
    onPaidLeaveStatus: any;
    user: any;
     //enum
     leaveApplicationStatus = LeaveApplicationStatus;
     //var
     leaveApplication: any = {
         typeOfLeave: {},
     };
     typeOfLeaveEmployee: any = {};
     approverNote: any = '';
     dialogMessage: any = '';

    constructor(
        private fb: FormBuilder,
        private leaveApplicationService: LeaveApplicationService,
        private employeeService: EmployeeService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private typeOfLeaveService: TypeOfLeaveService,
        private shiftWorkService: ShiftWorkService,
        private datePipe: DatePipe,
        private leavePermissionService: LeavePermissionService,
        private router: Router,
        private messageService: MessageService,

    ) {
        this.leaveApplicationForm = this.fb.group(
            {
                id:[],
                employeeId: [null, Validators.required],
                employeeName: [null, Validators.required],
                startDate: [null, [Validators.required]],
                endDate: [null, [Validators.required]],
                numberOfDays: [null],
                typeOfLeaveId: [null, [Validators.required]],
                salaryPercentage: [null, [Validators.required]],
                reasonForLeave: [null, [Validators.required]],
                note: [null],
                status: [LeaveApplicationStatus.Pending, [Validators.required]],
                approverIds: [[], [Validators.required]],
                replacementIds: [[]],
                relatedPersonIds: [[]],
            },
            { validators: dateRangeValidator() }
        );
        this.authService.userCurrent.subscribe((user) => {
            this.user = user;
        });
    }
    ngOnInit(): void {
        this.breadcrumbs = [
            { label: 'Đơn từ' },
            { label: 'Đơn xin nghỉ', routerLink: '/leave-application' },
            { label: 'Cập nhật' },
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
                this.leaveApplication.startDate = new Date(result.data.startDate);
                this.leaveApplication.endDate = new Date(result.data.endDate);
                this.leaveApplication.employeeName = employeeName;
                this.leaveApplication.createdAt = formattedCreatedAt;
                this.daysRemaining = { daysRemaining: 0 };
                this.typeOfLeaveSelected = result.data.typeOfLeave || {};
                const startDate = result.data.startDate ? new Date(result.data.startDate) : null;
                const endDate = result.data.endDate ? new Date(result.data.endDate) : null;

                const requestT = {
                    employeeId: result.data.employeeId,
                    typeOfLeaveId: result.data.typeOfLeaveId,
                    year: new Date(result.data.startDate).getFullYear()
                }
                this.leaveApplicationService.getTypeOfLeaveEmployee(requestT).subscribe(res => {
                    this.typeOfLeaveEmployee = res.data;
                    this.daysRemaining = res.data;
                })
                this.getLeavePermissionByEmployee();

                this.leaveApplicationForm.patchValue({
                    id: result.data.id,
                    employeeId: result.data.employeeId,
                    employeeName: `${result.data.employee.lastName} ${result.data.employee.firstName}`,
                    startDate: new Date(result.data.startDate),
                    endDate: new Date(result.data.endDate),
                    numberOfDays: result.data.numberOfDays,
                    typeOfLeaveId: result.data.typeOfLeaveId,
                    salaryPercentage: result.data.salaryPercentage,
                    reasonForLeave: result.data.reasonForLeave,
                    note: result.data.note,
                    status: result.data.status,
                    approverIds: result.data.leaveApplicationApprovers?.map(a => a.approverId) || [],
                    replacementIds: result.data.leaveApplicationReplacements?.map(r => r.replacementId) || [],
                    relatedPersonIds: result.data.leaveApplicationRelatedPeople?.map(rp => rp.relatedPersonId) || [],
                });

                this.onPaidLeaveStatus = result.data.onPaidLeaveStatus;
                this.onCalendarChange()
            });


        });

        //validate
                this.leaveApplicationForm
                    .get('employeeId')
                    .setValue(this.user.employee.id);
                this.leaveApplicationForm
                    .get('employeeName')
                    .setValue(
                        this.user.employee.lastName + ' ' + this.user.employee.firstName
                    );
                this.leaveApplicationForm
                    .get('status')
                    .setValue(LeaveApplicationStatus.Pending);
                    this.getEmployees();
                    this.getTypeOfLeave();
                    this.getLeavePermissionByEmployee();

    }
    validationMessages = {
        employeeId: [
            { type: 'required', message: 'Nhân viên không được để trống' },
        ],
        employeeName: [
            { type: 'required', message: 'Tên nhân viên không được để trống' },
        ],
        startDate: [
            { type: 'required', message: 'Ngày bắt đầu không được để trống' },
        ],
        endDate: [
            { type: 'required', message: 'Ngày kết thúc không được để trống' },
            {
                type: 'dateRange',
                message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
            },
        ],
        numberOfDays: [
            { type: 'required', message: 'Số ngày nghỉ không được để trống' },
        ],
        typeOfLeaveId: [
            {
                type: 'required',
                message: 'Loại hình nghỉ phép không được để trống',
            },
        ],
        salaryPercentage: [
            {
                type: 'required',
                message: 'Phần trăm lương không được để trống',
            },
        ],
        reasonForLeave: [
            {
                type: 'required',
                message: 'Lý do nghỉ phép không được để trống',
            },
        ],
        note: [{ type: 'required', message: 'Ghi chú không được để trống' }],
        status: [
            { type: 'required', message: 'Trạng thái không được để trống' },
        ],
        approverIds: [
            { type: 'required', message: 'Phải chọn ít nhất 1 người duyệt' },
        ],
        replacementIds: [
            {
                type: 'required',
                message: 'Phải chọn ít nhất 1 người thay thế duyệt',
            },
        ],
        relatedPersonIds: [
            {
                type: 'required',
                message: 'Phải chọn ít nhất 1 người liên quan duyệt',
            },
        ],
    };

    getCountScheduledDayOffs(request, startDate: any, endDate: any) {
        this.leaveApplicationService
            .getCountScheduledDayOffs(request)
            .subscribe((res) => {
                if (res.status == true) {
                    // this.getShiftWorks(request);// tạm thời bỏ qua
                    this.scheduledDayOffsCount = res.data;
                    this.calculateDays(startDate, endDate);
                } else {
                    this.calculateDays(startDate, endDate);
                }
            });
    }
    getShiftWorks(request) {
        this.shiftWorkService.getByEmployee(request).subscribe((res) => {
            if (res.status == true) {
                this.shiftWorks = res.data;
            }
        });
    }

    getLeavePermissionByEmployee() {
        const request = {
            id: this.user.employee.id,
        };
        this.leavePermissionService
            .GetLeavePermissionByEmployee(request)
            .subscribe((res) => {
                this.leavePermissionByEmployee = res.data;
                if (this.leavePermissionByEmployee == 0) {
                    this.onPaidLeaveStatus = OnPaidLeaveStatus.No;
                }
            });
    }
    getDaysRemaining(request: any) {
        request.employeeId = this.user.employee.id;
        this.typeOfLeaveService.getDaysRemaining(request).subscribe((res) => {
            this.daysRemaining = res.data;
            this.typeOfLeaveEmployee = res.data;
        });
    }
    //input change
    onTypeOfLeaveChange(event: any) {
        this.leaveApplicationForm
            .get('salaryPercentage')
            .setValue(
                this.typeOfLeaves.find((type) => type.id == event.value)
                    .salaryRate
            );

        let startDateValue = this.leaveApplicationForm.get('startDate')?.value;
        startDateValue = this.handleConvertDatetimeFormat(startDateValue);

        const request = {
            typeOfLeaveId: event.value,
            year: startDateValue
                ? startDateValue.split('-')[0]
                : new Date().getFullYear(),
        };
        this.getDaysRemaining(request);
        this.typeOfLeaveSelected = this.typeOfLeaves.find(
            (t) => t.id == event.value
        );
    }

    // onCalendarChange() {
    //     debugger
    //     let days = 0;
    //     const startDate = this.leaveApplicationForm.get('startDate').value;
    //     const endDate = this.leaveApplicationForm.get('endDate').value;

    //     if (!startDate || !endDate || startDate === '' || endDate === '') {
    //         this.numberOfDays = days;
    //         return;
    //     }

    //     const start = new Date(startDate);
    //     const end = new Date(endDate);

    //     if (start > end) {
    //         this.numberOfDays = days;
    //         return;
    //     }
    //     const request = {
    //         employeeId: this.user.employee.id,
    //         startDate: startDate.toDateString(),
    //         endDate: endDate.toDateString(),
    //     };
    //     this.getCountScheduledDayOffs(request, start, end);

    //     // days = this.calculateWorkingHours(start, end) / 8;
    //     // console.log("ạ",this.scheduledDayOffsCount)

    //     // // days = Math.round(days * 10) / 10;
    //     // days = Math.round(days * 100) / 100 - this.scheduledDayOffsCount;

    //     // this.numberOfDays = days;
    // }

    // calculateDays(startDate: any, endDate: any) {
    //     let days = this.calculateWorkingHours(startDate, endDate) / 8;
    //     days = Math.round(days * 100) / 100 - this.scheduledDayOffsCount;
    //     this.numberOfDays = days;
    // }

    calculateDays(startDate: any, endDate: any) {
        const totalHours = this.calculateWorkingHours(startDate, endDate);
        const fullDays = Math.floor(totalHours / 8); // phần nguyên của số ngày làm việc
        const remainingHours = totalHours % 8; // phần dư của số giờ làm việc

        let additionalDays = 0;
        if (remainingHours > 0) {
            if (remainingHours <= 5) {
                additionalDays = 0.5; // Nếu dư từ 1 đến 5 giờ thì tính là nửa ngày
            } else if (remainingHours > 5) {
                additionalDays = 1; // Nếu dư trên 5 giờ thì tính là một ngày đầy đủ
            }
        }

        let days = fullDays + additionalDays - this.scheduledDayOffsCount; // Trừ các ngày nghỉ đã lên lịch
        this.numberOfDays = days;
    }

    calculateWorkingHours(start: Date, end: Date): number {
        //đang fix cứng thời gian các ca
        const morningStartHour = 8;
        const morningEndHour = 12;
        const afternoonStartHour = 13.25; // 1:15 PM
        const afternoonEndHour = 17.25; // 5:15 PM
        let totalHours = 0;

        for (
            let d = new Date(start);
            d <= end;
            d.setUTCDate(d.getUTCDate() + 1)
        ) {
            // // Kiểm tra xem ngày đó có phải là Chủ Nhật không
            // if (d.getDay() === 0) { // 0 là Chủ Nhật trong JavaScript
            // 	continue;
            // }

            // Khởi tạo giờ làm việc trong ngày
            let morningWorkStart = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                morningStartHour,
                0,
                0
            );
            let morningWorkEnd = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                morningEndHour,
                0,
                0
            );
            let afternoonWorkStart = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                afternoonStartHour,
                15,
                0
            );
            let afternoonWorkEnd = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                afternoonEndHour,
                15,
                0
            );

            // Chỉnh sửa thời gian bắt đầu và kết thúc cho ngày bắt đầu và ngày kết thúc thực tế
            let actualStart =
                d.toDateString() === start.toDateString()
                    ? start
                    : morningWorkStart;
            let actualEnd =
                d.toDateString() === end.toDateString()
                    ? end
                    : afternoonWorkEnd;

            // Đảm bảo rằng thời gian bắt đầu và kết thúc không vượt quá giờ làm việc trong ngày
            actualStart = new Date(
                Math.max(actualStart.getTime(), morningWorkStart.getTime())
            );
            actualEnd = new Date(
                Math.min(actualEnd.getTime(), afternoonWorkEnd.getTime())
            );

            // Tính số giờ làm việc hợp lệ cho buổi sáng
            if (actualStart < morningWorkEnd && actualStart < actualEnd) {
                totalHours +=
                    (Math.min(morningWorkEnd.getTime(), actualEnd.getTime()) -
                        actualStart.getTime()) /
                    3600000;
            }

            // Tính số giờ làm việc hợp lệ cho buổi chiều, nếu thời gian kết thúc sau bắt đầu buổi chiều
            if (actualEnd > afternoonWorkStart && actualStart < actualEnd) {
                totalHours +=
                    (actualEnd.getTime() -
                        Math.max(
                            afternoonWorkStart.getTime(),
                            actualStart.getTime()
                        )) /
                    3600000;
            }
        }

        return totalHours;
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


    //function compare
    isApprover(leaveApp: any) {
        return leaveApp.leaveApplicationApprovers.map(item => item.approverId).includes(this.user.employee.id);
    }


    //function extract
    extractYear(dateString) {
        const parsedDate = new Date(dateString);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getFullYear();
        }
        const regex = /\d{2}-(\d{2})-(\d{4})/;
        const match = (dateString || '').match(regex);
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

    //get data
        getEmployees() {
            const request = {
                pageIndex: 1,
                pageSize: 10000,
                organizationId: this.user.organization.id,
                AccountStatus: AccountStatus.Active,
                Workingstatus: Workingstatus.Active,
            };
            this.employeeService.paging(request).subscribe((res) => {
                this.eployees = res.items.map((data) => {
                    const fullName = data.lastName + ' ' + data.firstName;
                    return {
                        ...data,
                        fullName: fullName,
                    };
                });
                this.eployees = this.eployees.filter(
                    (e) => e.id !== this.user.employee.id
                );
                console.log('this.employee', this.eployees);
                console.log('this.user.employee.id.', this.user.employee.id);
            });
        }

        getTypeOfLeave() {
            const request = {
                pageIndex: 1,
                pageSize: 1000,
                organizationId: this.user.organization.id,
            };
            this.typeOfLeaveService.paging(request).subscribe((res) => {
                this.typeOfLeaves = res.items;
            });
        }

        onSubmit(): void {
            if (this.leaveApplicationForm.invalid) {
              this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin!' });
              return;
            }

            const startDate = new Date(this.leaveApplicationForm.value.startDate);
            startDate.setHours(startDate.getHours() + 7);

            const endDate = new Date(this.leaveApplicationForm.value.endDate);
            endDate.setHours(endDate.getHours() + 7);

            const formData = {
              ...this.leaveApplicationForm.value,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              numberOfDays: this.numberOfDays,
              onPaidLeaveStatus: this.onPaidLeaveStatus,
            };

            this.leaveApplicationService.updateLeaveApplication(this.leaveApplicationForm.value.id, formData).subscribe(
                            (res: any) => {
                                const responseMessage = res?.data?.message || res?.message || 'Cập nhật đơn nghỉ thành công!';

                                if (res?.status) {
                                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: responseMessage });
                                        this.router.navigate(['/leave-application']);
                                        return;
                                }

                                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: responseMessage });
              },
              (error) => {
                                const errorMessage =
                                        error?.error?.data?.message ||
                                        error?.error?.message ||
                                        'Cập nhật đơn nghỉ thất bại!';
                                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: errorMessage });
              }
            );
          }

          onCalendarChange() {
            let days = 0;
            const startDate = this.leaveApplicationForm.get('startDate').value;
            const endDate = this.leaveApplicationForm.get('endDate').value;

            if (!startDate || !endDate || startDate === '' || endDate === '') {
                this.numberOfDays = days;
                return;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                this.numberOfDays = days;
                return;
            }
            const request = {
                employeeId: this.user.employee.id,
                startDate: startDate.toDateString(),
                endDate: endDate.toDateString(),
            };
            this.getCountScheduledDayOffs(request, start, end);

            // days = this.calculateWorkingHours(start, end) / 8;
            // console.log("ạ",this.scheduledDayOffsCount)

            // // days = Math.round(days * 10) / 10;
            // days = Math.round(days * 100) / 100 - this.scheduledDayOffsCount;

            // this.numberOfDays = days;
        }
}
