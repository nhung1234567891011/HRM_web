import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, TreeNode } from 'primeng/api';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { SummaryTimesheetNameEmployeeConfirmStatus } from 'src/app/core/enums/summary-timesheet-name-employee-confirm-status.enum';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { StaffDetailService } from 'src/app/core/services/staff-detail.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';
import { SummaryTimesheetNameEmployeeConfirmService } from 'src/app/core/services/summary-timesheet-name-employee-confirm.service';
import { SummaryTimesheetService } from 'src/app/core/services/summary-timesheet.service';

@Component({
    selector: 'app-detail-summary-timesheet',
    templateUrl: './detail-summary-timesheet.component.html',
    styleUrl: './detail-summary-timesheet.component.scss',
})
export class DetailSummaryTimesheetComponent implements OnInit {
    messages: any[] = [];
    items: MenuItem[] | undefined;
    selector: any;
    contracts: any;
    contractOption: any;
    pageSize: number = 30;
    unitOptions: any[] = [];
    pageIndex: number = 1;
    totalRecords: number = 0;
    currentPageReport: string = '';
    displayDialogEdit: boolean = false;
    detailForm!: FormGroup;
    detailTimesheet: any[];
    staffPosition: any[] = [];
    treeData: TreeNode[] = [];
    organizationId: string | null = null; // Lưu giá trị organizationId được chọn
    staffPositionIds: number[] = [];
    selectedItems: any[] = [];
    allSelected: boolean = false;
    detailSummaryById!: number;
    summarysheet: any;
    isDisabled: boolean = true;
    detaisummary: any;
    selectedEmployee: any;
    filteredEmployees: any[] = [];
    employeesName: any[] = [];
    selectedNode: any;
    user: any;
    buttonText: string = 'Chưa xác nhận';
    buttonColor: string = '#6c757d'; // Default color (gray)
    showErrorOrganizationId: boolean = false;
    showErrorTimekeepingSheetName: boolean = false;
    showErrorDetailTimesheet: boolean = false;
    showErrorTimekeepingMethod: boolean = false;
    summaryTimesheetNameId: any = null;
    summaryTimesheet: any[];
    permissionConstant = PermissionConstant;
    columns = [
        { field: 'select', header: 'Chọn', selected: true },
        { field: 'employeeCode', header: 'Mã nhân viên', selected: true },
        { field: 'fullName', header: 'Họ và tên', selected: true },
        { field: 'organization', header: 'Đơn vị công tác', selected: true },
        { field: 'position', header: 'Vị trí công việc', selected: true },
        { field: 'workingDays', header: 'Số công chuẩn', selected: true },
        { field: 'leaveDays', header: 'Nghỉ phép', selected: true },
        { field: 'daysPerMonth', header: 'Số Ngày/Tháng', selected: true },
        { field: 'totalHours', header: 'Tổng giờ', selected: true },
        { field: 'equalDays', header: 'Quy ngày', selected: true },
        {
            field: 'remainingLeaveDays',
            header: 'Số ngày phép còn lại',
            selected: true,
        },
        { field: 'status', header: 'Trạng thái', selected: true },
    ];

    filteredColumns = [...this.columns]; // Sao chép danh sách cột để tìm kiếm
    displayColumnsCustom = false;

    constructor(
        private organizationService: OrganizationService,
        private fb: FormBuilder,
        private staffPositionService: StaffPositionService,
        private staffDetailService: StaffDetailService,
        private summaryTimeKeepService: SummaryTimesheetService,
        private router: Router,
        private route: ActivatedRoute,
        private employeesService: EmployeeService,
        private authService: AuthService,
        private summaryTimesheetNameEmployeeConfirmService: SummaryTimesheetNameEmployeeConfirmService,
        public permisionHelper: HasPermissionHelper
    ) {
        this.authService.userCurrent.subscribe((res) => {
            this.user = res;
        });
    }

    ngOnInit() {
        this.items = [
            { label: 'Chấm công', route: '/installation' },
            { label: 'Bảng chi tiết chấm công tổng hợp' },
        ];

        this.initForm();
        this.getOrganizations();
        this.getStaffPosition();
        this.CallSnaphot();
        this.getDetailTimesheetById();
        this.fetchData();
        this.fetchEmployees();
        this.getPagingSummaryTimesheet();

        this.selectedItems = new Array(this.detailTimesheet?.length).fill(
            false
        );
    }

    openColumnDialog(): void {
        this.displayColumnsCustom = true;
    }

    onSearchColumn(event: Event): void {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredColumns = this.columns.filter((col) =>
            col.header.toLowerCase().includes(query)
        );
    }

    handleApplyChangeSelectedColumns(): void {
        localStorage.setItem(
            'selectedColumnsLeaveApplication',
            JSON.stringify(this.columns)
        );
        this.displayColumnsCustom = false;
    }

    isColumnVisible(field: string): boolean {
        const column = this.columns.find((col) => col.field === field);
        return column ? column.selected : false;
    }

    toggleSelectAll(isSelected: boolean): void {
        this.allSelected = isSelected;
        this.selectedItems = this.detailTimesheet.map(() => isSelected);
    }

    updateSelectAllState(): void {
        this.allSelected = this.selectedItems.every((isSelected) => isSelected);
    }

    initForm() {
        this.detailForm = this.fb.group({
            id: [null],
            organizationId: [null, Validators.required],
            timekeepingSheetName: [null, Validators.required],
            timekeepingMethod: [null, Validators.required],
            summaryTimesheetNameDetailTimesheetNames: [[], Validators.required],
            summaryTimesheetNameStaffPositions: [[], Validators.required],
        });
    }

    CallSnaphot(): void {
        this.detailSummaryById = +this.route.snapshot.paramMap.get('id')!;
        this.summaryTimesheetNameId = +this.route.snapshot.paramMap.get('id')!;
    }

    getPagingSummaryTimesheet(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            SummaryTimesheetId: this.detailSummaryById,
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
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

    fetchData(): void {
        const keyword =
            this.selectedEmployee && typeof this.selectedEmployee === 'string'
                ? this.selectedEmployee.trim()
                : '';

        const request: any = {
            id: this.detailSummaryById,
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            KeyWord: keyword,
            OrganizationId: this.selectedNode?.data?.id
                ? this.selectedNode?.data?.id
                : this.user.organization.id,
        };

        this.summaryTimeKeepService
            .getPagingSummaryTimeSheet(request)
            .subscribe((response) => {
                if (response.status) {
                    this.detaisummary = response.data.items;
                    this.totalRecords = response.data.totalRecords;
                    this.updateCurrentPageReport();
                }
            });
    }

    getButtonText(): string {
        if (!this.summaryTimesheet || this.summaryTimesheet.length === 0) {
            return 'Không có dữ liệu';
        }

        const status = this.summaryTimesheet[0]?.status; // Lấy status từ phần tử đầu tiên
        switch (status) {
            case SummaryTimesheetNameEmployeeConfirmStatus.None:
                return 'Chưa gửi xác nhận';
            case SummaryTimesheetNameEmployeeConfirmStatus.Confirm:
                return 'Đã xác nhận';
            case SummaryTimesheetNameEmployeeConfirmStatus.Reject:
                return 'Bị từ chối';
            case SummaryTimesheetNameEmployeeConfirmStatus.Pending:
                return 'Đang xác nhận';
            case SummaryTimesheetNameEmployeeConfirmStatus.SendedNotConfirm:
                return 'Chưa xác nhận';
            default:
                return 'Trạng thái không xác định';
        }
    }

    getButtonColor(): string {
        if (!this.summaryTimesheet || this.summaryTimesheet.length === 0) {
            return '#CCCCCC'; // Màu xám khi không có dữ liệu
        }

        const status = this.summaryTimesheet[0]?.status; // Lấy status từ phần tử đầu tiên
        switch (status) {
            case SummaryTimesheetNameEmployeeConfirmStatus.None:
                return '#CCCCCC'; // Màu đỏ cho trạng thái "Chưa gửi xác nhận"
            case SummaryTimesheetNameEmployeeConfirmStatus.Confirm:
                return '#4CAF50'; // Màu xanh lá cho trạng thái "Đã xác nhận"
            case SummaryTimesheetNameEmployeeConfirmStatus.Reject:
                return '#CCCCCC';
            case SummaryTimesheetNameEmployeeConfirmStatus.Pending:
                return '#CCCCCC';
            case SummaryTimesheetNameEmployeeConfirmStatus.SendedNotConfirm:
                return '#CCCCCC';
            default:
                return '#CCCCCC'; // Màu xám cho các trạng thái khác
        }
    }

    exportOrganizationsToExcel(): void {
        const keyword =
            this.selectedEmployee && typeof this.selectedEmployee === 'string'
                ? this.selectedEmployee.trim()
                : '';

        const request: any = {
            Id: this.detailSummaryById,
            KeyWord: keyword,
            OrganizationId: this.selectedNode?.data?.id
                ? this.selectedNode?.data?.id
                : this.user.organization.id,
            StaffPositionId:
                this.staffPositionIds && this.staffPositionIds.length > 0
                    ? this.staffPositionIds[0]
                    : null,
            // Lưu ý: backend đang dùng ApplySorting(sortBy, orderBy) (bị đảo tham số),
            // nên ở FE đang truyền SortBy = tên cột, OrderBy = asc/desc
            SortBy: 'LastName',
            OrderBy: 'asc',
        };

        const sheetName =
            this.summarysheet?.timekeepingSheetName ||
            this.detailForm.value.timekeepingSheetName ||
            'Bang_cham_cong';

        const safeName = sheetName.replace(/[\\/:*?"<>|]/g, '_');

        this.summaryTimeKeepService
            .exportSummaryTimeSheetWithEmployeeToExcel(request)
            .subscribe((blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${safeName}_${new Date().getTime()}.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
            });
    }

    fetchEmployees() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.employeesService.getEmployees(request).subscribe((data: any) => {
            this.employeesName = data.items.map((employeesName) => ({
                ...employeesName,
                displayName: `${employeesName.firstName} ${employeesName.lastName}`,
            }));
        });
    }

    searchEmployee(event: any) {
        const query = event.query.toLowerCase();
        this.filteredEmployees = this.employeesName.filter((employeesName) =>
            employeesName.displayName.toLowerCase().includes(query)
        );
    }

    getDetailTimesheetById(): void {
        const request: any = {
            id: this.detailSummaryById,
        };
        this.summaryTimeKeepService
            .getById(request)
            .subscribe((response: any) => {
                if (response && response.status) {
                    const data = response.data;
                    this.summarysheet = data;
                    this.detailForm.patchValue({
                        id: data.id,
                        timekeepingSheetName: data.timekeepingSheetName,
                        timekeepingMethod: data.timekeepingMethod,
                    });

                    const selectedPositions =
                        data.summaryTimesheetNameStaffPositions?.map(
                            (item: any) => item.id
                        ) || [];

                    // Tìm các vị trí trong staffPosition tương ứng với id đã chọn
                    const selectedStaffPositions = this.staffPosition.filter(
                        (position: any) =>
                            selectedPositions.includes(position.id)
                    );

                    // Gán các vị trí đã chọn vào form
                    this.detailForm.patchValue({
                        summaryTimesheetNameStaffPositions:
                            selectedStaffPositions,
                    });

                    const matchingNode = this.findTreeNodeById(
                        this.treeData,
                        data.organizationId
                    );
                    if (matchingNode) {
                        this.detailForm.patchValue({
                            organizationId: matchingNode,
                        });
                    }

                    this.detailTimesheet =
                        data.summaryTimesheetNameDetailTimesheetNames.map(
                            (item: any) => ({
                                id: item.detailTimesheetName.id,
                                timekeepingSheetName:
                                    item.detailTimesheetName
                                        .timekeepingSheetName,
                                startDate: item.detailTimesheetName.startDate,
                                endDate: item.detailTimesheetName.endDate,
                                organizationName:
                                    item.detailTimesheetName.organization
                                        .organizationName,
                                timekeepingMethod:
                                    item.detailTimesheetName
                                        .timekeepingMethod === 0
                                        ? 'Theo giờ'
                                        : 'Theo ngày',
                                positionNames:
                                    item.detailTimesheetName.detailTimesheetNameStaffPositions
                                        .map((pos: any) => pos.positionName)
                                        .join(', '),
                            })
                        );

                    this.selectedItems = this.detailTimesheet.map(() => true);
                    this.allSelected = this.detailTimesheet.length > 0;
                }
            });
    }

    findTreeNodeById(treeData: TreeNode[], id: any): TreeNode | null {
        for (const node of treeData) {
            if (node.data.id === id) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const foundNode = this.findTreeNodeById(node.children, id);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
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

    onOrganizationChange(event: any): void {
        const organizationId = event.value ? event.value.id : null;
        this.organizationId = organizationId;
        this.getPagingDetailTimesheet();
    }

    onStaffPositionChange(event: any): void {
        this.staffPositionIds = event.value.map((position: any) => position.id);
        this.getPagingDetailTimesheet();
    }

    getPagingDetailTimesheet(): void {
        const formValue = this.detailForm.value;
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            organizationId: formValue.organizationId?.data?.id,
            staffPositionId: this.staffPositionIds.join(','), // Chuyển thành chuỗi ID
        };

        this.staffDetailService.getPaging(request).subscribe(
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
                    this.detailTimesheet.length
                ).fill(false);
                this.allSelected = false; // Reset trạng thái checkbox cha
            },
            (error: any) => {
                console.error(error);
            }
        );
    }

    showDialogEdit() {
        this.displayDialogEdit = true;

        if (this.detailSummaryById) {
            this.getDetailTimesheetById();
        }
    }

    closeDialogEdit() {
        this.displayDialogEdit = false;
        this.detailForm.reset();
        this.showErrorOrganizationId = false;
        this.showErrorDetailTimesheet = false;
        this.showErrorTimekeepingSheetName = false;
        this.detailTimesheet = [];
    }

    onPageChange(event: any): void {
        this.pageSize = event.rows;
        this.pageIndex = event.page + 1;
        this.fetchData();
    }

    goToPreviousPage(): void {
        if (this.pageIndex > 1) {
            this.pageIndex--;
            this.fetchData();
        }
    }

    goToNextPage(): void {
        const lastPage = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageIndex < lastPage) {
            this.pageIndex++;
            this.fetchData();
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

    onSubmitUpdate(): void {
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

        if (
            !detailData.timekeepingSheetName ||
            detailData.timekeepingSheetName.length === 0
        ) {
            this.showErrorTimekeepingSheetName = true;
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
                isSelected ? this.detailTimesheet[index]?.id : null
            ) // Lấy id nếu được chọn
            .filter((id) => id !== null); // Loại bỏ giá trị null

        // Chuẩn bị request payload
        const request: any = {
            organizationId: formValue.organizationId?.data?.id,
            timekeepingSheetName: formValue.timekeepingSheetName,
            timekeepingMethod: formValue.timekeepingMethod,
            summaryTimesheetNameDetailTimesheetNames:
                selectedDetailTimesheetIds.map((id) => ({
                    detailTimesheetNameId: id,
                })),
            summaryTimesheetNameStaffPositions: selectedStaffPositionIds.map(
                (staffPositionId: number) => ({
                    staffPositionId: staffPositionId,
                })
            ),
        };

        const shiftWorkId = this.detailSummaryById;

        // Gửi request đến API
        this.summaryTimeKeepService.update(shiftWorkId, request).subscribe(
            (response: any) => {
                console.log('Thêm thành công:', response);
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Cập nhật thành công',
                        life: 3000,
                    },
                ];
                this.closeDialogEdit();
            },
            (error: any) => {
                console.error('Lỗi khi cập nhật:', error);
            }
        );
    }
    fixTimezoneOffset(date: Date): Date {
        if (!date) return null;
        let localDate = new Date(date);
        localDate.setHours(
            localDate.getHours() + Math.abs(localDate.getTimezoneOffset() / 60)
        ); // Cộng thêm số giờ bị lệch
        return localDate;
    }
    //tny add
    selectedEmployeeSends: any[] = [];
    date: any = null;
    showSendConfirm: any = false;
    handleShowSendConfirm() {
        this.showSendConfirm = true;
    }
    handleSendConfirm() {
        if (this.selectedEmployeeSends.length <= 0) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: 'Cảnh báo',
                    detail: 'Cần chọn ít nhất 1 nhân viên để gửi',
                    life: 3000,
                },
            ];
            return;
        }
        if (this.date == null) {
            this.messages = [
                {
                    severity: 'warn',
                    summary: 'Cảnh báo',
                    detail: 'Cần chọn ngày xác nhận',
                    life: 3000,
                },
            ];
            return;
        }

        const request = {
            summaryTimesheetNameId: this.summaryTimesheetNameId,
            employeeIds: this.selectedEmployeeSends
                .filter(
                    (item) =>
                        item.status ===
                            SummaryTimesheetNameEmployeeConfirmStatus.None ||
                        item.status ===
                            SummaryTimesheetNameEmployeeConfirmStatus.Reject
                )
                .map((item) => item.id),
            status: SummaryTimesheetNameEmployeeConfirmStatus.Pending,
            date: this.fixTimezoneOffset(this.date),
        };
        console.log('this.date', this.date);
        this.summaryTimesheetNameEmployeeConfirmService
            .createOrUpdateMultiple(request)
            .subscribe({
                next: (res) => {
                    if (res?.status === true) {
                        this.fetchData();
                        this.showSendConfirm = false;
                        this.messages = [
                            {
                                severity: 'success',
                                summary: 'Thành công',
                                detail: res?.message || 'Gửi xác nhận thành công',
                                life: 3000,
                            },
                        ];
                    } else {
                        this.messages = [
                            {
                                severity: 'error',
                                summary: 'Lỗi',
                                detail: res?.message || 'Gửi xác nhận thất bại',
                                life: 3000,
                            },
                        ];
                    }
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.message || 'Gửi xác nhận thất bại';
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Lỗi',
                            detail: msg,
                            life: 3000,
                        },
                    ];
                },
            });
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
                    text: 'Chờ xác nhận ',
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

    // Kiểm tra trạng thái trong bảng
}
