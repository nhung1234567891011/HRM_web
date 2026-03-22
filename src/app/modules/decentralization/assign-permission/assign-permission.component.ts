import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService, SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { DialogModule } from 'primeng/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import pagingConfig, {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE_SIZE_OPTIONS,
    DEFAULT_PER_PAGE_OPTIONS,
} from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PermissionService } from 'src/app/core/services/decentralization/permission.service';
import { RoleService } from 'src/app/core/services/decentralization/role.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserService } from 'src/app/core/services/user.service';
import { AccountStatusEmployee } from 'src/app/core/enums/account-status-employee.enum';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';

@Component({
    selector: 'app-show-permission',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        CheckboxModule,
        ButtonModule,
        PaginatorModule,
        InputTextModule,
        DropdownModule,
        ToolbarModule,
        BreadcrumbModule,
        TreeSelectModule,
        DialogModule,
        FormsModule,
        AutoCompleteModule,
        UtilityModule,
        CalendarModule,
        InputTextareaModule,
        MultiSelectModule,
    ],
    providers: [DatePipe],
    templateUrl: './assign-permission.component.html',
    styleUrl: './assign-permission.component.scss',
})
export class AssignPermissionComponent implements OnInit {
    //enum
    accountStatus = AccountStatus;
    //var
    breadcrumbs: any[];
    user: any;
    employees: any[] = [];
    selectedEmployees: any[] = [];
    roles: any[] = [];
    selectedRoles: any[] = [];
    selectedRoleIds: any[] = [];
    rolesOfEmployee: any[] = [];
    selectedEmployeeId: any = 0;
    currentPageReport: string = '';
    columnSearch: string = '';
    showColumnPanel: boolean = false;
    tempColumnVisibility: Record<string, boolean> = {};
    //flag
    showAssign: boolean = false;
    //search
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
    queryParameters: any = {
        ...this.config.paging,
        organizationId: null,
        keyWord: null,
        sortBy: null,
        orderBy: null,
    };

    get pageSize(): number {
        return this.paging?.pageSize || DEFAULT_PAGE_SIZE;
    }

    get pageIndex(): number {
        return this.paging?.pageIndex || DEFAULT_PAGE_INDEX;
    }

    get totalRecords(): number {
        return this.paging?.totalRecords || 0;
    }
    constructor(
        private router: Router,
        private datePipe: DatePipe,
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private authService: AuthService,
        private messageService: MessageService,
        private roleService: RoleService,
        private userService: UserService
    ) {
        this.authService.userCurrent.subscribe((user) => {
            this.user = user;
        });
    }

    ngOnInit(): void {
        this.breadcrumbs = [
            { label: 'Quyền hạn' },
            { label: 'Gán quyền' },
        ];
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                organizationId: params['organizationId']
                    ? params['organizationId']
                    : this.user.organization.id,
                pageIndex: params['pageIndex']
                    ? params['pageIndex']
                    : this.config.paging.pageIndex,
                pageSize: params['pageSize']
                    ? params['pageSize']
                    : this.config.paging.pageSize,
                workingstatus: Workingstatus.Active,
                accountStatus: AccountStatus.Active,
            };
            this.queryParameters = {
                ...params,
                organizationId:
                    this.queryParameters.organization?.data ||
                    this.user.organization.id,
                keyWord: this.queryParameters.keyWord
                    ? this.queryParameters.keyWord.trim()
                    : null,
                sortBy: this.queryParameters.sortBy || null,
                orderBy: this.queryParameters.orderBy || null,
            };
            this.getEmployees(request);
        });
        const requestRoles = {
            pageIndex: 1,
            pageSize: 10000,
        };
        this.getRoles(requestRoles);

        this.tempColumnVisibility = this.columns.reduce((acc, col) => {
            acc[col.field] = col.selected !== false;
            return acc;
        }, {} as Record<string, boolean>);
    }

    //get data
    getEmployees(request: any) {
        this.employeeService.paging(request).subscribe((res) => {
            if (res) {
                this.employees = res.items;
                console.log('this.employees', this.employees);
                if (this.employees.length === 0) {
                    this.paging.pageIndex = 1;
                }

                const { items, ...paging } = res;
                this.paging = paging;
                this.updateCurrentPageReport();

                this.selectedEmployees = [];
            }
        });
    }
    getRoles(request: any) {
        this.roleService.paging(request).subscribe((res) => {
            if (res.status == true) {
                this.roles = res.data.items;
                if (this.roles.length === 0) {
                    this.paging.pageIndex = 1;
                }

                const { items, ...paging } = res.data;
                this.paging = paging;

                this.selectedRoles = [];
            }
        });
    }

    getRoleByEmployee(request: any) {
        this.roleService.getRoleByEmployee(request).subscribe((res) => {
            if (res.status == true) {
                this.rolesOfEmployee = res.data;
                this.selectedRoles = res.data;
                this.selectedRoleIds = res.data.map((item) => item.id);
            }
        });
    }
    //search data
    onSearch() {
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                organizationId:
                    this.queryParameters.organization?.data ||
                    this.user.organization.id,
                keyWord: this.queryParameters.keyWord
                    ? this.queryParameters.keyWord.trim()
                    : null,
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
        this.updateCurrentPageReport();
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

    onRefreshSearch() {
        this.queryParameters = {};
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                organizationId: this.user.organization.id,
                keyWord: null,
                sortBy: null,
                orderBy: null,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }

    //send data
    showAssignRoles(employeeId: any, accountStatus: any) {
        if (accountStatus != AccountStatus.Active) {
            this.messageService.add({
                severity: 'info',
                summary: 'Thông báo',
                detail: 'Nhân viên chưa kích hoạt email hoặc tài khoản ngừng hoạt động',
            });
            return;
        }
        this.showAssign = true;
        const request = {
            employeeId: employeeId,
        };
        this.getRoleByEmployee(request);
        this.selectedEmployeeId = employeeId;
    }
    handleAssignRole() {
        const request = {
            employeeId: this.selectedEmployeeId,
            roleNames: this.roles
                .filter((item) => this.selectedRoleIds.includes(item.id))
                .map((item) => item.normalizedName),
        };
        this.userService.assignRolesToEmployee(request).subscribe((res) => {
            if (res.status == true) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: res.message,
                });
                this.router.navigate(['/decentralization/assign-permission']);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: res.message,
                });
            }
            this.showAssign = false;
            this.selectedRoleIds = [];
        });
        // console.log("request",request);
    }

    //data front end
    columns = [
        { field: 'name', header: 'Tên nhân viên', selected: true },
        { field: 'position', header: 'Vị trí công việc', selected: true },
        { field: 'staffTitle', header: 'Chức vụ', selected: true },
        { field: 'phoneNumber', header: 'Số điện thoại', selected: true },
        { field: 'personalEmail', header: 'Email', selected: true },
        {
            field: 'accountStatus',
            header: 'Trạng thái tài khoản',
            selected: true,
        },
        { field: 'action', header: 'Hành động', selected: true },
    ];

    get filteredColumnOptions() {
        const keyword = this.columnSearch.trim().toLowerCase();
        if (!keyword) {
            return this.columns;
        }

        return this.columns.filter((col) =>
            col.header.toLowerCase().includes(keyword)
        );
    }

    toggleColumnPanel(): void {
        if (this.showColumnPanel) {
            this.closeColumnPanel();
            return;
        }

        this.tempColumnVisibility = this.columns.reduce((acc, col) => {
            acc[col.field] = col.selected !== false;
            return acc;
        }, {} as Record<string, boolean>);
        this.columnSearch = '';
        this.showColumnPanel = true;
    }

    closeColumnPanel(): void {
        this.showColumnPanel = false;
        this.columnSearch = '';
    }

    onTempColumnToggle(field: string): void {
        this.tempColumnVisibility[field] = !this.tempColumnVisibility[field];
    }

    isTempColumnVisible(field: string): boolean {
        return this.tempColumnVisibility[field] !== false;
    }

    selectAllColumns(): void {
        this.columns.forEach((col) => {
            this.tempColumnVisibility[col.field] = true;
        });
    }

    clearAllColumns(): void {
        this.columns.forEach((col) => {
            this.tempColumnVisibility[col.field] = false;
        });
    }

    applyColumnChanges(): void {
        this.columns = this.columns.map((col) => ({
            ...col,
            selected: this.tempColumnVisibility[col.field] !== false,
        }));
        this.showColumnPanel = false;
    }

    isColumnVisible(field: string): boolean {
        return this.columns.find((col) => col.field === field)?.selected !== false;
    }

    updateCurrentPageReport(): void {
        const totalRecords = Number(this.paging?.totalRecords || 0);
        const pageIndex = Number(this.paging?.pageIndex || 1);
        const pageSize = Number(this.paging?.pageSize || 10);

        if (totalRecords <= 0) {
            this.currentPageReport =
                '<strong>0</strong> - <strong>0</strong> trong <strong>0</strong> bản ghi';
            return;
        }

        const startRecord = (pageIndex - 1) * pageSize + 1;
        const endRecord = Math.min(pageIndex * pageSize, totalRecords);
        this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${totalRecords}</strong> bản ghi`;
    }

    getAccountStatus(status: AccountStatus): {
        text: string;
        color: string;
        bgColor: string;
    } {
        switch (status) {
            case AccountStatus.NotSend:
                return {
                    text: 'Chưa gửi email kích hoạt',
                    color: '#721c24', // màu đỏ đậm
                    bgColor: '#f8d7da', // màu đỏ nhạt
                };
            case AccountStatus.Peding:
                return {
                    text: 'Chờ xác nhận email',
                    color: '#856404', // màu cam nâu
                    bgColor: '#fff3cd', // màu cam nhạt
                };
            case AccountStatus.Active:
                return {
                    text: 'Tài khoản đã kích hoạt',
                    color: '#155724', // màu xanh lá đậm
                    bgColor: '#d4edda', // màu xanh lá nhạt
                };
            case AccountStatus.InActive:
                return {
                    text: 'Email Ngừng hoạt động',
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
}
