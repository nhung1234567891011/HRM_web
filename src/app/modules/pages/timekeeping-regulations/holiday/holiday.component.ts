import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { HolidayService } from 'src/app/core/services/holiday.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';

@Component({
    selector: 'app-holiday',
    templateUrl: './holiday.component.html',
    styleUrl: './holiday.component.scss',
})
export class HolidayComponent {
    dialogVisible: boolean;
    createLcocation: FormGroup;
    mapUrl: string;
    map: any;
    marker: any;
    updateVisible: boolean;
    iframeUrl: string = '';
    listAllEmployee: any;
    pageIndex: number = 1;
    pageSize: number = 10;
    totalItems: number = 0;
    listLocation: any[] = [];
    nameorganization: string[] = [];
    deleteLocation: boolean;
    iddeleteLocation: number;
    statusDeleteLocation: boolean;
    nameLocation: string;
    createHoliday: boolean;
    updateHoliday: boolean;
    createForm: FormGroup;
    updateForm: FormGroup;
    listSelectTask: any[] = [
        { label: 'Toàn bộ công ty', value: 0 },
        { label: 'Cơ cấu tổ chức', value: 1 },
    ];
    idoraganization: number;
    idHolidayUpdate: number;
    allColumns = [
        { field: 'name', header: 'Tên ngày nghỉ' },
        { field: 'timeRange', header: 'Thời gian' },
        { field: 'applyObject', header: 'Đối tượng áp dụng' },
        { field: 'note', header: 'Ghi chú' },
        { field: 'action', header: 'Hành động' },
    ];
    selectedColumns: any[] = [...this.allColumns];
    constructor(
        private formBuilder: FormBuilder,
        private employeeObject: ObjectService,
        private route: ActivatedRoute,
        private router: Router,
        private holidayService: HolidayService,
        private organizationService: OrganiStructTypeService,
        private messageService: MessageService,
        private fb: FormBuilder,
        private authService: AuthService,
         public permisionHelper:HasPermissionHelper
    ) {
        (this.createForm = this.fb.group({
            name: [
                null,
                Validators.compose([
                    Validators.required,
                    this.noWhitespaceValidator,
                ]),
            ],
            isACompensatoryDayOff: [null],
            fromDate: [null, Validators.required],
            toDate: [null, Validators.required],
            applyObject: [0, Validators.required],
            note: [null],
        })),
            (this.updateForm = this.fb.group({
                nameUpdate: [
                    null,
                    Validators.compose([
                        Validators.required,
                        this.noWhitespaceValidator,
                    ]),
                ],
                isACompensatoryDayOffUpdate: [null],
                fromDateUpdate: [null, Validators.required],
                toDateUpdate: [null, Validators.required],
                applyObjectUpdate: [null, Validators.required],
                noteUpdate: [null],
            }));
    }
     permissionConstant=PermissionConstant
    ngOnInit() {
        this.authService.userCurrent.subscribe((user) => {
            this.idoraganization = user.organization.id;
        });
        this.getAllLocation(this.pageIndex, this.pageSize);
    }

    showDialogcreate() {
        this.dialogVisible = true;
    }
    getAllLocation(
        pageIndex: number = this.pageIndex,
        pageSize: number = this.pageSize,
        filterData: any = null
    ) {
        const request = {
            pageIndex: pageIndex,
            pageSize: pageSize,
            ...filterData,
        };

        this.holidayService.getPaging(request).subscribe(
            (response) => {
                if (response && response.items) {
                    this.listLocation = response.items || [];

                    this.totalItems = response.totalRecords || 0;
                    this.pageIndex = response.pageIndex;
                    this.pageSize = response.pageSize;
                    // this.updatePageReport();
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

        this.getAllLocation(this.pageIndex, this.pageSize, queryParams);
    }
    showDialogDeleteLocation(data: any) {
        this.nameorganization = [];
        this.iddeleteLocation = data.id;
        this.nameLocation = data.name;
        this.deleteLocation = true;
    }
    handleDeleteLocation() {
        this.holidayService
            .deleteHOliday(this.iddeleteLocation)
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Xóa thành công',
                });
                this.getAllLocation(this.pageIndex, this.pageSize);
                this.deleteLocation = false;
            });
    }
    showDialogCreate() {
        this.createHoliday = true;
    }
    closeDialogCreate() {
        this.createHoliday = false;
        this.createForm.reset();
        this.createForm.get('applyObject').setValue(0);
    }
    handleCreateHoliday() {
        let nameHoliday = '';
        const fromDate = this.convertToVietnamTimezone(
            this.createForm.get('fromDate').value
        );
        const toDate = this.convertToVietnamTimezone(
            this.createForm.get('toDate').value
        );
        this.holidayService
            .checkRepeatName(this.createForm.get('name').value)
            .subscribe((res) => {

                if (res.items.length > 0) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Thông báo',
                        detail: 'Tên ngày nghỉ lễ đã tồn tại',
                    });
                } else {
                    nameHoliday = this.createForm.get('name').value;
                    const data = {
                        organizationId: this.idoraganization,
                        name: nameHoliday,
                        isACompensatoryDayOff: this.createForm.get(
                            'isACompensatoryDayOff'
                        ).value,
                        fromDate: fromDate,
                        toDate: toDate,
                        applyObject: this.createForm.get('applyObject').value,
                        note: this.createForm.get('note').value,
                    };
                    this.holidayService.createHoliday(data).subscribe((res) => {
                        if (res) {
                            this.createForm.reset();
                            this.getAllLocation(this.pageIndex, this.pageSize);
                            this.createHoliday = false;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thành công',
                                detail: 'Tạo ngày nghỉ lễ thành công',
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Lỗi',
                                detail: 'Tạo ngày nghỉ lễ thất bại',
                            });
                        }
                    });
                }
            });
    }
    showDialogUpdate(id: number) {
        this.idHolidayUpdate = id;
        this.updateHoliday = true;
        this.holidayService.getByIdholiday(id).subscribe((res) => {
            this.updateForm.patchValue({
                nameUpdate: res?.name,
                isACompensatoryDayOffUpdate: res?.isACompensatoryDayOff,
                fromDateUpdate: new Date(res?.fromDate),
                toDateUpdate: new Date(res?.toDate),
                applyObjectUpdate: res?.applyObject,
                noteUpdate: res?.note,
            });
        });
        this.updateHoliday = true;
    }
    handleUpdateHoliday() {
        let nameHoliday = '';
        const fromDate = this.convertToVietnamTimezone(
            this.updateForm.get('fromDateUpdate').value
        );
        const toDate = this.convertToVietnamTimezone(
            this.updateForm.get('toDateUpdate').value
        );
        this.holidayService
            .checkRepeatName(this.updateForm.get('nameUpdate').value)
            .subscribe((res) => {
                if (
                    res.items?.[0]?.id != undefined &&
                    Number(res.items?.[0]?.id) != this.idHolidayUpdate
                ) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Thông báo',
                        detail: 'Tên ngày nghỉ lễ đã tồn tại',
                    });
                } else {
                    nameHoliday = this.updateForm.get('nameUpdate').value;
                    const request = {
                        name: nameHoliday,
                        isACompensatoryDayOff: this.updateForm.get(
                            'isACompensatoryDayOffUpdate'
                        ).value,
                        fromDate: fromDate,
                        toDate: toDate,
                        applyObject: this.updateForm.get('applyObjectUpdate')
                            .value,
                        note: this.updateForm.get('noteUpdate').value,
                    };
                    this.holidayService
                        .updateHoliday(this.idHolidayUpdate, request)
                        .subscribe((updateRes) => {
                            if (updateRes) {
                                this.updateForm.reset();
                                this.getAllLocation(
                                    this.pageIndex,
                                    this.pageSize
                                );
                                this.updateHoliday = false;
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Thông báo',
                                    detail: 'Cập nhật ngày nghỉ lễ thành công',
                                });
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Thông báo',
                                    detail: 'Cập nhật ngày nghỉ lễ thất bại',
                                });
                            }
                        });
                }
            });
    }

    isColVisible(field: string): boolean {
        return this.selectedColumns.some((c) => c.field === field);
    }

    onColumnToggle(event: any, col: any): void {
        if (event.checked) {
            if (!this.selectedColumns.some((c) => c.field === col.field)) {
                this.selectedColumns = this.allColumns.filter(
                    (c) =>
                        this.selectedColumns.some((s) => s.field === c.field) ||
                        c.field === col.field
                );
            }
        } else {
            this.selectedColumns = this.selectedColumns.filter(
                (c) => c.field !== col.field
            );
        }
    }

    convertToVietnamTimezone(date: string | Date): string | null {
        if (!date) return null;

        const vietnamOffset = 7 * 60;
        const utcDate = new Date(date);

        const vietnamDate = new Date(
            utcDate.getTime() + vietnamOffset * 60 * 1000
        );

        const year = vietnamDate.getFullYear();
        const month = ('0' + (vietnamDate.getMonth() + 1)).slice(-2);
        const day = ('0' + vietnamDate.getDate()).slice(-2);
        const hours = ('0' + vietnamDate.getHours()).slice(-2);
        const minutes = ('0' + vietnamDate.getMinutes()).slice(-2);
        const seconds = ('0' + vietnamDate.getSeconds()).slice(-2);

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    }

    noWhitespaceValidator(
        control: AbstractControl
    ): { [key: string]: boolean } | null {
        const value = (control.value || '').trim();
        return value === '' ? { whitespace: true } : null;
    }
}
