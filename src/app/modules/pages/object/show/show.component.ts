import { StaffPositionService } from './../../../../core/services/staff-position.service';
import {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
} from './../../../../core/configs/paging.config';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import pagingConfig, {
    DEFAULT_PAGE_SIZE_OPTIONS,
    DEFAULT_PER_PAGE_OPTIONS,
} from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import sortConstant from 'src/app/core/constants/sort.Constant';
import staffPositionConstant from 'src/app/core/constants/staff-position.constant';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { an, el } from '@fullcalendar/core/internal-common';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { environment } from 'src/environments/environment';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { WorkStatus } from 'src/app/core/enums/status-work.enum';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { ObjectService } from 'src/app/core/services/object.service';
import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    AbstractControl,
} from '@angular/forms';
import { AccountStatusEmployee } from 'src/app/core/enums/account-status-employee.enum';
import { Observable } from 'rxjs';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
interface Status {
    name: string;
    code: number;
}
interface City {
    name: string;
    code: string;
}
@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css'],
})
export class ShowComponent implements OnInit {
    cities: City[] | undefined;

    selectedCity: City | undefined;
    items: any;
    staffPositionVisible: boolean = false;
    status: Status[] | undefined;
    selectedLocation: Status | undefined;
    isCode: boolean = true;
    isCode1: boolean = true;
    isCode2: boolean = true;
    isCode3: boolean = true;
    isShowObject1: boolean = false;
    isShowObject2: boolean = false;
    checked: boolean = false;
    visible: boolean = false;
    visible1: boolean = false;
    listheaderTable: any[] = [];
    listheaderEmployee: any[] = [];
    data: any[] = [];
    location: any[] = [];
    dialogVisible: boolean = false;
    istwo1: boolean = true;
    istwo2: boolean = true;
    isdelete: boolean = false;
    isdeleteOne: boolean = false;
    level: any[] = [];
    selectedLevel: any;
    imageUrl: string = environment.baseApiImageUrl;
    selectedObject: any = null;
    isDialogVisible: boolean = false;
    activeTab: string = 'general';
    isHandleTool: boolean;
    optionWorkStatus: any[];
    optionAccountStatus: any[];
    listAllEmployee: any;
    listAllOrganistrucr: any[];
    listAllStaff: any[];
    selectedAccountStatus: any[];
    nodes: any[] = [];
    listAllcompany: any[] = [];
    selectedEmployeeIds: number[] = [];
    selectedEmployees: any[] = [];
    checkedEP: boolean = false;
    listEmployeeUpdate: any[];
    isParentUnitClicked: boolean;
    isParentUnitInvalid: boolean;
    selectedLocationUpdate: number;
    selectDepartmentHeads: any[];
    textSearch: string;
    getbyIDLocation: any[];
    staffTitleName: string;
    pageIndex: number = 1;
    pageSize: number = 10;
    totalItems: number = 0;
    currentPageReport: string = '';
    globalSelectedEmployeeIds: number[] = [];
    organizatioParentSelect1: number;
    organizatioParentIdObject: any[];
    organizationLeadersUpdate: any[] = [];
    listable: any[] = [];
    filteredListheaderTable = [];
    searchText: string = '';
    unitForm: FormGroup;
    position: string = '';
    employeeId: number;
    nameListEmployeeDelete: string[] = [];
    nameListEmployeeDeleteOne: string = '';
    saveUpdateEmployee: boolean = true;

    accountStatus = AccountStatus.InActive; // Trạng thái tài khoản mặc định

    employeeIDstatus: number;
    employeeName: any;
    AccountStatus: any;

    isDialogVisiblekkk: boolean = false;
    isEmailActivated = false;
    workingStatus: number;
    idoraganization: number;
    permissionConstant = PermissionConstant;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private staffPositionService: StaffPositionService,
        private confirmationService: ConfirmationService,
        private authService: AuthService,
        private toastService: ToastService,
        private organistruct: OrganiStructTypeService,
        private employeeObject: ObjectService,
        private messageService: MessageService,
        public permisionHelper: HasPermissionHelper
    ) {}
    public config: any = {
        paging: pagingConfig.default,
        baseUrl: systemConfig.baseFileSystemUrl,
        perPageOptions: DEFAULT_PER_PAGE_OPTIONS,
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    };

    public constant: any = {
        staffPosition: staffPositionConstant,
        sort: sortConstant,
    };
    //consstant

    //Banners
    public staffPositiones: any = [];

    public paging: any = {
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        sortBy: '',
        orderBy: '',
        totalRecords: 0,
        totalPages: 0,
    };

    public selectedStaffPosition: any = [];

    public queryParameters: any = {
        ...this.config.paging,
        status: 0,
        keyWord: '',
    };

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    onObjectClick(rowData: any) {
        console.log(rowData);
        this.selectedObject = rowData;
        this.isDialogVisible = true;
        this.selectedEmployee = rowData;
        this.employeeIDstatus = rowData.id;
        this.employeeName = `${rowData.lastName} ${rowData.firstName}`;
        // this.workingStatus = rowData.workingStatus;

        // Kiểm tra trạng thái accountStatus
        if (rowData.accountStatus === AccountStatus.Active) {
            // Active
            this.isEmailActivated = true;
        } else {
            // Inactive
            this.isEmailActivated = false;
        }
    }

    showDetails(rowData: any) {
        // Hiển thị chi tiết của đối tượng khi click
        this.selectedObject = rowData;
        this.isDialogVisible = true;
    }

    ngOnInit() {
        this.authService.userCurrent.subscribe((user) => {
            this.idoraganization = user.organization.id;
        });
        this.items = [{ label: 'Vị trí nhân sự' }];
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                pageIndex: params['pageIndex']
                    ? params['pageIndex']
                    : this.config.paging.pageIndex,
                pageSize: params['pageSize']
                    ? params['pageSize']
                    : this.config.paging.pageSize,
            };

            this.queryParameters = {
                ...params,
                status: params['status'] ? params['status'] : 0,
                keyWord: params['keyWord'] ? params['keyWord'] : null,
            };
        });

        this.status = [
            { name: 'Tất cả', code: 0 },
            { name: 'Chưa gửi email kích hoạt', code: 1 },
            { name: 'Chờ xác nhận email', code: 2 },
            { name: 'Đang hoạt động', code: 3 },
            { name: 'Ngừng hoạt động', code: 4 },
        ];
        this.listheaderTable = [
            { name: 'Mã nhân viên', status: true, code: 1 },
            { name: 'Họ và tên', status: true, code: 1 },
            { name: 'Đơn vị công tác', status: true, code: 1 },
            { name: 'Vị trí làm việc', status: true, code: 1 },
            { name: 'Chức danh', status: true, code: 1 },
            { name: 'Quản lý trực tiếp', status: true, code: 0 },
            { name: 'Ngày thử việc', status: true, code: 0 },
            { name: 'Ngày chính thức', status: true, code: 0 },
            { name: 'Trạng thái lao động', status: true, code: 1 },
            { name: 'Trạng thái tài khoản', status: true, code: 1 },
            { name: 'Điện thoại di động', status: true, code: 1 },
            { name: 'Điện thoại công việc', status: true, code: 1 },
            { name: 'Email cá nhân', status: true, code: 1 },
            { name: 'Email cơ quan', status: true, code: 1 },
            { name: 'Ngày sinh', status: true, code: 0 },
            { name: 'Giới tính', status: true, code: 0 },
            { name: 'Địa chỉ', status: true, code: 1 },
        ];

        this.optionAccountStatus = [
            {
                name: this.getAccountStatus(AccountStatus.NotSend).text,
                value: AccountStatus.NotSend,
            },
            {
                name: this.getAccountStatus(AccountStatus.Peding).text,
                value: AccountStatus.Peding,
            },
            {
                name: this.getAccountStatus(AccountStatus.Active).text,
                value: AccountStatus.Active,
            },
            {
                name: this.getAccountStatus(AccountStatus.InActive).text,
                value: AccountStatus.InActive,
            },
            {
                name: 'Đang làm việc',
                value: 4,
            },
            {
                name: 'Ngừng làm việc',
                value: 5,
            },
        ];
        this.optionWorkStatus = [
            {
                name: this.getWorkStatus(WorkStatus.Active).text,
                value: WorkStatus.Active,
            },
            {
                name: this.getWorkStatus(WorkStatus.Inactive).text,
                value: WorkStatus.Inactive,
            },
        ];
        this.getAllStaffPosition();
        this.getAllOrganiStruct();
        this.getEmployee();
        this.listCompany();

        this.getAllEmployee(this.pageIndex, this.pageSize);
        const storedData = localStorage.getItem('listheaderTable');
        if (storedData) {
            this.listable = JSON.parse(storedData);
        } else {
            this.listable = [...this.listheaderTable];
        }
    }

    openDialog(position: string) {
        this.position = position;

        this.filteredListheaderTable = this.listheaderTable.map((item) => {
            const storedItem = this.listable.find(
                (listableItem) => listableItem.name === item.name
            );
            return {
                ...item,
                status: storedItem ? storedItem.status : item.status,
            };
        });

        this.visible1 = true;
        this.searchText = '';
    }

    // Hàm xử lý tìm kiếm
    onSearch() {
        const search = this.searchText.trim().toLowerCase();
        if (search) {
            this.filteredListheaderTable = this.listheaderTable
                .filter((pr) => pr.name.toLowerCase().includes(search))
                .map((item) => {
                    const storedItem = this.listable.find(
                        (listableItem) => listableItem.name === item.name
                    );
                    return {
                        ...item,
                        status: storedItem ? storedItem.status : item.status,
                    };
                });
        } else {
            this.filteredListheaderTable = this.listheaderTable.map((item) => {
                const storedItem = this.listable.find(
                    (listableItem) => listableItem.name === item.name
                );
                return {
                    ...item,
                    status: storedItem ? storedItem.status : item.status,
                };
            });
        }
    }

    applyChanges() {
        this.filteredListheaderTable.forEach((filteredItem) => {
            const originalItem = this.listheaderTable.find(
                (item) => item.name === filteredItem.name
            );
            if (originalItem) {
                originalItem.status = filteredItem.status;
            }
        });
        localStorage.setItem(
            'listheaderTable',
            JSON.stringify(this.listheaderTable)
        );
        this.listable = JSON.parse(localStorage.getItem('listheaderTable'));
        this.visible1 = false;
    }

    resetDefaults() {
        this.listheaderTable = this.listheaderTable.map((item) => ({
            ...item,
            status: item.code === 1,
        }));

        this.filteredListheaderTable = [...this.listheaderTable];

        localStorage.setItem(
            'listheaderTable',
            JSON.stringify(this.listheaderTable)
        );
        this.listable = JSON.parse(localStorage.getItem('listheaderTable'));
        this.visible1 = false;
        this.getAllEmployee(this.pageIndex, this.pageSize, []);
    }

    getAllEmployee(
        pageIndex: number = this.pageIndex,
        pageSize: number = this.pageSize,
        filterData: any = null
    ) {
        const request = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            OrganizationId: this.idoraganization,
            ...filterData,
        };

        this.employeeObject.getAllEmployee(request).subscribe(
            (response) => {
                if (response && response.items) {
                    this.listAllEmployee = response.items || [];
                    // console.log(
                    //     this.listAllEmployee[0]?.managerDirect?.lastName
                    // );
                    // console.log(
                    //     this.listAllEmployee[0]?.managerDirect?.firstName
                    // );

                    this.totalItems = response.totalRecords || 0;
                    this.pageIndex = response.pageIndex;
                    this.pageSize = response.pageSize;
                    this.updatePageReport();
                } else {
                    this.listAllEmployee = [];
                    this.totalItems = 0;
                }
            },
            (error) => {
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Lỗi',
                //     detail : ' Lỗi khi lấy danh sách đơn hàng'
                // })
            }
        );
    }

    updatePageReport() {
        const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
        const endRecord = Math.min(
            startRecord + this.pageSize - 1,
            this.totalItems
        );
        this.currentPageReport = ` <b>${startRecord}</b> - <b>${endRecord}</b> trong <b>${this.totalItems}</b> bản ghi`;
    }

    onPageChange(event: any) {
        this.pageIndex = event.page + 1;
        this.pageSize = event.rows;

        const queryParams = { ...this.route.snapshot.queryParams };

        queryParams['pageIndex'] = this.pageIndex;
        queryParams['pageSize'] = this.pageSize;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            queryParamsHandling: 'merge',
        });
        this.checked = false;
        this.selectedEmployeeIds = [];
        this.selectedEmployees = [];
        this.istwo1 = true;
        this.getAllEmployee(this.pageIndex, this.pageSize, queryParams);
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
                    text: 'Email đang hoạt động',
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

    getWorkStatus(status: WorkStatus): {
        text: string;
        color: string;
        bgcolor: string;
    } {
        switch (status) {
            case WorkStatus.Active:
                return {
                    text: 'Đang làm việc',
                    color: '#155724', // Màu xanh lá đậm hơn
                    bgcolor: '#d4edda', // Màu xanh lá nhạt hơn
                };
            case WorkStatus.Inactive:
                return {
                    text: 'Ngừng làm việc',
                    color: '#494949', // Màu xám đậm hơn
                    bgcolor: '#ececec', // Màu xám nhạt hơn
                };
            default:
                return {
                    text: 'Không rõ', // Để xác định trạng thái không xác định
                    color: 'black',
                    bgcolor: 'white',
                };
        }
    }

    getSexStatus(sx: number) {
        switch (sx) {
            case 0:
                return { text: 'Nữ' };
            case 1:
                return { text: 'Nam' };
            case 2:
                return { text: 'Khác' };
            default:
                return {
                    text: '',
                };
        }
    }
    showDialog2() {
        this.dialogVisible = true;
    }
    onDialogClose() {
        this.dialogVisible = false;
        (this.staffTitleName = ''),
            (this.organizatioParentIdObject = this.nodes),
            (this.organizationLeadersUpdate = []),
            (this.selectedLocationUpdate = 0);
        this.istwo1 = true;
    }
    showDialog3() {
        this.nameListEmployeeDelete = [];
        this.selectedEmployeeIds.forEach((itemselect) => {
            this.listAllEmployee.forEach((item) => {
                if (item.id === itemselect) {
                    this.nameListEmployeeDelete.push(
                        item.lastName + item.firstName
                    );
                }
            });
        });

        this.isdelete = true;
    }

    toggleColumnVisibility(columnName: string, isVisible: boolean) {
        const column = this.listheaderTable.find(
            (col) => col.name === columnName
        );
        if (column) {
            column.status = isVisible;
        }
    }

    toggleColumnsVisibility(columns: string[], isVisible: boolean) {
        columns.forEach((columnName) =>
            this.toggleColumnVisibility(columnName, isVisible)
        );
    }

    hideColumns() {
        this.toggleColumnsVisibility(['Họ và tên', 'Email cá nhân'], false);
    }

    showColumns() {
        this.toggleColumnsVisibility(['Điện thoại di động', 'Ngày sinh'], true);
    }
    public getStaffPositions(request: any): any {
        this.staffPositionService
            .getPaging(request)
            .subscribe((result: any) => {
                if (result.status) {
                    if (
                        request.pageIndex !== 1 &&
                        result.data.items.length === 0
                    ) {
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

                    this.staffPositiones = result.data.items;
                    this.staffPositiones = this.staffPositiones.map(
                        (staffPosition: any) => ({
                            ...staffPosition,
                            status:
                                this.constant.staffPosition.status.find(
                                    (status: any) =>
                                        status.value === staffPosition.status
                                )?.label ?? '',
                        })
                    );

                    if (this.staffPositiones.length === 0) {
                        this.paging.pageIndex = 1;
                    }

                    const { items, ...paging } = result.data;
                    this.paging = paging;

                    this.selectedStaffPosition = [];
                }
            });
    }

    public selectAllStaffPositions(event: any): void {
        if (event.target.checked) {
            this.selectedStaffPosition = this.staffPositiones.map(
                (teacher: any) => teacher.id
            );
        } else {
            this.selectedStaffPosition = [];
        }
    }

    public handleOnSortAndOrderChange(orderBy: string): void {
        if (this.paging.orderBy === orderBy) {
            this.paging.sortBy =
                this.paging.sortBy === this.constant.sort.asc
                    ? this.constant.sort.desc
                    : this.constant.sort.asc;
        } else {
            this.paging.sortBy = sortConstant.desc;
        }

        this.paging = {
            orderBy: orderBy,
            sortBy: this.paging.sortBy,
        };

        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                orderBy: this.paging.orderBy,
                sortBy: this.paging.sortBy,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }

    public handleSelectItem(id: number): void {
        if (this.isSelected(id)) {
            this.selectedStaffPosition = this.selectedStaffPosition.filter(
                (id: any) => id !== id
            );
        } else {
            this.selectedStaffPosition.push(id);
        }
    }

    public isSelected(id: number): boolean {
        return this.selectedStaffPosition.includes(id);
    }

    public handleSearchStaffPosition() {
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                status: this.queryParameters.status
                    ? this.queryParameters.status
                    : null,
                keyWord: this.queryParameters.keyWord
                    ? this.queryParameters.keyWord
                    : null,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }

    onClickObject1(): void {
        this.isShowObject1 = false;
        this.isShowObject2 = true;
    }
    onClickObject2(): void {
        this.isShowObject1 = true;
        this.isShowObject2 = false;
    }
    showDialog() {
        this.visible = true;
    }

    visibleDropdowns: { [key: number]: boolean } = {}; // Lưu trạng thái hiển thị của từng dòng

    toggleDropdown(index: number) {
        // Đóng tất cả các dropdown khác
        this.visibleDropdowns = {};
        // Hiển thị dropdown tại dòng được click
        this.visibleDropdowns[index] = true;
    }
    @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;

    getStatusText(status: number): { text: string; color: string } {
        switch (status) {
            case 1:
                return { text: 'Đang làm việc', color: 'red' };
            case 2:
                return { text: 'Đã nghỉ việc', color: 'gray' };
            default:
                return { text: '', color: '' };
        }
    }
    getLevel(level: number): { text: string } {
        switch (level) {
            case 1:
                return { text: 'Giám độc ' };
            case 2:
                return { text: 'Phó giám đốc' };
            default:
                return { text: '' };
        }
    }
    getStatusAccount(level: number): { text: string } {
        switch (level) {
            case 0:
                return { text: 'Chưa gửi email kích hoạt ' };
            case 1:
                return { text: 'Chờ xác nhận email' };
            case 2:
                return { text: 'Đang hoạt động' };
            default:
                return { text: '' };
        }
    }
    applySettings() {
        // Close the dialog after applying settings
        this.visible1 = false;
    }

    showConfirmation(event: Event) {
        this.isHandleTool = true;
    }

    // /////////////////////////////////////////////// tny nguyen
    //varible
    isResendEmail = false;
    baseFEUrl = environment.baseFeUrl;

    showSendMailActive = false;

    selectedEmail: any;
    selectedEmployee: any;

    baseImageUrl = environment.baseApiImageUrl;

    isResendEmailMessage: any = '';
    //function
    handleShowResendEmail(email: any) {
        this.isResendEmail = true;
        this.selectedEmail = email.accountEmail;
        this.selectedEmployee = email;
        if (email.accountStatus == AccountStatusEmployee.Active) {
            this.isResendEmailMessage = 'Tài khoản đã kích hoạt email';
        }
    }
    handleShowSendMailActive() {
        this.showSendMailActive = true;
    }
    handleResendEmail(status: any) {
        if (status == true) {
            if (
                this.selectedEmployee.accountStatus ==
                AccountStatusEmployee.Active
            ) {
                // this.toastService.showInfo(
                //     'Thông báo',
                //     'Tài khoản đã kích hoạt email!'
                // );
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Thông báo',
                    detail: 'Tài khoản đã kích hoạt email!',
                });
                return;
            }
            if (
                this.selectedEmployee.accountStatus ==
                AccountStatusEmployee.Peding
            ) {
                const request = {
                    emails: [this.selectedEmail],
                    urlClient: this.baseFEUrl,
                };
                this.authService.resendEmailActive(request).subscribe(
                    (res) => {
                        if (res.status) {
                            // this.toastService.showSuccess(
                            //     'Thành công',
                            //     res.message
                            // );
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thông báo',
                                detail: 'Thêm đơn thành công',
                            });
                        } else {
                            // this.toastService.showError(
                            //     'Thất bại',
                            //     res.message
                            // );
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Thông báo',
                                detail: 'Thất bại',
                            });
                        }
                    },
                    (error) => {
                        // this.toastService.showError('Thất bại', 'Lỗi hệ thống');
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Thông báo',
                            detail: 'Lỗi hệ thống',
                        });
                        console.log(error?.error.Message);
                    }
                );
                this.isResendEmail = false;
                this.selectedEmail = '';
                return;
            }
            const request = {
                employeeId: this.selectedEmployee.id,
                name:
                    this.selectedEmployee.firstName +
                    this.selectedEmployee.lastName,
                email: this.selectedEmployee.accountEmail,
                phoneNumber: this.selectedEmployee.phoneNumber,
                urlClient: this.baseFEUrl,
            };
            this.authService.sendEmailActive(request).subscribe(
                (res) => {
                    if (res.status) {
                        // this.toastService.showSuccess(
                        //     'Thành công',
                        //     res.message
                        // );
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thông báo',
                            detail: 'thành công',
                        });
                        this.authService
                            .updateStatuEmployee(
                                { accountStatus: AccountStatusEmployee.Peding },
                                { id: this.selectedEmployee.id }
                            )
                            .subscribe((res) => {
                                if (res.status == true) {
                                    this.selectedEmployee.accountStatus =
                                        AccountStatusEmployee.Peding;
                                    this.listAllEmployee.find(
                                        (x) => x.id == this.selectedEmployee.id
                                    ).accountStatus =
                                        AccountStatusEmployee.Peding;
                                }
                            });
                    } else {
                        // this.toastService.showError('Thất bại', res.message);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Thông báo',
                            detail: 'thất bại',
                        });
                    }
                },
                (error) => {
                    // this.toastService.showError('Thất bại', 'Lỗi hệ thống');
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thông báo',
                        detail: 'Lỗi hệ thống',
                    });
                    console.log(error?.error.Message);
                }
            );
        }
        this.isResendEmail = false;
        this.selectedEmail = '';
    }

    handleReSendMailMultiple() {
        const sentMailActive: any = [];
        const noSentMailActive: any = [];

        this.selectedEmployees.forEach((selectedEmployee) => {
            if (
                selectedEmployee.accountStatus == AccountStatusEmployee.NotSend
            ) {
                const noSent = {
                    employeeId: selectedEmployee.id,
                    name:
                        selectedEmployee.lastName +
                        ' ' +
                        selectedEmployee.firstName,
                    email: selectedEmployee.accountEmail,
                    phoneNumber: selectedEmployee.phoneNumber,
                    urlClient: environment.baseFeUrl,
                };
                // noSentMailActive.push(selectedEmployee.accountEmail);
                noSentMailActive.push(noSent);
            }
            if (
                selectedEmployee.accountStatus == AccountStatusEmployee.Peding
            ) {
                sentMailActive.push(selectedEmployee.accountEmail);
            }
        });

        // console.log('haha', noSentMailActive)

        // console.log('haha', this.selectedEmployees)

        if (sentMailActive.length == 0 && noSentMailActive.length == 0) {
            let m = '';
            this.selectedEmployees.forEach((e) => {
                m = m + e.accountEmail + ' ,';
            });
            // this.toastService.showInfo(
            //     'Thông báo',
            //     'Vui lòng chọn tài khoản đang ở trạng thái chờ gửi email xác nhận và chưa gửi email xác nhận'
            // );
            this.messageService.add({
                severity: 'info',
                summary: 'Thông báo',
                detail: 'Vui lòng chọn tài khoản đang ở trạng thái chờ gửi email xác nhận và chưa gửi email xác nhận',
            });

            this.showSendMailActive = false;
            this.selectedEmployees = [];
            this.selectedEmployeeIds = [];
            this.istwo1 = this.selectedEmployees.length === 0;
            this.checked = false;
            this.listAllEmployee.forEach((employee) => {
                employee.checked = this.checked;
            });
            if (this.checked) {
                this.selectedEmployeeIds = this.listAllEmployee.map(
                    (employee) => employee.id
                );
                this.selectedEmployees = this.listAllEmployee;
            } else {
                this.selectedEmployeeIds = [];
                this.selectedEmployees = [];
            }
            return;
        }

        const requestResend = {
            emails: sentMailActive,
            urlClient: environment.baseFeUrl,
        };

        if (sentMailActive.length >= 1) {
            this.authService
                .resendEmailActive(requestResend)
                .subscribe((res) => {
                    if (res.status) {
                        console.log(
                            'Url resent email',
                            requestResend.urlClient
                        );
                        // this.toastService.showSuccess('Thành công', res.message);
                        if (noSentMailActive.length >= 1) {
                            this.authService
                                .sendEmailActiveMultiple(noSentMailActive)
                                .subscribe((res1) => {
                                    if (res1.status) {
                                        // this.toastService.showSuccess(
                                        //     'Thành công',
                                        //     'Gửi email thành công'
                                        // );
                                        this.messageService.add({
                                            severity: 'success',
                                            summary: 'Thông báo',
                                            detail: 'Gửi email thành công',
                                        });
                                        const ids = this.selectedEmployees
                                            .filter(
                                                (e) =>
                                                    e.accountStatus ==
                                                    AccountStatusEmployee.NotSend
                                            )
                                            .map((e) => e.id);
                                        // console.log('d',ids)
                                        this.authService
                                            .updateStatuEmployeeMultiple({
                                                ids: ids,
                                                accountStatus:
                                                    AccountStatusEmployee.Peding,
                                            })
                                            .subscribe((res3) => {
                                                if (res3.status == true) {
                                                    this.listAllEmployee.forEach(
                                                        (element) => {
                                                            if (
                                                                this.selectedEmployeeIds.includes(
                                                                    element.id
                                                                ) &&
                                                                element.accountStatus ==
                                                                    AccountStatusEmployee.NotSend
                                                            ) {
                                                                element.accountStatus =
                                                                    AccountStatusEmployee.Peding;
                                                            }
                                                        }
                                                    );
                                                    this.showSendMailActive =
                                                        false;
                                                    this.selectedEmployees = [];
                                                    this.selectedEmployeeIds =
                                                        [];
                                                    this.istwo1 =
                                                        this.selectedEmployees
                                                            .length === 0;
                                                    this.checked = false;

                                                    this.listAllEmployee.forEach(
                                                        (employee) => {
                                                            employee.checked =
                                                                this.checked;
                                                        }
                                                    );
                                                    if (this.checked) {
                                                        this.selectedEmployeeIds =
                                                            this.listAllEmployee.map(
                                                                (employee) =>
                                                                    employee.id
                                                            );
                                                        this.selectedEmployees =
                                                            this.listAllEmployee;
                                                    } else {
                                                        this.selectedEmployeeIds =
                                                            [];
                                                        this.selectedEmployees =
                                                            [];
                                                    }
                                                }
                                            });
                                    } else {
                                        // this.toastService.showWarning(
                                        //     'Cảnh báo',
                                        //     res1.message
                                        // );
                                        this.messageService.add({
                                            severity: 'warn',
                                            summary: 'Cảnh báo',
                                            detail: res1.message,
                                        });
                                    }
                                });
                        } else {
                            // this.toastService.showSuccess(
                            //     'Thành công',
                            //     'Gửi email thành công'
                            // );
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thông báo',
                                detail: 'Gửi email thành công',
                            });
                        }
                    } else {
                        // this.toastService.showWarning('Cảnh báo', res.message);
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Thông báo',
                            detail: res.message,
                        });
                    }
                });
        } else {
            if (noSentMailActive.length >= 1) {
                this.authService
                    .sendEmailActiveMultiple(noSentMailActive)
                    .subscribe((res1) => {
                        if (res1.status) {
                            // this.toastService.showSuccess(
                            //     'Thành công',
                            //     'Gửi email thành công'
                            // );
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thông báo',
                                detail: 'Gửi email thành công',
                            });
                            const ids = this.selectedEmployees
                                .filter(
                                    (e) =>
                                        e.accountStatus ==
                                        AccountStatusEmployee.NotSend
                                )
                                .map((e) => e.id);
                            this.authService
                                .updateStatuEmployeeMultiple({
                                    ids: ids,
                                    accountStatus: AccountStatusEmployee.Peding,
                                })
                                .subscribe((res3) => {
                                    if (res3.status == true) {
                                        this.listAllEmployee.forEach(
                                            (element) => {
                                                if (
                                                    this.selectedEmployeeIds.includes(
                                                        element.id
                                                    ) &&
                                                    element.accountStatus ==
                                                        AccountStatusEmployee.NotSend
                                                ) {
                                                    element.accountStatus =
                                                        AccountStatusEmployee.Peding;
                                                }
                                                // console.log(this.selectedEmployeeIds.includes(element.id) && element.accountStatus == AccountStatusEmployee.NotSend);
                                            }
                                        );
                                    }

                                    this.showSendMailActive = false;
                                    this.selectedEmployees = [];
                                    this.selectedEmployeeIds = [];
                                    this.istwo1 =
                                        this.selectedEmployees.length === 0;
                                    this.checked = false;

                                    this.listAllEmployee.forEach((employee) => {
                                        employee.checked = this.checked;
                                    });
                                    if (this.checked) {
                                        this.selectedEmployeeIds =
                                            this.listAllEmployee.map(
                                                (employee) => employee.id
                                            );
                                        this.selectedEmployees =
                                            this.listAllEmployee;
                                    } else {
                                        this.selectedEmployeeIds = [];
                                        this.selectedEmployees = [];
                                    }
                                });
                        } else {
                            // this.toastService.showWarning(
                            //     'Cảnh báo',
                            //     res1.message
                            // );
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Thông báo',
                                detail: res1.message,
                            });
                        }
                    });
            }
        }
    }

    // lấy ra tất cả vị trí
    getAllStaffPosition() {
        const resquest = {
            pageIndex: 1,
            pageSize: 10000,
        };
        this.staffPositionService.getPaging(resquest).subscribe((res) => {
            this.listAllStaff = res.data.items;
        });
    }
    // lấy ra tất cả tổ chức của cty
    getAllOrganiStruct() {
        const resquest = {
            pageIndex: 1,
            pageSize: 10000,
        };
        this.organistruct.getAllOrganiStruct(resquest).subscribe((res) => {
            this.listAllOrganistrucr = res.data.items;
        });
    }

    // lấy danh sách nhân viên

    listCompany() {
        this.organistruct
            .getOrganiStructType(this.idoraganization)
            .subscribe((res) => {
                if (res && res.data) {
                    this.listAllcompany = [this.convertToTree(res.data)];
                } else {
                    this.listAllcompany = [];
                }

                this.listCompanyToTreeSelect();
            });
    }

    convertToTree(node: any): any {
        if (!node.id) {
            console.log('Node không có id:', node);
        }
        return {
            label: node.organizationName,
            data: node.id,
            children: (node.organizationChildren || []).map((child: any) =>
                this.convertToTree(child)
            ),
        };
    }

    mapToTreeNode(node: any): any {
        return {
            label: node.label,
            data: node.data,
            children: node.children || [],
        };
    }

    listCompanyToTreeSelect() {
        if (Array.isArray(this.listAllcompany)) {
            this.nodes = this.listAllcompany.map((company) =>
                this.mapToTreeNode(company)
            );
        } else {
            // console.error(
            //     'listCompany không phải là mảng',
            //     this.listAllcompany
            // );
        }
    }

    // hàm checkbox
    onSelectAllChange(): void {
        this.selectedEmployeeIds = [];
        this.selectedEmployees = [];
        this.listAllEmployee.forEach((employee) => {
            employee.checked = this.checked;
        });
        this.istwo1 = false;

        if (this.checked) {
            this.selectedEmployeeIds = this.listAllEmployee.map(
                (employee) => employee.id
            );
            this.selectedEmployees = this.listAllEmployee.map(
                (employee) => employee
            );
            this.istwo1 = false;
        } else {
            this.selectedEmployeeIds = [];
            this.selectedEmployees = [];
            this.istwo1 = true;
        }
    }

    // Hàm xử lý khi checkbox trong bảng thay đổi
    onCheckboxChange(): void {
        this.selectedEmployeeIds = [];
        this.selectedEmployees = [];

        this.selectedEmployeeIds = this.listAllEmployee
            .filter((employee) => employee.checked)
            .map((employee) => employee.id);

        this.selectedEmployees = this.listAllEmployee
            .filter((employee) => employee.checked)
            .map((employee) => employee);

        this.checked = this.listAllEmployee.every(
            (employee) => employee.checked
        );

        this.istwo1 = this.selectedEmployeeIds.length === 0;
    }

    getEmployee() {
        const request = {
            parseInt: 1,
            pageSize: 1000000,
        };

        this.organistruct.getEmployee(request).subscribe(
            (res) => {
                if (res && res.items) {
                    this.listEmployeeUpdate = res.items.map((employee) => ({
                        ...employee,
                        name: `${employee?.lastName} ${employee?.firstName} `,
                    }));
                } else {
                    this.listEmployeeUpdate = [];
                }
            },
            (error) => {
                console.error('API Error:', error);
                this.listEmployeeUpdate = [];
            }
        );
    }
    removeSelectedHead(index: number) {
        const selectedHeads =
            this.unitForm.get('organizationLeaders').value || [];
        selectedHeads.splice(index, 1);
        this.unitForm.patchValue({ organizationLeaders: selectedHeads });
    }

    handleTreeSelectFocusOut(event: FocusEvent) {
        const target = event.relatedTarget as HTMLElement;
        const isInsideTreeSelect = target?.closest('.custom-tree-select');

        if (target && target.closest('[aria-hidden="true"]')) {
            event.preventDefault();
        }
        if (!isInsideTreeSelect) {
            this.isParentUnitClicked = true;
            this.validateParentUnit();
        }
    }
    validateParentUnit() {
        this.isParentUnitInvalid =
            !this.organizatioParentIdObject ||
            this.organizatioParentIdObject.length === 0;
    }

    onParentUnitChange(event: any) {
        this.validateParentUnit();
    }
    onParentUnitChangeSearch(event: any) {
        const selectedNode = event.value;
        this.unitForm
            .get('organizatioParentSelect')
            .setValue(selectedNode ? selectedNode.data : []);
    }

    onLeadersChange(event: any) {}

    onPositionChange(event: any) {
        const selectedPosition = event.value;
        if (!selectedPosition || !selectedPosition.id) {
            this.staffTitleName = null;
            return;
        }

        const request = { id: selectedPosition.id };

        this.staffPositionService.getById(request).subscribe(
            (res) => {
                if (res && res.data) {
                    this.staffTitleName =
                        res.data.staffTitle?.staffTitleName || null;
                }
            },
            (error) => {
                console.error('Error fetching staff title:', error);
                this.staffTitleName = null;
            }
        );
    }

    search() {
        const request: any = {};
        if (this.textSearch?.trim()) {
            request.keyWord = this.textSearch.trim();
        }
        if (
            this.selectedAccountStatus &&
            (this.selectedAccountStatus as any)?.value !== undefined &&
            (this.selectedAccountStatus as any)?.value !== null
        ) {
            if (
                (this.selectedAccountStatus as any)?.value === 4 ||
                (this.selectedAccountStatus as any)?.value === 5
            ) {
                if ((this.selectedAccountStatus as any)?.value === 4) {
                    request.WorkingStatus = 0;
                } else if ((this.selectedAccountStatus as any)?.value === 5) {
                    request.WorkingStatus = 1;
                }
            } else {
                request.AccountStatus = (
                    this.selectedAccountStatus as any
                )?.value;
            }
        }

        if (
            this.organizatioParentSelect1 &&
            (this.organizatioParentSelect1 as any)?.data
        ) {
            request.OrganizationId = (
                this.organizatioParentSelect1 as any
            )?.data;
        }

        if (this.selectedLocation && (this.selectedLocation as any)?.id) {
            request.StaffPositionId = (this.selectedLocation as any)?.id;
        }
        if (
            this.organizatioParentIdObject &&
            (this.organizatioParentIdObject as any)?.id
        ) {
            request.organizatioParentIdObject = (
                this.organizatioParentIdObject as any
            )?.id;
        }

        //   console.log(request);

        const queryParams: any = {
            pageIndex: (this.pageIndex = 1),
            pageSize: this.pageSize,
            ...request,
        };
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            // queryParamsHandling: 'merge',
        });
        this.getAllEmployee(this.pageIndex, this.pageSize, request);
    }

    async handleUpdateEmployee() {
        const organizatioParentId = (this.organizatioParentIdObject as any)
            ?.data;
        const ManagerId = this.organizationLeadersUpdate?.length
            ? this.organizationLeadersUpdate.map((item) => item.id)
            : [];
        const locationId = (this.selectedLocationUpdate as any)?.id;

        const resquest = {
            Id: locationId,
        };
        if (resquest) {
            this.staffPositionService.getById(resquest).subscribe((res) => {
                this.staffTitleName = res.data.staffTitle?.staffTitleName;
            });
        }
        let successCount = 0;
        let errorCount = 0;
        for (const item of this.selectedEmployeeIds) {
            try {
                const res = await this.employeeObject
                    .getId({ id: item })
                    .toPromise();

                const formData = new FormData();

                formData.append('EmployeeCode', res?.employeeCode || '');
                formData.append('LastName', res?.lastName || '');
                formData.append('FirstName', res?.firstName?.trim() || '');
                formData.append(
                    'DateOfBirth',
                    res.dateOfBirth
                        ? new Date(res.dateOfBirth).toISOString()
                        : ''
                );
                formData.append('AvatarUrl', res?.avatarUrl || '');
                formData.append('Address', res?.address || '');
                formData.append('PhoneNumber', res?.phoneNumber || '');
                formData.append('PersonalEmail', res?.personalEmail || '');
                formData.append('Sex', res?.sex || '');
                formData.append(
                    'OrganizationId',
                    organizatioParentId?.toString() ||
                        res.staffPositionId?.toString()
                );
                formData.append(
                    'StaffPositionId',
                    locationId?.toString() || res.staffPositionId?.toString()
                );
                formData.append(
                    'ManagerDirectId',
                    ManagerId[0]?.toString() || res?.managerDirectId
                );
                formData.append(
                    'WorkingStatus',
                    res?.workingStatus?.toString() || 0
                );
                formData.append(
                    'ProbationDate',
                    res.probationDate
                        ? new Date(res.probationDate).toISOString()
                        : ''
                );
                formData.append(
                    'OfficialDate',
                    res.officialDate
                        ? new Date(res.officialDate).toISOString()
                        : ''
                );
                formData.append('WorkPhoneNumber', res?.workPhoneNumber || '');
                formData.append('CompanyEmail', res?.companyEmail || '');
                formData.append('AccountEmail', res?.accountEmail || '');
                // formData.forEach((value, key) => {
                //     console.log(`${key}: (${typeof value})`, value);
                // });

                // Gửi FormData qua API
                await this.employeeObject
                    .updateEmployeeData(item, formData)
                    .toPromise();
                successCount++;
            } catch (error) {
                console.error('Error in updateObjectForm:', error);
                errorCount++;
            }
        }

        if (successCount === this.selectedEmployeeIds.length) {
            (this.staffTitleName = ''),
                (this.organizatioParentIdObject = this.nodes),
                (this.organizationLeadersUpdate = []),
                (this.selectedLocationUpdate = 0);
            this.istwo1 = true;
            this.getAllEmployee(this.pageIndex, this.pageSize);
            // this.toastService.showSuccess(
            //     'Cập nhật',
            //     'Cập nhật đơn vị nhân viên thành công'
            // );
            this.messageService.add({
                severity: 'success',
                summary: 'Thông báo',
                detail: 'Cập nhật đơn vị nhân viên thành công',
            });
        } else if (errorCount > 0) {
            // this.toastService.showError(
            //     'Cập nhật thất bại',
            //     `${errorCount} bản ghi đã gặp lỗi`
            // );
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Cập nhật lỗi ',
            });
        }
        this.dialogVisible = false;
    }

    hiddenDialogDelete() {
        this.selectedEmployeeIds = [];
        this.isdelete = false;
    }
    async handleDeleteEmployee() {
        let allDeleted = true;
        let errorMessage = '';
        for (const id of this.selectedEmployeeIds) {
            try {
                await this.employeeObject.deleteEmployee(id).toPromise();
            } catch (error: any) {
                allDeleted = false;
                if (!errorMessage) {
                    if (error?.error?.detail) {
                        errorMessage = error.error.detail;
                    } else if (error?.message) {
                        errorMessage = error.message;
                    } else {
                        errorMessage = 'Xóa nhân viên không thành công';
                    }
                }
            }
        }
        if (allDeleted) {
            this.selectedEmployeeIds = [];
            this.istwo1 = true;
            this.messageService.add({
                severity: 'success',
                summary: 'Thông báo',
                detail: 'Xóa nhân viên thành công',
            });

            this.getAllEmployee(this.pageIndex, this.pageSize);
            this.isdelete = false;
        } else {
            this.istwo1 = true;
            this.selectedEmployeeIds = [];
            this.isdelete = false;
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: errorMessage || 'Xóa nhân viên không thành công',
            });
        }
    }

    openDeleteDialog(id: number): void {
        this.nameListEmployeeDeleteOne = '';
        this.employeeId = id;
        this.listAllEmployee.forEach((item) => {
            if (item.id === id)
                this.nameListEmployeeDeleteOne = item.lastName + item.firstName;
        });
        this.isdeleteOne = true;
    }
    closeDeleteOneEmp() {
        this.isdeleteOne = false;
    }
    handledeleteOneEmp() {
        if (this.employeeId !== null) {
            // console.log(this.employeeId);

            this.employeeObject.deleteEmployee(this.employeeId).subscribe({
                next: () => {
                    this.isdeleteOne = false;
                    this.getAllEmployee(this.pageIndex, this.pageSize);
                    // this.toastService.showSuccess(
                    //     'Xóa',
                    //     'Xóa nhân viên thành công'
                    // );
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thông báo',
                        detail: 'Xóa nhân viên thành công',
                    });
                },
                error: (err) => {
                    console.error('Error deleting employee:', err);
                    this.isdeleteOne = false;

                    const detail =
                        err?.error?.detail ||
                        err?.message ||
                        'Xóa nhân viên không thành công';

                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Thông báo',
                        detail,
                    });
                },
            });
        }
    }
    getNameManagerIndirect(id: number): string {
        if (id) {
            const employee = this.listAllEmployee.find(
                (item) => item.id === id
            );
            return employee ? employee.lastName + ' ' + employee.firstName : '';
        } else {
            return '';
        }
    }

    // Hiển thị hộp thoại xác nhận
    showConfirmDialog() {
        this.isDialogVisiblekkk = true; // Hiển thị dialog
    }

    onAccept() {
        this.isDialogVisiblekkk = false; // Đóng dialog
        this.toggleAccountStatus(); // Thực hiện hành động kích hoạt
    }

    onReject() {
        this.isDialogVisiblekkk = false; // Đóng dialog
        console.log('Hủy kích hoạt');
    }

    toggleAccountStatus() {
        console.log('Working Status:', this.workingStatus);

        if (this.selectedObject.workingStatus === 1) {
            // Hiển thị thông báo và thoát khỏi hàm
            // this.toastService.showWarning('Cảnh báo', 'Bạn đã nghỉ việc ở công ty');
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Bạn đã nghie việc ở công ty này',
            });
            return;
        } else {
            const newStatus = this.isEmailActivated
                ? AccountStatus.InActive
                : AccountStatus.Active; // InActive = 3, Active = 2

            this.authService
                .sendAccountandDistroyAccount({
                    employeeId: this.employeeIDstatus,
                    accountStatus: newStatus,
                })
                .subscribe((response) => {
                    if (response.status === true) {
                        // Cập nhật trạng thái thành công
                        this.isDialogVisiblekkk = false;
                        this.isEmailActivated =
                            newStatus === AccountStatus.Active; // Cập nhật trạng thái
                        this.selectedObject.accountStatus = newStatus; // Cập nhật đối tượng

                        // Hiển thị thông báo thành công tùy theo trạng thái
                        if (newStatus === AccountStatus.InActive) {
                            // this.toastService.showSuccess('Thành công', 'Tài khoản đã ngừng kích hoạt');
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thông báo',
                                detail: 'Tài khoản đã ngừng kích hoạt',
                            });
                        } else {
                            // this.toastService.showSuccess('Thành công', 'Kích hoạt tài khoản thành công');
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thông báo',
                                detail: 'Kích hoạt tài khoản thành công',
                            });
                        }
                    } else {
                        // Xử lý lỗi
                        this.isDialogVisiblekkk = false;
                        //   this.toastService.showError('Thất bại', response.message);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Thông báo',
                            detail: response.message,
                        });
                    }
                });
        }
    }
}
