import { UserCurrent } from './../../../../core/models/identity/user-current.interface';
import { HolidayService } from './../../../../core/services/holiday.service';
import { OrganizationService } from './../../../../core/services/organization.service';
import { StaffTitleService } from './../../../../core/services/staff-title.service';
import { GroupPositionService } from './../../../../core/services/group-position.service';
import { StaffPositionService } from './../../../../core/services/staff-position.service';
import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { an } from '@fullcalendar/core/internal-common';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { noWhitespaceValidator } from 'src/app/shared/validator';
import { Router } from '@angular/router';
import { ShiftService } from 'src/app/core/services/shift.service';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/core/services/identity/auth.service';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
    items: any;
    cities!: any[];
    selectedCities!: any[];
    positionVisible: boolean = false;
    jobTitleVisible: boolean = false;
    status: boolean = false;
    groupAddVisible: boolean = false;
    staffPositionCreateForm: FormGroup;

    groupPositions: any;
    selectedOrganizations: any;
    positions: any;
    organizations: any;

    selectedPosition: any;

    isGroupPositionEditing: number | null = null; // Thêm biến này
    groupPositionsCreateForm: FormGroup;

    positionAddVisible: boolean = false;
    coefficientVisible: boolean = false;

    staffTitles: any;
    selectedTitle: any;
    isStaffTitleEditing: number | null = null; // Thêm biến này
    shiftCreateForm: FormGroup;
    time: Date;
    checked: boolean = false;

    holidays: any;
    date: any;

    userCurrent: any;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder,
        private groupPositionService: GroupPositionService,
        private staffPositionService: StaffPositionService,
        private staffTitleService: StaffTitleService,
        private organizationService: OrganizationService,
        private holidayService: HolidayService,
        private shiftService: ShiftService,
        private router: Router,
        private messageService: MessageService,
        private authService: AuthService
    ) {
        this.shiftCreateForm = this.formBuilder.group({
            OrganizationId: [null], // Id công ty tổ chức trực thuộc
            Code: [null, [Validators.required, noWhitespaceValidator()]], //Mã
            Name: [null, [Validators.required, noWhitespaceValidator()]], //Tên
            StartTime: [null, [Validators.required]], //Giờ bắt đầu
            EndTime: [null, [Validators.required]], //Giờ tan
            IsTimeChecked: [null], // Cho phép chấm vào
            StartTimeIn: [{ value: null, disabled: true }], //Thời gian bắt đầu chấm vào
            EndTimeIn: [{ value: null, disabled: true }], //Thời gian kết thúc chấm vào

            IsBreak: [null], // Cho phép chấm ra
            StartTimeOut: [{ value: null, disabled: true }], //Thời gian bắt đầu chấm ra
            EndTimeOut: [{ value: null, disabled: true }], //Thời gian kết thúc chấm ra
            TakeABreak: [null], //Cho phép nghỉ giữa ca
            StartTakeABreak: [{ value: null, disabled: true }], //Thời gian bắt đầu nghỉ giữa
            EndTakeABreak: [{ value: null, disabled: true }], //Thời gian kết thúc nghỉ giữa
            WorkingHours: [null], // Số giờ làm việc
            WorkingDays: [null], // Số ngày làm việc
            RegularMultiplier: [null], // Hệ số ngày thường.
            HolidayMultiplier: [1], // Hệ số ngày lễ.
            LeaveDaysMultiplier: [null], // Hệ số ngày nghỉ phép.
            DeductIfNoStartTime: [null], // Trừ công nếu không có giờ vào.
            DeductIfNoEndTime: [null], // Trừ công nếu không có giờ ra.
            AllowEarlyLeave: [null], // Cho phép đi về sớm.
            AllowedEarlyLeaveMinutes: [null], // Số phút được phép về sớm.
            AllowLateArrival: [null], // Cho phép đi muộn.
            AllowedLateArrivalMinutes: [null], // Số phút được phép đi muộn.
            AllowOvertime: [null], // Cho phép làm thêm giờ.
        });
        this.subscribeToFormChanges();
    }

    subscribeToFormChanges() {
        // Tính toán giờ làm việc
        ['StartTime', 'EndTime'].forEach((field) => {
            this.shiftCreateForm
                .get(field)
                ?.valueChanges.subscribe(() => this.calculateWorkingHours());
        });

        // Xử lý checkbox bật/tắt trường
        this.handleCheckboxToggle('IsTimeChecked', [
            'StartTimeIn',
            'EndTimeIn',
        ]);
        this.handleCheckboxToggle('IsBreak', ['StartTimeOut', 'EndTimeOut']);
        this.handleCheckboxToggle('TakeABreak', [
            'StartTakeABreak',
            'EndTakeABreak',
        ]);

        this.shiftCreateForm
            .get('StartTakeABreak')
            ?.valueChanges.subscribe(() => this.calculateWorkingHours());
        this.shiftCreateForm
            .get('EndTakeABreak')
            ?.valueChanges.subscribe(() => this.calculateWorkingHours());
    }
    ngOnInit() {
        this.items = [
            { label: 'Ca làm việc' },
            { label: 'Danh sách ca', routerLink: '/shift' },
            { label: 'Thêm mới' },
        ];
        const currentYear = new Date().getFullYear();
        this.date = new Date(currentYear, 0); // Tạo ngày 1/1 của năm hiện tại
        this.loadHolidays();
        this.authService.userCurrent.subscribe((user: any) => {
            this.userCurrent = user;
            console.log(user);
        });
    }

    increaseYear() {
        if (this.date) {
            const newYear = this.date.getFullYear() + 1;
            this.date = new Date(newYear, 0); // Tăng 1 năm
            this.loadHolidays();
        }
    }

    decreaseYear() {
        if (this.date) {
            const newYear = this.date.getFullYear() - 1;
            this.date = new Date(newYear, 0); // Giảm 1 năm

            this.loadHolidays();
        }
    }

    loadHolidays(): void {
        const year = new Date(this.date).getFullYear();
        this.holidayService
            .getHolidyByYearPaging({ year: year })
            .subscribe((results) => {
                this.holidays = results.map((item) => ({
                    ...item,
                    coefficient: 0,
                }));
            });
    }

    showCoefficient(): void {
        this.coefficientVisible = true;
        this.loadHolidays();
    }

    handleCheckboxToggle(checkboxField: string, targetFields: string[]) {
        this.shiftCreateForm
            .get(checkboxField)
            ?.valueChanges.subscribe((checked) => {
                targetFields.forEach((field) => {
                    if (checked) {
                        this.shiftCreateForm.get(field)?.enable();
                    } else {
                        this.shiftCreateForm.get(field)?.disable();
                        this.shiftCreateForm.patchValue({ [field]: null });
                    }
                });

                // Kiểm tra nếu IsBreak được chọn, cập nhật lại giờ làm việc
                if (checkboxField === 'TakeABreak') {
                    this.calculateWorkingHours();
                }
            });
    }

    calculateWorkingHours() {
        const startTime = this.shiftCreateForm.get('StartTime')?.value;
        const endTime = this.shiftCreateForm.get('EndTime')?.value;
        const takeABreak = this.shiftCreateForm.get('TakeABreak')?.value;
        let workingHours = 0;

        if (startTime && endTime) {
            const start = this.parseTime(startTime);
            const end = this.parseTime(endTime);

            // Đảm bảo rằng thời gian kết thúc luôn lớn hơn thời gian bắt đầu
            if (end >= start) {
                // Tổng thời gian làm việc
                workingHours =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Tính theo giờ

                // Trừ thời gian nghỉ giữa ca nếu có
                if (takeABreak) {
                    const startBreak =
                        this.shiftCreateForm.get('StartTakeABreak')?.value;
                    const endBreak =
                        this.shiftCreateForm.get('EndTakeABreak')?.value;

                    if (startBreak && endBreak) {
                        const breakStart = this.parseTime(startBreak);
                        const breakEnd = this.parseTime(endBreak);

                        if (breakEnd > breakStart) {
                            const breakHours =
                                (breakEnd.getTime() - breakStart.getTime()) /
                                (1000 * 60 * 60);
                            workingHours -= breakHours;
                            console.log('Break Hours:', breakHours);
                        }
                    }
                }

                // Cập nhật lại giá trị giờ làm việc
                this.shiftCreateForm.patchValue({
                    WorkingHours: workingHours.toFixed(2),
                });
            } else {
                this.shiftCreateForm.patchValue({ WorkingHours: null }); // Giờ kết thúc nhỏ hơn giờ bắt đầu
            }
        } else {
            this.shiftCreateForm.patchValue({ WorkingHours: null }); // Thiếu dữ liệu
        }
    }

    parseTime(timeString: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    onSubmit() {
        console.log(this.shiftCreateForm.value);

        if (this.shiftCreateForm.valid) {
            this.loadingService.show();
            const formData = {
                ...this.shiftCreateForm.value,
                OrganizationId: this.userCurrent?.employee?.organization?.id,
            };
            // const formData = {};
            this.shiftService.create(formData).subscribe({
                next: (response) => {
                    if (response.status) {
                        this.loadingService.hide();
                        this.router.navigate(['/shift']);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thông báo',
                            detail: 'Thêm ca làm thành công',
                        });
                    } else {
                        this.loadingService.hide();
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Thông báo',
                            detail: 'Thêm ca làm thất bại',
                        });
                    }
                },
                error: (error) => {
                    this.loadingService.hide();
                    if (error.status === 400) {
                        this.toastService.showError(
                            'Thất bại',
                            `${error.error?.detail || 'Dữ liệu không hợp lệ.'}`
                        );
                    } else if (error.status === 404) {
                        this.toastService.showError(
                            'Lỗi 404',
                            `${error.detail}`
                        );
                    } else {
                        this.toastService.showError(
                            'Lỗi',
                            'Đã xảy ra lỗi trong quá trình xử lý.'
                        );
                    }
                },
            });
        } else {
            this.shiftCreateForm.markAllAsTouched();
            this.toastService.showWarning('Chú ý', 'Vui lòng nhập thông tin!');
        }
    }

    handleCreateStaffTitle(): void {
        if (this.shiftCreateForm.valid) {
            this.staffTitleService
                .create(this.shiftCreateForm.value)
                .subscribe((result) => {
                    if (result.status) {
                        this.shiftCreateForm.reset();
                    }
                });
        }
    }

    handleCreateGroupPosition(): void {
        if (this.groupPositionsCreateForm.valid) {
            this.groupPositionService
                .create(this.groupPositionsCreateForm.value)
                .subscribe((result) => {
                    if (result.status) {
                        this.groupPositionsCreateForm.reset();
                    }
                });
        }
    }

    loadHoliday(): void {
        this;
    }

    editStaffTitle(index: number) {
        this.isStaffTitleEditing = index;
    }

    saveStaffTitleEdit(position: any) {
        this.staffTitleService
            .updateBodyAndQueryParams({ id: position.id }, position)
            .subscribe(() => {});
        this.isStaffTitleEditing = null;
    }

    editGroupPosition(index: number) {
        this.isGroupPositionEditing = index;
    }
    saveGroupPositionEdit(position: any) {
        this.groupPositionService
            .updateBodyAndQueryParams({ id: position.id }, position)
            .subscribe(() => {});
        this.isGroupPositionEditing = null;
    }

    deleteStaffTitle(data: any) {
        this.staffTitleService
            .deleteSoft({ id: data.id })
            .subscribe((result) => {
                if (result.status) {
                } else {
                }
            });
    }

    deleteGroupPosition(data: any) {
        console.log(data);
        this.groupPositionService
            .deleteSoft({ id: data.id })
            .subscribe((result) => {
                if (result.status) {
                } else {
                }
            });
    }

    handleCancelStaffTitle() {
        //  groupAddVisible: boolean = false;
        if (this.positionAddVisible) {
            this.positionAddVisible = false;
        } else {
            this.jobTitleVisible = false;
        }
    }

    handleCancelGroupPosition() {
        //  groupAddVisible: boolean = false;
        if (this.groupAddVisible) {
            this.groupAddVisible = false;
        } else {
            this.positionVisible = false;
        }
    }

    handleSave(): void {
        console.log(this.holidays);

        let formData = [];
        if (this.holidays && this.holidays.length > 0) {
            let maxCoefficient = this.holidays[0].factor; // Giả sử phần tử đầu tiên có coefficient lớn nhất
            // Dùng vòng lặp for để tìm coefficient lớn nhất
            for (let i = 1; i < this.holidays.length; i++) {
                formData.push({
                    holidayId: this.holidays[i].holidayId,
                    year: this.holidays[i].year,
                    factor: this.holidays[i].factor,
                    isFixed: true,
                });

                if (this.holidays[i].factor > maxCoefficient) {
                    maxCoefficient = this.holidays[i].factor;
                }
            }
            this.holidayService
                .saveWorkFactor({ year: this.date.getFullYear() }, formData)
                .subscribe((results) => {
                    this.coefficientVisible = false;
                });
            // Gắn giá trị lớn nhất vào HolidayMultiplier trong form
            this.shiftCreateForm.patchValue({
                HolidayMultiplier: maxCoefficient,
            });
        } else {
            console.log('No holidays available.');
        }
    }
}
