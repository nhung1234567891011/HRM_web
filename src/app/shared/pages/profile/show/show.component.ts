import { StaffPositionService } from './../../../../core/services/staff-position.service';
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
import systemConfig from 'src/app/core/configs/system.config';
import sortConstant from 'src/app/core/constants/sort.Constant';
import staffPositionConstant from 'src/app/core/constants/staff-position.constant';
import { ProfileService } from 'src/app/core/services/profile.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import profileConstant from 'src/app/core/constants/profile.constant';
import { ObjectService } from 'src/app/core/services/object.service';
import { M } from '@fullcalendar/core/internal-common';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css'],
    providers: [ConfirmationService],
})
export class ShowComponent implements OnInit {
    imgUrl: string = environment.baseApiImageUrl;
    items: any;
    staffPositionVisible: boolean = false;
    profiles: any;
    data: any;
    options: any;
    classifyOptions: any;
    organizations: any;
    employees: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private toastService: ToastService,
        private router: Router,
        private staffPositionService: StaffPositionService,
        private profileService: ProfileService,
        private organiStructTypeService: OrganiStructTypeService,
        private confirmationService: ConfirmationService,
        private objectService: ObjectService,
        private messageService: MessageService
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

                    if (this.queryParameters.employeeId) {
                        // if (this.employees.length == 0) {
                        //     this.objectService
                        //         .getAllEmployee()
                        //         .subscribe((results) => {
                        //             this.employees = results.items;
                        //             console.log(
                        //                 this.employees?.find(
                        //                     (o) =>
                        //                         o.id ==
                        //                         this.queryParameters.employeeId
                        //                 )
                        //             );
                        //             this.queryParameters.employeeObject =
                        //                 this.employees?.find(
                        //                     (o) =>
                        //                         o.id ==
                        //                         this.queryParameters.employeeId
                        //                 );
                        //         });
                        // } else {
                        this.queryParameters.employeeObject =
                            this.employees?.find(
                                (o) => o.id == this.queryParameters.employeeId
                            );
                        // }
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
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                workingStatus: this.queryParameters.workingStatus
                    ? this.queryParameters.workingStatus
                    : null,
                keyWord: this.queryParameters.keyWord
                    ? this.queryParameters.keyWord
                    : null,
                employeeId: this.queryParameters.employeeObject
                    ? (this.queryParameters.employeeObject as any)?.id
                    : null,
                organizationId: this.queryParameters.organizationObject
                    ? (this.queryParameters.organizationObject as any)?.data
                    : null,
            };
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
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

    filterEmployeeSuggestions(event: any): void {
        const query = event.query.toLowerCase();
        this.objectService.getAllEmployee({ name: query }).subscribe((res) => {
            this.employees = res.items.map((employee) => ({
                ...employee,
                name: `${employee?.lastName} ${employee?.firstName} `,
            }));
        });
    }

    onEmployeeSelected(event: any) {
        this.queryParameters.employeeId = event.id; // Gán lại đối tượng người dùng đầy đủ
    }
}
