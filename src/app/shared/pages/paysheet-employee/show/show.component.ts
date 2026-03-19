import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, TreeNode } from 'primeng/api';

import pagingConfig, {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE_SIZE_OPTIONS,
    DEFAULT_PER_PAGE_OPTIONS,
} from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { SalaryStatus } from 'src/app/core/enums/salary-status.enum';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
// import { CreateComponent } from '../create/create.component';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { DatePipe } from '@angular/common';
import {
    ApplicablePosition,
    PayrollConfirmationStatus,
    PayrollStatus,
} from 'src/app/core/enums/payroll.enum';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { PayrollConfirmationStatusEmployee } from 'src/app/core/enums/payroll-confirmation-status-employee.enum';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrl: './show.component.css',
    providers: [ConfirmationService, DatePipe],
})
export class ShowComponent implements OnInit {
    items: any = {};
    queryParameters: any = {};
    salaryTables: any = [];
    selectedSalaryTable: any = {};
    selectedNode: any;
    treeData: TreeNode[] = [];
    salaries: any[] = [];
    organizations: any[] = [];
    payrolls: any[] = [];
    currentYear: any;
    userCurrent: any;
    PayrollConfirmationStatusEmployeeEnum: typeof PayrollConfirmationStatusEmployee =
        PayrollConfirmationStatusEmployee;
    //flag
    displayColumnsCustom: boolean = false;

    columns = [
        { field: 'payrollName', header: 'Tên bảng lương', selected: true },
        { field: 'organizationName', header: 'Đơn vị áp dụng', selected: true },
        {
            field: 'staffPositionLabel',
            header: 'Vị trí áp dụng',
            selected: true,
        },
        { field: 'createdAt', header: 'Ngày tổng hợp', selected: true },
        { field: 'updatedAt', header: 'Ngày cập nhật', selected: true },
        { field: 'payrollStatuslabel', header: 'Trạng thái', selected: true },
        {
            field: 'payrollConfirmationStatusLabel',
            header: 'Trạng thái xác nhận',
            selected: true,
        },
    ];

    paging: any = {
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        sortBy: '',
        orderBy: '',
        totalRecords: 0,
        totalPages: 0,
    };
    config: any = {
        paging: pagingConfig.default,
        baseUrl: systemConfig.baseFileSystemUrl,
        perPageOptions: DEFAULT_PER_PAGE_OPTIONS,
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    };
    user: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private datePipe: DatePipe,
        private payrollService: PayrollService,
        private organiStructTypeService: OrganiStructTypeService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {
        this.authService.userCurrent.subscribe((user) => {
            this.user = user;
        });
    }

    // @ViewChild(CreateComponent) createComponent!: CreateComponent;
    ngOnInit() {
        this.items = [
            { label: 'Tính lương' },
            { label: 'Bảng lương nhân viên' },
        ];
        this.currentYear = new Date().getFullYear();
        this.getOrganizations();
        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
            this.route.queryParams.subscribe((params) => {
                const request = {
                    ...params,
                    pageIndex: params['pageIndex']
                        ? params['pageIndex']
                        : this.config.paging.pageIndex,
                    pageSize: params['pageSize']
                        ? params['pageSize']
                        : this.config.paging.pageSize,

                    employeeId: user?.employee.id,
                    organizationId: user?.organization?.id,
                    year: this.currentYear,
                };

                this.queryParameters = {
                    ...params,
                    status: params['status'] ? params['status'] : null,
                    name: params['name'] ? params['name'] : null,
                    employeeId: user?.employee.id,
                    organizationId: user?.organization?.id,
                    year: this.currentYear,
                };
                this.getPayrolls(request);
            });
        });
    }

    // Hàm tăng năm
    incrementYear(): void {
        const newYear = this.currentYear + 1;
        this.currentYear = newYear;
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                pageIndex: params['pageIndex']
                    ? params['pageIndex']
                    : this.config.paging.pageIndex,
                pageSize: params['pageSize']
                    ? params['pageSize']
                    : this.config.paging.pageSize,

                employeeId: this.userCurrent?.employee.id,
                organizationId: this.userCurrent?.organization?.id,
                year: this.currentYear,
            };

            this.queryParameters = {
                ...params,
                status: params['status'] ? params['status'] : null,
                name: params['name'] ? params['name'] : null,
                employeeId: this.userCurrent?.employee.id,
                organizationId: this.userCurrent?.organization?.id,
                year: this.currentYear,
            };
            this.getPayrolls(request);
        });
    }

    // Hàm giảm năm
    decrementYear(): void {
        const newYear = this.currentYear - 1;
        this.currentYear = newYear;
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                pageIndex: params['pageIndex']
                    ? params['pageIndex']
                    : this.config.paging.pageIndex,
                pageSize: params['pageSize']
                    ? params['pageSize']
                    : this.config.paging.pageSize,

                employeeId: this.userCurrent?.employee.id,
                organizationId: this.userCurrent?.organization?.id,
                year: this.currentYear,
            };

            this.queryParameters = {
                ...params,
                status: params['status'] ? params['status'] : null,
                name: params['name'] ? params['name'] : null,
                employeeId: this.userCurrent?.employee.id,
                organizationId: this.userCurrent?.organization?.id,
                year: this.currentYear,
            };
            this.getPayrolls(request);
        });
    }

    // getPayrolls(request: any) {
    //     this.payrollService.getPaging({}).subscribe((results) => {
    //         this.payrolls = results.items;
    //         console.log(this.payrolls);
    //     });
    // }
    public getPayrolls(request: any): any {
        this.payrollService
            .getPagingForCustomer(request)
            .subscribe((result: any) => {
                if (request.pageIndex !== 1 && result.items.length === 0) {
                    this.route.queryParams.subscribe((params) => {
                        const request = {
                            ...params,
                            pageIndex: 1,
                        };

                        this.router.navigate([], {
                            relativeTo: this.route,
                            queryParams: request,
                            queryParamsHandling: 'merge',
                        });
                    });
                }
                this.payrolls = result.items.map((item: any) => {
                    let payrollStatuslabel = '';
                    switch (item.payrollStatus) {
                        case PayrollStatus.Locked:
                            payrollStatuslabel = 'Đã khóa';
                            break;
                        case PayrollStatus.Unlocked:
                            payrollStatuslabel = 'Chưa khóa';
                            break;
                    }
                    let payrollConfirmationStatusLabel = '';
                    switch (item.confirmationStatus) {
                        case this.PayrollConfirmationStatusEmployeeEnum.NotSent:
                            payrollConfirmationStatusLabel =
                                'Chưa gửi xác nhận';
                            break;
                        case this.PayrollConfirmationStatusEmployeeEnum
                            .Rejected:
                            payrollConfirmationStatusLabel = 'Từ chối xác nhận';
                            break;
                        case this.PayrollConfirmationStatusEmployeeEnum
                            .Confirming:
                            payrollConfirmationStatusLabel = 'Đang xác nhận';
                            break;
                        case this.PayrollConfirmationStatusEmployeeEnum
                            .Confirmed:
                            payrollConfirmationStatusLabel = 'Đã xác nhận';
                            break;
                    }

                    let applicablePositionLabel = '';
                    switch (item.applicablePosition) {
                        case ApplicablePosition.AllPosition:
                            applicablePositionLabel = 'Tất cả';
                            break;
                        case ApplicablePosition.Other:
                            applicablePositionLabel = 'Khác';
                            break;
                    }

                    let staffPositionLabel = item.payrollStaffPositions
                        .map((position: any) => position.positionName)
                        .join(', ');

                    console.log(staffPositionLabel);

                    const formattedCreatedAt = this.datePipe.transform(
                        item.createdAt,
                        'dd-MM-yyyy'
                    );
                    const formattedUpdatedAt = this.datePipe.transform(
                        item.createdAt,
                        'dd-MM-yyyy'
                    );
                    return {
                        ...item,
                        payrollStatuslabel,
                        payrollConfirmationStatusLabel,
                        staffPositionLabel,
                        createdAt: formattedCreatedAt,
                        updatedAt: formattedUpdatedAt,
                    };
                });

                if (this.payrolls.length === 0) {
                    this.paging.pageIndex = 1;
                }

                const { items, ...paging } = result;
                this.paging = paging;
                console.log('payroll', this.payrolls);
                // this.selectedPayrolls = [];
            });
    }
    getOrganizations() {
        const request = { id: this.user.organization.id };
        this.organiStructTypeService
            .getOrganiStructType(request.id)
            .subscribe((res) => {
                if (res && res.data) {
                    this.organizations = [this.handleConvertToTree(res.data)];
                } else {
                    this.organizations = [];
                }

                this.handleConvertToTreeSelect();
                this.route.queryParams.subscribe((params) => {
                    const organizationId = params['organizationId']
                        ? params['organizationId']
                        : null;
                    if (organizationId) {
                        this.queryParameters.organization =
                            this.getOrganization(
                                this.organizations,
                                organizationId
                            );
                    }
                });
            });
    }
    getOrganization(nodes: any, id: any) {
        for (const node of nodes) {
            if (node.data == id) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const found = this.getOrganization(node.children, id);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    handleConcatenatePropertyValues(
        items: any[],
        propertyName1: string
    ): string {
        if (!items || items.length === 0) {
            return '';
        }
        return items
            .map((item) => item[propertyName1])
            .filter((value) => value)
            .join(', ');
    }
    handleConvertToTree(node: any): any {
        if (!node.id) {
        }
        return {
            label: node.organizationName,
            data: node.id,
            children: (node.organizationChildren || []).map((child: any) =>
                this.handleConvertToTree(child)
            ),
        };
    }

    handleMapToTreeNode(node: any): any {
        return {
            label: node.label,
            data: node.data,
            children: node.children || [],
        };
    }

    handleConvertToTreeSelect() {
        if (Array.isArray(this.organizations)) {
            this.organizations = this.organizations.map((organization) =>
                this.handleMapToTreeNode(organization)
            );
        } else {
            console.error(
                'organizations không phải là mảng',
                this.organizations
            );
        }
    }

    handleSearchSalary() {}

    getPayrollConfirmationStatusEmployee(
        status: PayrollConfirmationStatusEmployee
    ): {
        text: string;
        color: string;
        bgColor: string;
    } {
        switch (status) {
            case PayrollConfirmationStatusEmployee.NotSent:
                return {
                    text: 'Bị từ chối',
                    color: '#721c24', // màu đỏ đậm
                    bgColor: '#f8d7da', // màu đỏ nhạt
                };
            case PayrollConfirmationStatusEmployee.Confirming:
                return {
                    text: 'Chờ xác nhận',
                    color: '#856404', // màu cam nâu
                    bgColor: '#fff3cd', // màu cam nhạt
                };
            case PayrollConfirmationStatusEmployee.Rejected:
                return {
                    text: 'Đã xác nhận',
                    color: '#155724', // màu xanh lá đậm
                    bgColor: '#d4edda', // màu xanh lá nhạt
                };
            case PayrollConfirmationStatusEmployee.Confirmed:
                return {
                    text: 'Đã xác nhận',
                    color: '#155724', // màu xanh lá đậm
                    bgColor: '#d4edda', // màu xanh lá nhạt
                };
        }
    }

    // handle create

    filteredColumns = [...this.columns];

    handleOpenDialogSelectedColumns() {
        this.displayColumnsCustom = true;
    }

    handleApplyChangeSelectedColumns() {
        const selectedColumnsLeaveApplication = this.columns.filter(
            (col) => col.selected
        );
        localStorage.setItem(
            'selectedColumnsLeaveApplication',
            JSON.stringify(selectedColumnsLeaveApplication)
        );
        this.displayColumnsCustom = false;
    }

    onSearchColumn(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredColumns = this.columns.filter((col) =>
            col.header.toLowerCase().includes(query)
        );
    }
    onSearch() {
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                organizationId: this.queryParameters.organization?.data || null,
                keyWord: this.queryParameters.keyWord
                    ? this.queryParameters.keyWord.trim()
                    : null,

                name: this.queryParameters.name || null,
                sortBy: this.queryParameters.sortBy || null,
                orderBy: this.queryParameters.orderBy || null,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }

    onPageChange(event: any) {
        this.paging.pageIndex = event.page + 1;
        this.paging.pageSize = event.rows;
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                pageIndex: event.page + 1,
                pageSize: event.rows,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }

    logSalary(salary: any): void {
        this.router.navigate([
            '/payroll-employee',
            salary.id,
            this.userCurrent.employee.id,
        ]);
    }
}
