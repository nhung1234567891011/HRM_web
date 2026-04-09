import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffPositionService } from './../../../../core/services/staff-position.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { StaffTitleService } from 'src/app/core/services/staff-title.service';
import { GroupPositionService } from 'src/app/core/services/group-position.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit {
    items: any;
    cities!: any[];
    selectedCities!: any[];
    positionVisible: boolean = false;
    status: boolean = false;
    positionAddVisible: boolean = false;
    jobTitleVisible: boolean = false;
    id: any;

    groupPositions: any;
    staffTitles: any;
    staffPositionById: any;

    staffPositionUpdateForm: FormGroup;
    organizations: any;

    selectedPosition: any;
    selectedTitle: any;

    existingOrganizationIds: number[] = [];
    groupAddVisible: boolean = false;

    isStaffTitleEditing: number | null = null; // Thêm biến này
    isGroupPositionEditing: number | null = null; // Thêm biến này

    groupPositionsCreateForm: FormGroup;
    staffTitleCreateForm: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private groupPositionService: GroupPositionService,
        private formBuilder: FormBuilder,
        private staffTitleService: StaffTitleService,
        private organizationService: OrganizationService,
        private staffPositionService: StaffPositionService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.staffPositionUpdateForm = this.formBuilder.group({
            code: [null, Validators.required],
            locationGroup: [null],
            name: [null, Validators.required],
            organizations: [null, Validators.required],
            group: [null],
            title: [null],
            status: [null],
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
            { label: 'Chỉnh sửa' },
        ];
        this.loadOrganization();
        this.loadPositionGroups();
        this.loadStaffTitle();
        this.route.paramMap.subscribe((params) => {
            this.id = params.get('id')!;
            this.staffPositionService
                .getById({ id: this.id })
                .subscribe((results) => {
                    if (results.status) {
                        this.staffPositionById = results.data;
                        this.existingOrganizationIds =
                            this.staffPositionById.organizationPositions.map(
                                (position: any) => position.organizationId
                            );

                        this.staffPositionUpdateForm.patchValue({
                            code: this.staffPositionById.positionCode,
                            locationGroup:
                                this.staffPositionById.groupPositionId,
                            name: this.staffPositionById.positionName,
                            organizations: [],
                            group: this.staffPositionById.group,
                            title: this.staffPositionById.staffTitleId,
                            status: this.staffPositionById.staffPositionStatus,
                        });

                        this.syncSelectedOrganizations();
                    } else {
                    }
                });
        });
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

    loadOrganization(): void {
        this.organizationService.getPaging({ id: 1 }).subscribe((results) => {
            this.organizations = this.transformData([results.data]);
            this.syncSelectedOrganizations();
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

    loadPosition(): void {}

    show() {
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }

    startLoading() {
        this.loadingService.show();
    }

    onSubmit() {
        if (this.staffPositionUpdateForm.valid) {
            this.loadingService.show();
            const organizationPositions = [];
            const selectedOrganizations =
                this.staffPositionUpdateForm.value.organizations || [];

            for (const org of selectedOrganizations) {
                organizationPositions.push({
                    organizationId: org?.data ?? org?.id ?? org,
                });
            }
            const formData = {
                positionCode: this.staffPositionUpdateForm.value.code.trim(),
                positionName: this.staffPositionUpdateForm.value.name.trim(),
                groupPositionId:
                    this.staffPositionUpdateForm.value.locationGroup,
                staffTitleId: this.staffPositionUpdateForm.value.title,
                organizationPositions: organizationPositions,
                staffPositionStatus: this.staffPositionUpdateForm.value.status,
            };
            this.staffPositionService
                .updateBodyAndQueryParams({ id: this.id }, formData)
                .subscribe({
                    next: (response) => {
                        if (response.status) {
                            this.loadingService.hide();
                            this.router.navigate(['/staff-position']);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Thông báo',
                                detail: 'Cập nhật vị trí thành công!',
                            });
                        } else {
                            this.loadingService.hide();
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Thông báo',
                                detail: `${response.message}`,
                            });
                        }
                    },
                    error: (error) => {
                        this.loadingService.hide();

                        if (error.status === 400) {
                            console.error('Lỗi 400: Bad Request', error);
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Lỗi ',
                                detail:
                                    error.error?.detail ||
                                    'Yêu cầu không hợp lệ!',
                            });
                        } else {
                            console.error('Lỗi khác:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Lỗi hệ thống',
                                detail: 'Có lỗi xảy ra, vui lòng thử lại!',
                            });
                        }
                    },
                    complete: () => {
                        console.log('Cập nhật hoàn tất!');
                    },
                });
        } else {
            this.staffPositionUpdateForm.markAllAsTouched();
            this.toastService.showWarning('Chú ý', 'Vui lòng nhập thông tin!');
        }
    }

    showPositionGroupDal() {
        this.positionVisible = true;
        this.selectedPosition =
            this.staffPositionUpdateForm.value.locationGroup;
    }

    handleSelectPositionGroup() {
        if (this.selectedPosition) {
            this.staffPositionUpdateForm.patchValue({
                locationGroup: Number(this.selectedPosition),
            });
            this.positionVisible = false;
        }
    }

    showTitleDal() {
        this.jobTitleVisible = true;
        this.selectedTitle = this.staffPositionUpdateForm.value.title;
    }

    handleSelectTitle() {
        if (this.selectedTitle) {
            this.staffPositionUpdateForm.patchValue({
                title: Number(this.selectedTitle),
            });
            this.jobTitleVisible = false;
        }
    }

    onPermissionsChange(updatedPermissions: any[]) {
        // console.log("change nhe" +updatedPermissions);
        this.existingOrganizationIds = updatedPermissions;
    }

    private syncSelectedOrganizations(): void {
        if (!this.organizations?.length || !this.existingOrganizationIds?.length) {
            return;
        }

        const selectedNodes: any[] = [];
        const selectedIdSet = new Set(this.existingOrganizationIds);

        const collectSelected = (nodes: any[]) => {
            for (const node of nodes || []) {
                if (selectedIdSet.has(node.data)) {
                    selectedNodes.push(node);
                }

                if (node.children?.length) {
                    collectSelected(node.children);
                }
            }
        };

        collectSelected(this.organizations);

        this.staffPositionUpdateForm.patchValue({
            organizations: selectedNodes,
        });
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
        this.staffTitleService.delete({ id: data.id }).subscribe((result) => {
            if (result.status) {
                this.loadStaffTitle();
            } else {
            }
        });
    }

    deleteGroupPosition(data: any) {
        this.groupPositionService
            .delete({ id: data.id })
            .subscribe((result) => {
                if (result.status) {
                    this.loadPositionGroups();
                } else {
                }
            });
    }
}
