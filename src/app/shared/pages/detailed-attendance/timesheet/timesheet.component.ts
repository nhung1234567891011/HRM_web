import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { TimeKeepingLeaveStatus } from 'src/app/core/enums/time-keeping-leave-status';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { HolidayService } from 'src/app/core/services/holiday.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { StaffDetailService } from 'src/app/core/services/staff-detail.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';
import { TimeSheetService } from 'src/app/core/services/time-sheet.service';

@Component({
    selector: 'app-timesheet',
    templateUrl: './timesheet.component.html',
    styleUrl: './timesheet.component.scss',
})
export class TimesheetComponent implements OnInit {
    selectedUnit: any = null;
    messages: any[] = [];
    treeData: TreeNode[] = [];
    selectedNode: any;
    displayDialog: boolean = false;
    detailUpdateForm!: FormGroup;
    optionPosition: any;
    invalidDateRange = false;
    selector: any;
    contractOption: any;
    pageSize: number = 30;
    pageIndex: number = 1;
    display: boolean = false;
    isDialogVisible: boolean = false;
    timeTrackingForm: FormGroup;
    detailById!: number;
    timesheet: any;
    dateRange: { date: string; dayOfWeek: string }[] = [];
    staffPosition: any[] = [];
    isLocked: boolean = false;
    isDisabled: boolean = true;
    displayConfirmDialog: boolean = false;
    dialogTitle: string = '';
    dialogMessage: string = '';
    currentLockState: boolean = false;
    currentShiftWorkId: string = '';
    employees: any[] = [];
    employeesName: any[] = [];
    timesheetDataById: any;
    timesheetDate: string;
    timesheetData: any = {
        totalWokring: 0,
        totalLeaveWorking: 0,
        totalLateEarly: 0,
        totalNotCheck: 0,
    };
    selectedEmployee: any;
    filteredEmployees: any[] = [];
    timekeepingMethodOption = [
        { label: 'Theo giờ', value: 0 },
        { label: 'Theo ngày', value: 1 },
    ];
    selectedShiftData: any = null; // Dữ liệu ca làm việc nhận từ API
    timeSheetRaw: any = null; // Dữ liệu ca làm việc nhận từ API
    selectedShiftId: string = '';
    selectedTimeSheetId: number;
    selectedDate: string = '';
    morningTimeSheetId: any;
    afternoonTimeSheetId: any;
    summaryTimesheetStatus = TimeKeepingLeaveStatus;

    showErrorOrganizationId: boolean = false;
    showErrorTimekeepingSheetName: boolean = false;
    showErrorStartDate: boolean = false;
    showErrorEndDate: boolean = false;
    showErrorTimekeepingMethod: boolean = false;
    showErrorDetailTimesheet: boolean = false;
    private isPatching = false;
    public userCurrent: any;

    constructor(
        private organizationService: OrganizationService,
        private router: Router,
        private route: ActivatedRoute,
        private staffDetailService: StaffDetailService,
        private staffPositionService: StaffPositionService,
        private timeSheetService: TimeSheetService,
        private holidayService: HolidayService,
        private fb: FormBuilder,
        private http: HttpClient,
        private employeesService: EmployeeService,
        private authService: AuthService
    ) {
        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
        });
    }

    ngOnInit() {
        this.CallSnaphot();
        this.getDetailTimesheetById();
        this.initForm();
        this.fetchEmployees();
        this.getOrganizations();
        this.getStaffPosition();
        this.getTimesheetDetails();
        this.getTimeSheetData();

        this.timeTrackingForm.valueChanges.subscribe(() => {
            this.updateWorkingHours();
        });
    }

    initForm() {
        this.detailUpdateForm = this.fb.group({
            id: [null, Validators.required],
            organizationId: [null, Validators.required],
            timekeepingSheetName: [null, Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            isLock: [null],
            timekeepingMethod: ['', Validators.required],
            detailTimesheetNameStaffPositions: [[], Validators.required],
        });

        this.timeTrackingForm = this.fb.group({
            date: [null, Validators.required],
            numberOfWorkingHour: [null, Validators.required],
            startTime: [null, Validators.required],
            endTime: [null, Validators.required],
            startTakeABreak: [null, Validators.required],
            endTakeABreak: [null, Validators.required],
            newBreakStartTime: [null, Validators.required],
            newBreakEndTime: [null, Validators.required],
            lateDuration: [null],
            earlyLeaveDuration: [null],
        });
    }

    CallSnaphot(): void {
        this.detailById = +this.route.snapshot.paramMap.get('id')!;
    }

    getOrganizations(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.organizationService.getPagingAll(request).subscribe((response) => {
            if (response?.status) {
                const items = Array.isArray(response?.data?.items)
                    ? response.data.items
                    : [];
                this.treeData = this.transformToTreeNode(items);

                const userOrganizationId = this.userCurrent?.organization?.id;
                const selectedNode = this.findNodeById(
                    this.treeData,
                    userOrganizationId
                );
                if (selectedNode) {
                    this.selectedNode = selectedNode;
                }
            }
        });
    }
    findNodeById(nodes: TreeNode[], id: any): TreeNode | null {
        if (!Array.isArray(nodes) || id == null) {
            return null;
        }

        for (const node of nodes) {
            if (node?.data?.id === id) {
                return node; // Nếu tìm thấy node phù hợp
            }
            if (Array.isArray(node?.children) && node.children.length > 0) {
                const found = this.findNodeById(node.children, id);
                if (found) {
                    return found;
                }
            }
        }
        return null; // Không tìm thấy
    }
    getStaffPosition(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.staffPositionService.getPaging(request).subscribe((response) => {
            if (response?.status) {
                const items = Array.isArray(response?.data?.items)
                    ? response.data.items
                    : [];
                this.staffPosition = items.map((item: any) => ({
                    id: item.id,
                    name: item.positionName,
                }));
            }
        });
    }

    transformToTreeNode(data: any[]): TreeNode[] {
        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((item) => ({
            label: item.organizationName,
            data: item,
            children: Array.isArray(item.organizationChildren)
                ? this.transformToTreeNode(item.organizationChildren)
                : [],
            expanded: false,
        }));
    }

    findTreeNodeById(treeData: TreeNode[], id: any): TreeNode | null {
        if (!Array.isArray(treeData) || id == null) {
            return null;
        }

        for (const node of treeData) {
            if (node?.data?.id === id) {
                return node;
            }
            if (Array.isArray(node?.children) && node.children.length > 0) {
                const foundNode = this.findTreeNodeById(node.children, id);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }

    fetchEmployees() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.employeesService.getEmployees(request).subscribe((data: any) => {
            const items = Array.isArray(data?.items) ? data.items : [];
            this.employeesName = items.map((employeesName: any) => ({
                ...employeesName,
                displayName: `${employeesName?.firstName || ''} ${
                    employeesName?.lastName || ''
                }`.trim(),
            }));
        });
    }

    searchEmployee(event: any) {
        const query = (event?.query || '').toLowerCase();
        this.filteredEmployees = this.employeesName.filter((employeesName) =>
            (employeesName?.displayName || '').toLowerCase().includes(query)
        );
    }

    getDetailTimesheetById(): void {
        const request: any = {
            id: this.detailById,
        };
        this.staffDetailService.getById(request).subscribe((response: any) => {
            if (response?.status && response?.data) {
                const data = response.data;
                this.timesheet = data;

                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);

                if (
                    !Number.isNaN(startDate.getTime()) &&
                    !Number.isNaN(endDate.getTime())
                ) {
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                    this.dateRange = this.generateDateRange(startDate, endDate);
                } else {
                    this.dateRange = [];
                }

                // Gán dữ liệu vào form
                this.detailUpdateForm.patchValue({
                    id: data.id,
                    timekeepingSheetName: data.timekeepingSheetName,
                    startDate: !Number.isNaN(startDate.getTime())
                        ? new Date(data.startDate)
                        : null,
                    endDate: !Number.isNaN(endDate.getTime())
                        ? new Date(data.endDate)
                        : null,
                    isLock: data.isLock,
                    timekeepingMethod: data.timekeepingMethod,
                });

                this.isLocked = !!data.isLock;

                const selectedPositions =
                    (Array.isArray(data.detailTimesheetNameStaffPositions)
                        ? data.detailTimesheetNameStaffPositions
                        : [])?.map(
                        (item: any) => item.id
                    ) || [];

                // Tìm các vị trí trong staffPosition tương ứng với id đã chọn
                const selectedStaffPositions = (Array.isArray(this.staffPosition)
                    ? this.staffPosition
                    : []
                ).filter(
                    (position: any) => selectedPositions.includes(position.id)
                );

                // Gán các vị trí đã chọn vào form
                this.detailUpdateForm.patchValue({
                    detailTimesheetNameStaffPositions: selectedStaffPositions,
                });

                const matchingNode = this.findTreeNodeById(
                    this.treeData,
                    data.organizationId
                );
                if (matchingNode) {
                    this.detailUpdateForm.patchValue({
                        organizationId: matchingNode,
                    });
                }
            }
        });
    }

    showConfirmDialog(isLocked: boolean): void {
        this.currentLockState = isLocked;

        this.dialogTitle = isLocked ? 'Xác nhận mở khóa' : 'Xác nhận khóa';
        this.dialogMessage = isLocked
            ? 'Bạn có chắc chắn muốn mở khóa bảng không?'
            : 'Bạn có chắc chắn muốn khóa bảng không?';

        this.displayConfirmDialog = true;
    }

    confirmToggleLock(): void {
        const request = { isLock: !this.currentLockState };
        const shiftWorkId = this.detailById;

        this.staffDetailService.updateLock(shiftWorkId, request).subscribe({
            next: (response: any) => {
                if (response && response.status) {
                    // Cập nhật trạng thái khóa
                    this.currentLockState = !this.currentLockState;
                    this.displayConfirmDialog = false;
                    this.getDetailTimesheetById();

                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: this.currentLockState
                                ? 'Đã khóa bảng thành công'
                                : 'Đã mở khóa bảng thành công',
                            life: 3000,
                        },
                    ];
                }
            },
            error: (err) => {
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Không thể thay đổi trạng thái khóa',
                        life: 3000,
                    },
                ];
            },
        });
    }

    cancelToggleLock(): void {
        this.displayConfirmDialog = false;
    }

    formatTime(time: string): string {
        if (!time || typeof time !== 'string') {
            return '00:00';
        }

        const date = new Date(`1970-01-01T${time}Z`); // Tạo đối tượng Date từ chuỗi thời gian
        if (Number.isNaN(date.getTime())) {
            return '00:00';
        }

        const hours = date.getUTCHours().toString().padStart(2, '0'); // Lấy giờ
        const minutes = date.getUTCMinutes().toString().padStart(2, '0'); // Lấy phút
        return `${hours}:${minutes}`;
    }

    getTimeSheetData() {
        const request: any = {
            id: this.detailById,
        };
        this.timeSheetService.getTimesheetData(request).subscribe(
            (response) => {
                if (response?.status) {
                    this.timesheetData = {
                        ...this.timesheetData,
                        ...(response?.data || {}),
                    };
                } else {
                    this.timesheetData = {
                        totalWokring: 0,
                        totalLeaveWorking: 0,
                        totalLateEarly: 0,
                        totalNotCheck: 0,
                    };
                }
            },
            (error) => {
                this.timesheetData = {
                    totalWokring: 0,
                    totalLeaveWorking: 0,
                    totalLateEarly: 0,
                    totalNotCheck: 0,
                };
                console.error('Error fetching timesheet data', error);
            }
        );
    }

    getTimesheetDetails(): void {
        const today = new Date().toDateString(); // Ngày hôm nay
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            DetailTimeSheetId: this.detailById,
            KeyWord: this.selectedEmployee
                ? (this.selectedEmployee.displayName || '').replace('+', ' ')
                : '',
            OrganizationId:
                this.selectedNode?.data?.id ||
                this.userCurrent?.organization?.id ||
                null,
        };

        // Gọi API mới lấy dữ liệu nhân viên theo DetailTimeSheet (KHÔNG phân trang)
        this.timeSheetService
            .getTimesheetByDetailSheet(request)
            .subscribe((response: any) => {
                if (response?.status) {
                    // API get-detail-time-sheet trả data là List<GetDetailTimesheetWithEmployeeDto>
                    const items = Array.isArray(response?.data)
                        ? response.data
                        : [];

                    // Gọi API lấy danh sách ngày lễ
                    this.employees = items.map((item: any) => {
                        const timesheets = Array.isArray(item?.timesheets)
                            ? item.timesheets
                            : [];
                        const holidays = Array.isArray(item?.holidays)
                            ? item.holidays
                            : [];

                        const schedule = this.dateRange.map((date) => {
                            const currentDate = new Date(date?.date);
                            const isDateValid = !Number.isNaN(
                                currentDate.getTime()
                            );
                            const isToday =
                                isDateValid &&
                                currentDate.toDateString() === today; // Đánh dấu nếu là ngày hôm nay

                            const timesheet = timesheets.find((ts: any) => {
                                const tsDate = new Date(ts?.date);
                                return (
                                    isDateValid &&
                                    !Number.isNaN(tsDate.getTime()) &&
                                    tsDate.toDateString() ===
                                        currentDate.toDateString()
                                );
                            });

                            const shifts = Array.isArray(timesheet?.shifts)
                                ? timesheet.shifts
                                : [];

                            const holiday = holidays.find(
                                (h: any) => {
                                    const fromDate = new Date(h?.fromDate);
                                    const toDate = new Date(h?.toDate);

                                    return (
                                        isDateValid &&
                                        !Number.isNaN(fromDate.getTime()) &&
                                        !Number.isNaN(toDate.getTime()) &&
                                        currentDate >= fromDate &&
                                        currentDate <= toDate
                                    );
                                }
                            );

                            if (shifts.length > 0 || holiday) {
                                const shiftMorning = shifts.find(
                                    (shift: any) => {
                                        if (
                                            !shift?.startTime ||
                                            !shift?.endTime
                                        ) {
                                            return false;
                                        }

                                        const shiftStartTime = new Date(
                                            `1970-01-01T${shift.startTime}`
                                        );
                                        const shiftEndTime = new Date(
                                            `1970-01-01T${shift.endTime}`
                                        );
                                        if (
                                            Number.isNaN(
                                                shiftStartTime.getTime()
                                            ) ||
                                            Number.isNaN(shiftEndTime.getTime())
                                        ) {
                                            return false;
                                        }

                                        const morningStart = new Date(
                                            '1970-01-01T08:00:00'
                                        );
                                        const morningEnd = new Date(
                                            '1970-01-01T12:00:00'
                                        );
                                        return (
                                            shiftStartTime >= morningStart &&
                                            shiftEndTime <= morningEnd
                                        );
                                    }
                                );

                                const shiftAfternoon = shifts.find(
                                    (shift: any) => {
                                        if (
                                            !shift?.startTime ||
                                            !shift?.endTime
                                        ) {
                                            return false;
                                        }

                                        const shiftStartTime = new Date(
                                            `1970-01-01T${shift.startTime}`
                                        );
                                        const shiftEndTime = new Date(
                                            `1970-01-01T${shift.endTime}`
                                        );
                                        if (
                                            Number.isNaN(
                                                shiftStartTime.getTime()
                                            ) ||
                                            Number.isNaN(shiftEndTime.getTime())
                                        ) {
                                            return false;
                                        }

                                        const afternoonStart = new Date(
                                            '1970-01-01T13:15:00'
                                        );
                                        const afternoonEnd = new Date(
                                            '1970-01-01T17:15:00'
                                        );
                                        return (
                                            shiftStartTime >= afternoonStart &&
                                            shiftEndTime <= afternoonEnd
                                        );
                                    }
                                );

                                const singleShift = shifts.find((shift: any) => {
                                    const shiftName =
                                        shift?.shiftTableName
                                            ?.toString()
                                            .toLowerCase() ?? '';

                                    return (
                                        shiftName.length > 0 &&
                                        !shiftName.includes('sáng') &&
                                        !shiftName.includes('chiều')
                                    );
                                }
                                );

                                if (singleShift) {
                                    return {
                                        morning: `${this.formatTime(
                                            singleShift.startTime || '00:00'
                                        )} - ${this.formatTime(
                                            singleShift.endTime || '00:00'
                                        )}`,
                                        morningName: singleShift.shiftTableName,
                                        morningshiftWorkId:
                                            singleShift.shiftWorkId,
                                        morningtimeSheetId:
                                            singleShift.timeSheetId,
                                        morningtimeKeepingLeaveStatus:
                                            singleShift.timeKeepingLeaveStatus ??
                                            TimeKeepingLeaveStatus.None,
                                        morningColor: singleShift.isEnoughWork
                                            ? 'green'
                                            : 'yellow',
                                        afternoon: null,
                                        afternoonName: null,
                                        afternoonshiftWorkId: null,
                                        afternoontimeSheetId: null,
                                        afternoonColor: null,
                                        singleShift: true,
                                        permittedLeave: null,
                                        holiday: holiday ? holiday.name : null,
                                        isToday,
                                    };
                                } else {
                                    return {
                                        morning: shiftMorning
                                            ? `${this.formatTime(
                                                  shiftMorning?.startTime ||
                                                      '00:00'
                                              )} - ${this.formatTime(
                                                  shiftMorning?.endTime ||
                                                      '00:00'
                                              )}`
                                            : null,
                                        morningName:
                                            shiftMorning?.shiftTableName,
                                        morningshiftWorkId:
                                            shiftMorning?.shiftWorkId || null,
                                        morningtimeSheetId:
                                            shiftMorning?.timeSheetId || null,
                                        morningtimeKeepingLeaveStatus:
                                            shiftMorning?.timeKeepingLeaveStatus ??
                                            TimeKeepingLeaveStatus.None,
                                        afternoon: shiftAfternoon
                                            ? `${this.formatTime(
                                                  shiftAfternoon.startTime ||
                                                      '00:00'
                                              )} - ${
                                                  this.formatTime(
                                                      shiftAfternoon.endTime ||
                                                          '00:00'
                                                  ) || '00:00'
                                              }`
                                            : null,
                                        afternoonName:
                                            shiftAfternoon?.shiftTableName ||
                                            null,
                                        afternoonshiftWorkId:
                                            shiftAfternoon?.shiftWorkId || null,
                                        afternoontimeSheetId:
                                            shiftAfternoon?.timeSheetId || null,
                                        afternoontimeKeepingLeaveStatus:
                                            shiftAfternoon?.timeKeepingLeaveStatus ||
                                            null,
                                        morningColor: shiftMorning?.isEnoughWork
                                            ? 'green'
                                            : 'lightgray',
                                        afternoonColor:
                                            shiftAfternoon?.isEnoughWork
                                                ? 'green'
                                                : 'lightgray',
                                        singleShift: false,
                                        permittedLeave: null,
                                        holiday: holiday ? holiday.name : null,
                                        isToday,
                                    };
                                }
                            } else {
                                return {
                                    morning: null,
                                    morningName: null,
                                    morningshiftWorkId: null,
                                    morningtimeSheetId: null,
                                    morningtimeKeepingLeaveStatus:
                                        TimeKeepingLeaveStatus.None,
                                    afternoon: null,
                                    afternoonName: null,
                                    afternoonshiftWorkId: null,
                                    afternoontimeSheetId: null,
                                    afternoontimeKeepingLeaveStatus:
                                        TimeKeepingLeaveStatus.None,
                                    morningColor: 'lightgray',
                                    afternoonColor: 'lightgray',
                                    singleShift: false,
                                    permittedLeave: null,
                                    holiday: null,
                                    isToday,
                                };
                            }
                        });

                        return {
                            id: item?.id,
                            employeeCode: item?.employeeCode || '---',
                            name: `${item?.lastName || ''} ${
                                item?.firstName || ''
                            }`.trim() || '---',
                            schedule,
                        };
                    });
                    return;
                }

                this.employees = [];
            }, () => {
                this.employees = [];
            });
    }

    generateDateRange(
        startDate: Date,
        endDate: Date
    ): {
        date: string;
        dayOfWeek: string;
        displayDate: string;
        isToday: boolean;
    }[] {
        const result: {
            date: string;
            dayOfWeek: string;
            displayDate: string;
            isToday: boolean;
        }[] = [];
        const today = new Date().toDateString(); // Lấy ngày hôm nay

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = [
                'Chủ nhật',
                'Thứ 2',
                'Thứ 3',
                'Thứ 4',
                'Thứ 5',
                'Thứ 6',
                'Thứ 7',
            ][currentDate.getDay()];
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`; // Lấy yyyy-MM-dd
            const displayDate = currentDate.getDate().toString(); // Lấy ngày (1-31)

            result.push({
                date: formattedDate,
                dayOfWeek,
                displayDate,
                isToday: currentDate.toDateString() === today, // Đánh dấu nếu là ngày hôm nay
            });

            currentDate.setDate(currentDate.getDate() + 1); // Tăng thêm 1 ngày
        }

        return result;
    }

    showDialogEdit() {
        this.displayDialog = true;

        // Gọi API để lấy dữ liệu chi tiết
        if (this.detailById) {
            this.getDetailTimesheetById();
        }
    }

    closeDialogEdit() {
        this.displayDialog = false;
        this.detailUpdateForm.reset();
        this.showErrorOrganizationId = false;
        this.showErrorDetailTimesheet = false;
        this.showErrorTimekeepingSheetName = false;
        this.showErrorStartDate = false;
        this.showErrorEndDate = false;
        this.showErrorTimekeepingMethod = false;
        this.invalidDateRange = false;
    }

    saveTimesheet() {
        console.log('Form Values:', this.timeTrackingForm.value);
        this.display = false; // Close dialog after saving
    }

    convertToDate(time: string): Date {
        // Kiểm tra nếu time là null hoặc undefined, nếu có thì trả về một giá trị mặc định
        if (!time) {
            console.error('Invalid time value:', time); // In ra lỗi nếu giá trị time không hợp lệ
            return new Date(); // Trả về thời gian hiện tại nếu time không hợp lệ
        }

        const date = new Date();
        const [hours, minutes] = time.split(':'); // Chia time thành giờ và phút
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        date.setSeconds(0); // Đặt giây về 0
        date.setMilliseconds(0); // Đặt mili giây về 0
        return date;
    }

    updateWorkingHours() {
        if (this.isPatching) {
            return;
        }

        // Đặt biến cờ là true để tránh gọi lại
        this.isPatching = true;
        const formValues = this.timeTrackingForm.value;

        const startTime = formValues.startTime
            ? new Date(formValues.startTime)
            : null;
        const endTime = formValues.endTime
            ? new Date(formValues.endTime)
            : null;

        // Kiểm tra endTime nếu có
        if (endTime === null) {
            console.warn('End time is not provided yet');
            // Bạn có thể xử lý khi endTime chưa có giá trị tại đây (ví dụ: không tính giờ làm việc khi endTime là null)
            this.isPatching = false;
            return;
        }

        // Lấy dữ liệu giờ nghỉ từ selectedShiftData
        const breakStartTime = formValues.startTakeABreak
            ? new Date(formValues.startTakeABreak)
            : null;
        const breakEndTime = formValues.endTakeABreak
            ? new Date(formValues.endTakeABreak)
            : null;

        const newBreakStartTime = formValues.newBreakStartTime
            ? new Date(formValues.newBreakStartTime)
            : null;
        const newBreakEndTime = formValues.newBreakEndTime
            ? new Date(formValues.newBreakEndTime)
            : null;

        const shiftStartTime = formValues.startTime
            ? new Date(formValues.startTime)
            : null;
        const shiftEndTime = formValues.endTime
            ? new Date(formValues.endTime)
            : null;

        // Kiểm tra tính hợp lệ của giờ vào, giờ nghỉ và giờ ra
        if (!startTime || !endTime) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Dữ liệu không đầy đủ để tính số giờ làm việc',
                    life: 3000,
                },
            ];
            this.isPatching = false;
            return;
        }

        // Tổng thời gian làm việc (từ giờ vào đến giờ ra)
        let totalWorkTime =
            (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Đổi sang giờ
        if (totalWorkTime < 0) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Giờ ra không thể sớm hơn giờ vào',
                    life: 3000,
                },
            ];
            this.isPatching = false;
            return;
        }

        // Tính thời gian nghỉ giữa giờ (break time)
        let breakTime = 0;
        if (breakStartTime && breakEndTime && breakEndTime > breakStartTime) {
            breakTime =
                (breakEndTime.getTime() - breakStartTime.getTime()) /
                (1000 * 60 * 60);
        }
        console.log('breakEndTime', breakEndTime?.getTime());
        console.log('breakStartTime', breakStartTime?.getTime());
        console.log('breakTime', breakTime);

        // Tính thời gian nghỉ mới nhập vào (new break time)
        let newBreakTime = 0;
        if (
            newBreakStartTime &&
            newBreakEndTime &&
            newBreakEndTime > newBreakStartTime
        ) {
            newBreakTime =
                (newBreakEndTime.getTime() - newBreakStartTime.getTime()) /
                (1000 * 60 * 60);
        }

        // Debug log để kiểm tra các giá trị breakTime và newBreakTime
        console.log('Break Time:', breakTime, 'New Break Time:', newBreakTime);

        // Tổng thời gian nghỉ
        const totalBreakTime = breakTime;

        // Số giờ làm việc thực tế là tổng thời gian làm việc trừ thời gian nghỉ
        let actualWorkHours = totalWorkTime - totalBreakTime;
        if (actualWorkHours < 0) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Thời gian nghỉ không thể lớn hơn tổng thời gian làm việc',
                    life: 3000,
                },
            ];
            this.isPatching = false;
            return;
        }

        // Làm tròn số giờ làm việc đến 2 chữ số thập phân
        actualWorkHours = Math.round(actualWorkHours * 100) / 100;

        // Debug log để kiểm tra giá trị của actualWorkHours
        console.log('Actual Work Hours:', actualWorkHours);

        // Cập nhật số giờ làm việc vào form
        this.timeTrackingForm.patchValue({
            numberOfWorkingHour: actualWorkHours,
        });

        // Tính thời gian đi muộn (so với giờ bắt đầu ca)
        const selectedShiftStartTime = this.selectedShiftData?.startTime
            ? this.convertToDate(this.selectedShiftData.startTime)
            : null;

        if (selectedShiftStartTime && shiftStartTime) {
            const lateDurationInMilliseconds =
                shiftStartTime.getTime() -
                selectedShiftStartTime.getTime() -
                totalBreakTime;
            let lateDurationInMinutes = Math.max(
                0,
                lateDurationInMilliseconds / (1000 * 60)
            ); // Chuyển đổi ra phút và chỉ tính giá trị dương
            lateDurationInMinutes = Math.round(lateDurationInMinutes); // Làm tròn đến số nguyên phút

            this.timeTrackingForm.patchValue({
                lateDuration: lateDurationInMinutes,
            });
        }

        console.log('shiftStartTime', shiftStartTime?.getTime());
        console.log('selectedShiftStartTime', selectedShiftStartTime?.getTime());

        // Tính thời gian về sớm (so với giờ kết thúc ca)
        const selectedShiftEndTime = this.selectedShiftData?.endTime
            ? this.convertToDate(this.selectedShiftData.endTime)
            : null;

        if (selectedShiftEndTime && shiftEndTime) {
            // Chỉ tính nếu giờ kết thúc của thời gian thực tế muộn hơn giờ kết thúc của ca làm việc
            const earlyLeaveDurationInMilliseconds =
                shiftEndTime.getTime() - selectedShiftEndTime.getTime();
            let earlyLeaveDurationInMinutes = Math.max(
                0,
                earlyLeaveDurationInMilliseconds / (1000 * 60)
            ); // Chuyển đổi ra phút và chỉ tính giá trị dương
            earlyLeaveDurationInMinutes = Math.round(
                earlyLeaveDurationInMinutes
            ); // Làm tròn đến số nguyên phút

            this.timeTrackingForm.patchValue({
                earlyLeaveDuration: earlyLeaveDurationInMinutes,
            });
        }
        this.isPatching = false;
    }

    openDialog(shiftId: string | null, timeSheetId: number | null) {
        if (this.isLocked) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Thao tác đang bị khóa.',
                    life: 3000,
                },
            ];
            return;
        }

        if (!shiftId || !timeSheetId) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: '',
                    detail: 'Không tìm thấy dữ liệu ca làm việc để hiển thị.',
                    life: 3000,
                },
            ];
            return;
        }

        this.selectedShiftId = shiftId;
        this.selectedTimeSheetId = timeSheetId;
        const request: any = {
            id: this.selectedShiftId,
        };

        // Gọi API lấy dữ liệu ca làm việc
        this.timeSheetService
            .getByShiftWorkdId(request)
            .subscribe((response: any) => {
                if (response?.status) {
                    this.selectedShiftData = response.data; // Lưu dữ liệu ca làm việc vào biến
                    this.isDialogVisible = true;

                    // Gọi API lấy chi tiết timesheet
                    if (timeSheetId) {
                        const request: any = {
                            id: timeSheetId,
                        };
                        this.timeSheetService
                            .getById(request)
                            .subscribe((timeSheetResponse: any) => {
                                const timeSheetData =
                                    timeSheetResponse?.data ||
                                    timeSheetResponse;

                                if (timeSheetData) {
                                    // Lưu dữ liệu từ getById vào this.timeSheetRaw
                                    this.timeSheetRaw = {
                                        ...this.timeSheetRaw,
                                        startTime: timeSheetData.startTime,
                                        endTime: timeSheetData.endTime,
                                    };

                                    // Định dạng ngày
                                    const rawDate = timeSheetData.date;
                                    this.selectedDate = rawDate
                                        ? new Date(rawDate).toLocaleDateString(
                                              'vi-VN'
                                          ) // Định dạng ngày theo kiểu Việt Nam
                                        : '---';

                                    // Cập nhật form với dữ liệu mới
                                    this.populateDialogData();
                                } else {
                                    console.error(
                                        'Không lấy được dữ liệu timesheet'
                                    );
                                }
                            });
                    } else {
                        console.error('Không tìm thấy timeSheetId');
                    }
                } else {
                    console.error('Không lấy được dữ liệu ca làm việc');
                }
            });
    }

    populateDialogData() {
        if (this.selectedShiftData || this.timeSheetRaw) {
            const startTime = this.timeSheetRaw?.startTime
                ? this.convertToDate(this.timeSheetRaw.startTime)
                : null;
            let endTime = this.timeSheetRaw?.endTime
                ? this.convertToDate(this.timeSheetRaw.endTime)
                : null;
            if (!endTime) {
                endTime = new Date();
                endTime.setHours(17, 15, 0, 0); // Đặt thời gian là 17:15
            }
            const startTakeABreak = this.selectedShiftData?.startTakeABreak
                ? this.convertToDate(this.selectedShiftData.startTakeABreak)
                : null;
            const endTakeABreak = this.selectedShiftData?.endTakeABreak
                ? this.convertToDate(this.selectedShiftData.endTakeABreak)
                : null;
            this.timeTrackingForm.patchValue({
                startTime: startTime,
                endTime: endTime,
                startTakeABreak: startTakeABreak,
                endTakeABreak: endTakeABreak,
            });
        }
    }

    closeDialog() {
        this.isDialogVisible = false; // Close dialog
        this.timeTrackingForm.reset();
        this.timeTrackingForm.patchValue({
            breakStartTime: null,
            breakEndTime: null,
        });
    }

    onSave() {
        console.log(this.timeTrackingForm.value);
    }

    convertToDateTime(time: string | Date): Date | null {
        if (!time) {
            return null;
        }

        if (time instanceof Date) {
            return time;
        }

        if (typeof time === 'string') {
            const [hours, minutes, seconds] = time.split(':').map(Number);
            if (Number.isNaN(hours) || Number.isNaN(minutes)) {
                return null;
            }

            const date = new Date();
            date.setHours(hours, minutes, seconds || 0, 0);
            return date;
        }

        console.error('Dữ liệu không hợp lệ:', time);
        return null;
    }

    private convertToISODate(dateString: string): string {
        if (!dateString || typeof dateString !== 'string') {
            return new Date().toISOString();
        }

        const [day, month, year] = dateString.split('/').map(Number);
        if (
            Number.isNaN(day) ||
            Number.isNaN(month) ||
            Number.isNaN(year)
        ) {
            return new Date().toISOString();
        }

        const date = new Date(Date.UTC(year, month - 1, day)); // Tạo ngày theo UTC
        if (Number.isNaN(date.getTime())) {
            return new Date().toISOString();
        }

        return date.toISOString(); // Trả về định dạng ISO
    }

    onSubmitUpdate(): void {
        const detailData = this.detailUpdateForm.value;
        let hasError = false;

        if (!detailData.organizationId) {
            this.showErrorOrganizationId = true;
            hasError = true;
        }

        if (
            !Array.isArray(detailData.detailTimesheetNameStaffPositions) ||
            detailData.detailTimesheetNameStaffPositions.length === 0
        ) {
            this.showErrorDetailTimesheet = true;
            hasError = true;
        }

        if (
            !detailData.timekeepingSheetName ||
            !String(detailData.timekeepingSheetName).trim()
        ) {
            this.showErrorTimekeepingSheetName = true;
            hasError = true;
        }

        if (!detailData.startDate) {
            this.showErrorStartDate = true;
            hasError = true;
        }

        if (!detailData.endDate) {
            this.showErrorEndDate = true;
            hasError = true;
        }

        if (
            detailData.timekeepingMethod === null ||
            detailData.timekeepingMethod === undefined ||
            detailData.timekeepingMethod === ''
        ) {
            this.showErrorTimekeepingMethod = true;
            hasError = true;
        }

        if (hasError) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Đang có lỗi cần được chỉnh sửa',
                    life: 3000,
                },
            ];
            return;
        }

        const formValue = this.detailUpdateForm.value;

        const startDate = new Date(formValue.startDate);
        const endDate = new Date(formValue.endDate);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Ngày bắt đầu hoặc ngày kết thúc không hợp lệ',
                    life: 3000,
                },
            ];
            return;
        }

        // Lấy múi giờ địa phương và điều chỉnh ngày
        const startOffset = startDate.getTimezoneOffset() * 60000; // Múi giờ trong mili giây
        const localStartDate = new Date(
            startDate.getTime() - startOffset
        ).toISOString(); // Thời gian điều chỉnh theo múi giờ địa phương

        const endOffset = endDate.getTimezoneOffset() * 60000; // Múi giờ trong mili giây
        const localEndDate = new Date(
            endDate.getTime() - endOffset
        ).toISOString();

        // Tạo dữ liệu cho API
        const requestBody = {
            organizationId: formValue.organizationId?.data?.id,
            timekeepingSheetName: formValue.timekeepingSheetName,
            startDate: localStartDate,
            endDate: localEndDate,
            timekeepingMethod: formValue.timekeepingMethod,
            isLock: true,
            staffTimesheets: (
                Array.isArray(formValue.detailTimesheetNameStaffPositions)
                    ? formValue.detailTimesheetNameStaffPositions
                    : []
            )
                .filter((position: any) => position?.id)
                .map((position: any) => ({
                    staffPositionId: position.id,
                })),
        };

        const shiftWorkId = this.detailById;

        this.staffDetailService.update(shiftWorkId, requestBody).subscribe(
            (response) => {
                // Xử lý phản hồi thành công
                console.log('Cập nhật thành công:', response);
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Cập nhật thành công',
                        life: 3000,
                    },
                ];
                this.closeDialogEdit();
                setTimeout(() => {
                    this.router.navigate(['/detailed-attendance']);
                }, 1000);
            },
            (error) => {
                // Xử lý lỗi
                console.error('Lỗi khi cập nhật:', error);
            }
        );
    }

    sendTimeTrackingToAPI() {
        const timeSheetId = this.selectedTimeSheetId;

        if (!timeSheetId) {
            console.error('Không có ID ca làm việc');
            return;
        }

        const formValues = this.timeTrackingForm.value;
        const selectedDateISO = this.convertToISODate(this.selectedDate || '');

        const startTime = this.formatToTimeString(
            this.convertToDateTime(formValues.startTime)
        );
        const endTime = this.formatToTimeString(
            this.convertToDateTime(formValues.endTime)
        );
        const request = {
            date: selectedDateISO,
            startTime: startTime,
            endTime: endTime,
            numberOfWorkingHour: formValues.numberOfWorkingHour || 0,
            lateDuration: formValues.lateDuration || 0,
            earlyLeaveDuration: formValues.earlyLeaveDuration || 0,
        };

        this.timeSheetService
            .update(timeSheetId, request)
            .subscribe((response: any) => {
                if (response && response.status) {
                    console.log('Cập nhật thành công');
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Cập nhật thành công',
                            life: 3000,
                        },
                    ];
                    this.isDialogVisible = false; // Đóng dialog sau khi thành công
                    this.getTimesheetDetails();
                } else {
                    console.error('Cập nhật thất bại');
                }
            });
    }

    formatToTimeString(date: any): string {
        if (!date) {
            return '';
        }

        if (date instanceof Date) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        // Trường hợp input là chuỗi thời gian
        if (typeof date === 'string') {
            const [hours = '', minutes = '', seconds = ''] = date.split(':');

            if (!hours || !minutes) {
                return '';
            }

            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${
                (seconds || '00').padStart(2, '0')
            }`;
        }

        console.error('Dữ liệu không hợp lệ:', date);
        return '';
    }
}
