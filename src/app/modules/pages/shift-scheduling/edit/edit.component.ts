import { ShiftWorkService } from 'src/app/core/services/shift-work.service';
import { ScheduleService } from './../../../../core/services/schedule.service';
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
import { ActivatedRoute, Router } from '@angular/router';
import dateFilterConstant from 'src/app/core/constants/date-filter.constant';
import sortConstant from 'src/app/core/constants/sort.Constant';
import { ShiftService } from 'src/app/core/services/shift.service';
import { CompanyInfoService } from 'src/app/core/services/company-info.service';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
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
    shiftWorkById: any;

    positionAddVisible: boolean = false;
    staffTitles: any;
    selectedTitle: any;
    isStaffTitleEditing: number | null = null; // Thêm biến này
    shiftWorkCreateForm: FormGroup;
    standardWorkingDaysCount: number = 0;

    date: any;
    dateFilters: any;
    weeks: any[] = [];

    id: any;
    scheduleData = [];

    listSelectTask: any[] = [
        { label: 'Cơ cấu tổ chức', value: 0 },
        { label: 'Danh sách nhân viên', value: 1 },
    ];

    daysOfWeek = [
        'Chủ nhật',
        'Thứ 2',
        'Thứ 3',
        'Thứ 4',
        'Thứ 5',
        'Thứ 6',
        'Thứ 7',
    ];

    shiftDialogs: any;
    companyInfos: any;

    public constant: any = {
        dateFilters: dateFilterConstant,
        sort: sortConstant,
    };

    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder,
        private staffPositionService: StaffPositionService,
        private organizationService: OrganizationService,
        private shiftWorkService: ShiftWorkService,
        private shiftService: ShiftService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.shiftWorkCreateForm = this.formBuilder.group({
            ShiftTableName: [null, [Validators.required]], // Tên bảng phân ca.
            ShiftCatalogId: [null, [Validators.required]], // Mã ca làm việc.
            OrganizationId: [null], // Đơn vị áp dụng phân ca.
            StartDate: [null, [Validators.required]], // Ngày bắt đầu áp dụng.
            EndDate: [null], // Ngày kết thúc áp dụng.
            RecurrenceType: [null],
            RecurrenceCount: [null], // Số lần lặp lại.
            IsMonday: [null], // Áp dụng cho Thứ Hai.
            IsTuesday: [null], // Áp dụng cho Thứ Ba.
            IsWednesday: [null], // Áp dụng cho Thứ Tư.
            IsThursday: [null], // Áp dụng cho Thứ Năm.
            IsFriday: [null], // Áp dụng cho Thứ Sáu.
            IsSaturday: [null], // Áp dụng cho Thứ Bảy.
            IsSunday: [null], // Áp dụng cho Chủ Nhật.
            IsIndividualTarget: [null],
            IsOrganizationTarget: [null],
            DateFilters: [null],
            ApplyObject: [null],
        });

        this.route.params.subscribe((params) => {
            this.id = params['id']; // Truy cập giá trị id
        });
    }
    ngOnInit() {
        this.items = [
            { label: 'Ca làm việc' },
            { label: 'Phân ca', routerLink: '/shift-scheduling' },
            { label: 'Chỉnh sửa' },
        ];
        let date = new Date();
        this.date = new Date();
        let currentMonth = date.getMonth() + 1; // getMonth() trả về tháng từ 0 đến 11, cần cộng 1 để có tháng từ 1 đến 12
        let currentYear = date.getFullYear(); // getFullYear() trả về năm hiện tại
        // this.generateCalendar(currentYear, currentMonth);
        // this.loadOrganization();
        // this.loadShiftDialog();
        // this.loadCompanyInfo();

        // this.shiftWorkService.getById({ id: this.id }).subscribe((results) => {

        //     this.shiftWorkById = results.data;
        //     this.shiftWorkCreateForm = this.formBuilder.group({
        //         shiftWorkId: [this.shiftWorkById?.id], // Tên bảng phân ca.
        //         ShiftTableName: [
        //             this.shiftWorkById.shiftTableName,
        //             [Validators.required],
        //         ], // Tên bảng phân ca.

        //         ShiftCatalogId: [
        //             this.shiftDialogs?.find(
        //                 (item: any) =>
        //                     item.id == this.shiftWorkById.shiftCatalogId
        //             ),
        //             [Validators.required],
        //         ], // Mã ca làm việc.

        //         // this.shiftWorkById.organizationId
        //         OrganizationId: [
        //             this.getOrganizationById(
        //                 this.shiftWorkById.organizationId,
        //                 this.organizations
        //             ),
        //         ], // Đơn vị áp dụng phân ca.
        //         StartDate: [
        //             new Date(this.shiftWorkById.startDate),
        //             [Validators.required],
        //         ], // Ngày bắt đầu áp dụng.
        //         EndDate: [
        //             new Date(this.shiftWorkById.endDate),
        //             [Validators.required],
        //         ], //], // Ngày kết thúc áp dụng.
        //         RecurrenceType: [this.shiftWorkById.recurrenceType],
        //         RecurrenceCount: [this.shiftWorkById.recurrenceCount], // Số lần lặp lại.
        //         IsMonday: [this.shiftWorkById.isMonday], // Áp dụng cho Thứ Hai.
        //         IsTuesday: [this.shiftWorkById.isTuesday], // Áp dụng cho Thứ Ba.
        //         IsWednesday: [this.shiftWorkById.isWednesday], // Áp dụng cho Thứ Tư.
        //         IsThursday: [this.shiftWorkById.isThursday], // Áp dụng cho Thứ Năm.
        //         IsFriday: [this.shiftWorkById.isFriday], // Áp dụng cho Thứ Sáu.
        //         IsSaturday: [this.shiftWorkById.isSaturday], // Áp dụng cho Thứ Bảy.
        //         IsSunday: [this.shiftWorkById.isSunday], // Áp dụng cho Chủ Nhật.
        //         ApplyObject: [this.shiftWorkById.applyObject],
        //     });
        //     this.standardWorkingDaysCount = this.shiftWorkById.totalWork;
        //     this.scheduleData.push(this.shiftWorkById);
        //     this.updateShift();
        // });
        // this.loadOrganization();
        this.loadAndInitializeShiftWork();
    }
    async loadAndInitializeShiftWork() {
        console.log('work');
        try {
            // Đợi các hàm load dữ liệu hoàn tất
            await Promise.all([
                this.loadOrganization(),
                this.loadShiftDialog(),
            ]);
            // Gọi API lấy dữ liệu chi tiết ca làm việc
            const result = await lastValueFrom(
                this.shiftWorkService.getById({ id: this.id })
            );
            console.log(this.organizations);
            this.shiftWorkById = result.data;
            this.loadOrganization();
            this.loadShiftDialog();

            this.shiftWorkCreateForm = this.formBuilder.group({
                shiftWorkId: [this.shiftWorkById?.id], // Tên bảng phân ca.
                ShiftTableName: [
                    this.shiftWorkById.shiftTableName,
                    [Validators.required],
                ], // Tên bảng phân ca.

                ShiftCatalogId: [
                    this.shiftDialogs?.find(
                        (item: any) =>
                            item.id == this.shiftWorkById.shiftCatalogId
                    ),
                    [Validators.required],
                ], // Mã ca làm việc.

                OrganizationId: [
                    this.getOrganizationById(
                        this.shiftWorkById.organizationId,
                        this.organizations
                    ),
                ], // Đơn vị áp dụng phân ca.
                StartDate: [
                    new Date(this.shiftWorkById.startDate),
                    [Validators.required],
                ], // Ngày bắt đầu áp dụng.
                EndDate: [
                    new Date(this.shiftWorkById.endDate),
                    [Validators.required],
                ], // Ngày kết thúc áp dụng.
                RecurrenceType: [this.shiftWorkById.recurrenceType],
                RecurrenceCount: [this.shiftWorkById.recurrenceCount], // Số lần lặp lại.
                IsMonday: [this.shiftWorkById.isMonday], // Áp dụng cho Thứ Hai.
                IsTuesday: [this.shiftWorkById.isTuesday], // Áp dụng cho Thứ Ba.
                IsWednesday: [this.shiftWorkById.isWednesday], // Áp dụng cho Thứ Tư.
                IsThursday: [this.shiftWorkById.isThursday], // Áp dụng cho Thứ Năm.
                IsFriday: [this.shiftWorkById.isFriday], // Áp dụng cho Thứ Sáu.
                IsSaturday: [this.shiftWorkById.isSaturday], // Áp dụng cho Thứ Bảy.
                IsSunday: [this.shiftWorkById.isSunday], // Áp dụng cho Chủ Nhật.
                ApplyObject: [this.shiftWorkById.applyObject],
            });
            this.standardWorkingDaysCount = this.shiftWorkById.totalWork;
            this.scheduleData.push(this.shiftWorkById);
            this.updateShift();
        } catch (error) {
            console.error('Error loading shift work data:', error);
        }
    }

    generateCalendar(
        year: number,
        month: number,
        recurrenceType: string,
        recurrenceCount: number
    ): void {
        this.standardWorkingDaysCount = 0;
        this.weeks = [];
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
        let week = [];
        let dayCount = 1;
        let nextMonthDayCount = 1;
        for (let i = 0; i < firstDayOfMonth; i++) {
            week.push({
                day: daysInPrevMonth - firstDayOfMonth + i + 1,
                currentMonth: false,
            });
        }
        while (dayCount <= daysInMonth) {
            if (week.length === 7) {
                this.weeks.push(week);
                week = [];
            }
            const date = new Date(year, month - 1, dayCount);
            const isWorkingDay = this.isWorkingDay(
                year,
                month,
                dayCount,
                recurrenceType,
                recurrenceCount
            );
            let shiftInfo = null;
            if (isWorkingDay) {
                this.standardWorkingDaysCount++;
                for (const shift of this.scheduleData) {
                    const startDate = new Date(shift.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(shift.endDate);

                    if (date >= startDate && date <= endDate) {
                        shiftInfo = {
                            shiftName: shift.shiftCatalog?.name,
                            shiftTime: `${shift.shiftCatalog?.startTime} - ${shift.shiftCatalog?.endTime}`,
                        };
                        break; // Dừng lại khi tìm thấy ca làm việc phù hợp
                    }
                }
            }
            week.push({
                day: dayCount,
                currentMonth: true,
                isWorkingDay: isWorkingDay,
                shiftInfo: shiftInfo,
            });
            dayCount++;
        }
        while (week.length < 7) {
            week.push({ day: nextMonthDayCount, currentMonth: false });
            nextMonthDayCount++;
        }
        this.weeks.push(week);
    }

    // isWorkingDay(year: number, month: number, day: number): boolean {
    //     const date = new Date(year, month - 1, day);
    //     const dayOfWeek = date.getDay();

    //     // Kiểm tra xem ngày này có nằm trong ca làm việc nào không
    //     return this.scheduleData.some((shift) => {
    //         const startDate = new Date(shift.startDate);
    //         const endDate = new Date(shift.endDate);
    //         const isInShiftPeriod = date >= startDate && date <= endDate;

    //         if (!isInShiftPeriod) return false;

    //         // Kiểm tra xem ngày trong tuần có được đánh dấu là ngày làm việc không
    //         switch (dayOfWeek) {
    //             case 0:
    //                 return shift.isSunday;
    //             case 1:
    //                 return shift.isMonday;
    //             case 2:
    //                 return shift.isTuesday;
    //             case 3:
    //                 return shift.isWednesday;
    //             case 4:
    //                 return shift.isThursday;
    //             case 5:
    //                 return shift.isFriday;
    //             case 6:
    //                 return shift.isSaturday;
    //             default:
    //                 return false;
    //         }
    //     });
    // }

    isWorkingDay(
        year: number,
        month: number,
        day: number,
        recurrenceType: string,
        recurrenceCount: number
    ): boolean {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();

        // Kiểm tra xem ngày này có nằm trong ca làm việc nào không
        return this.scheduleData.some((shift) => {
            let startDate = new Date(shift.startDate);
            let endDate = new Date(shift.endDate);
            // Trừ 8 tiếng và gán lại giá trị
            // startDate = new Date(startDate.getTime() - 8 * 60 * 60 * 1000);
            // endDate = new Date(endDate.getTime() - 8 * 60 * 60 * 1000);
            startDate.setHours(0, 0, 0, 0);
            const isInShiftPeriod = date >= startDate && date <= endDate;
            if (!isInShiftPeriod) return false;

            // Kiểm tra loại lặp lại

            let isRecurring = false;
            if (recurrenceType === '1') {
                // Kiểm tra lặp lại theo tuần
                const diffInDays = Math.floor(
                    (date.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                );
                isRecurring = diffInDays % (recurrenceCount * 7) <= 6;
            } else if (recurrenceType === '2') {
                // Kiểm tra lặp lại theo tháng
                const diffInMonths =
                    (date.getFullYear() - startDate.getFullYear()) * 12 +
                    (date.getMonth() - startDate.getMonth());
                isRecurring =
                    diffInMonths % recurrenceCount === 0 &&
                    date.getDate() === startDate.getDate();
            }

            if (!isRecurring) {
                return false;
            }

            // Kiểm tra xem ngày trong tuần có được đánh dấu là ngày làm việc không
            switch (dayOfWeek) {
                case 0:
                    return shift.isSunday;
                case 1:
                    return shift.isMonday;
                case 2:
                    return shift.isTuesday;
                case 3:
                    return shift.isWednesday;
                case 4:
                    return shift.isThursday;
                case 5:
                    return shift.isFriday;
                case 6:
                    return shift.isSaturday;
                default:
                    return false;
            }
        });
    }

    getEndOfDay(date: Date): string {
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        return endDate.toISOString();
    }

    updateShift(): void {
        const data = {
            shiftTableName: this.shiftWorkCreateForm.value.ShiftTableName,
            shiftCatalogId: this.shiftWorkCreateForm.value.ShiftCatalogId?.id,
            organizationId: this.shiftWorkCreateForm.value.OrganizationId,
            startDate: new Date(this.shiftWorkCreateForm.value.StartDate),
            // ),
            endDate: new Date(this.shiftWorkCreateForm.value.EndDate),
            recurrenceType:
                this.shiftWorkCreateForm.value.RecurrenceType.toString(),
            recurrenceCount: this.shiftWorkCreateForm.value.RecurrenceCount,
            isMonday: this.shiftWorkCreateForm.value.IsMonday,
            isTuesday: this.shiftWorkCreateForm.value.IsTuesday,
            isWednesday: this.shiftWorkCreateForm.value.IsWednesday,
            isThursday: this.shiftWorkCreateForm.value.IsThursday,
            isFriday: this.shiftWorkCreateForm.value.IsFriday,
            isSaturday: this.shiftWorkCreateForm.value.IsSaturday,
            isSunday: this.shiftWorkCreateForm.value.IsSunday,
            applyObject: this.shiftWorkCreateForm.value.applyObject,
            shiftCatalog: this.shiftWorkCreateForm.value.ShiftCatalogId,
            organization: {
                id: 2,
                organizationName: 'Phòng Marketing',
            },
        };

        this.scheduleData = [];
        this.scheduleData.push(data);
        this.generateCalendar(
            this.date.getFullYear(),
            this.date.getMonth() + 1,
            data.recurrenceType,
            data.recurrenceCount
        );
    }

    // loadCompanyInfo(): void {
    //     this.companyInfoService.getAllCompany({}).subscribe((results) => {
    //         this.companyInfos = results.data.items;
    //         console.log(this.companyInfos);
    //     });
    // }

    // transformData(data: any) {
    //     return data.map((item: any) => {
    //         const transformedItem = {
    //             id: item.id,
    //             label: item.organizationName,
    //             data: item.id,
    //             children: item.organizationChildren
    //                 ? this.transformData(item.organizationChildren)
    //                 : [],
    //         };
    //         return transformedItem;
    //     });
    // }

    show(): void {
        this.toastService.showSuccess('Thành công', 'thêm thành công');
    }

    increaseMonth() {
        if (this.date) {
            let newMonth = this.date.getMonth() + 1; // Lấy tháng hiện tại và tăng 1
            let newYear = this.date.getFullYear();

            if (newMonth > 11) {
                newMonth = 0; // Nếu tháng > 11 (tháng 12), chuyển sang tháng 1 của năm tiếp theo
                newYear += 1; // Tăng năm
            }

            // Tạo một đối tượng Date mới với giá trị tháng và năm mới
            this.date = new Date(newYear, newMonth);

            // Gọi lại hàm generateCalendar để cập nhật lịch
            this.generateCalendar(
                newYear,
                newMonth + 1,
                this.scheduleData[0]?.recurrenceType,
                this.scheduleData[0]?.recurrenceCount
            ); // newMonth + 1 để lấy giá trị tháng từ 1 đến 12
        }
    }

    decreaseMonth() {
        if (this.date) {
            let newMonth = this.date.getMonth() - 1; // Lấy tháng hiện tại và giảm 1
            let newYear = this.date.getFullYear();

            if (newMonth < 0) {
                newMonth = 11; // Nếu tháng < 0 (tháng 1), chuyển sang tháng 12 của năm trước
                newYear -= 1; // Giảm năm
            }

            // Tạo một đối tượng Date mới với giá trị tháng và năm mới
            this.date = new Date(newYear, newMonth);

            // Gọi lại hàm generateCalendar để cập nhật lịch
            this.generateCalendar(
                newYear,
                newMonth + 1,
                this.scheduleData[0]?.recurrenceType,
                this.scheduleData[0]?.recurrenceCount
            ); // newMonth + 1 để lấy giá trị tháng từ 1 đến 12
        }
    }

    // loadShiftDialog(): void {
    //     this.shiftService.getPaging({}).subscribe((results) => {
    //         this.shiftDialogs = results.data.items;
    //     });
    // }
    loadShiftDialog(): Promise<void> {
        console.log('work loadShiftDialog');

        return new Promise((resolve, reject) => {
            this.shiftService.getPaging({}).subscribe((results) => {
                this.shiftDialogs = results.data.items;

                this.shiftWorkCreateForm.patchValue({
                    OrganizationId: this.shiftDialogs?.find(
                        (item: any) =>
                            item.id == this.shiftWorkById.shiftCatalogId
                    ),
                });
            });
            resolve(); // Gọi resolve khi hoàn tất
        });
    }

    subtractOneDay(date: Date): Date {
        const result = new Date(date);
        result.setDate(result.getDate() - 1); // Trừ 1 ngày
        return result;
    }

    getOrganizationById(organizationId: number, organizations: any[]): any {
        if (!Array.isArray(organizations)) {
            console.error('organizations is not iterable:', organizations);
            return null;
        }

        for (let org of organizations) {
            if (org.data === organizationId) {
                return org;
            }
            if (
                org.children &&
                Array.isArray(org.children) &&
                org.children.length > 0
            ) {
                let found = this.getOrganizationById(
                    organizationId,
                    org.children
                );
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    showPositionGroupDal() {
        this.positionVisible = true;
        this.selectedPosition =
            this.staffPositionCreateForm.value.locationGroup;
    }

    handleSelectPositionGroup() {
        if (this.selectedPosition) {
            this.staffPositionCreateForm.patchValue({
                locationGroup: Number(this.selectedPosition),
            });
            this.positionVisible = false;
        }
    }

    showTitleDal() {
        this.jobTitleVisible = true;
        this.selectedTitle = this.staffPositionCreateForm.value.title;
    }

    handleSelectTitle() {
        if (this.selectedTitle) {
            this.staffPositionCreateForm.patchValue({
                title: Number(this.selectedTitle),
            });
            this.jobTitleVisible = false;
        }
    }

    onDayChange(day: string, event: any): void {
        this.updateShift();
    }

    // loadOrganization(): void {
    //     this.organizationService.getPaging({ id: 1 }).subscribe((results) => {
    //         this.organizations = this.transformData([results.data]);
    //     });
    // }

    loadOrganization(): Promise<void> {
        console.log('work loadOrganization');
        return new Promise((resolve, reject) => {
            this.organizationService
                .getPaging({ id: 1 })
                .subscribe((results) => {
                    this.organizations = this.transformData([results.data]);
                    this.shiftWorkCreateForm.patchValue({
                        OrganizationId: this.getOrganizationById(
                            this.shiftWorkById.organizationId,
                            this.organizations
                        ),
                    });
                });
            resolve(); // Gọi resolve khi hoàn tất
        });
    }

    transformData(data: any) {
        return data.map((item: any) => {
            const transformedItem = {
                label: item.organizationName,
                data: item.id,
                children: item.organizationChildren
                    ? this.transformData(item.organizationChildren)
                    : [],
            };
            return transformedItem;
        });
    }

    onSubmit() {
        if (this.staffPositionCreateForm.valid) {
            this.loadingService.show();
            const organizationPositions = [];
            for (const orgId of this.staffPositionCreateForm.value
                .organizations) {
                organizationPositions.push({
                    organizationId: orgId.data,
                });
            }

            const formData = {
                positionCode: this.staffPositionCreateForm.value.code.trim(),
                positionName: this.staffPositionCreateForm.value.name.trim(),
                groupPositionId:
                    this.staffPositionCreateForm.value.locationGroup,
                staffTitleId: this.staffPositionCreateForm.value.title,
                organizationPositions: organizationPositions,
            };
            this.staffPositionService.create(formData).subscribe({
                next: (response) => {
                    if (response.status) {
                        this.loadingService.hide();
                        this.router.navigate(['/staff-position']);
                        this.toastService.showSuccess(
                            'Thành công',
                            'Tạo vị trí thành công!'
                        );
                    } else {
                        this.loadingService.hide();
                        this.toastService.showError(
                            'Thất bại',
                            `${response.message}`
                        );
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
            this.staffPositionCreateForm.markAllAsTouched();
            this.toastService.showWarning('Chú ý', 'Vui lòng nhập thông tin!');
        }
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

    handleCreateShiftScheduling(): void {
        if (this.shiftWorkCreateForm.valid) {
            let startDate = new Date(this.shiftWorkCreateForm.value.StartDate);
            // Cộng thêm 7 giờ
            startDate.setHours(startDate.getHours() + 7);
            let endDate = new Date(this.shiftWorkCreateForm.value.EndDate);
            // // Cộng thêm 7 giờ
            endDate.setHours(endDate.getHours() + 7);

            const formData = {
                shiftTableName: this.shiftWorkCreateForm.value.ShiftTableName,
                shiftCatalogId:
                    this.shiftWorkCreateForm.value.ShiftCatalogId?.id,
                organizationId:
                    this.shiftWorkCreateForm.value.OrganizationId?.data,

                startDate: startDate,
                endDate: endDate,

                recurrenceType: this.shiftWorkCreateForm.value.RecurrenceType,
                recurrenceCount: this.shiftWorkCreateForm.value.RecurrenceCount,
                totalWork: this.standardWorkingDaysCount,
                isMonday: this.shiftWorkCreateForm.value.IsMonday,
                isTuesday: this.shiftWorkCreateForm.value.IsTuesday,
                isWednesday: this.shiftWorkCreateForm.value.IsWednesday,
                isThursday: this.shiftWorkCreateForm.value.IsThursday,
                isFriday: this.shiftWorkCreateForm.value.IsFriday,
                isSaturday: this.shiftWorkCreateForm.value.IsSaturday,
                isSunday: this.shiftWorkCreateForm.value.IsSunday,
                applyObject: this.shiftWorkCreateForm.value.ApplyObject,
            };
            this.shiftWorkService
                .updateBodyAndQueryParams(
                    { shiftWorkId: this.shiftWorkCreateForm.value.shiftWorkId },
                    formData
                )
                .subscribe((result) => {
                    this.router.navigate(['/shift-scheduling']);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thông báo',
                        detail: 'Sửa phân ca làm thành công',
                    });
                });
        } else {
            this.shiftWorkCreateForm.markAsTouched();
        }
    }
}
