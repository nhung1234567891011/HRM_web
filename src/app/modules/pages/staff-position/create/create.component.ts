import { OrganizationService } from './../../../../core/services/organization.service';
import { StaffTitleService } from './../../../../core/services/staff-title.service';
import { GroupPositionService } from './../../../../core/services/group-position.service';
import { StaffPositionService } from './../../../../core/services/staff-position.service';
import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { an } from '@fullcalendar/core/internal-common';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { noWhitespaceValidator } from 'src/app/shared/validator';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
    items: any;
    cities!: any[];
    selectedCities!: any[];
    positionVisible: boolean = false;
    jobTitleVisible: boolean = false;
    status: boolean = false;
    groupAddVisible: boolean = false;
    staffPositionCreateForm: FormGroup;

    groupPositions: any;
    selectedOrganizations: any;
    positions: any;
    organizations: any;

    selectedPosition: any;

    isGroupPositionEditing: number | null = null; // Thêm biến này
    groupPositionsCreateForm: FormGroup;

    positionAddVisible: boolean = false;
    staffTitles: any;
    selectedTitle: any;
    isStaffTitleEditing: number | null = null; // Thêm biến này
    staffTitleCreateForm: FormGroup;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder,
        private groupPositionService: GroupPositionService,
        private staffPositionService: StaffPositionService,
        private staffTitleService: StaffTitleService,
        private organizationService: OrganizationService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.staffPositionCreateForm = this.formBuilder.group({
            code: [null, [Validators.required, noWhitespaceValidator()]],
            locationGroup: [null],
            name: [null, [Validators.required, noWhitespaceValidator()]],
            organizations: [null, Validators.required],
            group: [null],
            title: [null],
        });

        this.staffPositionCreateForm
            .get('locationGroup')
            .valueChanges.subscribe((value) => {
                console.log('Selected Position ID:', value);
                this.selectedPosition = value;
            });

        this.groupPositionsCreateForm = this.formBuilder.group({
            groupPositionName: [null],
        });

        this.staffTitleCreateForm = this.formBuilder.group({
            staffTitleName: [null],
        });
    }
    ngOnInit() {
        this.items = [
            { label: 'Hệ thống' },
            { label: 'Vị trí', routerLink: '/staff-position' },
            { label: 'Thêm mới' },
        ];

        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
        ];
        this.loadOrganization();
        this.loadPositionGroups();
        this.loadStaffTitle();
    }

    loadPositionGroups(): void {
        this.groupPositionService.getAll().subscribe((results) => {
            this.groupPositions = results.data;
        });
    }
    loadStaffTitle(): void {
        this.staffTitleService.getAll().subscribe((results) => {
            this.staffTitles = results.data;
        });
    }

    show() {
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }

    startLoading() {
        this.loadingService.show();
    }

    showPositionGroupDal() {
        this.positionVisible = true;
        this.selectedPosition =
            this.staffPositionCreateForm.value.locationGroup;
    }

    handleSelectPositionGroup() {
        if (this.selectedPosition) {
            this.staffPositionCreateForm.patchValue({
                locationGroup: Number(this.selectedPosition),
            });
            this.positionVisible = false;
        }
    }

    showTitleDal() {
        this.jobTitleVisible = true;
        this.selectedTitle = this.staffPositionCreateForm.value.title;
    }

    handleSelectTitle() {
        if (this.selectedTitle) {
            this.staffPositionCreateForm.patchValue({
                title: Number(this.selectedTitle),
            });
            this.jobTitleVisible = false;
        }
    }

    loadOrganization(): void {
        this.organizationService.getPaging({ id: 1 }).subscribe((results) => {
            this.organizations = this.transformData([results.data]);
            console.log(this.organizations);
        });
    }

    transformData(data: any) {
        return data.map((item: any) => {
            const transformedItem = {
                label: item.organizationName,
                data: item.id,
                children: item.organizationChildren
                    ? this.transformData(item.organizationChildren)
                    : [],
            };
            return transformedItem;
        });
    }

    onSubmit() {
        if (this.staffPositionCreateForm.valid) {
            this.loadingService.show();
            const organizationPositions = [];
            for (const orgId of this.staffPositionCreateForm.value
                .organizations) {
                organizationPositions.push({
                    organizationId: orgId.data,
                });
            }

            const formData = {
                positionCode: this.staffPositionCreateForm.value.code.trim(),
                positionName: this.staffPositionCreateForm.value.name.trim(),
                groupPositionId:
                    this.staffPositionCreateForm.value.locationGroup,
                staffTitleId: this.staffPositionCreateForm.value.title,
                organizationPositions: organizationPositions,
            };
            this.staffPositionService.create(formData).subscribe({
                next: (response) => {
                    if (response.status) {
                        this.loadingService.hide();
                        this.router.navigate(['/staff-position']);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thông báo',
                            detail: 'Tạo vị trí thành công!',
                        });
                    } else {
                        this.loadingService.hide();
                        const detail = this.getReadableErrorMessage(response);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Thông báo',
                            detail,
                        });
                    }
                },
                error: (error: HttpErrorResponse) => {
                    this.loadingService.hide();
                    const detail = this.getReadableErrorMessage(error);

                    if (error.status === 400) {
                        this.toastService.showError('Thất bại', detail);
                        return;
                    }

                    if (error.status === 404) {
                        this.toastService.showError('Lỗi 404', detail);
                        return;
                    }

                    if (error.status === 409) {
                        this.toastService.showError('Dữ liệu bị trùng', detail);
                        return;
                    }

                    this.toastService.showError('Lỗi', detail);
                },
            });
        } else {
            this.staffPositionCreateForm.markAllAsTouched();
            this.toastService.showError(
                'Thiếu thông tin',
                'Vui lòng nhập đầy đủ các trường bắt buộc trước khi thêm mới.'
            );
        }
    }

    handleCreateStaffTitle(): void {
        if (this.staffTitleCreateForm.valid) {
            this.staffTitleService
                .create(this.staffTitleCreateForm.value)
                .subscribe((result) => {
                    if (result.status) {
                        this.loadStaffTitle();
                        this.staffTitleCreateForm.reset();
                    }
                });
        }
    }

    handleCreateGroupPosition(): void {
        if (this.groupPositionsCreateForm.valid) {
            this.groupPositionService
                .create(this.groupPositionsCreateForm.value)
                .subscribe((result) => {
                    if (result.status) {
                        this.groupPositionsCreateForm.reset();
                        this.loadPositionGroups();
                    }
                });
        }
    }

    editStaffTitle(index: number) {
        this.isStaffTitleEditing = index;
    }

    saveStaffTitleEdit(position: any) {
        this.staffTitleService
            .updateBodyAndQueryParams({ id: position.id }, position)
            .subscribe(() => {
                this.loadStaffTitle();
            });
        this.isStaffTitleEditing = null;
    }

    editGroupPosition(index: number) {
        this.isGroupPositionEditing = index;
    }
    saveGroupPositionEdit(position: any) {
        this.groupPositionService
            .updateBodyAndQueryParams({ id: position.id }, position)
            .subscribe(() => {
                this.loadPositionGroups();
            });
        this.isGroupPositionEditing = null;
    }

    deleteStaffTitle(data: any) {
        this.staffTitleService
            .deleteSoft({ id: data.id })
            .subscribe((result) => {
                if (result.status) {
                    this.loadStaffTitle();
                } else {
                }
            });
    }

    deleteGroupPosition(data: any) {
        console.log(data);
        this.groupPositionService
            .deleteSoft({ id: data.id })
            .subscribe((result) => {
                if (result.status) {
                    this.loadPositionGroups();
                } else {
                }
            });
    }

    handleCancelStaffTitle() {
        //  groupAddVisible: boolean = false;
        if (this.positionAddVisible) {
            this.positionAddVisible = false;
        } else {
            this.jobTitleVisible = false;
        }
    }

    handleCancelGroupPosition() {
        //  groupAddVisible: boolean = false;
        if (this.groupAddVisible) {
            this.groupAddVisible = false;
        } else {
            this.positionVisible = false;
        }
    }

    private getReadableErrorMessage(source: any): string {
        const payload = source?.error ?? source;

        const messages: string[] = [];

        if (payload?.message && typeof payload.message === 'string') {
            messages.push(payload.message.trim());
        }

        if (payload?.detail && typeof payload.detail === 'string') {
            messages.push(payload.detail.trim());
        }

        const errors = payload?.errors;

        if (Array.isArray(errors)) {
            for (const item of errors) {
                if (typeof item === 'string' && item.trim()) {
                    messages.push(item.trim());
                    continue;
                }

                if (item?.errorMessage && typeof item.errorMessage === 'string') {
                    messages.push(item.errorMessage.trim());
                }
            }
        } else if (errors && typeof errors === 'object') {
            Object.values(errors).forEach((value) => {
                if (Array.isArray(value)) {
                    value.forEach((msg) => {
                        if (typeof msg === 'string' && msg.trim()) {
                            messages.push(msg.trim());
                        }
                    });
                } else if (typeof value === 'string' && value.trim()) {
                    messages.push(value.trim());
                }
            });
        }

        const uniqueMessages = [...new Set(messages.filter(Boolean))];

        if (uniqueMessages.length > 0) {
            return uniqueMessages.join(' | ');
        }

        if (source?.status === 0) {
            return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
        }

        return 'Thêm vị trí thất bại. Vui lòng kiểm tra lại dữ liệu và thử lại.';
    }
}
