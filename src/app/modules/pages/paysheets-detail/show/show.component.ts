import {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
} from './../../../../core/configs/paging.config';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import pagingConfig, {
    DEFAULT_PAGE_SIZE_OPTIONS,
    DEFAULT_PER_PAGE_OPTIONS,
} from 'src/app/core/configs/paging.config';

import { Location } from '@angular/common';
import systemConfig from 'src/app/core/configs/system.config';
import sortConstant from 'src/app/core/constants/sort.Constant';
import shiftConstant from 'src/app/core/constants/staff-position.constant';
import { ToastService } from 'src/app/core/services/global/toast.service';
import {
    ConfirmationService,
    ConfirmEventType,
    MessageService,
} from 'primeng/api';
import { PayrollDetailService } from 'src/app/core/services/payroll-detail.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { PayrollService } from 'src/app/core/services/payroll.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { display } from 'html2canvas/dist/types/css/property-descriptors/display';
import { UpdateCommonContainerComponent } from './../../update-personal-record/update-common-container/update-common-container.component';
import { ContractService } from 'src/app/core/services/contract.service';
import { PayrollConfirmationStatus } from 'src/app/core/enums/payroll.enum';
import { PayrollConfirmationStatusEmployee } from 'src/app/core/enums/payroll-confirmation-status-employee.enum';
import { RecoverPasswordComponent } from './../../../auth/recover-password/recover-password.component';
import { LoadingService } from './../../../../core/services/global/loading.service';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css'],
    providers: [ConfirmationService],
})
export class ShowComponent implements OnInit {
    items: any;
    shiftVisible: boolean = false;
    isRowSelectable: any;
    shiftWorks: any;
    selectedPayroll: any[] = [];
    clockWorkDialog: boolean = false;
    workConfirmDialog: boolean = false;
    workConfirmTime: any;
    id: any;
    organizations: any[] = [];
    payrollName: any;
    isPayrollLocked = false;
    displayEditPayrollDetailDialog = false;
    payrollDetailEditing: any = null;
    payrollDetailEditModel: any = {
        baseSalary: null,
        standardWorkDays: null,
        actualWorkDays: null,
        kpi: null,
        kpiPercentage: null,
        bonus: null,
        salaryRate: null,
    };
    displayColumnDialog = false;
    allColumns: Array<{ key: string; label: string }> = [
        { key: 'department', label: 'Bộ phận' },
        { key: 'contract', label: 'Hợp đồng' },
        { key: 'baseSalary', label: 'Lương cứng (cơ bản)' },
        { key: 'standardWorkDays', label: 'Ngày công chuẩn' },
        { key: 'actualWorkDays', label: 'Ngày công thực tế' },
        { key: 'receivedSalary', label: 'Lương cơ bản thực nhận' },
        { key: 'allowanceMealTravel', label: 'Phụ cấp đi lại, ăn trưa' },
        { key: 'parkingAmount', label: 'Tiền gửi xe công ty' },
        { key: 'commissionAmount', label: 'Hoa hồng' },
        { key: 'overtimeAmount', label: 'Lương tăng ca' },
        { key: 'holidayWorkAmount', label: 'Lương ngày lễ' },
        { key: 'socialInsurance', label: 'Bảo hiểm (BHXH+BHTN+BHYT)' },
        { key: 'salaryRate', label: 'Tỉ lệ hưởng lương' },
        { key: 'totalDeduction', label: 'Khấu trừ' },
        { key: 'totalAllowance', label: 'Phụ cấp (đi lại + gửi xe)' },
        { key: 'totalSalary', label: 'Tổng lương' },
        { key: 'totalReceivedSalary', label: 'Tổng lương thực nhận' },
        { key: 'status', label: 'Trạng thái' },
    ];
    /** Cột luôn hiển thị (Hoa hồng, Bảo hiểm) - không cho ẩn hẳn. */
    private readonly requiredColumnKeys = ['commissionAmount', 'socialInsurance'];
    selectedColumnKeys: string[] = [...this.allColumns.map((c) => c.key)];
    responseEmployeeVisiable: boolean = false;
    user: any;
    payRollUpdate: any;

    constructor(
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService,
        private payrollDetailService: PayrollDetailService,
        private payrollService: PayrollService,
        private messageService: MessageService,
        private organiStructTypeService: OrganiStructTypeService,
        private contractService: ContractService,
        private location: Location,
        private authService: AuthService,
        private loadingService: LoadingService
    ) {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            this.id = id;
            if (id) {
                this.isLoading = true;
                this.loadPayrollLockState();
                this.payrollDetailService
                    .fetchData({ payrollId: id })
                    .subscribe((result: any) => {
                        this.route.queryParams.subscribe((params) => {
                            const request = {
                                ...params,
                                pageIndex: this.coerceNumber(
                                    params['pageIndex'],
                                    this.config.paging.pageIndex
                                ),
                                pageSize: this.coerceNumber(
                                    params['pageSize'],
                                    this.config.paging.pageSize
                                ),

                                payrollId: this.id,
                            };
                            this.queryParameters = {
                                ...params,
                                status: params['status']
                                    ? params['status']
                                    : null,
                                name: params['name'] ? params['name'] : null,
                                payrollId: this.id,
                            };
                            if (result.status == 500) {
                                this.isLoading = false;
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Lỗi khi tính lương',
                                    detail: 'Đã có lỗi khi tính lương',
                                });
                            }
                            this.getPayrollDetails(request);
                            this.isLoading = false;
                        });
                    });
            }
        });

        this.payrollService.getById({ id: this.id }).subscribe((results) => {
            this.payrollName = results.payrollName;
            this.payRollUpdate = results;
        });

        this.authService.userCurrent.subscribe((user) => {
            this.user = user;
        });
    }

    loadPayrollLockState() {
        if (!this.id) return;
        this.payrollService
            .isPayrollLocked(Number(this.id))
            .subscribe((res: any) => {
                // API trả { isLocked: boolean }
                this.isPayrollLocked = !!res?.isLocked;
            });
    }

    public config: any = {
        paging: pagingConfig.default,
        baseUrl: systemConfig.baseFileSystemUrl,
        perPageOptions: DEFAULT_PER_PAGE_OPTIONS,
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
    };

    public constant: any = {
        shift: shiftConstant,
        sort: sortConstant,
    };
    //shift
    public payrollDetails: any = [];

    public paging: any = {
        pageIndex: DEFAULT_PAGE_INDEX,
        pageSize: DEFAULT_PAGE_SIZE,
        sortBy: '',
        orderBy: '',
        totalRecords: 0,
        totalPages: 0,
    };

    public selectedShift: any = [];

    public queryParameters: any = {
        ...this.config.paging,
        status: null,
        name: null,
    };
    payrollStatusLabel: string;
    ngOnInit() {
        this.items = [
            { label: 'Tính lương' },
            { label: 'Bảng lương', routerLink: '/payroll/salary' },
            { label: 'Chi tiết' },
        ];
        // Đảm bảo cột Hoa hồng, BHXH luôn có trong danh sách hiển thị
        const keysSet = new Set(this.selectedColumnKeys);
        this.requiredColumnKeys.forEach((k) => keysSet.add(k));
        this.selectedColumnKeys = Array.from(keysSet);
        // Lấy dữ liệu từ `state`
        this.route.queryParams.subscribe((params) => {
            console.log('params', params);
            this.payrollStatusLabel =
                params['payrollStatus'] || 'Không xác định';
        });
        this.getOrganizations();
        this.getContractType();
    }

    private coerceNumber(value: any, fallback: number) {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : fallback;
    }

    isColumnVisible(key: string) {
        return this.selectedColumnKeys.includes(key);
    }

    /** Đảm bảo Hoa hồng, BHXH luôn nằm trong cột hiển thị (gọi khi đóng dialog cột). */
    ensureRequiredColumns(): void {
        const keysSet = new Set(this.selectedColumnKeys);
        this.requiredColumnKeys.forEach((k) => keysSet.add(k));
        this.selectedColumnKeys = Array.from(keysSet);
    }
    contractTypes: any = null;
    getContractType() {
        this.contractService.getPagingAll().subscribe((result) => {
            this.contractTypes = result.items;
            console.log('this.contractTyps', this.contractTypes);
        });
        // Chuyển contractTypes thành Map để tra cứu nhanh
    }
    getContractTypeName(contractTypeId: number) {
        let contractType = this.contractTypes.find(
            (c) => c.id == contractTypeId
        );
        return contractType ? contractType.name : 'Không xác định';
    }
    public getPayrollDetails(request: any): any {
        this.payrollDetailService
            .getPaging(request)
            .subscribe((result: any) => {
                this.payrollDetails = result.items;
                console.log('this.payrollDetails', result.items);
                this.payrollDetails = this.payrollDetails.map((shift: any) => {
                    const allowance = Number(shift.allowanceMealTravel) || 0;
                    const parking = Number(shift.parkingAmount) || 0;
                    const deductionSum = (shift.deductions || []).reduce(
                        (s: number, d: any) => s + (Number(d?.value) || 0),
                        0
                    );
                    return {
                        ...shift,
                        socialInsurance: shift.socialInsurance ?? shift.bhxhAmount ?? 0,
                        totalAllowance: shift.totalAllowance ?? (allowance + parking),
                        totalDeduction: shift.totalDeduction ?? deductionSum,
                        unionFee: shift.unionFee ?? 0,
                        contractTypeName: this.getContractTypeName(
                            shift.contractTypeId
                        ),
                        statusName: this.getPayrollDetailStatusName(
                            shift.confirmationStatus
                        ),
                        totalRestTime: this.calculateRestTime(
                            shift.endTakeABreak,
                            shift.startTakeABreak
                        ),
                        payrollDetailStatusLable:
                            this.constant.shift.status.find(
                                (status: any) =>
                                    status.value?.toString() ==
                                    shift.payrollDetailStatus?.toString()
                            )?.label ?? '',
                    };
                });

                const { items, ...paging } = result;
                this.paging = paging;

                // Nếu user đang ở page vượt quá totalPages (thường xảy ra sau khi xóa),
                // thì điều hướng về trang cuối cùng thay vì luôn quay về trang 1.
                const currentPageIndex = this.coerceNumber(request?.pageIndex, 1);
                const totalPages = this.coerceNumber(this.paging?.totalPages, 1);
                if (
                    currentPageIndex > 1 &&
                    totalPages > 0 &&
                    currentPageIndex > totalPages
                ) {
                    const currentParams = this.route.snapshot.queryParams;
                    this.router.navigate([], {
                        relativeTo: this.route,
                        queryParams: {
                            ...currentParams,
                            pageIndex: totalPages,
                        },
                        queryParamsHandling: 'merge',
                    });
                    return;
                }

                this.selectedShift = [];
            });
    }
    getPayrollDetailStatusName(payrollDetailStatus: number) {
        if (payrollDetailStatus == PayrollConfirmationStatusEmployee.NotSent) {
            return 'Chưa gửi xác nhận';
        } else if (
            payrollDetailStatus == PayrollConfirmationStatusEmployee.Confirming
        ) {
            return 'Đang xác nhận';
        } else if (
            payrollDetailStatus == PayrollConfirmationStatusEmployee.Rejected
        ) {
            return 'Từ chối xác nhận';
        } else if (
            payrollDetailStatus == PayrollConfirmationStatusEmployee.Confirmed
        ) {
            return 'Đã xác nhận';
        }
        return 'Không xác định';
    }
    calculateRestTime(endTime: string, startTime: string): string {
        // Kiểm tra nếu không có giá trị startTime hoặc endTime
        if (!startTime || !endTime) {
            return '00:00:00'; // Trả về 00:00:00 nếu không có giá trị
        }

        // Tách giờ, phút, giây từ chuỗi thời gian
        const [startHours, startMinutes, startSeconds] = startTime
            .split(':')
            .map(Number);
        const [endHours, endMinutes, endSeconds] = endTime
            .split(':')
            .map(Number);

        // Kiểm tra tính hợp lệ của thời gian
        if (
            isNaN(startHours) ||
            isNaN(startMinutes) ||
            isNaN(startSeconds) ||
            isNaN(endHours) ||
            isNaN(endMinutes) ||
            isNaN(endSeconds)
        ) {
            throw new Error('Invalid time format');
        }

        // Tạo đối tượng Date với thời gian từ 00:00:00
        const start = new Date(
            1970,
            0,
            1,
            startHours,
            startMinutes,
            startSeconds
        );
        const end = new Date(1970, 0, 1, endHours, endMinutes, endSeconds);

        // Kiểm tra nếu endTime nhỏ hơn startTime (qua đêm)
        let totalRestTime = end.getTime() - start.getTime();

        if (totalRestTime < 0) {
            // Nếu thời gian kết thúc nhỏ hơn thời gian bắt đầu (qua đêm), cộng 24 giờ vào
            totalRestTime = totalRestTime + 24 * 60 * 60 * 1000; // Cộng thêm 24 giờ (1 ngày)
        }

        // Chuyển đổi tổng thời gian nghỉ từ milliseconds sang giây
        const totalRestTimeInSeconds = totalRestTime / 1000; // milliseconds to seconds

        // Tính giờ, phút và giây
        const hours = Math.floor(totalRestTimeInSeconds / 3600); // Số giờ
        const minutes = Math.floor((totalRestTimeInSeconds % 3600) / 60); // Số phút
        const seconds = Math.floor(totalRestTimeInSeconds % 60); // Số giây còn lại

        // Đảm bảo kết quả có định dạng "hh:mm:ss"
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return formattedTime;
    }

    goBack() {
        this.location.back();
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

    public handleSearchPayrollDetails() {
        // this.route.queryParams.subscribe((params) => {
        //     const request = {
        //         ...params,
        //         status: this.queryParameters.status
        //             ? this.queryParameters.status
        //             : null,
        //         name: this.queryParameters.name
        //             ? this.queryParameters.name.trim()
        //             : null,
        //     };

        //     this.router.navigate([], {
        //         relativeTo: this.route,
        //         queryParams: request,
        //         queryParamsHandling: 'merge',
        //     });
        // });

        const params = this.route.snapshot.queryParams;
        const request = {
            ...params,
            pageIndex: 1,
            organizationId: this.queryParameters.organization?.data || null,
            name: this.queryParameters.name?.trim() || null,
            sortBy: this.queryParameters.sortBy || null,
            orderBy: this.queryParameters.orderBy || null,
            payrollId: this.id,
        };

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: request,
            queryParamsHandling: 'merge',
        });
    }

    public selectAllpayrollDetails(event: any): void {
        if (event.target.checked) {
            this.selectedShift = this.payrollDetails.map(
                (teacher: any) => teacher.id
            );
        } else {
            this.selectedShift = [];
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
                payrollId: this.id,
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
            this.selectedShift = this.selectedShift.filter(
                (id: any) => id !== id
            );
        } else {
            this.selectedShift.push(id);
        }
    }

    public isSelected(id: number): boolean {
        return this.selectedShift.includes(id);
    }

    public handleSearchshift() {
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                status: this.queryParameters.status
                    ? this.queryParameters.status
                    : null,
                name: this.queryParameters.name
                    ? this.queryParameters.name
                    : null,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }

    handleOpenConfirm(): void {
        this.confirmationService.confirm({
            message:
                'Thao tác này sẽ giúp bạn khóa bảng lại để không thể sửa, xóa dữ liệu. Bạn có thể chắc chắn muốn thực hiện chức năng này không?',
            header: 'Thông báo',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Confirmed',
                    detail: 'You have accepted',
                });
            },
            reject: (type) => {},
        });
    }

    public handleDeleteItem(event: any, data: any) {
        if (this.isPayrollLocked) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Bảng lương đã khóa, không thể xóa phiếu lương.',
            });
            return;
        }
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Bạn có chắc chắn muốn xóa phiếu lương của "${data.fullName}" ?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.payrollDetailService
                    .deleteSoft({ id: data.id })
                    .subscribe((item) => {
                        this.route.queryParams.subscribe((params) => {
                            const request = {
                                ...params,
                                pageIndex: params['pageIndex']
                                    ? params['pageIndex']
                                    : this.config.paging.pageIndex,
                                pageSize: params['pageSize']
                                    ? params['pageSize']
                                    : this.config.paging.pageSize,
                                payrollId: this.id,
                            };
                            this.getPayrollDetails(request);
                        });
                        this.toastService.showSuccess(
                            'Thành công',
                            'Xóa phiếu lương thành công!'
                        );
                    });
            },
            reject: () => {},
        });

        // const swalWithBootstrapButtons = Swal.mixin({
        //     customClass: {
        //         cancelButton: 'btn btn-danger ml-2',
        //         confirmButton: 'btn btn-success',
        //     },
        //     buttonsStyling: false,
        // });
        // swalWithBootstrapButtons
        //     .fire({
        //         title: `Bạn có chắc muốn xoá banner có Id ${id}?`,
        //         text: 'Sau khi xoá bản sẽ không thể khôi phục dữ liệu!',
        //         icon: 'warning',
        //         showCancelButton: true,
        //         confirmButtonText: 'Xác nhận',
        //         cancelButtonText: 'Bỏ qua',
        //         reverseButtons: false,
        //     })
        //     .then((result) => {
        //         if (result.isConfirmed) {
        //             const request = {
        //                 id: id,
        //             };
        //         }
        //     });
    }
    navigateToEdit(id: number): void {
        this.router.navigate(['/staff-position/edit/', id]);
    }

    openEditPayrollDetail(rowData: any) {
        if (this.isPayrollLocked) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Bảng lương đã khóa, không thể sửa phiếu lương.',
            });
            return;
        }

        this.payrollDetailEditing = rowData;
        this.payrollDetailEditModel = {
            baseSalary: rowData?.baseSalary ?? null,
            standardWorkDays: rowData?.standardWorkDays ?? null,
            actualWorkDays: rowData?.actualWorkDays ?? null,
            kpi: rowData?.kpi ?? null,
            kpiPercentage: rowData?.kpiPercentage ?? null,
            bonus: rowData?.bonus ?? null,
            salaryRate: rowData?.salaryRate ?? null,
        };
        this.displayEditPayrollDetailDialog = true;
    }

    saveEditPayrollDetail() {
        if (!this.payrollDetailEditing?.id) return;

        const dataQueryParams = { id: this.payrollDetailEditing.id };
        const dataBody = {
            baseSalary: this.payrollDetailEditModel.baseSalary,
            standardWorkDays: this.payrollDetailEditModel.standardWorkDays,
            actualWorkDays: this.payrollDetailEditModel.actualWorkDays,
            kpi: this.payrollDetailEditModel.kpi,
            kpiPercentage: this.payrollDetailEditModel.kpiPercentage,
            bonus: this.payrollDetailEditModel.bonus,
            salaryRate: this.payrollDetailEditModel.salaryRate,
        };

        this.payrollDetailService
            .updateBodyAndQueryParams(dataQueryParams, dataBody)
            .subscribe((res: any) => {
                if (res?.status) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Cập nhật phiếu lương thành công',
                    });
                    this.displayEditPayrollDetailDialog = false;
                    this.payrollDetailEditing = null;
                    this.reloadData();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail:
                            res?.message || 'Cập nhật phiếu lương thất bại',
                    });
                }
            });
    }
    public handleOnDeleteMultiple(event: any) {
        const selectedIds = this.selectedShift.map((item) => item.id);
        if (selectedIds.length > 0) {
            this.confirmationService.confirm({
                target: event.target as EventTarget,
                message: `Bạn có chắc chắn muốn xóa "${selectedIds}" ?`,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Có',
                rejectLabel: 'Không',
                accept: () => {
                    this.payrollDetailService
                        .deleteRange({ ids: selectedIds })
                        .subscribe((result) => {
                            if (result) {
                                this.route.queryParams.subscribe((params) => {
                                    const request = {
                                        ...params,
                                        pageIndex: params['pageIndex']
                                            ? params['pageIndex']
                                            : this.config.paging.pageIndex,
                                        pageSize: params['pageSize']
                                            ? params['pageSize']
                                            : this.config.paging.pageSize,
                                        payrollId: this.id,
                                    };
                                    this.getPayrollDetails(request);
                                });
                                this.toastService.showSuccess(
                                    'Thành công',
                                    'Xóa vị trí thành công!'
                                );
                            } else {
                                this.toastService.showError(
                                    'Thất bại',
                                    `${result.message}`
                                );
                            }
                        });
                },
                reject: () => {},
            });
        } else {
            this.toastService.showWarning(
                'Chú ý',
                'Vui lòng chọn vị trí muốn xóa'
            );
        }

        // const swalWithBootstrapButtons = Swal.mixin({
        //     customClass: {
        //         cancelButton: 'btn btn-danger ml-2',
        //         confirmButton: 'btn btn-success',
        //     },
        //     buttonsStyling: false,
        // });
        // swalWithBootstrapButtons
        //     .fire({
        //         title: `Bạn có muốn xoá các bản ghi có Id: ${this.selectedBanners.join(
        //             ', '
        //         )} không?`,
        //         text: 'Sau khi xoá bản sẽ không thể khôi phục dữ liệu!',
        //         icon: 'warning',
        //         showCancelButton: true,
        //         confirmButtonText: 'Xác nhận',
        //         cancelButtonText: 'Bỏ qua',
        //         reverseButtons: false,
        //     })
        //     .then((result) => {
        //         if (result.isConfirmed) {
        //             const request = {
        //                 ids: this.selectedBanners,
        //             };
        //         }
        //     });
    }
    onPageChange(event: any) {
        this.paging.pageIndex = event.page + 1;
        this.paging.pageSize = event.rows;
        const params = this.route.snapshot.queryParams;
        const request = {
            ...params,
            pageIndex: event.page + 1,
            pageSize: event.rows,
            payrollId: this.id,
        };
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: request,
            queryParamsHandling: 'merge',
        });
    }

    onStatusChange(rowData: any): void {
        // Ví dụ, bạn có thể gọi API để cập nhật thông tin này trong cơ sở dữ liệu
        this.updatepayrollDetailStatus(rowData);
    }

    // Phương thức cập nhật trạng thái của vị trí
    updatepayrollDetailStatus(rowData: any): void {
        this.payrollDetailService
            .updateBodyAndQueryParamsStatus(
                { id: rowData.id },
                { payrollDetailStatus: rowData.payrollDetailStatus }
            )
            .subscribe(
                (response) => {},
                (error) => {}
            );
    }
    onSelectionChange(event: any) {
        console.log(this.selectedPayroll);
    }
    handleSendPayrollDetailConfirm(): void {
        if (!this.selectedPayroll?.length) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: 'Cần chọn ít nhất 1 phiếu lương để gửi xác nhận',
            });
            return;
        }
        if (!this.workConfirmTime) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: 'Vui lòng chọn thời hạn nhận phản hồi',
            });
            return;
        }
        const payrollDetailIds = this.selectedPayroll.map(
            (item: any) => item.id
        );
        this.payrollDetailService
            .sendPayrollDetailConfirm({
                payrollDetailIds: payrollDetailIds,
                responseDeadline: this.workConfirmTime,
            })
            .subscribe({
                next: (results: any) => {
                    if (results?.status) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: results?.message || 'Gửi bảng lương thành công',
                        });
                        this.reloadData();
                        this.workConfirmDialog = false;
                        this.workConfirmTime = null;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Lỗi',
                            detail: results?.message || 'Gửi bảng lương thất bại',
                        });
                    }
                },
                error: (err) => {
                    const msg = err?.error?.message || err?.message || 'Gửi bảng lương thất bại';
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: msg,
                    });
                },
            });
    }
    displayEditDialog = false;
    inputPayrollName: string;
    onEditName() {
        this.displayEditDialog = true;

        // this.payrollService.update(requestUpdate).subscribe((results) => {
        //     console.log("")
        // })
    }
    savePayroll() {
        let dataBody = {
            organizationId: this.payRollUpdate.organizationId,
            summaryTimesheetNameId: this.payRollUpdate.summaryTimesheetNameId,
            payrollName: this.payrollName,
            payrollStatus: this.payRollUpdate.payrollStatus,
            payrollConfirmationStatus:
                this.payRollUpdate.payrollConfirmationStatus,
        };
        let dataQueryParams = { id: this.payRollUpdate.id }; // ID truyền qua query params

        this.payrollService
            .updateBodyAndQueryParams(dataQueryParams, dataBody)
            .subscribe((results) => {
                if (results.status) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Cập nhật tên bảng lương thành công',
                    });
                    this.displayEditDialog = false;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: 'Cập nhật tên bảng lương thất bại',
                    });
                }
            });
    }
    reloadData() {
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            this.id = id;
            if (id) {
                this.payrollDetailService
                    .fetchData({ payrollId: id })
                    .subscribe((result: any) => {
                        this.route.queryParams.subscribe((params) => {
                            const request = {
                                ...params,
                                pageIndex: params['pageIndex']
                                    ? params['pageIndex']
                                    : this.config.paging.pageIndex,
                                pageSize: params['pageSize']
                                    ? params['pageSize']
                                    : this.config.paging.pageSize,
                                payrollId: this.id,
                            };
                            this.queryParameters = {
                                ...params,
                                status: params['status']
                                    ? params['status']
                                    : null,
                                name: params['name'] ? params['name'] : null,
                                payrollId: this.id,
                            };
                            this.getPayrollDetails(request);
                        });
                    });
            }
        });
    }
    isLoading = false;
    reCalculatePayroll() {
        if (this.isPayrollLocked) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Bảng lương đã khóa, không thể cập nhật phiếu lương.',
            });
            return;
        }
        this.isLoading = true;
        this.route.paramMap.subscribe((params) => {
            const id = params.get('id');
            this.id = id;
            if (id) {
                this.payrollDetailService
                    .reCalculate({ payrollId: id })
                    .subscribe((result: any) => {
                        //
                        this.route.queryParams.subscribe((params) => {
                            const request = {
                                ...params,
                                pageIndex: params['pageIndex']
                                    ? params['pageIndex']
                                    : this.config.paging.pageIndex,
                                pageSize: params['pageSize']
                                    ? params['pageSize']
                                    : this.config.paging.pageSize,
                                payrollId: this.id,
                            };
                            this.queryParameters = {
                                ...params,
                                status: params['status']
                                    ? params['status']
                                    : null,
                                name: params['name'] ? params['name'] : null,
                                payrollId: this.id,
                            };
                            if (result.status == 500) {
                                this.isLoading = false;
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Lỗi khi tính lương',
                                    detail: 'Đã có lỗi khi tính lương',
                                });
                            }
                            this.isLoading = false;
                            this.getPayrollDetails(request);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thành công',
                                detail: 'Cập nhật tính toán bảng lương thành công ',
                            });
                            this.loadPayrollLockState();
                        });
                    });
            }
        });
        this.isLoading = false;
    }

    togglePayrollLock() {
        if (!this.id) return;
        this.payrollService
            .togglePayrollStatus(Number(this.id))
            .subscribe((res: any) => {
                if (res?.status) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Cập nhật trạng thái khóa bảng lương thành công',
                    });
                    this.clockWorkDialog = false;
                    this.loadPayrollLockState();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail:
                            res?.message ||
                            'Cập nhật trạng thái khóa bảng lương thất bại',
                    });
                }
            });
    }
}
