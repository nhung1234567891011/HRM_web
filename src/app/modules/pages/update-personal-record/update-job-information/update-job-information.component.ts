import { ActivatedRoute, Router } from '@angular/router';
// import { Component, OnInit } from '@angular/core';
// import { LoadingService } from 'src/app/core/services/global/loading.service';
// import { ToastService } from 'src/app/core/services/global/toast.service';

// @Component({
//     selector: 'app-update-job-information',
//     templateUrl: './update-job-information.component.html',
//     styleUrl: './update-job-information.component.scss',
// })
// export class UpdateJobInformationComponent {
//     items: any;
//     selectedCities!: any[];
//     positionVisible: boolean = false;
//     status: boolean = false;
//     positionAddVisible: boolean = false;
//     jobTitleVisible: boolean = false;
//     date: any;
//     checked: boolean = false;
//     cities: any[] | undefined;

//     selectedCity: any | undefined;
//     allowances: any;

//     //Dialog
//     allowanceVisible: boolean = false;
//     constructor(
//         private toastService: ToastService,
//         private loadingService: LoadingService
//     ) {}
//     ngOnInit() {
//         this.items = [
//             { label: 'Danh sách hồ sơ', routeLink: '/profile' },
//             { label: 'Thêm mới hồ sơ' },
//         ];
//         this.cities = [
//             { name: 'New York', code: 'NY' },
//             { name: 'Rome', code: 'RM' },
//             { name: 'London', code: 'LDN' },
//             { name: 'Istanbul', code: 'IST' },
//             { name: 'Paris', code: 'PRS' },
//         ];
//         this.loadPositionGroups();
//         this.loadPosition();
//         this.loadUnit();
//     }

//     loadPositionGroups(): void {}
//     loadPosition(): void {}
//     loadUnit(): void {}

//     show() {
//         console.log(1);
//         this.toastService.showSuccess('Thành công', 'Thêm mới th');
//     }

//     startLoading() {
//         this.loadingService.show();
//     }
// }

import { UserCurrent } from './../../../../core/models/identity/user-current.interface';
import { DeductionService } from './../../../../core/services/deduction.service';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-job-information',
//   templateUrl: './job-information.component.html',
//   styleUrl: './job-information.component.scss'
// })
// export class JobInformationComponent {

// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jobInfoConstant from 'src/app/core/constants/job-infomation.constant';
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { LaborService } from 'src/app/core/services/labor.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-update-job-information',
    templateUrl: './update-job-information.component.html',
    styleUrl: './update-job-information.component.scss',
})
export class UpdateJobInformationComponent {
    items: any;
    selectedCities!: any[];
    positionVisible: boolean = false;
    status: boolean = false;
    positionAddVisible: boolean = false;
    jobTitleVisible: boolean = false;
    date: any;
    checked: boolean = false;
    cities: any[] | undefined;

    selectedCity: any | undefined;
    allowances: any;
    hideQuitJobFields: boolean = false; // Trạng thái ẩn/hiện của các trường

    //Contract
    contractTypes: any;
    totalAmountDeductions: any;
    //Dialog
    allowanceVisible: boolean = false;
    deductionsVisible: boolean = false;

    contractTypeVisible: boolean = false;
    selectedContructType: any;
    isContractTypeEditing: number | null = null; // Thêm biến này
    contractTypeCreateForm: FormGroup;
    contractTypeAddVisible: boolean | null = null;

    labores: any;
    laborVisible: boolean = false;
    selectedLabor: any;
    isLaborEditing: number | null = null; // Thêm biến này
    laborCreateForm: FormGroup;
    laborAddVisible: boolean | null = null;

    createAllowanceForm: FormGroup;

    createJobInfo: FormGroup;
    totalAmount: number = 0;
    allowanceAccount: any;
    allowanceStandard: any;
    allowanceValue: any;

    deductions: any;

    createDeductionForm: FormGroup;
    userCurrent: any;
    profileById: any;
    employees: any;

    id: any;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private contractService: ContractService,
        private formBuilder: FormBuilder,
        private allowanceService: AllowanceService,
        private laborService: LaborService,
        private deductionService: DeductionService,
        private authService: AuthService,
        private profileService: ProfileService,
        private objectService: ObjectService,
        private router: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.contractTypeCreateForm = this.formBuilder.group({
            name: [null],
        });

        this.createAllowanceForm = this.formBuilder.group({
            contractId: [null],
            allowNameId: [null],
            allowanceName: [null],
            standardTypeId: [null],
            standardType: [null],
            standardValue: [null],
            typeValueId: [null],
            typeValue: [null],
            value: [null],
            note: [null],
        });

        this.createDeductionForm = this.formBuilder.group({
            deducationId: [null],
            deducationName: [null, [Validators.required]],
            standardType: [null],
            standardValue: 0,
            standardId: [null],
            typeValue: [null],
            value: 0,
            valueId: [null],
            note: [null],
            employeeId: 0,
        });

        this.createJobInfo = this.formBuilder.group({
            //THông tin công việc
            employeeId: [null],
            organizationId: [null],
            staffPositionId: [null],
            staffTitleId: [null],
            timeKeepingId: [null],
            workingStatus: [null, Validators.required],
            natureOfLaborId: [null],
            natureOfLaborName: [null],
            workingArea: [null],
            workingLocation: [null],
            contractTypeId: [null],
            internshipStartDate: [null],
            probationStartDate: [null],
            officialStartDate: [null],
            seniority: [null],
            retiredDate: [null],
            level: [{ value: null, disabled: true }],
            bac: [{ value: null, disabled: true }],

            //Thông tin nghỉ việc
            reasonGroupQuitJob: [null],
            reasonQuitJob: [null],
            quitJobDate: [null],
            opinionContribute: [null],

            //THông tin lương
            salaryLevel: [null],
            basicSalary: [null],
            insuranceSalary: [null],
            totalSalary: [null],
            bankAccountNumber: [null, Validators.pattern('^[0-9]*$')], // Validate số tài khoản
            bankName: [null],

            reviewer: [null],

            employeeApproveId: [null],
        });

        this.laborCreateForm = this.formBuilder.group({
            name: [null],
        });

        this.loadLabor();
    }

    public constant: any = {
        jobInfo: jobInfoConstant,
    };

    ngOnInit() {
        this.id = +this.router.snapshot.paramMap.get('id')!;

        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
            this.profileService
                .getProfileByCustomerId({ id: this.id })
                .subscribe((response) => {
                    this.allowances = response?.contracts[0]?.allowances;
                    this.profileById = response?.jobInfo;
                    // console.log(
                    //     this.profileById?.reasonGroupQuitJob.toString()
                    // );
                    this.createJobInfo = this.formBuilder.group({
                        employeeId: [this.id || null],
                        organizationId: [
                            {
                                value:
                                    response?.organizationLeaders[0]
                                        ?.organizationName || null,
                                disabled: true,
                            },
                        ],
                        staffPositionId: [
                            {
                                value:
                                    response?.staffPosition?.positionName ||
                                    null,
                                disabled: true,
                            },
                        ],
                        staffTitleId: [
                            {
                                value:
                                    response?.staffTitle?.staffTitleName ||
                                    null,
                                disabled: true,
                            },
                        ],
                        timeKeepingId: [
                            this.profileById?.timeKeepingId || null,
                        ],
                        workingStatus: [
                            this.profileById?.workingStatus.toString() || '1',
                        ], // Bắt buộc chọn trạng thái làm việc
                        natureOfLaborId: [
                            this.profileById?.natureOfLaborId || null,
                        ],
                        natureOfLaborName: [
                            this.profileById?.natureOfLaborName || null,
                        ],
                        workingArea: [this.profileById?.workingArea || null],
                        workingLocation: [
                            this.profileById?.workingLocation || null,
                        ],
                        contractTypeId: [
                            this.profileById?.contractTypeId || null,
                        ],
                        internshipStartDate: [
                            new Date(this.profileById?.internshipStartDate) ||
                                null,
                        ],
                        probationStartDate: [
                            new Date(this.profileById?.probationStartDate) ||
                                null,
                        ],
                        officialStartDate: [
                            new Date(this.profileById?.officialStartDate) ||
                                null,
                        ],
                        seniority: [this.profileById?.seniority || null],
                        retiredDate: [
                            new Date(this.profileById?.retiredDate) || null,
                        ],
                        level: [
                            {
                                value: this.profileById?.level || null,
                                disabled: true,
                            },
                        ],
                        bac: [
                            {
                                value: this.profileById?.bac || null,
                                disabled: true,
                            },
                        ],

                        // Thông tin nghỉ việc
                        reasonGroupQuitJob: [
                            this.profileById?.reasonGroupQuitJob?.toString() ||
                                null,
                        ],
                        reasonQuitJob: [
                            this.profileById?.reasonQuitJob || null,
                        ],
                        quitJobDate: [
                            new Date(this.profileById?.quitJobDate) || null,
                        ],
                        opinionContribute: [
                            this.profileById?.opinionContribute || null,
                        ],

                        // Thông tin lương
                        salaryLevel: [this.profileById?.salaryLevel || null],
                        basicSalary: [this.profileById?.basicSalary || null],
                        insuranceSalary: [
                            this.profileById?.insuranceSalary || null,
                        ],
                        totalSalary: [this.profileById?.totalSalary || null],
                        bankAccountNumber: [
                            this.profileById?.bankAccountNumber || null,
                            Validators.pattern('^[0-9]*$'), // Validate chỉ cho phép số
                        ],
                        bankName: [this.profileById?.bankName || null],
                        employeeApproveId: [
                            {
                                value:
                                    this.profileById?.employeeApproveId || null,
                                disabled: true,
                            },
                        ],
                        reviewer: [this.profileById?.reviewer || null],
                    });

                    this.createJobInfo
                        .get('workingStatus')
                        ?.valueChanges.subscribe((value) => {
                            console.log(value);
                            if (value == 1) {
                                console.log(3);
                                this.hideQuitJobFields = true; // Ẩn các trường
                                this.clearQuitJobFields(); // Clear dữ liệu và disable các trường
                            } else {
                                this.hideQuitJobFields = false; // Hiện các trường
                                this.enableQuitJobFields(); // Kích hoạt các trường
                            }
                        });
                });
        });
        this.allowanceAccount = [
            {
                label: 'Khen thưởng nhân viên',
                value: '1',
            },
        ];
        this.allowanceStandard = [
            {
                label: 'Số tiền cố định',
                value: '1',
            },
        ];
        this.allowanceValue = [
            {
                label: 'Số tiền cố định',
                value: '1',
            },
        ];
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Chỉnh sửa' },
        ];
        this.loadContractType();
        // this.loadAllowance();
        this.loadDeductions();
        this.loadEmployee();
    }
    enableQuitJobFields() {
        this.createJobInfo.get('reasonGroupQuitJob')?.enable();
        this.createJobInfo.get('reasonQuitJob')?.enable();
        this.createJobInfo.get('quitJobDate')?.enable();
        this.createJobInfo.get('opinionContribute')?.enable();
    }
    clearQuitJobFields() {
        this.createJobInfo.get('reasonGroupQuitJob')?.reset();
        this.createJobInfo.get('reasonGroupQuitJob')?.disable();

        this.createJobInfo.get('reasonQuitJob')?.reset();
        this.createJobInfo.get('reasonQuitJob')?.disable();

        this.createJobInfo.get('quitJobDate')?.reset();
        this.createJobInfo.get('quitJobDate')?.disable();

        this.createJobInfo.get('opinionContribute')?.reset();
        this.createJobInfo.get('opinionContribute')?.disable();
    }

    loadEmployee(): void {
        this.objectService
            .getAllEmployee({ workingStatus: 0 })
            .subscribe((results) => {
                console.log(results);
                this.employees = results.items.map((employee) => ({
                    ...employee,
                    name: `${employee?.lastName} ${employee?.firstName} `,
                }));
            });
    }
    loadContractType() {
        this.contractService.getPagingAll({}).subscribe((result) => {
            this.contractTypes = result.items;
        });
    }

    loadLabor() {
        this.laborService.getPaging().subscribe((result) => {
            console.log(result);
            this.labores = result.items;
        });
    }

    handleSelectLabor() {
        if (this.selectedLabor) {
            this.createJobInfo.patchValue({
                natureOfLaborId: Number(this.selectedLabor),
            });
            this.laborVisible = false;
        }
    }

    handleSelectContractType() {
        if (this.selectedContructType) {
            this.createJobInfo.patchValue({
                contractTypeId: Number(this.selectedContructType),
            });

            this.contractTypeVisible = false;
        }
    }

    // loadAllowance(): void {
    //     this.allowanceService.getPaging().subscribe((result) => {
    //         this.allowances = result.items;
    //         this.totalAmount = this.allowances?.reduce(
    //             (sum, item) => sum + (item.value || 0),
    //             0
    //         );
    //     });
    // }

    loadDeductions(): void {
        this.deductionService.getById({ id: this.id }).subscribe((result) => {
            this.deductions = result.data;
            console.log('deductions', this.deductions);
            this.totalAmountDeductions = this.deductions?.reduce(
                (sum, item) => sum + (item.value || 0),
                0
            );
        });
    }

    show() {
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }
    startLoading() {
        this.loadingService.show();
    }

    handleCancelContractType() {
        //  groupAddVisible: boolean = false;
        if (this.contractTypeAddVisible) {
            this.contractTypeAddVisible = false;
        } else {
            this.contractTypeVisible = false;
        }
    }

    handleCreateContractType(): void {
        if (this.contractTypeCreateForm.valid) {
            this.contractService
                .createContractType(this.contractTypeCreateForm.value)
                .subscribe((result) => {
                    console.log(result);
                    if (result.status) {
                        this.contractTypeCreateForm.reset();
                        this.loadContractType();
                    }
                });
        }
    }

    editContractType(index: number) {
        this.isContractTypeEditing = index;
    }

    saveContractTypeEdit(position: any) {
        this.contractService
            .updateContractType(position.id, position)
            .subscribe(() => {
                this.loadContractType();
            });
        this.isContractTypeEditing = null;
    }

    handleCreateAllowance(): void {
        this.contractService
            .createAllowance(this.createAllowanceForm.value)
            .subscribe((result) => {
                this.toastService.showSuccess(
                    'Thành công',
                    'Thêm mới phụ cấp thành công'
                );
                this.createAllowanceForm.reset();
                this.allowanceVisible = false;
                // this.loadAllowance();
            });
    }

    handleCreateDeduction(): void {
        if (this.createDeductionForm.valid) {
            const formData = {
                deducationName: this.createDeductionForm.value.deducationName,
                standardType: this.createDeductionForm.value.standardType,
                standardValue: this.createDeductionForm.value.standardValue,
                typeValue: this.createDeductionForm.value.typeValue,
                value: this.createDeductionForm.value.value,
                note: this.createDeductionForm.value.note,
                employeeId: this.userCurrent?.employee?.id,
            };
            this.deductionService.create(formData).subscribe((result) => {
                this.toastService.showSuccess(
                    'Thành công',
                    'Thêm mới phụ cấp thành công'
                );
                this.createDeductionForm.reset();
                this.deductionsVisible = false;
                this.loadDeductions();
                // this.loadAllowance();
            });
        } else {
            this.createDeductionForm.markAllAsTouched();
        }
    }

    ////////////////////////////////////////////////////////////////
    //Tính chất lao động
    handleCancelLabor() {
        //  groupAddVisible: boolean = false;
        if (this.laborAddVisible) {
            this.laborAddVisible = false;
        } else {
            this.laborVisible = false;
        }
    }

    handleCreateLabor(): void {
        if (this.laborCreateForm.valid) {
            const formData = {
                deducationName: this.laborCreateForm.value.deducationName,
                standardType: this.laborCreateForm.value.standardType,
                standardValue: this.laborCreateForm.value.standardValue,
                typeValue: this.laborCreateForm.value.typeValue,
                value: this.laborCreateForm.value.value,
                note: this.laborCreateForm.value.note,
                employeeId: this.userCurrent?.employee?.id,
            };
            this.laborService.create(formData).subscribe((result) => {
                console.log(result);
                if (result.status) {
                    this.laborCreateForm.reset();
                    this.loadLabor();
                }
            });
        }
    }

    editLabor(index: number) {
        this.isLaborEditing = index;
    }

    saveLaborEdit(position: any) {
        this.laborService.updateLabor(position.id, position).subscribe(() => {
            this.loadLabor();
        });
        this.isLaborEditing = null;
    }

    onSubmit(): void {
        if (this.createJobInfo.invalid) {
            this.createJobInfo.markAllAsTouched();
            this.toastService.showWarning(
                'Chú ý',
                'Vui lòng kiểm tra lại dữ liệu trước khi cập nhật.'
            );
            return;
        }

        const profileId = this.profileById?.id;
        if (profileId == null) {
            this.toastService.showError(
                'Thất bại',
                'Không tìm thấy hồ sơ công việc cần cập nhật.'
            );
            return;
        }

        const rawValue = this.createJobInfo.getRawValue();
        const formData = {
            ...rawValue,
            employeeId: this.id,
            workingStatus: this.toNumberOrNull(rawValue?.workingStatus),
            natureOfLaborId: this.toNumberOrNull(rawValue?.natureOfLaborId),
            timeKeepingId: this.toNumberOrNull(rawValue?.timeKeepingId),
            contractTypeId: this.toNumberOrNull(rawValue?.contractTypeId),
            internshipStartDate: this.toIsoOrNull(rawValue?.internshipStartDate),
            probationStartDate: this.toIsoOrNull(rawValue?.probationStartDate),
            officialStartDate: this.toIsoOrNull(rawValue?.officialStartDate),
            seniority: this.toDecimalOrNull(rawValue?.seniority),
            retiredDate: this.toIsoOrNull(rawValue?.retiredDate),
            quitJobDate: this.toIsoOrNull(rawValue?.quitJobDate),
            salaryLevel: this.toDecimalOrNull(rawValue?.salaryLevel),
            basicSalary: this.toDecimalOrNull(rawValue?.basicSalary),
            insuranceSalary: this.toDecimalOrNull(rawValue?.insuranceSalary),
            totalSalary: this.toDecimalOrNull(rawValue?.totalSalary),
        };

        if (formData.workingStatus === 0) {
            formData.reasonGroupQuitJob = null;
            formData.reasonQuitJob = null;
            formData.quitJobDate = null;
            formData.opinionContribute = null;
        }

        this.profileService
            .updateJobInfo(
                { id: profileId },
                formData
            )
            .subscribe({
                next: (results) => {
                    if (results?.status === false) {
                        this.toastService.showError(
                            'Cập nhật thất bại',
                            this.getReadableErrorMessage(results)
                        );
                        return;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thông báo',
                        detail: 'Cập nhật thông tin công việc thành công',
                    });
                },
                error: (error: HttpErrorResponse) => {
                    this.toastService.showError(
                        'Cập nhật thất bại',
                        this.getReadableErrorMessage(error)
                    );
                },
            });
    }

    private toNumberOrNull(value: any): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    private toDecimalOrNull(value: any): number | null {
        return this.toNumberOrNull(value);
    }

    private toIsoOrNull(value: any): string | null {
        if (!value) {
            return null;
        }

        const dateValue = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(dateValue.getTime())) {
            return null;
        }

        return dateValue.toISOString();
    }

    private getReadableErrorMessage(source: any): string {
        const payload = source?.error ?? source;

        const messages: string[] = [];

        if (typeof payload?.message === 'string' && payload.message.trim()) {
            messages.push(payload.message.trim());
        }

        if (typeof payload?.detail === 'string' && payload.detail.trim()) {
            messages.push(payload.detail.trim());
        }

        if (Array.isArray(payload?.errors)) {
            payload.errors.forEach((item: any) => {
                if (typeof item === 'string' && item.trim()) {
                    messages.push(item.trim());
                }
                if (
                    typeof item?.errorMessage === 'string' &&
                    item.errorMessage.trim()
                ) {
                    messages.push(item.errorMessage.trim());
                }
            });
        }

        if (messages.length > 0) {
            return [...new Set(messages)].join(' | ');
        }

        if (source?.status === 0) {
            return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
        }

        return 'Có lỗi xảy ra khi cập nhật thông tin công việc.';
    }

    handleDelete(item: any): void {
        this.deductionService
            .deleteSoft({ id: item.id })
            .subscribe((results) => {
                this.toastService.showSuccess(
                    'Thành công',
                    'Xóa khấu trừ thành công!'
                );
                this.deductionsVisible = false;
                this.loadDeductions();
            });
    }
}
