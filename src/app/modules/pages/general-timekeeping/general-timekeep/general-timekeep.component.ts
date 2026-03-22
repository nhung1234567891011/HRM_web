import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, TreeNode } from 'primeng/api';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { SummaryTimesheetNameEmployeeConfirmStatus } from 'src/app/core/enums/summary-timesheet-name-employee-confirm-status.enum';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { StaffDetailService } from 'src/app/core/services/staff-detail.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';
import { SummaryTimesheetService } from 'src/app/core/services/summary-timesheet.service';

@Component({
    selector: 'app-general-timekeep',
    templateUrl: './general-timekeep.component.html',
    styleUrl: './general-timekeep.component.scss',
})
export class GeneralTimekeepComponent implements OnInit {
    messages: any[] = [];
    filteredEmployees: any[] = [];
    filteredName: any[] = [];
    selectedEmployee: any;
    items: MenuItem[] | undefined;
    pageSize: number = 30;
    pageIndex: number = 1;
    totalRecords: number = 0;
    currentPageReport: string = '';
    currentMonthYear: Date;
    filteredAttendance = [];
    selectedUnit: any = null;
    staffPosition: any[] = [];
    validateCheckBox: boolean = false;
    treeData: TreeNode[] = [];
    selectedNode: any;
    displayDialog: boolean = false;
    detailForm!: FormGroup;
    optionPosition: any;
    detailTimesheet: any[];
    summaryTimesheet: any[];
    selectedItems: any[] = [];
    allSelected: boolean = false;
    selectedDetailTimesheets: any;
    invalidDateRange = false;
    staffPositionId: number[] = [];
    timekeepingMethodOption = [
        { name: 'Theo giờ', value: 0 },
        { name: 'Theo ngày', value: 1 },
    ];
    selectedTimekeepingMethod: number | null = null;
    expandedRows: { [key: number]: boolean } = {};
    organizationId: string | null = null; // Lưu giá trị organizationId được chọn
    staffPositionIds: number[] = [];
    detailAttendance = [
        {
            attendanceName: 'Bảng chấm công tháng 12',
            time: { start: new Date(2024, 11, 1), end: new Date(2024, 11, 31) }, // 1/12/2024 - 31/12/2024
            checkin: '8:00 AM - 5:00 PM',
            unit: 'Phòng Nhân sự',
            position: 'Hà Nội',
            status: 'Hoàn thành',
        },
        {
            attendanceName: 'Bảng chấm công tháng 11',
            time: { start: new Date(2024, 10, 1), end: new Date(2024, 10, 30) }, // 1/11/2024 - 30/11/2024
            checkin: '8:30 AM - 5:30 PM',
            unit: 'Phòng Kế toán',
            position: 'TP.HCM',
            status: 'Đang xử lý',
        },
        {
            attendanceName: 'Bảng chấm công tháng 10',
            time: { start: new Date(2024, 9, 1), end: new Date(2024, 9, 31) }, // 1/10/2024 - 31/10/2024
            checkin: '9:00 AM - 6:00 PM',
            unit: 'Phòng IT',
            position: 'Đà Nẵng',
            status: 'Bị từ chối',
        },
    ];
    showError: boolean = false;
    permissionConstant = PermissionConstant;
    allColumns = [
        { field: 'timekeepingSheetName', header: 'Tên bảng chấm công' },
        { field: 'timeRange', header: 'Thời gian' },
        { field: 'timekeepingMethod', header: 'Chấm công' },
        { field: 'organizationName', header: 'Đơn vị áp dụng' },
        { field: 'positionNames', header: 'Vị trí' },
        { field: 'status', header: 'Trạng thái' },
        { field: 'action', header: 'Thao tác' },
    ];
    selectedColumns: any[] = [...this.allColumns];

    showErrorOrganizationId: boolean = false;
    showErrorTimekeepingSheetName: boolean = false;
    showErrorDetailTimesheet: boolean = false;
    showErrorTimekeepingMethod: boolean = false;

    constructor(
        private organizationService: OrganizationService,
        private fb: FormBuilder,
        private staffPositionService: StaffPositionService,
        private staffDetailService: StaffDetailService,
        private summaryTimeKeepService: SummaryTimesheetService,
        public permisionHelper: HasPermissionHelper
    ) {}

    ngOnInit() {
        this.items = [
            { label: 'Chấm công' },
            { label: 'Chấm công tổng hợp' },
        ];

        this.currentMonthYear = new Date(); // Tháng năm hiện tại
        this.initForm();
        this.filterByCurrentMonth();
        this.getOrganizations();
        this.getStaffPosition();
        this.getPagingSummaryTimesheet();

        this.selectedItems = new Array(this.detailTimesheet?.length).fill(
            false
        );
    }

    initForm() {
        this.detailForm = this.fb.group({
            organizationId: [null, Validators.required],
            timekeepingSheetName: [null, Validators.required],
            timekeepingMethod: [null, Validators.required],
            summaryTimesheetNameDetailTimesheetNames: [[], Validators.required],
            summaryTimesheetNameStaffPositions: [[], Validators.required],
        });
    }

    selectAll(selectAll: boolean): void {
        this.allSelected = selectAll;
        this.selectedItems = this.selectedItems.map(() => selectAll);
    }
    updateSelectAllState(): void {
        // Nếu tất cả checkbox con được chọn
        this.allSelected = this.selectedItems.every((item) => item === true);
    }

    onOrganizationChange(event: any): void {
        const organizationId = event.value ? event.value.id : null;
        this.organizationId = organizationId;
        this.getPagingDetailTimesheet();
    }
    onStaffPositionChange(event: any): void {
        this.staffPositionIds = event.value.map((position: any) => position.id);
        this.getPagingDetailTimesheet();
    }

    getPagingSummaryTimesheet(): void {
        const month = this.currentMonthYear.getMonth() + 1;
        const year = this.currentMonthYear.getFullYear();
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            Month: month,
            Year: year,
            name: this.selectedEmployee?.displayName || '',
            organizationId: this.selectedNode?.data?.id,
        };

        this.summaryTimeKeepService.getPaging(request).subscribe(
            (response: any) => {
                this.summaryTimesheet = response.data.items.map((item) => {
                    const positionNames =
                        item.summaryTimesheetNameStaffPositions
                            .map((position) => position.positionName)
                            .join(', ');
                    return {
                        ...item,
                        positionNames: positionNames,
                    };
                });
                this.totalRecords = response.data.totalRecords;
                this.updateCurrentPageReport();
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

    getMinMaxDates(summaryTimesheetNameDetailTimesheetNames: any[]): {
        minDate: Date;
        maxDate: Date;
    } {
        if (
            !summaryTimesheetNameDetailTimesheetNames ||
            summaryTimesheetNameDetailTimesheetNames.length === 0
        ) {
            return { minDate: null, maxDate: null };
        }

        const dates = summaryTimesheetNameDetailTimesheetNames.map((item) => ({
            startDate: new Date(item.detailTimesheetName.startDate),
            endDate: new Date(item.detailTimesheetName.endDate),
        }));

        const minDate = new Date(
            Math.min(...dates.map((d) => d.startDate.getTime()))
        );
        const maxDate = new Date(
            Math.max(...dates.map((d) => d.endDate.getTime()))
        );

        return { minDate, maxDate };
    }

    searchName(event: any): void {
        const query = event.query.toLowerCase();

        this.summaryTimeKeepService
            .getPaging({
                name: query,
                pageSize: this.pageSize,
                pageIndex: this.pageIndex,
            })
            .subscribe(
                (response: any) => {
                    this.filteredName = response.data.items.map(
                        (item: any) => ({
                            displayName: item.timekeepingSheetName, // Lấy timekeepingSheetName
                            id: item.id,
                        })
                    );
                },
                (error: any) => {
                    console.error(error);
                }
            );
    }

    getPagingDetailTimesheet(): void {
        const formValue = this.detailForm.value;
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            organizationId: formValue.organizationId?.data?.id,
            staffPositionId: this.staffPositionIds.join(','), // Chuyển thành chuỗi ID
        };

        this.staffDetailService.getSelect(request).subscribe(
            (response: any) => {
                this.detailTimesheet = response.data.items.map((item) => {
                    const positionNames = item.detailTimesheetNameStaffPositions
                        .map((position) => position.positionName)
                        .join(', ');
                    return {
                        ...item,
                        positionNames: positionNames,
                    };
                });

                this.selectedItems = new Array(
                    this.detailTimesheet?.length
                ).fill(false);
                this.allSelected = false; // Reset trạng thái checkbox cha
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

    toggleRow(id: string, event: Event): void {
        event.preventDefault();
        this.expandedRows[id] = !this.expandedRows[id];
    }

    isAllPositionsMatch(positionNames: string): boolean {
        // Tạo một mảng các vị trí từ `positionNames`
        const positions = positionNames.split(', ').map((name) => name.trim());

        // Kiểm tra xem tất cả các vị trí trong `positions` có tồn tại trong `this.staffPosition`
        // Nếu một vị trí không có trong `staffPosition`, trả về false
        return (
            positions.length === this.staffPosition.length &&
            positions.every((positionName) =>
                this.staffPosition.some(
                    (staffPos) => staffPos.name === positionName
                )
            )
        );
    }

    getsummaryTimesheetNameStatus(
        status: SummaryTimesheetNameEmployeeConfirmStatus
    ): {
        text: string;
        color: string;
        bgColor: string;
    } {
        switch (status) {
            case SummaryTimesheetNameEmployeeConfirmStatus.Reject:
                return {
                    text: 'Bị từ chối',
                    color: '#721c24', // màu đỏ đậm
                    bgColor: '#f8d7da', // màu đỏ nhạt
                };
            case SummaryTimesheetNameEmployeeConfirmStatus.Pending:
                return {
                    text: 'Đang xác nhận ',
                    color: '#856404', // màu cam nâu
                    bgColor: '#fff3cd', // màu cam nhạt
                };
            case SummaryTimesheetNameEmployeeConfirmStatus.Confirm:
                return {
                    text: 'Đã xác nhận',
                    color: '#155724', // màu xanh lá đậm
                    bgColor: '#d4edda', // màu xanh lá nhạt
                };
            case SummaryTimesheetNameEmployeeConfirmStatus.None:
                return {
                    text: 'Chưa gửi xác nhận',
                    color: '#383d41', // màu xám đậm
                    bgColor: '#e2e3e5', // màu xám nhạt
                };
            case SummaryTimesheetNameEmployeeConfirmStatus.SendedNotConfirm:
                return {
                    text: 'Chưa xác nhận',
                    color: '#383d41', // màu xám đậm
                    bgColor: '#e2e3e5', // màu xám nhạt
                };
            default:
                return {
                    text: 'Tất cả trạng thái',
                    color: 'black', // màu đen để rõ ràng
                    bgColor: 'white', // màu trắng đơn giản
                };
        }
    }

    getOrganizations(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.organizationService.getPagingAll(request).subscribe((response) => {
            if (response.status) {
                this.treeData = this.transformToTreeNode(response.data.items);
            }
        });
    }

    transformToTreeNode(data: any[]): TreeNode[] {
        return data.map((item) => ({
            label: item.organizationName,
            data: item,
            id: item.id,
            children: item.organizationChildren
                ? this.transformToTreeNode(item.organizationChildren)
                : [],
            expanded: false,
        }));
    }

    getStaffPosition(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.staffPositionService.getPaging(request).subscribe((response) => {
            if (response.status) {
                this.staffPosition = response.data.items.map((item: any) => ({
                    id: item.id,
                    name: item.positionName,
                }));
            }
        });
    }

    showDialogAdd() {
        this.displayDialog = true;
    }

    closeDialogAdd() {
        this.displayDialog = false;
        this.detailForm.reset();
        this.showErrorOrganizationId = false;
        this.showErrorDetailTimesheet = false;
        this.showErrorTimekeepingSheetName = false;
        this.detailTimesheet = [];
    }

    formatTimeRange(time: { start: Date; end: Date }): string {
        const start = time.start.toLocaleDateString('vi-VN');
        const end = time.end.toLocaleDateString('vi-VN');
        return `${start} - ${end}`;
    }

    // Chuyển về tháng trước
    prevMonth(): void {
        const prev = new Date(this.currentMonthYear);
        prev.setMonth(this.currentMonthYear.getMonth() - 1);
        this.currentMonthYear = prev;
        this.getPagingSummaryTimesheet();
    }

    // Chuyển sang tháng sau
    nextMonth(): void {
        const next = new Date(this.currentMonthYear);
        next.setMonth(this.currentMonthYear.getMonth() + 1);
        this.currentMonthYear = next;
        this.getPagingSummaryTimesheet();
    }

    // Lọc dữ liệu theo tháng hiện tại
    filterByCurrentMonth(): void {
        const startOfMonth = new Date(
            this.currentMonthYear.getFullYear(),
            this.currentMonthYear.getMonth(),
            1
        );
        const endOfMonth = new Date(
            this.currentMonthYear.getFullYear(),
            this.currentMonthYear.getMonth() + 1,
            0
        );

        this.filteredAttendance = this.detailAttendance.filter((contract) => {
            return (
                contract.time.start <= endOfMonth && // Ngày bắt đầu <= ngày cuối của tháng hiện tại
                contract.time.end >= startOfMonth // Ngày kết thúc >= ngày đầu của tháng hiện tại
            );
        });
    }

    onPageChange(event: any): void {
        this.pageSize = event.rows;
        this.pageIndex = event.page + 1;
        this.getPagingSummaryTimesheet();
    }

    goToPreviousPage(): void {
        if (this.pageIndex > 1) {
            this.pageIndex--;
            this.getPagingSummaryTimesheet();
        }
    }

    goToNextPage(): void {
        const lastPage = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageIndex < lastPage) {
            this.pageIndex++;
            this.getPagingSummaryTimesheet();
        }
    }
    updateCurrentPageReport(): void {
        const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
        const endRecord = Math.min(
            this.pageIndex * this.pageSize,
            this.totalRecords
        );
        if (this.totalRecords === 0) {
            this.currentPageReport = `<strong>0</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
        }
        if (this.totalRecords > 0) {
            this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
        }
    }

    isColVisible(field: string): boolean {
        return this.selectedColumns.some(c => c.field === field);
    }

    onColumnToggle(event: any, col: any): void {
        if (event.checked) {
            if (!this.selectedColumns.some(c => c.field === col.field)) {
                this.selectedColumns = this.allColumns.filter(c =>
                    this.selectedColumns.some(s => s.field === c.field) || c.field === col.field
                );
            }
        } else {
            this.selectedColumns = this.selectedColumns.filter(c => c.field !== col.field);
        }
    }

    onSubmit(): void {
        const detailData = this.detailForm.value;
        let hasError = false;

        if (
            !detailData.organizationId ||
            detailData.organizationId.length === 0
        ) {
            this.showErrorOrganizationId = true;
            hasError = true;
        }

        if (
            !detailData.summaryTimesheetNameStaffPositions ||
            detailData.summaryTimesheetNameStaffPositions.length === 0
        ) {
            this.showErrorDetailTimesheet = true;
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

        const formValue = this.detailForm.value;

        const selectedStaffPositionIds =
            formValue.summaryTimesheetNameStaffPositions.map(
                (item: any) => item.id
            );

        // Lấy danh sách ID từ các checkbox được chọn
        const selectedDetailTimesheetIds = this.selectedItems
            .map((isSelected, index) =>
                isSelected ? this.detailTimesheet[index].id : null
            ) // Lấy `id` của item nếu được chọn
            .filter((id) => id !== null); // Loại bỏ giá trị null

        // Chuẩn bị request payload
        const request: any = {
            organizationId: formValue.organizationId?.data?.id,
            timekeepingSheetName: formValue.timekeepingSheetName,
            timekeepingMethod: formValue.timekeepingMethod,
            summaryTimesheetNameDetailTimesheetNames:
                selectedDetailTimesheetIds.map((id) => ({
                    detailTimesheetNameId: id, // Format mỗi ID theo yêu cầu API
                })),
            summaryTimesheetNameStaffPositions: selectedStaffPositionIds.map(
                (staffPositionId: number) => ({
                    staffPositionId: staffPositionId,
                })
            ),
        };
        if (
            request.summaryTimesheetNameDetailTimesheetNames == null ||
            request.summaryTimesheetNameDetailTimesheetNames == undefined ||
            request.summaryTimesheetNameDetailTimesheetNames.length === 0
        ) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Phải chọn ít nhất một bản chấm công chi tiết',
                    life: 3000,
                },
            ];
            this.validateCheckBox = true;
            return;
        }
        console.log(
            'this. request.summaryTimesheetNameDetailTimesheetNames',
            request.summaryTimesheetNameDetailTimesheetNames
        );
        // Gửi request đến API
        this.summaryTimeKeepService.create(request).subscribe(
            (response: any) => {
                console.log('Thêm thành công:', response);
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Thêm mới thành công',
                        life: 3000,
                    },
                ];
                this.closeDialogAdd();
                this.getPagingSummaryTimesheet();
            },
            (error: any) => {
                console.error('Lỗi khi thêm:', error);
            }
        );
    }
}
