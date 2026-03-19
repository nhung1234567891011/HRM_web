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
import shiftConstant from 'src/app/core/constants/staff-position.constant';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ShiftWorkService } from 'src/app/core/services/shift-work.service';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';

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
    permissionConstant = PermissionConstant;

    constructor(
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService,
        private shiftWorkService: ShiftWorkService,
        public hasPermissionHelper: HasPermissionHelper,
        private messageService: MessageService
    ) {}
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
    public shiftWorks: any = [];

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

    ngOnInit() {
        this.items = [
            { label: 'Ca làm việc' },
            { label: 'Phân ca' },
        ];
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
                status: params['status'] ? params['status'] : null,
                name: params['name'] ? params['name'] : null,
            };
            this.getshiftWorks(request);
        });
    }
    public getshiftWorks(request: any): any {
        this.shiftWorkService.getPaging(request).subscribe((result: any) => {
            if (request.pageIndex !== 1 && result.data.items.length === 0) {
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
            this.shiftWorks = result.data.items;

            this.shiftWorks = this.shiftWorks.map((shift: any) => ({
                ...shift,
                shiftWorkStatusLable:
                    this.constant.shift.status.find(
                        (status: any) =>
                            status.value?.toString() ==
                            shift.shiftWorkStatus?.toString()
                    )?.label ?? '',
            }));

            console.log(this.shiftWorks);
            if (this.shiftWorks.length === 0) {
                this.paging.pageIndex = 1;
            }

            const { items, ...paging } = result.data;
            this.paging = paging;

            this.selectedShift = [];
        });
    }
    public handleSearchStaffPostion() {
        this.route.queryParams.subscribe((params) => {
            const request = {
                ...params,
                status: this.queryParameters.status
                    ? this.queryParameters.status
                    : null,
                name: this.queryParameters.name
                    ? this.queryParameters.name.trim()
                    : null,
            };

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: request,
                queryParamsHandling: 'merge',
            });
        });
    }
    public selectAllshiftWorks(event: any): void {
        if (event.target.checked) {
            this.selectedShift = this.shiftWorks.map(
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
    public handleDeleteItem(event: any, data: any) {
        console.log(data);
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: `Bạn có chắc chắn muốn xóa "${data?.shiftTableName}" ?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.shiftWorkService
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
                            this.getshiftWorks(request);
                        });

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thông báo',
                            detail: 'Xóa phân ca thành công',
                        });
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
                    this.shiftWorkService
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
                                    this.getshiftWorks(request);
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
    onStatusChange(rowData: any): void {
        // Thực hiện các hành động cần thiết khi trạng thái thay đổi
        console.log('Updated row data:', rowData);

        // Ví dụ, bạn có thể gọi API để cập nhật thông tin này trong cơ sở dữ liệu
        this.updateshiftWorkStatus(rowData);
    }
    // Phương thức cập nhật trạng thái của vị trí
    updateshiftWorkStatus(rowData: any): void {
        this.shiftWorkService
            .updateBodyAndQueryParamsStatus(
                { id: rowData.id },
                { shiftWorkStatus: rowData.shiftWorkStatus }
            )
            .subscribe(
                (response) => {
                    console.log('Cập nhật trạng thái thành công', response);
                },
                (error) => {
                    console.error('Cập nhật trạng thái thất bại', error);
                }
            );
    }
}
