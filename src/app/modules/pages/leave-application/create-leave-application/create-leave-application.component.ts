import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
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
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import {
    dateRangeValidator,
    markAllAsTouched,
} from 'src/app/core/helpers/validatorHelper';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { TypeOfLeaveService } from 'src/app/core/services/type-of-leave.service';
import { el, s } from '@fullcalendar/core/internal-common';
import { ShiftWorkService } from 'src/app/core/services/shift-work.service';
import { LeavePermissionService } from 'src/app/core/services/leave-permission.service';
import {
    OnPaidLeaveStatus,
    OnPaidLeaveStatusConstant,
} from 'src/app/core/enums/on-paid-leave-status.enum';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';

@Component({
    selector: 'app-create-leave-application',
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
    templateUrl: './create-leave-application.component.html',
    styleUrl: './create-leave-application.component.scss',
})
export class CreateLeaveApplicationComponent implements OnInit {
    //flash
    isSubmitting = false;
    //var
    eployees: any[];
    typeOfLeaves: any[];
    typeOfLeaveSelected: any = {};
    breadcrumbs: any[];
    user: any;
    daysRemaining: any;
    numberOfDays: any = 0;
    scheduledDayOffsCount: any = 0;
    shiftWorks: any[] = [];
    leavePermissionByEmployee: any = 0;
    onPaidLeaveStatus: any = OnPaidLeaveStatus.Yes;
    //
    onPaidLeaveStatusConstant = OnPaidLeaveStatusConstant;
    //
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService,
        private leaveApplicationService: LeaveApplicationService,
        private messageService: MessageService,
        private employeeService: EmployeeService,
        private typeOfLeaveService: TypeOfLeaveService,
        private shiftWorkService: ShiftWorkService,
        private leavePermissionService: LeavePermissionService
    ) {
        this.leaveApplicationForm = this.fb.group(
            {
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

        //
        this.breadcrumbs = [
            { label: 'Đơn từ' },
            { label: 'Đơn xin nghỉ', routerLink: '/leave-application' },
            { label: 'Tạo mới' },
        ];

        //
        this.getEmployees();
        this.getTypeOfLeave();
        this.getLeavePermissionByEmployee();
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

    getDaysRemaining(request: any) {
        request.employeeId = this.user.employee.id;
        this.typeOfLeaveService.getDaysRemaining(request).subscribe((res) => {
            this.daysRemaining = res.data;
        });
    }

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

    onSubmit() {
        if (this.isSubmitting) {
            return;
        }
        if (this.leaveApplicationForm.valid) {
            let startDateValue =
                this.leaveApplicationForm.get('startDate')?.value;
            startDateValue = this.handleConvertDatetimeFormat(startDateValue);
            const request = this.leaveApplicationForm.value;
            request.organizationId = this.user.organization.id;
            request.typeOfLeaveName = this.typeOfLeaves.find(
                (ty) =>
                    ty.id ==
                    this.leaveApplicationForm.get('typeOfLeaveId').value
            ).name;
            request.updateDaysRemainingTypeOfLeaveEmployeeRequest = {
                daysRemaining: this.numberOfDays,
                employeeId: this.user.employee.id,
                typeOfLeaveId:
                    this.leaveApplicationForm.get('typeOfLeaveId').value,
                year: startDateValue
                    ? startDateValue.split('-')[0]
                    : new Date().getFullYear(),
            };
            request.numberOfDays = this.numberOfDays;
            request.startDate = new Date(
                request.startDate.setHours(request.startDate.getHours() + 7)
            );
            request.endDate = new Date(
                request.endDate.setHours(request.endDate.getHours() + 7)
            );
            request.onPaidLeaveStatus = this.onPaidLeaveStatus;
            this.isSubmitting = true;
            this.leaveApplicationService.create(request).subscribe(
                (res) => {
                    if (res.status == true) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Tạo đơn xin nghỉ thành công',
                        });
                        this.router.navigate(['/leave-application']);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: res.message,
                        });
                    }
                },
                (exception) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Lỗi hệ thống',
                    });
                    this.isSubmitting = false;
                },
                () => {
                    this.isSubmitting = false;
                }
            );
        } else {
            markAllAsTouched(this.leaveApplicationForm);
            this.messageService.add({
                severity: 'warning',
                summary: 'Cảnh báo',
                detail: 'Cần nhập đủ thông tin',
            });
        }
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

    // validate
    leaveApplicationForm: FormGroup;
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
}

//////////////ignore
// onTypeOfLeaveChange(event: any) {
// 	this.leaveApplicationForm.get('salaryPercentage').setValue(this.typeOfLeaves.find(type => type.id == event.value).salaryRate);
// 	let startDateValue=this.leaveApplicationForm.get('startDate')?.value;
// 	console.log(formatDate(startDateValue, 'yyyy-MM-dd', 'en-US'));
// 	const request = {
// 		typeOfLeaveId: event.value,
// 		year: startDateValue?startDateValue.split('-')[0]:new Date().getFullYear(),
// 	}
// 	this.getDaysRemaining(request);
// }
// onCalendarChange() {
// 	let days;
// 	const startDate = this.leaveApplicationForm.get('startDate').value;
// 	const endDate = this.leaveApplicationForm.get('endDate').value;

// 	if (!startDate || !endDate || startDate == '' || endDate == '') {
// 		days = 0
// 		this.leaveApplicationForm.get('numberOfDays').setValue(days);
// 		return;
// 	}

// 	const start = new Date(startDate);
// 	const end = new Date(endDate);

// 	if (start > end) {
// 		days = 0
// 	}

// 	else {
// 		const difference = end.getTime() - start.getTime();
// 		days = Math.ceil(difference / (1000 * 3600 * 24));
// 	}

// 	this.leaveApplicationForm.get('numberOfDays').setValue(days);
// }
// this.leaveApplicationForm.get('numberOfDays').setValue(days);
