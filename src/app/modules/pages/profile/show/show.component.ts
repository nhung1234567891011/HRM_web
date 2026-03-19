import { StaffPositionService } from './../../../../core/services/staff-position.service';
import {
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
} from './../../../../core/configs/paging.config';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import pagingConfig, {
    DEFAULT_PAGE_SIZE_OPTIONS,
    DEFAULT_PER_PAGE_OPTIONS,
} from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import sortConstant from 'src/app/core/constants/sort.Constant';
import staffPositionConstant from 'src/app/core/constants/staff-position.constant';
import { ProfileService } from 'src/app/core/services/profile.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import profileConstant from 'src/app/core/constants/profile.constant';
import { M } from '@fullcalendar/core/internal-common';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css'],
    providers: [ConfirmationService],
})
export class ShowComponent implements OnInit, OnDestroy {
    imgUrl: string = environment.baseApiImageUrl;
    items: any;
    staffPositionVisible: boolean = false;
    profiles: any;
    data: any;
    options: any;
    classifyOptions: any;
    organizations: any;

    constructor(
        private route: ActivatedRoute,
        private toastService: ToastService,
        private router: Router,
        private staffPositionService: StaffPositionService,
        private profileService: ProfileService,
        private organiStructTypeService: OrganiStructTypeService,
        private confirmationService: ConfirmationService,
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
        profileConstant: profileConstant,
        sort: sortConstant,
    };

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

    // public selectedStaffPosition: any = [];
    public selectedProfile: any = [];

    public queryParameters: any = {
        ...this.config.paging,
        workingStatus: 0,
        keyWord: '',
        employeeId: null,
        employeeObject: null,
        organizationId: null,
        organizationObject: null,
    };

    ngOnInit() {
        this.loadOrganization();
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        this.classifyOptions = [
            {
                label: 'Giới tính',
                value: 1,
            },
            {
                label: 'Thâm niên',
                value: 2,
            },
            {
                label: 'Độ tuổi',
                value: 3,
            },
        ];
        this.data = {
            labels: [
                'Dưới 1 năm',
                'Từ 1-5 năm',
                'Từ 6-10 năm',
                'Trên 10 năm',
                'Không xác định',
            ],
            datasets: [
                {
                    data: [300, 50, 100],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--yellow-500'),
                        documentStyle.getPropertyValue('--green-500'),
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--yellow-400'),
                        documentStyle.getPropertyValue('--green-400'),
                    ],
                },
            ],
        };
        this.options = {
            cutout: '60%',
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
        };

        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ' },
        ];
    }

    getAttributeNames(data: any[]): string[] {
        if (!data || data.length === 0) {
            return [];
        }
        // Lấy thuộc tính của đối tượng đầu tiên trong mảng
        return Object.keys(data[0]);
    }

    loadOrganization() {
        this.organiStructTypeService
            .getOrganiStructType(1)
            .subscribe((items) => {
                // this.organizations = items.data;
                this.organizations = this.transformData([items.data]);
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
                        // workingStatus: params['workingStatus'] ? params['workingStatus'] : 0,
                        keyWord: params['keyWord'] ? params['keyWord'] : null,
                        workingStatus: params['workingStatus']
                            ? params['workingStatus']
                            : null,
                        employeeId: params['employeeId']
                            ? params['employeeId']
                            : null,
                        organizationId: params['organizationId']
                            ? params['organizationId']
                            : null,
                    };
                    if (this.queryParameters.organizationId) {
                        const fomartOrganizations = this.flattenTree(
                            this.organizations
                        );
                        this.queryParameters.organizationObject =
                            fomartOrganizations.find(
                                (o) =>
                                    o.id == this.queryParameters.organizationId
                            );
                    }

                    this.getProfile(request);
                });
            });
    }

    flattenTree(tree) {
        const result = [];
        function traverse(node) {
            // Thêm node hiện tại vào kết quả
            result.push({
                id: node.id,
                label: node.label,
                data: node.data,
            });

            // Nếu có children, duyệt qua từng child
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    traverse(child); // Đệ quy với child
                }
            }
        }

        // Bắt đầu từ từng root node trong cây
        for (const root of tree) {
            traverse(root);
        }

        return result;
    }

    transformData(data: any) {
        return data.map((item: any) => {
            const transformedItem = {
                id: item.id,
                label: item.organizationName,
                data: item.id,
                children: item.organizationChildren
                    ? this.transformData(item.organizationChildren)
                    : [],
            };
            return transformedItem;
        });
    }

    public getProfile(request: any): any {
        this.profileService.getPaging(request).subscribe((result: any) => {
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
            this.profiles = result.items;
            console.log(this.constant.profileConstant.genders);
            this.profiles = this.profiles.map((profile: any) => ({
                ...profile,
                sex:
                    this.constant.profileConstant.genders.find(
                        (gender: any) =>
                            gender.value.toString() === profile.sex?.toString()
                    )?.label ?? '',
            }));

            if (this.profiles.length === 0) {
                this.paging.pageIndex = 1;
            }

            const { items, ...paging } = result;
            this.paging = paging;

            this.selectedProfile = [];
        });
    }

    public selectAllStaffPositions(event: any): void {
        if (event.target.checked) {
            this.selectedProfile = this.staffPositiones.map(
                (teacher: any) => teacher.id
            );
        } else {
            this.selectedProfile = [];
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
            this.selectedProfile = this.selectedProfile.filter(
                (id: any) => id !== id
            );
        } else {
            this.selectedProfile.push(id);
        }
    }

    public isSelected(id: number): boolean {
        return this.selectedProfile.includes(id);
    }

    public handleSearchProfile() {
        const keyWord = this.queryParameters.keyWord?.trim() || null;
        const request = {
            pageIndex: this.config.paging.pageIndex,
            pageSize: this.config.paging.pageSize,
            workingStatus: this.queryParameters.workingStatus
                ? this.queryParameters.workingStatus
                : null,
            keyWord,
            employeeId: null,
            organizationId: this.queryParameters.organizationObject
                ? (this.queryParameters.organizationObject as any)?.data
                : null,
        };

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: request,
            queryParamsHandling: 'merge',
        }).then(() => {
            this.getProfile(request);
        });
    }

    public handleDeleteItem(event: any, data: any) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Bạn có chắc chắn muốn xóa hồ sơ "${
                data?.lastName + ' ' + data?.firstName
            }" ?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.staffPositionService
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
                            };
                            this.getProfile(request);
                        });
                        this.toastService.showSuccess(
                            'Thành công',
                            'Xóa hồ sơ thành công!'
                        );
                    });
            },
            reject: () => {},
        });
    }
    // public handleOnDeleteMultiple() {
    //     // const swalWithBootstrapButtons = Swal.mixin({
    //     //     customClass: {
    //     //         cancelButton: 'btn btn-danger ml-2',
    //     //         confirmButton: 'btn btn-success',
    //     //     },
    //     //     buttonsStyling: false,
    //     // });
    //     // swalWithBootstrapButtons
    //     //     .fire({
    //     //         title: `Bạn có muốn xoá các bản ghi có Id: ${this.selectedBanners.join(
    //     //             ', '
    //     //         )} không?`,
    //     //         text: 'Sau khi xoá bản sẽ không thể khôi phục dữ liệu!',
    //     //         icon: 'warning',
    //     //         showCancelButton: true,
    //     //         confirmButtonText: 'Xác nhận',
    //     //         cancelButtonText: 'Bỏ qua',
    //     //         reverseButtons: false,
    //     //     })
    //     //     .then((result) => {
    //     //         if (result.isConfirmed) {
    //     //             const request = {
    //     //                 ids: this.selectedBanners,
    //     //             };
    //     //         }
    //     //     });
    // }
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
    public handleOnDeleteMultiple(event: any) {
        const selectedIds = this.selectedProfile.map((item) => item.id);
        if (selectedIds.length > 0) {
            this.confirmationService.confirm({
                target: event.target as EventTarget,
                message: `Bạn có chắc chắn muốn xóa "${selectedIds}" ?`,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Có',
                rejectLabel: 'Không',
                accept: () => {
                    this.staffPositionService
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
                                    };
                                    this.getProfile(request);
                                });
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Thông báo',
                                    detail: 'Xóa vị trí thành công!',
                                });
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Thông báo',
                                    detail: `${result.message}`,
                                });
                            }
                        });
                },
                reject: () => {},
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thông báo',
                detail: 'Vui lòng chọn vị trí muốn xóa',
            });
        }
    }

    handleWarn(data: any): void {
        const formData = {
            userId: 0,
            isLock: true,
        };
    }

    ngOnDestroy(): void {
        // Cleanup nếu cần
    }

    exportToExcel() {
        // Tạo request với điều kiện giống như paging nhưng không có pageIndex và pageSize
        // Sử dụng giá trị hiện tại từ queryParameters và paging, không subscribe vào queryParams
        const request: any = {
            workingStatus: this.queryParameters.workingStatus
                ? this.queryParameters.workingStatus
                : null,
            keyWord: this.queryParameters.keyWord
                ? this.queryParameters.keyWord
                : null,
            employeeId: null,
            organizationId: this.queryParameters.organizationObject
                ? (this.queryParameters.organizationObject as any)?.data
                : this.queryParameters.organizationId
                ? this.queryParameters.organizationId
                : null,
        };

        // Thêm orderBy và sortBy nếu có
        if (this.paging.orderBy) {
            request.orderBy = this.paging.orderBy;
        }

        if (this.paging.sortBy) {
            request.sortBy = this.paging.sortBy;
        }

        // Gọi API để lấy tất cả profiles
        this.profileService.getAllProfiles(request).subscribe({
            next: (result: any) => {
                const profiles = result.items || result || [];
                
                // Tạo workbook và worksheet
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Danh sách hồ sơ');

                // Định nghĩa header
                const headers = [
                    'STT',
                    'Mã nhân viên',
                    'Họ và tên',
                    'Giới tính',
                    'Ngày sinh',
                    'Số điện thoại',
                    'Email công việc',
                    'Cấp bậc',
                    'Vị trí công việc',
                    'Đơn vị',
                ];

                // Thêm header row
                const headerRow = worksheet.addRow(headers);
                headerRow.font = { bold: true, size: 12 };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' },
                };
                headerRow.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                };

                // Hàm helper để map giới tính
                const getGenderLabel = (sex: any): string => {
                    if (sex === null || sex === undefined || sex === '') {
                        return 'Không rõ';
                    }
                    const sexValue = sex?.toString();
                    if (sexValue === '1') {
                        return 'Nam';
                    } else if (sexValue === '2') {
                        return 'Nữ';
                    }
                    return 'Không rõ';
                };

                // Hàm helper để lấy tên đơn vị
                const getOrganizationName = (profile: any): string => {
                    // Ưu tiên lấy từ Organization
                    if (profile?.organization?.organizationName) {
                        return profile.organization.organizationName;
                    }
                    // Nếu không có, lấy từ OrganizationLeaders (đơn vị đầu tiên)
                    if (profile?.organizationLeaders && profile.organizationLeaders.length > 0) {
                        return profile.organizationLeaders[0]?.organizationName || '';
                    }
                    return '';
                };

                // Thêm dữ liệu
                profiles.forEach((profile: any, index: number) => {
                    const row = worksheet.addRow([
                        index + 1,
                        profile?.employeeCode || '',
                        `${profile?.lastName || ''} ${profile?.firstName || ''}`.trim(),
                        getGenderLabel(profile?.sex),
                        profile?.dateOfBirth
                            ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN')
                            : '',
                        profile?.phoneNumber || '',
                        profile?.companyEmail || '',
                        profile?.staffTitle?.staffTitleName || '',
                        profile?.staffPosition?.positionName || '',
                        getOrganizationName(profile),
                    ]);

                    row.alignment = { vertical: 'middle', horizontal: 'left' };
                });

                // Định dạng cột
                worksheet.columns.forEach((column, index) => {
                    if (index === 0) {
                        // STT
                        column.width = 8;
                    } else if (index === 1) {
                        // Mã nhân viên
                        column.width = 15;
                    } else if (index === 2) {
                        // Họ và tên
                        column.width = 25;
                    } else if (index === 3) {
                        // Giới tính
                        column.width = 12;
                    } else if (index === 4) {
                        // Ngày sinh
                        column.width = 15;
                    } else if (index === 5) {
                        // Số điện thoại
                        column.width = 15;
                    } else if (index === 6) {
                        // Email công việc
                        column.width = 25;
                    } else if (index === 7) {
                        // Cấp bậc
                        column.width = 20;
                    } else if (index === 8) {
                        // Vị trí công việc
                        column.width = 20;
                    } else if (index === 9) {
                        // Đơn vị
                        column.width = 25;
                    }
                });

                // Thêm viền cho tất cả các ô
                worksheet.eachRow((row, rowNumber) => {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                });

                // Lưu file
                workbook.xlsx.writeBuffer().then((data) => {
                    const blob = new Blob([data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });
                    const fileName = `Danh_sach_ho_so_${new Date().getTime()}.xlsx`;
                    saveAs(blob, fileName);
                    this.toastService.showSuccess(
                        'Thành công',
                        'Xuất file Excel thành công!'
                    );
                });
            },
            error: (error) => {
                console.error('Error exporting Excel:', error);
                this.toastService.showError(
                    'Lỗi',
                    'Có lỗi xảy ra khi xuất file Excel!'
                );
            },
        });
    }
}
