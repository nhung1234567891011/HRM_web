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
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ContractService } from 'src/app/core/services/contract.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { CONTRACT_NOT_FIXED_DURATION } from './../../../../core/constants/contract.constant';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-contract-update',
    templateUrl: './contract-update.component.html',
    styleUrl: './contract-update.component.scss',
})
export class ContractUpdateComponent {
    messages: any[] = [];
    contractTypeId: number = null;
    items: MenuItem[] | undefined;
    contractUpdateForm!: FormGroup;
    allowanceUpdateForm!: FormGroup;
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
    allowanceListNew: any[] = [];
    totalAmount: number = 0;
    isContractDurationDisabled: boolean = false;
    isExpiryDateDisabled: boolean = false;
    selectedAllowance: any = null;
    selectedFile: File | null = null;
    contractId: number;
    fileName: string | null = null;
    contractById!: number;
    selectedAttachment: any;
    Url: string = '';
    news: any;
    units: any[] = [];
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
        private employeeService: EmployeeService,
        private route: ActivatedRoute,
        private Router: Router
    ) {}

    ngOnInit() {
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hợp đồng', routerLink: '/contract/show' },
            { label: 'Chỉnh sửa' },
        ];
        this.CallSnaphot();
        this.getContractById();
        this.initForm();
        this.loadContractType();
        this.loadContractDuration();
        this.loadWorkingForm();
        this.loadEmployees();
    }

    initForm() {
        this.contractUpdateForm = this.fb.group({
            id: [null, Validators.required],
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
            salaryInsurance: [null, Validators.required],
            kpiSalary: [null, Validators.required],
            salaryRate: [null, Validators.required],
            unionFee: [null, Validators.required],
            companyRepresentativeSigningId: [null, Validators.required],
            companyRepresentativeSigning: [null, Validators.required],
            representative: [null, Validators.required],
            attachment: [null, Validators.required],
            note: [null, Validators.required],
            signStatus: [null, Validators.required],
            description: [null, Validators.required],
        });

        this.allowanceUpdateForm = this.fb.group({
            id: [null, Validators.required],
            allowNameId: [null, Validators.required],
            allowanceName: [null, Validators.required],
            standardTypeId: [null, Validators.required],
            standardType: [null, Validators.required],
            standardValue: [null, Validators.required],
            typeValueId: [null, Validators.required],
            typeValue: [null, Validators.required],
            value: [null, Validators.required],
            note: [null, Validators.required],
            contractId: [null, Validators.required],
        });
    }

    CallSnaphot(): void {
        this.contractById = +this.route.snapshot.paramMap.get('id')!;
    }

    getContractById(): void {
        this.contractService.getByIdContract(this.contractById).subscribe({
            next: (data) => {
                this.selectedAttachment = data;
                if (this.selectedAttachment.attachment) {
                    this.Url = this.selectedAttachment.attachment;
                }
                this.contractUpdateForm.patchValue({
                    id: data.id,
                    code: data.code,
                    employeeId: data.employeeId,
                    nameEmployee: data.nameEmployee,
                    codeEmployee: data.codeEmployee,
                    unitId: data.unitId,
                    position: data.position,
                    signingDate: new Date(data.signingDate),
                    contractName: data.contractName,
                    contractTypeId: data.contractTypeId,
                    contractTypeName: data.contractTypeName,
                    contractDurationId: data.contractDurationId,
                    contractDuration: data.contractDuration,
                    workingFormId: data.workingFormId,
                    effectiveDate: new Date(data.effectiveDate),
                    expiryDate: new Date(data.expiryDate),
                    salaryAmount: data.salaryAmount,
                    salaryInsurance: data.salaryInsurance,
                    kpiSalary: data.kpiSalary,
                    salaryRate: data.salaryRate,
                    companyRepresentativeSigningId:
                        data.companyRepresentativeSigningId,
                    companyRepresentativeSigning:
                        data.companyRepresentativeSigning,
                    representative: data.representative,
                    attachment: data.attachment,
                    note: data.note,
                    signStatus: data.signStatus,
                    expiredStatus: data.expiredStatus,
                    contractType: data.contractType,
                    unit: data.unit,
                });
                this.getAllowancesByContractId(data.id);
            },
            error: (err) => {
                console.error('Error loading contract:', err);
            },
        });
    }

    getAllowancesByContractId(contractId: number): void {
        this.contractService.getAllowanceByIdContract(contractId).subscribe({
            next: (allowances) => {
                this.allowanceList = allowances.map((allowance) => ({
                    ...allowance,
                    isNew: false,
                }));
                this.updateTotalAmount();
            },
            error: (err) => {
                console.error('Error loading allowances:', err);
            },
        });
    }

    openEditAllowance(allowance: any): void {
        this.news = allowance.isNew;
        if (this.news) {
            this.editAllowance(allowance);
        } else {
            const allowanceId = allowance.id;

            this.contractService.getAllowanceById(allowanceId).subscribe({
                next: (data) => {
                    // Điền dữ liệu vào form
                    this.allowanceUpdateForm.patchValue({
                        id: data.id,
                        allowNameId: data.allowNameId,
                        standardTypeId: data.standardTypeId,
                        standardValue: data.standardValue,
                        typeValueId: data.typeValueId,
                        value: data.value,
                        note: data.note,
                        contractId: data.contractId,
                    });

                    // Hiển thị hộp thoại chỉnh sửa
                    this.displayDialogEidt = true;
                },
                error: (err) => {
                    console.error('Error loading allowance details:', err);
                },
            });
        }
    }

    openDialog3(): void {
        this.showDialog3 = true;
    }

    closeDialog3() {
        this.showDialog3 = false;
    }

    requireExpiryDateValidator(control: AbstractControl) {
        const contractDurationId =
            this.contractUpdateForm?.get('contractDurationId')?.value;
        const expiryDate = control.value;
        const effectiveDate =
            this.contractUpdateForm?.get('effectiveDate')?.value;

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
            this.contractUpdateForm.get('contractDurationId')?.value;

        const selectedContractDuration = this.contractDuration.find(
            (duration) => duration.id === contractDurationId
        );

        this.contractUpdateForm.patchValue({
            contractDuration: selectedContractDuration
                ? selectedContractDuration.name
                : '',
        });

        if (contractDurationId) {
            this.contractUpdateForm.get('expiryDate')?.clearValidators();
        } else {
            this.contractUpdateForm
                .get('expiryDate')
                ?.setValidators([
                    Validators.required,
                    this.requireExpiryDateValidator.bind(this),
                ]);
        }

        this.contractUpdateForm.get('expiryDate')?.updateValueAndValidity();
    }

    onEffectiveDateChange() {
        this.contractUpdateForm.get('expiryDate')?.updateValueAndValidity();
    }

    loadEmployees(): void {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
        };
        this.employeeService.getEmployees(request).subscribe((data) => {
            this.employees = data.items.map((employee: any) => ({
                id: employee.id,
                name: `${employee.lastName} ${employee.firstName} `,
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
                    name: `${employee.lastName} ${employee.firstName} `,
                    employeeCode: employee.employeeCode,
                    organizationId: employee.organization.id || '',
                    positionName: employee.staffPosition?.positionName,
                }));
        });
    }

    onEmployeeChange(event: any): void {
        if (event.value === null) {
            this.contractUpdateForm.patchValue({
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
                this.contractUpdateForm.patchValue({
                    codeEmployee: selectedEmployee.employeeCode,
                    unitId: selectedEmployee.organizationId,
                    position: selectedEmployee.positionName,
                    nameEmployee: selectedEmployee.name,
                });
            }
        }
    }
    onContractTypeChange(selectedContractTypeId: number) {
        this.contractTypeId = selectedContractTypeId;
        this.selectedContractType = this.contractType.find(
            (type) => type.id === selectedContractTypeId
        );
        const selectedContractType = this.contractType.find(
            (type) => type.id === selectedContractTypeId
        );

        this.contractUpdateForm.patchValue({
            contractTypeName: selectedContractType
                ? selectedContractType.name
                : '',
        });

        if (
            this.selectedContractType.name
                .toLowerCase()
                .trim()
                .includes(CONTRACT_NOT_FIXED_DURATION.toLowerCase().trim())
        ) {
            this.isContractDurationDisabled = true;
            this.isExpiryDateDisabled = true;
            this.showErrorExpiryDate = false;
            this.contractUpdateForm.patchValue({
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

        this.contractUpdateForm.patchValue({
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

    removeFile(): void {
        this.Url = null;
        this.selectedAttachment.attachment = null;
        this.contractUpdateForm.patchValue({
            attachment: null,
        });
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
            this.contractUpdateForm.controls['contractDurationId'].value;
        const effectiveDate =
            this.contractUpdateForm.controls['effectiveDate'].value;

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

        this.contractUpdateForm.controls['expiryDate'].setValue(expiryDate);
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
        const totalAmount = this.allowanceList.reduce((acc, allowance) => {
            return acc + (Number(allowance.value) || 0);
        }, 0);

        const totalAmountNew = this.allowanceListNew.reduce(
            (acc, allowance) => {
                return acc + (Number(allowance.value) || 0);
            },
            0
        );

        this.totalAmount = totalAmountNew + totalAmount;
    }

    saveAllowance() {
        const newAllowance = { ...this.allowanceUpdateForm.value };
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
        newAllowance.isNew = true;

        this.allowanceListNew.push(newAllowance);
        this.updateTotalAmount();
        this.displayDialog = false;
    }

    saveAndResetAllowance() {
        const newAllowance = { ...this.allowanceUpdateForm.value };
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
        newAllowance.isNew = true;

        this.allowanceListNew.push(newAllowance);
        this.updateTotalAmount();
        this.allowanceUpdateForm.reset();
    }

    editAllowance(allowance: any) {
        this.selectedAllowance = allowance;
        this.allowanceUpdateForm.patchValue(allowance);
        this.displayDialogEidt = true;
    }

    // Lưu dữ liệu sau khi sửa
    updateAllowance() {
        // Tìm index của phần tử đang sửa
        const index = this.allowanceListNew.findIndex(
            (item) => item === this.selectedAllowance
        );

        if (index !== -1) {
            const newAllowance = { ...this.allowanceUpdateForm.value };
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
            newAllowance.isNew = true;
            this.allowanceListNew[index] = newAllowance; // Cập nhật dữ liệu
            this.updateTotalAmount(); // Cập nhật tổng tiền
        }
        this.closeDialogEdit();
    }

    updateAllowanceSave(): void {
        const allowanceData = {
            id: this.allowanceUpdateForm.value.id,
            contractId: this.allowanceUpdateForm.value.contractId,
            allowNameId: this.allowanceUpdateForm.value.allowNameId,
            allowanceName: this.getAllowanceNameById(
                this.allowanceUpdateForm.value.allowNameId
            ), // Lấy tên khoản từ ID
            standardTypeId: this.allowanceUpdateForm.value.standardTypeId,
            standardType: this.getstandardTypeById(
                this.allowanceUpdateForm.value.standardTypeId
            ), // Lấy định mức từ ID
            standardValue: this.allowanceUpdateForm.value.standardValue,
            typeValueId: this.allowanceUpdateForm.value.typeValueId,
            typeValue: this.getValueById(
                this.allowanceUpdateForm.value.typeValueId
            ), // Lấy giá trị từ ID
            value: this.allowanceUpdateForm.value.value,
            note: this.allowanceUpdateForm.value.note,
        };

        if (this.news) {
            this.updateAllowance();
        } else {
            const newAllowance = { ...this.allowanceUpdateForm.value };
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

            this.contractService.updateAllowance(allowanceData).subscribe({
                next: (response) => {
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Cập nhật thành công',
                            life: 3000,
                        },
                    ];
                    this.getAllowancesByContractId(this.contractById);
                    this.closeDialogEdit();
                },
                error: (err) => {
                    console.error('Error updating allowance:', err);
                },
            });
        }
    }

    closeDialogEdit() {
        this.displayDialogEidt = false;
        this.selectedAllowance = null;
        this.allowanceUpdateForm.reset();
    }

    // Delete an allowance
    deleteAllowance(allowance: any) {
        this.allowanceList = this.allowanceList.filter(
            (item) => item !== allowance
        );
        this.updateTotalAmount();
    }

    deleteAllowanceNew(allowance: any) {
        this.allowanceListNew = this.allowanceListNew.filter(
            (item) => item !== allowance
        );
        this.updateTotalAmount();
    }

    showDialogAllowance() {
        this.displayDialog = true;
    }

    closeDialogAllowance() {
        this.displayDialog = false;
        this.allowanceUpdateForm.reset();
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

    saveAndAddAllowance(contractId: number) {
        const allowanceListNew = this.allowanceListNew;

        const requests = allowanceListNew.map((allowance) => {
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

            return this.contractService.createAllowance(request);
        });

        forkJoin(requests).subscribe({
            next: (results) => {
                console.log(
                    'Tất cả các khoản phụ cấp đã được thêm thành công:',
                    results
                );
                this.allowanceList = [];
            },
            error: (err) => {
                console.error('Lỗi khi thêm các khoản phụ cấp:', err);
            },
        });
    }

    onUpdateContract() {
        console.log('đã click');
        const contractData = this.contractUpdateForm.value;
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
            contractData.contractTypeId.length === 0
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
                .toLowerCase()
                .trim()
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
                    detail: 'Hợp đồng đang có lỗi cần được chỉnh sửa',
                    life: 3000,
                },
            ];
            return;
        }

        const formData = new FormData();
        const fieldsToAppend = [
            { field: 'id', value: this.contractUpdateForm.value.id },
            {
                field: 'employeeId',
                value: this.contractUpdateForm.value.employeeId,
            },
            {
                field: 'nameEmployee',
                value: this.contractUpdateForm.value.nameEmployee,
            },
            {
                field: 'codeEmployee',
                value: this.contractUpdateForm.get('codeEmployee')?.value,
            },
            {
                field: 'code',
                value: this.contractUpdateForm.get('code')?.value,
            },
            {
                field: 'unitId',
                value: this.contractUpdateForm.get('unitId')?.value,
            },
            {
                field: 'position',
                value: this.contractUpdateForm.get('position')?.value,
            },
            {
                field: 'contractName',
                value: this.contractUpdateForm.value.contractName,
            },
            {
                field: 'contractTypeId',
                value: this.contractUpdateForm.value.contractTypeId,
            },
            {
                field: 'contractTypeName',
                value: this.contractUpdateForm.value.contractTypeName,
            },
            {
                field: 'contractDurationId',
                value: this.contractUpdateForm.value.contractDurationId,
            },
            {
                field: 'contractDuration',
                value: this.contractUpdateForm.value.contractDuration,
            },
            {
                field: 'workingFormId',
                value: this.contractUpdateForm.value.workingFormId,
            },
            {
                field: 'salaryAmount',
                value: this.contractUpdateForm.value.salaryAmount,
            },
            {
                field: 'salaryInsurance',
                value: this.contractUpdateForm.value.salaryInsurance,
            },
            {
                field: 'kpiSalary',
                value: this.contractUpdateForm.value.kpiSalary,
            },
            {
                field: 'salaryRate',
                value: this.contractUpdateForm.value.salaryRate,
            },
            {
                field: 'unionFee',
                value: this.contractUpdateForm.value.unionFee,
            },
            {
                field: 'companyRepresentativeSigningId',
                value: this.contractUpdateForm.value
                    .companyRepresentativeSigningId,
            },
            {
                field: 'companyRepresentativeSigning',
                value: this.contractUpdateForm.value
                    .companyRepresentativeSigning,
            },
            {
                field: 'representative',
                value: this.contractUpdateForm.value.representative,
            },
            { field: 'note', value: this.contractUpdateForm.value.note },
            {
                field: 'signStatus',
                value: this.contractUpdateForm.value.signStatus,
            },
        ];

        if (this.selectedFile) {
            fieldsToAppend.push({
                field: 'attachmentFile',
                value: this.selectedFile as File,
            });
        } else if (this.selectedAttachment?.attachment) {
            fieldsToAppend.push({
                field: 'attachment',
                value: this.selectedAttachment.attachment,
            });
        }

        fieldsToAppend.forEach((item) => {
            if (item.value) {
                formData.append(item.field, item.value);
            }
        });

        // Handle date fields separately
        const dateFields = [
            {
                field: 'signingDate',
                value: this.contractUpdateForm.value.signingDate,
            },
            {
                field: 'effectiveDate',
                value: this.contractUpdateForm.value.effectiveDate,
            },
            {
                field: 'expiryDate',
                value: this.contractUpdateForm.value.expiryDate,
            },
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
        const contractId = this.contractById;
        this.contractService.updateContract(contractId, formData).subscribe({
            next: (response) => {
                if (response.status) {
                    const contractId = this.contractById;
                    this.saveAndAddAllowance(contractId);
                    this.messages = [
                        {
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Cập nhật thành công',
                            life: 3000,
                        },
                    ];
                    setTimeout(() => {
                        this.router.navigate(['/contract/show']);
                    }, 1000);
                    this.contractUpdateForm.reset();
                }
            },
            error: (err) => {
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Đã có lỗi xảy ra',
                        life: 3000,
                    },
                ];
            },
        });
    }
    environment = environment;
    openDialogFile() {
        var urlDirect =
            this.environment.baseApiImageUrl +
            this.contractUpdateForm.get('attachment')?.value;
        console.log('url', urlDirect);
        window.open(urlDirect, '_blank');
    }
}
