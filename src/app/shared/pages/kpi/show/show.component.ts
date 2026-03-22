import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { KpiService } from 'src/app/core/services/kpi.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css'],
    providers: [ConfirmationService],
})
export class ShowComponent implements OnInit {
    items: any;
    detailForm!: FormGroup;
    detailUpdateForm!: FormGroup;
    staffPositionVisible: boolean = false;
    isRowSelectable: any;
    createKpiVisible: boolean = false;
    updateKpiVisible: boolean = false;
    selectedEmployee: any;
    filteredName: any[] = [];
    filteredEmployees: any[] = [];
    pageSize: number = 30;
    pageIndex: number = 1;
    employeesName: any[] = [];
    treeData: TreeNode[] = [];
    selectedNode: any;
    kpilist: any;
    totalRecords: number = 0;
    detailById: number = 0;
    currentPageReport: string = '';
    staffPosition: any[] = [];
    messages: any[] = [];
    expandedRows: { [key: number]: boolean } = {};
    isDisabled: boolean = true;
    selectedStartDate: string = '';
    selectedEndDate: string = '';

    showErrorOrganizationId: boolean = false;
    showErrorStaffPositionId: boolean = false;
    showErrorNameKpiTable: boolean = false;
    showErrorCreateTime: boolean = false;
    permissionConstant = PermissionConstant;

    constructor(
        private employeesService: EmployeeService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService,
        private organizationService: OrganizationService,
        private kpiService: KpiService,
        private staffPositionService: StaffPositionService,
        private formBuilder: FormBuilder,
        public permisionHelper: HasPermissionHelper
    ) {
        // formBuilder;
    }

    ngOnInit() {
        this.items = [
            { label: 'Tính lương' },
            { label: 'Doanh thu hoa hồng' },
        ];
        this.initForm();
        this.loadKpiData();
        this.getOrganizations();
        this.getStaffPosition();
        this.fetchEmployees();
    }

    initForm() {
        this.detailForm = this.formBuilder.group({
            nameKpiTable: [null, Validators.required],
            organizationId: [null, Validators.required],
            createTime: [null, Validators.required],
            kpiTablePositions: [[], Validators.required],
        });
        this.detailUpdateForm = this.formBuilder.group({
            id: [null, Validators.required],
            nameKpiTable: [null, Validators.required],
            organizationId: [null, Validators.required],
            createTime: [null, Validators.required],
            fromDate: [null, Validators.required],
            toDate: [null, Validators.required],
            kpiTablePositions: [[], Validators.required],
        });
    }

    loadKpiData() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            OrganizationId: this.selectedNode?.data?.id,
            NameKpiTable: this.selectedEmployee ? this.selectedEmployee.displayName.replace('+', ' ') : '',
        };
        this.kpiService.getPaging(request).subscribe((response: any) => {
            if (response?.status) {
                this.kpilist = response.data.items.map(item => {
                    const positionNames = item.kpiTablePositions.map(position => position.positionName).join(', ');
                    return {
                        ...item,
                        positionNames: positionNames
                    };
                });
                this.totalRecords = response.data.totalRecords;
                this.updateCurrentPageReport();
            }
        });
    }

    getById(kpiId: number): void {
        this.detailById = kpiId;
        const request: any = {
            id: kpiId,
        };
        this.kpiService.getById(request).subscribe((response: any) => {
            if (response && response.status) {
                const data = response.data;

                // Gán dữ liệu vào form
                this.detailUpdateForm.patchValue({
                    id: data.id,
                    nameKpiTable: data.nameKpiTable,
                    fromDate: new Date(data.fromDate),
                    toDate: new Date(data.toDate),
                });

                // So sánh staffPositionId với id trong staffPosition
                const selectedPositions = data.kpiTablePositions?.map((item: any) => item.staffPositionId) || [];
                const selectedStaffPositions = this.staffPosition.filter((position: any) =>
                    selectedPositions.includes(position.id)
                );

                // Gán các vị trí đã chọn vào form
                this.detailUpdateForm.patchValue({
                    kpiTablePositions: selectedStaffPositions,
                });

                // Tìm node trong treeData
                const matchingNode = this.findTreeNodeById(this.treeData, data.organizationId);
                if (matchingNode) {
                    this.detailUpdateForm.patchValue({
                        organizationId: matchingNode,
                    });
                }

                const fromDate = new Date(data.fromDate);
                const toDate = new Date(data.toDate);
                const firstDayOfMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
                const lastDayOfMonth = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0);
    
                // Gán ngày đầu tháng vào form
                this.detailUpdateForm.patchValue({
                    createTime: firstDayOfMonth,  // Gán ngày đầu tháng
                });
            }
        });
    }


    openCreateKpiVisible() {
        this.createKpiVisible = true;
    }
    openUpdateKpiVisible(kpiId: number) {
        this.updateKpiVisible = true;
        this.getById(kpiId);
    }

    closeCreateKpiVisible() {
        this.createKpiVisible = false; // Đóng dialog
        this.detailForm.reset(); // Reset form về trạng thái ban đầu
        this.showErrorOrganizationId = false;
        this.showErrorNameKpiTable = false;
        this.showErrorStaffPositionId = false;
        this.showErrorCreateTime = false;
    }
    closeUpdateKpiVisible() {
        this.updateKpiVisible = false; // Đóng dialog
        this.detailUpdateForm.reset(); // Reset form về trạng thái ban đầu
        this.showErrorOrganizationId = false;
        this.showErrorNameKpiTable = false;
        this.showErrorStaffPositionId = false;
        this.showErrorCreateTime = false;
    }

    fetchEmployees() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex
        };
        this.kpiService.getPaging(request).subscribe((response: any) => {
            this.employeesName = response.data.items.map(employeesName => ({
                ...employeesName,
                displayName: `${employeesName.nameKpiTable}`
            }));
        });
    }

    searchEmployee(event: any) {
        const query = event.query.toLowerCase();
        this.filteredEmployees = this.employeesName.filter(employeesName =>
            employeesName.displayName.toLowerCase().includes(query)
        );
    }

    getOrganizations(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex
        };
        this.organizationService.getPagingAll(request).subscribe((response) => {
            if (response.status) {
                this.treeData = this.transformToTreeNode(response.data.items);
            }
        });
    }

    transformToTreeNode(data: any[]): TreeNode[] {
        return data.map(item => ({
            label: item.organizationName,
            data: item,
            children: item.organizationChildren ? this.transformToTreeNode(item.organizationChildren) : [],
            expanded: false
        }));
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

    getStaffPosition(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex
        };
        this.staffPositionService.getPaging(request).subscribe((response) => {
            if (response.status) {
                this.staffPosition = response.data.items.map((item: any) => ({
                    id: item.id,
                    name: item.positionName
                }));
            }
        });
    }

    isAllPositionsMatch(positionNames: string): boolean {
        const positions = positionNames.split(', ').map(name => name.trim());

        return positions.length === this.staffPosition.length &&
            positions.every(positionName =>
                this.staffPosition.some(staffPos => staffPos.name === positionName)
            );
    }

    toggleRow(id: string, event: Event): void {
        event.preventDefault(); // Ngăn không reload trang
        this.expandedRows[id] = !this.expandedRows[id]; // Đổi trạng thái mở/đóng của hàng theo id
    }

    onPageChange(event: any): void {
        this.pageSize = event.rows;
        this.pageIndex = event.page + 1;
        this.loadKpiData();
    }

    goToPreviousPage(): void {
        if (this.pageIndex > 1) {
            this.pageIndex--;
            this.loadKpiData();
        }
    }

    goToNextPage(): void {
        const lastPage = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageIndex < lastPage) {
            this.pageIndex++;
            this.loadKpiData();
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

    onMonthSelect(event: Date): void {
        const selectedDate = new Date(event); // Lấy ngày từ p-calendar
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
    
        // Tính ngày đầu tháng (local time)
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Ngày cuối tháng
    
        // Tạo chuỗi ngày theo múi giờ địa phương
        this.selectedStartDate = this.toLocalISOString(startDate);
        this.selectedEndDate = this.toLocalISOString(endDate);
    }
    
    // Hàm chuyển Date sang ISO string theo múi giờ địa phương
    toLocalISOString(date: Date): string {
        const tzOffset = date.getTimezoneOffset() * 60000; // Lấy offset múi giờ (phút -> ms)
        const localDate = new Date(date.getTime() - tzOffset); // Trừ offset để về đúng local time
        return localDate.toISOString().slice(0, 19); // Bỏ phần 'Z' ở cuối
    }    

    addKpi(): void {
        const detailData = this.detailForm.value;
        let hasError = false;

        if (!detailData.organizationId || detailData.organizationId.length === 0) {
            this.showErrorOrganizationId = true;
            hasError = true;
        }

        if (!detailData.kpiTablePositions || detailData.kpiTablePositions.length === 0) {
            this.showErrorStaffPositionId = true;
            hasError = true;
        }

        if (!detailData.nameKpiTable || detailData.nameKpiTable.length === 0) {
            this.showErrorNameKpiTable = true;
            hasError = true;
        }

        if (!detailData.createTime || detailData.createTime.length === 0) {
            this.showErrorCreateTime = true;
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

        const selectedStaffPositionIds = formValue.kpiTablePositions.map((item: any) => item.id);

        // const createTime = new Date(formValue.createTime);
        // const startOffset = createTime.getTimezoneOffset() * 60000;
        // const localCreateTime = new Date(createTime.getTime() - startOffset).toISOString();

        const payload = {
            organizationId: formValue.organizationId?.data?.id,
            nameKpiTable: formValue.nameKpiTable,
            fromDate: this.selectedStartDate,
            toDate: this.selectedEndDate,
            kpiTablePositions: selectedStaffPositionIds.map((staffPositionId: number) => ({
                staffPositionId: staffPositionId,
            })),
        };

        // Gửi API
        this.kpiService.create(payload).subscribe({
            next: (response: any) => {
                if (response.status) {
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Thêm mới thành công',
                            life: 3000,
                        },
                    ];
                    this.closeCreateKpiVisible();
                    this.loadKpiData();
                } else {
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Đã có lỗi xảy ra',
                            life: 3000,
                        },
                    ];
                }
            },
            error: (error) => {
                if (error.status === 400 && error.error?.detail) {
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: error.error.detail,
                            life: 3000,
                        },
                    ];
                } else {
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Đã có lỗi xảy ra',
                            life: 3000,
                        },
                    ];
                }
            },
        });
    }


    updateKpi(): void {
        const detailData = this.detailUpdateForm.value;
        let hasError = false;

        if (!detailData.organizationId || detailData.organizationId.length === 0) {
            this.showErrorOrganizationId = true;
            hasError = true;
        }

        if (!detailData.kpiTablePositions || detailData.kpiTablePositions.length === 0) {
            this.showErrorStaffPositionId = true;
            hasError = true;
        }

        if (!detailData.nameKpiTable || detailData.nameKpiTable.length === 0) {
            this.showErrorNameKpiTable = true;
            hasError = true;
        }

        if (!detailData.createTime || detailData.createTime.length === 0) {
            this.showErrorCreateTime = true;
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

        const fromDate = new Date(formValue.fromDate);
        const startOffset = fromDate.getTimezoneOffset() * 60000;
        const localfromDate = new Date(fromDate.getTime() - startOffset).toISOString();

        const toDate = new Date(formValue.toDate);
        const endOffset = toDate.getTimezoneOffset() * 60000;
        const localtoDate = new Date(toDate.getTime() - endOffset).toISOString();

        // Tạo dữ liệu cho API
        const requestBody = {
            organizationId: formValue.organizationId?.data?.id,
            nameKpiTable: formValue.nameKpiTable,
            fromDate: localfromDate,
            toDate: localtoDate,
            kpiTablePositions: formValue.kpiTablePositions.map((position: any) => ({
                staffPositionId: position.id,
            })),
        };

        const kpiTableId = this.detailById;

        this.kpiService.update(kpiTableId, requestBody).subscribe({
            next: (response) => {
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
                this.closeUpdateKpiVisible();
                this.loadKpiData();
            },
            error: (error) => {
                if (error.status === 400 && error.error?.detail) {
                    // Hiển thị thông báo lỗi chi tiết từ API
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: error.error.detail,
                            life: 3000,
                        },
                    ];
                } else {
                    // Hiển thị thông báo lỗi mặc định
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Đã có lỗi xảy ra',
                            life: 3000,
                        },
                    ];
                }
                console.error('Lỗi khi cập nhật:', error);
            },
        });
    }

}
