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
import { ConfirmationService } from 'primeng/api';
import { ShiftService } from 'src/app/core/services/shift.service';
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
    shiftVisible: boolean = false;
    isRowSelectable: any;
    permissionConstant = PermissionConstant;

    constructor(
        private confirmationService: ConfirmationService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService,
        private shiftService: ShiftService,
        public hasPermissionHelper: HasPermissionHelper
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
    public shifts: any = [];

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
            { label: 'Danh sách ca' },
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
            this.getshifts(request);
        });
    }

    public getshifts(request: any): any {
        this.shiftService.getPaging(request).subscribe((result: any) => {
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
            this.shifts = result.data.items;
            this.shifts = this.shifts.map((shift: any) => {
                return {
                    ...shift,
                    totalRestTime: this.calculateRestTime(
                        shift.endTakeABreak,
                        shift.startTakeABreak
                    ),
                    shiftStatusLable:
                        this.constant.shift.status.find(
                            (status: any) =>
                                status.value?.toString() ==
                                shift.shiftStatus?.toString()
                        )?.label ?? '',
                };
            });
            if (this.shifts.length === 0) {
                this.paging.pageIndex = 1;
            }

            const { items, ...paging } = result.data;
            this.paging = paging;

            this.selectedShift = [];
        });
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

    public selectAllshifts(event: any): void {
        if (event.target.checked) {
            this.selectedShift = this.shifts.map((teacher: any) => teacher.id);
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
        this.confirmationService.confirm({
            message: `Bạn có chắc chắn muốn xóa ca "${data.name}"?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.shiftService
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
                            this.getshifts(request);
                        });
                        this.toastService.showSuccess(
                            'Thành công',
                            'Xóa ca thành công!'
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
    public handleOnDeleteMultiple(event: any) {
        const selectedIds = this.selectedShift.map((item) => item.id);
        if (selectedIds.length > 0) {
            this.confirmationService.confirm({
                message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} ca đã chọn?`,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Có',
                rejectLabel: 'Không',
                accept: () => {
                    this.shiftService
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
                                    this.getshifts(request);
                                });
                                this.toastService.showSuccess(
                                    'Thành công',
                                    'Xóa ca thành công!'
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
                'Vui lòng chọn ca muốn xóa'
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
        this.updateshiftStatus(rowData);
    }

    // Phương thức cập nhật trạng thái của vị trí
    updateshiftStatus(rowData: any): void {
        this.shiftService
            .updateBodyAndQueryParamsStatus(
                { id: rowData.id },
                { shiftStatus: rowData.shiftStatus }
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
