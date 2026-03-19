import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { C } from '@fullcalendar/core/internal-common';
import { MenuItem } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { CONTRACT_NOT_FIXED_DURATION } from 'src/app/core/constants/contract.constant';
import { ContractService } from 'src/app/core/services/contract.service';
import { EmployeeService } from 'src/app/core/services/employee.service';

@Component({
    selector: 'app-contract-create',
    templateUrl: './contract-create.component.html',
    styleUrl: './contract-create.component.scss',
})
export class ContractCreateComponent implements OnInit {
    messages: any[] = [];
    contractTypeId: number = null;
    items: MenuItem[] | undefined;
    contractForm!: FormGroup;
    allowanceForm!: FormGroup;
    showDialog3 = false;
    contractType: any[] = [];
    companyRepresenSigning: any[] = [];
    contractDuration: any[] = [];
    workingform: any[] = [];
    nld: any[] = [];
    options: any[] = [];
    contractDurationOption: any[] = [];
    workingFormOption: any[] = [];
    employee: any[] = [];
    units: any[] = [];
    isDisabled = true;
    calendarIcon: string = 'pi pi-calendar';
    uploadedFiles: File[] = [];
    acceptedFileTypes = '.xlsx,.xls,.ppt,.pptx,.pdf,.jpg,.jpeg,.png,.gif';
    isDialogVisibleContractType: boolean = false;
    isDialogVisibleContractDuration: boolean = false;
    isDialogVisibleWorkingform: boolean = false;
    searchTerm: string = '';
    pageSize: number = 30;
    pageIndex: number = 1;
    filterContractType: any[] = [];
    filterContractDuration: any[] = [];
    filterWorkingForm: any[] = [];
    displayDialog: boolean = false;
    displayDialogEidt: boolean = false;
    employees: any[] = [];
    represenSigning: any[] = [];
    allowanceList: any[] = [];
    totalAmount: number = 0;
    isContractDurationDisabled: boolean = false;
    isExpiryDateDisabled: boolean = false;
    selectedAllowance: any = null;
    selectedFile: File | null = null;
    contractId: number;
    fileName: string | null = null;
    selectedContractType: any = null;
    showErrorEmployees: boolean = false;
    showErrorCodeEmployees: boolean = false;
    showErrorUnit: boolean = false;
    showErrorCode: boolean = false;
    showErrorSigningDate: boolean = false;
    showErrorEffectiveDate: boolean = false;
    showErrorExpiryDate: boolean = false;
    showErrorContractType: boolean = false;
    showErrorAllowanceName: boolean = false;

    allowanceNameOptions = [{ label: 'Hỗ trợ', value: 1 }];

    allowanceRateOptions = [{ label: 'Số tiền cố định', value: 1 }];

    valueOptions = [{ label: 'Số tiền cố định', value: 1 }];

    signStatuOptions: any[] = [
        { id: 0, name: 'Chưa ký' },
        { id: 1, name: 'Đã ký' },
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private contractService: ContractService,
        private http: HttpClient,
        private employeeService: EmployeeService
    ) {}

    ngOnInit() {
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hợp đồng', routerLink: '/contract/show' },
            { label: 'Thêm mới' },
        ];
        this.initForm();
        this.loadContractType();
        this.loadContractDuration();
        this.loadWorkingForm();
        this.loadEmployees();
    }

    initForm() {
        this.contractForm = this.fb.group({
            employeeId: [null, Validators.required],
            nameEmployee: [null, Validators.required],
            codeEmployee: new FormControl({ value: '', disabled: true }),
            code: new FormControl({ value: '', disabled: true }),
            unitId: new FormControl({ value: '', disabled: true }),
            position: new FormControl({ value: '', disabled: true }),
            signingDate: [null, Validators.required],
            contractName: [null, Validators.required],
            contractTypeId: [null, Validators.required],
            contractTypeName: [null, Validators.required],
            contractDurationId: [null],
            contractDuration: [null, Validators.required],
            workingFormId: [null, Validators.required],
            effectiveDate: [null, Validators.required],
            expiryDate: [null, this.requireExpiryDateValidator.bind(this)],
            salaryAmount: [null, Validators.required],
            unionFee: [null, Validators.required],
            salaryInsurance: [null, Validators.required],
            kpiSalary: [null, Validators.required],
            salaryRate: [null, Validators.required],
            companyRepresentativeSigningId: [null, Validators.required],
            companyRepresentativeSigning: [null, Validators.required],
            representative: [null, Validators.required],
            attachment: [null, Validators.required],
            note: [null, Validators.required],
            signStatus: [null, Validators.required],
            description: [null, Validators.required],
        });

        this.allowanceForm = this.fb.group({
            allowNameId: [null, Validators.required],
            allowanceName: [null, Validators.required],
            standardTypeId: [null, Validators.required],
            standardType: [null, Validators.required],
            standardValue: [null, Validators.required],
            typeValueId: [null, Validators.required],
            typeValue: [null, Validators.required],
            value: [null, Validators.required],
            note: [null, Validators.required],
        });
    }

    requireExpiryDateValidator(control: AbstractControl) {
        const contractDurationId =
            this.contractForm?.get('contractDurationId')?.value;
        const expiryDate = control.value;
        const effectiveDate = this.contractForm?.get('effectiveDate')?.value;

        if (!effectiveDate) {
            return { requiredEffectiveDate: true };
        }

        if (!contractDurationId && !expiryDate) {
            return { requiredExpiryDate: true };
        }

        return null;
    }

    onContractDurationChange() {
        const contractDurationId =
            this.contractForm.get('contractDurationId')?.value;

        const selectedContractDuration = this.contractDuration.find(
            (duration) => duration.id === contractDurationId
        );

        this.contractForm.patchValue({
            contractDuration: selectedContractDuration
                ? selectedContractDuration.name
                : '',
        });

        if (contractDurationId) {
            this.contractForm.get('expiryDate')?.clearValidators();
        } else {
            this.contractForm
                .get('expiryDate')
                ?.setValidators([
                    Validators.required,
                    this.requireExpiryDateValidator.bind(this),
                ]);
        }

        this.contractForm.get('expiryDate')?.updateValueAndValidity();
    }

    onEffectiveDateChange() {
        this.contractForm.get('expiryDate')?.updateValueAndValidity();
    }

    openDialog3(): void {
        this.showDialog3 = true;
    }

    closeDialog3() {
        this.showDialog3 = false;
    }

    loadEmployees(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.employeeService.getEmployees(request).subscribe((data) => {
            this.employees = data.items.map((employee: any) => ({
                id: employee.id,
                name: `${employee.lastName} ${employee.firstName}`,
                employeeCode: employee.employeeCode,
                organizationId: employee.organization.id || '',
                positionName: employee.staffPosition?.positionName,
            }));

            this.units = [
                ...new Set(
                    data.items
                        .map((employee: any) => ({
                            id: employee.organization.id || '',
                            name:
                                employee.organization.organizationName ||
                                'Không xác định',
                        }))
                        .filter((unit) => unit.id)
                ),
            ];

            this.represenSigning = data.items
                .filter((employee: any) => employee.workingStatus === 0)
                .map((employee: any) => ({
                    id: employee.id,
                    name: `${employee.lastName} ${employee.firstName}`,
                    employeeCode: employee.employeeCode,
                    organizationId: employee.organization.id || '',
                    positionName: employee.staffPosition?.positionName,
                }));
        });
    }

    onEmployeeChange(event: any): void {
        if (event.value === null) {
            this.contractForm.patchValue({
                codeEmployee: '',
                unitId: '',
                position: '',
                nameEmployee: '',
            });
        } else {
            const selectedEmployee = this.employees.find(
                (e) => e.id === event.value
            );
            if (selectedEmployee) {
                this.contractForm.patchValue({
                    codeEmployee: selectedEmployee.employeeCode,
                    unitId: selectedEmployee.organizationId,
                    position: selectedEmployee.positionName,
                    nameEmployee: selectedEmployee.name,
                });
            }
        }
    }
    onUnitChange(event: any): void {
        if (event.value === null) {
            this.contractForm.patchValue({
                unitId: '',
            });
        }
    }

    onContractTypeChange(selectedContractTypeId: number) {
        this.contractTypeId = selectedContractTypeId;

        this.selectedContractType = this.contractType.find(
            (type) => type.id === selectedContractTypeId
        );

        this.contractForm.patchValue({
            contractTypeName: this.selectedContractType
                ? this.selectedContractType.name
                : '',
        });

        if (
            this.selectedContractType.name
                .trim()
                .toLowerCase()
                .includes(CONTRACT_NOT_FIXED_DURATION.toLowerCase().trim())
        ) {
            this.isContractDurationDisabled = true;
            this.isExpiryDateDisabled = true;
            this.showErrorExpiryDate = false;
            this.contractForm.patchValue({
                contractDurationId: null,
                expiryDate: null,
            });
        } else {
            this.isContractDurationDisabled = false;
            this.isExpiryDateDisabled = false;
        }
    }

    onCompanyRepresentativeSigningChange(selectedSigningId: number) {
        const selectedSigning = this.represenSigning.find(
            (signing) => signing.id === selectedSigningId
        );

        this.contractForm.patchValue({
            companyRepresentativeSigning: selectedSigning
                ? selectedSigning.name
                : '',
        });
    }

    onFileSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input?.files?.length) {
            const file = input.files[0];
            this.selectedFile = file;
        }
    }

    clearFile(): void {
        this.selectedFile = null;
        const fileInput = document.getElementById(
            'file-upload'
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ''; // Xóa giá trị input
        }
    }

    onDateSelectSigningDate(): void {
        this.showErrorSigningDate = false;
    }

    onDateSelectEffectiveDate(): void {
        this.showErrorEffectiveDate = false;
    }

    onDateSelectExpiryDate(): void {
        this.showErrorExpiryDate = false;
    }

    onRemoveFile(): void {
        this.uploadedFiles = [];
    }
    calculateExpiryDate() {
        const selectedDuration =
            this.contractForm.controls['contractDurationId'].value;
        const effectiveDate = this.contractForm.controls['effectiveDate'].value;

        if (!selectedDuration || !effectiveDate) {
            return;
        }

        const durationOption = this.contractDuration.find(
            (item: any) => item.id === selectedDuration
        );

        if (!durationOption) {
            return;
        }

        const duration = durationOption.name.toLowerCase();
        let daysToAdd = 0;

        if (duration.includes('ngày')) {
            daysToAdd = parseInt(duration, 10);
        } else if (duration.includes('tuần')) {
            daysToAdd = parseInt(duration, 10) * 7;
        } else if (duration.includes('tháng')) {
            daysToAdd = parseInt(duration, 10) * 30;
        } else if (duration.includes('quý')) {
            daysToAdd = parseInt(duration, 10) * 90;
        } else if (duration.includes('năm')) {
            daysToAdd = parseInt(duration, 10) * 365;
        }

        if (isNaN(daysToAdd) || daysToAdd <= 0) {
            console.warn('Thời hạn hợp đồng không hợp lệ');
            return;
        }

        const effectiveDateObject = new Date(effectiveDate);
        const expiryDate = new Date(
            effectiveDateObject.setDate(
                effectiveDateObject.getDate() + daysToAdd
            )
        );

        this.contractForm.controls['expiryDate'].setValue(expiryDate);
    }

    loadContractType() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.contractService.getPagingAll(request).subscribe(
            (response: any) => {
                const allItems = response.items.filter(
                    (item: any) => !item.isDeleted
                );

                this.contractType = allItems
                    .filter((item: any) => item.contractTypeStatus === true)
                    .map((item: any) => ({ id: item.id, name: item.name }));

                this.options = allItems;
                this.filterContractType = [...this.options];

                this.syncOptionsContractType();
            },
            (error) => {
                console.error('Error loading options:', error);
            }
        );
    }

    loadContractDuration() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.contractService.getPagingContractDuration(request).subscribe(
            (response: any) => {
                const allItems = response.items.filter(
                    (item: any) => !item.isDeleted
                );

                this.contractDuration = allItems
                    .filter((item: any) => item.contractDurationStatus === true)
                    .map((item: any) => ({ id: item.id, name: item.duration }));

                this.contractDurationOption = allItems;
                this.filterContractDuration = [...this.contractDurationOption];

                this.syncOptionsContractDuration();
            },
            (error) => {
                console.error('Error loading options:', error);
            }
        );
    }
    loadWorkingForm() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.contractService.getPagingWorkingForm(request).subscribe(
            (response: any) => {
                const allItems = response.items.filter(
                    (item: any) => !item.isDeleted
                );

                this.workingform = allItems
                    .filter((item: any) => item.workingFormStatus === true)
                    .map((item: any) => ({ id: item.id, name: item.form }));

                this.workingFormOption = allItems;
                this.filterWorkingForm = [...this.workingFormOption];

                this.syncOptionsWorkingform();
            },
            (error) => {
                console.error('Error loading options:', error);
            }
        );
    }

    syncOptionsContractType() {
        this.filterContractType.forEach((option) => {
            if (option.contractTypeStatus === true) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        });
    }
    syncOptionsContractDuration() {
        this.filterContractDuration.forEach((option) => {
            if (option.contractDurationStatus === true) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        });
    }
    syncOptionsWorkingform() {
        this.filterWorkingForm.forEach((option) => {
            if (option.workingFormStatus === true) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        });
    }

    openDialogContractType() {
        this.isDialogVisibleContractType = true;
    }

    openDialogContractDuration() {
        this.isDialogVisibleContractDuration = true;
    }
    openDialogWorkingForm() {
        this.isDialogVisibleWorkingform = true;
    }

    closeDialogContractType() {
        this.isDialogVisibleContractType = false;
        this.loadContractType();
    }
    closeDialogContractDuration() {
        this.isDialogVisibleContractDuration = false;
        this.loadContractDuration();
    }
    closeDialogWorkingForm() {
        this.isDialogVisibleWorkingform = false;
        this.loadWorkingForm();
    }

    addRowContractType() {
        const newOption = {
            name: '',
            selected: true,
            isEditing: true,
            isNew: true,
            isEdited: false,
            isDeleted: false,
        };
        this.options.push(newOption);
        this.filterContractType = [...this.options];
    }
    addRowContractDuration() {
        const newOption = {
            duration: '',
            selected: true,
            isEditing: true,
            isNew: true,
            isEdited: false,
            isDeleted: false,
        };
        this.contractDurationOption.push(newOption);
        this.filterContractDuration = [...this.contractDurationOption];
    }
    addRowWorkingForm() {
        const newOption = {
            form: '',
            selected: true,
            isEditing: true,
            isNew: true,
            isEdited: false,
            isDeleted: false,
        };
        this.workingFormOption.push(newOption);
        this.filterWorkingForm = [...this.workingFormOption];
    }

    finishEditingContractType(option: any) {
        if (option.name.trim() === '') {
            this.options = this.options.filter((o) => o !== option);
        } else {
            option.isEdited = !option.isNew;
        }
        this.filterContractType = [...this.options];
    }

    finishEditingContractDuration(option: any) {
        if (option.duration.trim() === '') {
            this.contractDurationOption = this.contractDurationOption.filter(
                (o) => o !== option
            );
        } else {
            option.isEdited = !option.isNew;
        }
        this.filterContractDuration = [...this.contractDurationOption];
    }
    finishEditingWorkingForm(option: any) {
        if (option.form.trim() === '') {
            this.workingFormOption = this.workingFormOption.filter(
                (o) => o !== option
            );
        } else {
            option.isEdited = !option.isNew;
        }
        this.filterWorkingForm = [...this.workingFormOption];
    }

    onCheckboxChangeContractType(option: any) {
        option.contractTypeStatus = !option.contractTypeStatus;
        option.selected = option.contractTypeStatus;
        if (!option.isNew) {
            option.isEdited = true; // Đánh dấu chỉnh sửa nếu không phải hàng mới
        }
    }

    onCheckboxChangeContractDuration(option: any) {
        option.contractDurationStatus = !option.contractDurationStatus;
        option.selected = option.contractDurationStatus;
        if (!option.isNew) {
            option.isEdited = true; // Đánh dấu chỉnh sửa nếu không phải hàng mới
        }
    }
    onCheckboxChangeWorkingForm(option: any) {
        option.workingFormStatus = !option.workingFormStatus;
        option.selected = option.workingFormStatus;
        if (!option.isNew) {
            option.isEdited = true; // Đánh dấu chỉnh sửa nếu không phải hàng mới
        }
    }

    editRowContractType(option: any) {
        option.isEditing = true;
    }

    editRowContractDuration(option: any) {
        option.isEditing = true;
    }
    editRowWorkingForm(option: any) {
        option.isEditing = true;
    }

    deleteRowContractType(index: number) {
        this.options.splice(index, 1);
        this.filterContractType = [...this.options];
    }

    deleteRowContractDuration(index: number) {
        this.contractDurationOption.splice(index, 1);
        this.filterContractDuration = [...this.contractDurationOption];
    }
    deleteRowWorkingForm(index: number) {
        this.workingFormOption.splice(index, 1);
        this.filterWorkingForm = [...this.workingFormOption];
    }

    filterOptionsContractType() {
        this.filterContractType = this.options.filter((option) =>
            option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    filterOptionsContractDuration() {
        this.filterContractDuration = this.contractDurationOption.filter(
            (option) =>
                option.duration
                    .toLowerCase()
                    .includes(this.searchTerm.toLowerCase())
        );
    }
    filterOptionsWorkingForm() {
        this.filterWorkingForm = this.workingFormOption.filter((option) =>
            option.form.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    contractTypeCreateAndUpdate() {
        const createRequests = this.filterContractType
            .filter((option) => option.isNew)
            .map((option) => {
                const resquest = {
                    name: option.name,
                    isDeleted: option.isDeleted || false, // Gán giá trị mặc định cho `isDeleted`
                };

                return this.contractService
                    .createContractType(resquest)
                    .toPromise();
            });

        const updateRequests = this.filterContractType
            .filter((option) => !option.isNew && option.isEdited) // Lọc các dòng đã chỉnh sửa
            .map((option) => {
                const resquest = {
                    id: option.id,
                    name: option.name,
                    contractTypeStatus: option.contractTypeStatus, // Cập nhật trạng thái checkbox
                    isDeleted: option.isDeleted || false, // Gán giá trị mặc định cho `isDeleted`
                };

                return this.contractService
                    .updateContractType(option.id, resquest)
                    .toPromise();
            });

        // Gửi các yêu cầu lưu thông tin
        Promise.all([...createRequests, ...updateRequests])
            .then((responses) => {
                console.log('All options saved successfully:', responses);
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Lưu thông tin thành công',
                        life: 3000,
                    },
                ];
                this.closeDialogContractType();
                // this.loadOptionsFromApi();
            })
            .catch((error) => {
                console.error('Error saving options:', error);
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Đã có lỗi xảy ra',
                        life: 3000,
                    },
                ];
            });
    }
    contractDurationCreateAndUpdate() {
        const createRequests = this.filterContractDuration
            .filter((option) => option.isNew)
            .map((option) => {
                const resquest = {
                    duration: option.duration,
                    isDeleted: option.isDeleted || false, // Gán giá trị mặc định cho `isDeleted`
                };

                return this.contractService
                    .createContractDuration(resquest)
                    .toPromise();
            });

        const updateRequests = this.filterContractDuration
            .filter((option) => !option.isNew && option.isEdited) // Lọc các dòng đã chỉnh sửa
            .map((option) => {
                const resquest = {
                    id: option.id,
                    duration: option.duration,
                    contractDurationStatus: option.contractDurationStatus, // Cập nhật trạng thái checkbox
                    isDeleted: option.isDeleted || false, // Gán giá trị mặc định cho `isDeleted`
                };

                return this.contractService
                    .updateContractDuration(option.id, resquest)
                    .toPromise();
            });

        // Gửi các yêu cầu lưu thông tin
        Promise.all([...createRequests, ...updateRequests])
            .then((responses) => {
                console.log('All options saved successfully:', responses);
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Lưu thông tin thành công',
                        life: 3000,
                    },
                ];
                this.closeDialogContractDuration();
                // this.loadOptionsFromApi();
            })
            .catch((error) => {
                console.error('Error saving options:', error);
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Đã có lỗi xảy ra',
                        life: 3000,
                    },
                ];
            });
    }
    workingFormCreateAndUpdate() {
        const createRequests = this.filterWorkingForm
            .filter((option) => option.isNew)
            .map((option) => {
                const resquest = {
                    form: option.form,
                    isDeleted: option.isDeleted || false, // Gán giá trị mặc định cho `isDeleted`
                };

                return this.contractService
                    .createWorkingForm(resquest)
                    .toPromise();
            });

        const updateRequests = this.filterWorkingForm
            .filter((option) => !option.isNew && option.isEdited) // Lọc các dòng đã chỉnh sửa
            .map((option) => {
                const resquest = {
                    id: option.id,
                    form: option.form,
                    workingFormStatus: option.workingFormStatus, // Cập nhật trạng thái checkbox
                    isDeleted: option.isDeleted || false, // Gán giá trị mặc định cho `isDeleted`
                };

                return this.contractService
                    .updateWorkingForm(option.id, resquest)
                    .toPromise();
            });

        // Gửi các yêu cầu lưu thông tin
        Promise.all([...createRequests, ...updateRequests])
            .then((responses) => {
                console.log('All options saved successfully:', responses);
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Lưu thông tin thành công',
                        life: 3000,
                    },
                ];
                this.closeDialogWorkingForm();
                // this.loadOptionsFromApi();
            })
            .catch((error) => {
                console.error('Error saving options:', error);
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Đã có lỗi xảy ra',
                        life: 3000,
                    },
                ];
            });
    }

    updateTotalAmount() {
        this.totalAmount = this.allowanceList.reduce((acc, allowance) => {
            return acc + (Number(allowance.value) || 0);
        }, 0);
    }

    saveAllowance() {
        const newAllowance = { ...this.allowanceForm.value };
        let hasError = false;

        if (
            !newAllowance.allowNameId ||
            newAllowance.allowNameId.length === 0
        ) {
            this.showErrorAllowanceName = true;
            hasError = true;
        }

        if (hasError) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Đang có lỗi cần được chỉnh sửa',
                    life: 3000,
                },
            ];
            return;
        }
        newAllowance.value = Number(newAllowance.value);
        newAllowance.standardValue = Number(newAllowance.standardValue);
        this.allowanceList.push(newAllowance);
        this.updateTotalAmount();
        this.displayDialog = false;
    }

    saveAndResetAllowance() {
        const newAllowance = { ...this.allowanceForm.value };
        let hasError = false;

        if (
            !newAllowance.allowNameId ||
            newAllowance.allowNameId.length === 0
        ) {
            this.showErrorAllowanceName = true;
            hasError = true;
        }

        if (hasError) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Đang có lỗi cần được chỉnh sửa',
                    life: 3000,
                },
            ];
            return;
        }
        newAllowance.value = Number(newAllowance.value);
        newAllowance.standardValue = Number(newAllowance.standardValue);
        this.allowanceList.push(newAllowance);
        this.updateTotalAmount();
        this.allowanceForm.reset();
    }

    editAllowance(allowance: any) {
        this.selectedAllowance = allowance;
        this.allowanceForm.patchValue(allowance);
        this.displayDialogEidt = true;
    }

    getAllowanceNameById(id: number): string {
        const option = this.allowanceNameOptions.find(
            (option) => option.value === id
        );
        return option ? option.label : '';
    }
    getstandardTypeById(id: number): string {
        const option = this.allowanceRateOptions.find(
            (option) => option.value === id
        );
        return option ? option.label : '';
    }
    getValueById(id: number): string {
        const option = this.valueOptions.find((option) => option.value === id);
        return option ? option.label : '';
    }

    // Lưu dữ liệu sau khi sửa
    updateAllowance() {
        // Tìm index của phần tử đang sửa
        const index = this.allowanceList.findIndex(
            (item) => item === this.selectedAllowance
        );

        if (index !== -1) {
            const newAllowance = { ...this.allowanceForm.value };
            let hasError = false;

            if (
                !newAllowance.allowNameId ||
                newAllowance.allowNameId.length === 0
            ) {
                this.showErrorAllowanceName = true;
                hasError = true;
            }

            if (hasError) {
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Không thể lưu vì:',
                        detail: 'Đang có lỗi cần được chỉnh sửa',
                        life: 3000,
                    },
                ];
                return;
            }
            this.allowanceList[index] = { ...this.allowanceForm.value }; // Cập nhật dữ liệu
            this.updateTotalAmount(); // Cập nhật tổng tiền
        }
        this.closeDialogEdit();
    }

    closeDialogEdit() {
        this.displayDialogEidt = false;
        this.selectedAllowance = null;
        this.allowanceForm.reset();
    }

    // Delete an allowance
    deleteAllowance(allowance: any) {
        this.allowanceList = this.allowanceList.filter(
            (item) => item !== allowance
        );
        this.updateTotalAmount();
    }

    showDialogAllowance() {
        this.displayDialog = true;
    }

    closeDialogAllowance() {
        this.displayDialog = false;
        this.allowanceForm.reset();
    }

    saveAndAddAllowance(contractId: number) {
        // Get the current list of allowances
        const allowanceList = this.allowanceList;

        // Map each allowance in the list to the new request format
        const requests = allowanceList.map((allowance) => {
            const request = {
                contractId: contractId,
                allowNameId: allowance.allowNameId,
                allowanceName: this.getAllowanceNameById(allowance.allowNameId),
                standardTypeId: allowance.standardTypeId,
                standardType: this.getstandardTypeById(
                    allowance.standardTypeId
                ),
                standardValue: allowance.standardValue || 0,
                typeValueId: allowance.typeValueId,
                typeValue: this.getValueById(allowance.typeValueId),
                value: allowance.value || 0,
                note: allowance.note || '',
            };

            // Call the service to create the allowance with the formatted request
            return this.contractService.createAllowance(request);
        });

        // Execute all the requests in parallel using forkJoin
        forkJoin(requests).subscribe({
            next: (results) => {
                console.log(
                    'Tất cả các khoản phụ cấp đã được thêm thành công:',
                    results
                );
                this.allowanceList = []; // Clear the list after successful addition
            },
            error: (err) => {
                console.error('Lỗi khi thêm các khoản phụ cấp:', err);
            },
        });
    }

    onSubmitContract() {
        const contractData = this.contractForm.value;
        let hasError = false;

        if (!contractData.employeeId || contractData.employeeId.length === 0) {
            this.showErrorEmployees = true;
            hasError = true;
        }

        if (
            !contractData.signingDate ||
            contractData.signingDate.length === 0
        ) {
            this.showErrorSigningDate = true;
            hasError = true;
        }

        if (
            !contractData.contractTypeId ||
            (contractData.contractTypeId.length === 0 &&
                !this.selectedContractType.name
                    .trim()
                    .toLowerCase()
                    .includes(CONTRACT_NOT_FIXED_DURATION.toLowerCase().trim()))
        ) {
            this.showErrorContractType = true;
            hasError = true;
        }

        if (
            !contractData.effectiveDate ||
            contractData.effectiveDate.length === 0
        ) {
            this.showErrorEffectiveDate = true;
            hasError = true;
        }

        if (
            (!contractData.expiryDate ||
                contractData.expiryDate.length === 0) &&
            !this.selectedContractType.name
                .trim()
                .toLowerCase()
                .includes(CONTRACT_NOT_FIXED_DURATION.toLowerCase().trim())
        ) {
            this.showErrorExpiryDate = true;
            hasError = true;
        }

        if (hasError) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Đang có lỗi cần được chỉnh sửa',
                    life: 3000,
                },
            ];
            return;
        }

        const formData = new FormData();
        const fieldsToAppend = [
            { field: 'employeeId', value: this.contractForm.value.employeeId },
            {
                field: 'nameEmployee',
                value: this.contractForm.value.nameEmployee,
            },
            {
                field: 'codeEmployee',
                value: this.contractForm.get('codeEmployee')?.value,
            },
            { field: 'unitId', value: this.contractForm.get('unitId')?.value },
            {
                field: 'position',
                value: this.contractForm.get('position')?.value,
            },
            {
                field: 'contractName',
                value: this.contractForm.value.contractName,
            },
            {
                field: 'contractTypeId',
                value: this.contractForm.value.contractTypeId,
            },
            {
                field: 'contractTypeName',
                value: this.contractForm.value.contractTypeName,
            },
            {
                field: 'contractDurationId',
                value: this.contractForm.value.contractDurationId,
            },
            {
                field: 'contractDuration',
                value: this.contractForm.value.contractDuration,
            },
            {
                field: 'workingFormId',
                value: this.contractForm.value.workingFormId,
            },
            {
                field: 'salaryAmount',
                value: this.contractForm.value.salaryAmount,
            },
            {
                field: 'salaryInsurance',
                value: this.contractForm.value.salaryInsurance,
            },
            { field: 'kpiSalary', value: this.contractForm.value.kpiSalary },
            { field: 'unionFee', value: this.contractForm.value.unionFee },
            { field: 'salaryRate', value: this.contractForm.value.salaryRate },
            {
                field: 'companyRepresentativeSigningId',
                value: this.contractForm.value.companyRepresentativeSigningId,
            },
            {
                field: 'companyRepresentativeSigning',
                value: this.contractForm.value.companyRepresentativeSigning,
            },
            {
                field: 'representative',
                value: this.contractForm.value.representative,
            },
            { field: 'note', value: this.contractForm.value.note },
            { field: 'signStatus', value: this.contractForm.value.signStatus },
            { field: 'attachmentFile', value: this.selectedFile as File },
        ];

        fieldsToAppend.forEach((item) => {
            if (item.value) {
                formData.append(item.field, item.value);
            }
        });

        const dateFields = [
            {
                field: 'signingDate',
                value: this.contractForm.value.signingDate,
            },
            {
                field: 'effectiveDate',
                value: this.contractForm.value.effectiveDate,
            },
            { field: 'expiryDate', value: this.contractForm.value.expiryDate },
        ];

        dateFields.forEach((item) => {
            if (item.value) {
                const localDate = new Date(item.value);
                const offset = localDate.getTimezoneOffset() * 60000; // Offset in milliseconds
                const localDateString = new Date(
                    localDate.getTime() - offset
                ).toISOString(); // Adjust to local time
                formData.append(item.field, localDateString);
            }
        });

        // Submit form data
        this.contractService.createContract(formData).subscribe({
            next: (response) => {
                if (response.status) {
                    const contractId = response.data.id;
                    this.saveAndAddAllowance(contractId);
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Thêm mới thành công',
                            life: 3000,
                        },
                    ];
                    setTimeout(() => {
                        this.router.navigate(['/contract/show']);
                    }, 1000);
                    this.contractForm.reset();
                }
            },
            error: (err) => {
                if (err.status === 400 && err.error?.detail) {
                    // Nếu status là 400 và có detail trong response
                    this.messages = [
                        {
                            severity: 'warn',
                            summary: '',
                            detail: err.error.detail, // Hiển thị detail từ response
                            life: 3000,
                        },
                    ];
                } else {
                    // Xử lý lỗi khác
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Đã có lỗi xảy ra',
                            life: 3000,
                        },
                    ];
                }
            },
        });
    }
}
