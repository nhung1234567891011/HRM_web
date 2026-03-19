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
import { MessageService } from 'primeng/api';
import jobInfoConstant from 'src/app/core/constants/job-infomation.constant';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { AllowanceService } from 'src/app/core/services/allowance.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { LaborService } from 'src/app/core/services/labor.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { ProfileService } from 'src/app/core/services/profile.service';

@Component({
    selector: 'app-job-information',
    templateUrl: './job-information.component.html',
    styleUrl: './job-information.component.scss',
})
export class JobInformationComponent {
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

    permissionConstant = PermissionConstant;

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
        private messageService: MessageService,
        public hasPermissionHelper: HasPermissionHelper
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
        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
            this.profileService
                .getProfileByCustomerId({ id: user?.employee?.id })
                .subscribe((response) => {
                    this.allowances = response?.contracts[0]?.allowances;
                    this.profileById = response?.jobInfo;
                    // console.log(
                    //     this.profileById?.reasonGroupQuitJob.toString()
                    // );
                    this.createJobInfo = this.formBuilder.group({
                        employeeId: [this.profileById?.employeeId || null],
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
            { label: 'Thêm mới' },
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

    loadDeductions(): void {
        this.deductionService
            .getById({ id: this.userCurrent?.employee?.id })
            .subscribe((result) => {
                this.deductions = result.data;
                this.totalAmountDeductions = this.deductions?.reduce(
                    (sum, item) => sum + (item.value || 0),
                    0
                );
            });
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
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: 'Thêm mới phụ cấp thành công',
                });

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
        // this.createJobInfo.value.employeeId = this.;

        console.log(this.createJobInfo.value.natureOfLaborId);
        this.profileService
            .updateJobInfo(
                { id: this.profileById?.id },
                this.createJobInfo.value
            )
            .subscribe((results) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: 'Cập nhật thông tin chung hồ sơ thành công',
                });
            });
    }

    handleDelete(item: any): void {
        this.deductionService
            .deleteSoft({ id: item.id })
            .subscribe((results) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Thông báo',
                    detail: 'Xóa khấu trừ thành công!',
                });
                this.deductionsVisible = false;
                this.loadDeductions();
            });
    }
}
