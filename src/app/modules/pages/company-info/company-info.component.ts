import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CompanyInfoService } from 'src/app/core/services/company-info.service';
import { Base } from 'src/app/shared/base/base';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-company-info',
    templateUrl: './company-info.component.html',
    styleUrl: './company-info.component.scss',
})
export class CompanyInfoComponent implements OnInit {
    ImgUrl: string = environment.baseApiImageUrl;
    isEditing: boolean = false;
    items: MenuItem[] | undefined;
    companyForm!: FormGroup;
    isManualPosition: boolean = false;
    showErrorsTaxCode: boolean = false;
    taxCodeErrorMessage: any;
    showErrorsFullName: boolean = false;
    showErrorsAdress: boolean = false;
    showErrorsPhoneNumber: boolean = false;
    showErrorsCompanyCode: boolean = false;
    showErrorsFax: boolean = false;
    calendarIcon: string = 'pi pi-calendar';
    imageUrl: string = '';
    imageUrl2: string = '';
    messages: any[] = [];
    originalFormValue: any;
    selectedFile: File | null = null;
    selectedCompany: any = {};
    originalImageUrl: string | null = null;
    dateError: boolean = false;
    constructor(
        private fb: FormBuilder,
        private companyService: CompanyInfoService,
        private route: ActivatedRoute,
        private router: Router
    ) {}
    ngOnInit(): void {
        this.items = [
            { label: 'Hệ thống' },
            { label: 'Thông tin công ty' },
        ];

        this.initializeForm();
        this.getCompanyData(1);
    }

    initializeForm(): void {
        this.companyForm = this.fb.group({
            id: [1, Validators.required],
            fullName: [null, [Validators.required, this.whitespaceValidator()]],
            abbreviation: ['', [Validators.maxLength(50)]],
            taxCode: [
                '',
                [Validators.required, Validators.pattern(/^[0-9]{10,13}$/)],
            ],
            companyCode: ['', [Validators.maxLength(30)]],
            incorporationDate: ['', [Validators.required]],
            logoImage: [null],
            logoPath: [''],
            businessRegistrationCode: [''],
            businessRegistrationDate: ['', [Base.dateBeforeTodayValidator]],
            issuingAuthority: [''],
            legalRepresentative: [''],
            legalRepresentativeTitle: ['', [Validators.required]],
            address: [null, [Validators.required, this.whitespaceValidator()]],
            phoneNumber: [
                null,
                [Validators.required, this.whitespaceValidator()],
            ],
            fax: [null, [Validators.required, this.whitespaceValidator()]],
            email: [''],
            website: [''],
        });
        this.originalFormValue = this.companyForm.value;
    }

    getCompanyData(id: number): void {
        this.companyService.getCompanyById(id).subscribe((response) => {
            if (response.status) {
                const data = response.data;
                this.selectedCompany = data;
                this.imageUrl = `${this.ImgUrl}/${data.logoPath}`;
                const incorporationDate = new Date(data.incorporationDate);
                const businessRegistrationDate = new Date(data.businessRegistrationDate);
                this.companyForm.patchValue({
                    id: 1,
                    fullName: data.fullName,
                    abbreviation: data.abbreviation,
                    taxCode: data.taxCode,
                    companyCode: data.companyCode,
                    incorporationDate: incorporationDate,
                    logoPath: this.selectedCompany.logoPath,
                    businessRegistrationCode: data.businessRegistrationCode,
                    businessRegistrationDate: businessRegistrationDate,
                    issuingAuthority: data.issuingAuthority,
                    legalRepresentative: data.legalRepresentative,
                    legalRepresentativeTitle: data.legalRepresentativeTitle,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    fax: data.fax,
                    email: data.email,
                    website: data.website,
                });
            }
        });
    }

    whitespaceValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value || '';
            // Kiểm tra nếu chỉ toàn là khoảng trắng
            const isWhitespace = value.trim().length === 0 && value.length > 0;
            return isWhitespace ? { whitespace: true } : null;
        };
    }

    onInputChangeTaxCode(event: any): void {
        const taxCodeValue = event.target.value;

        // Kiểm tra xem taxCode có dài hơn 13 ký tự không
        if (taxCodeValue && taxCodeValue.length > 13) {
            this.showErrorsTaxCode = true;
            this.taxCodeErrorMessage =
                'Mã số thuế không hợp lệ, chỉ được nhập số, gồm 10 tới 13 chữ số';
        } else {
            // Nếu không, ẩn lỗi
            this.showErrorsTaxCode = false;
            this.taxCodeErrorMessage = '';
        }

        // Cũng có thể thực hiện kiểm tra loại ký tự nhập vào
        const regex = /^[0-9]*$/;
        if (!regex.test(taxCodeValue)) {
            this.showErrorsTaxCode = true;
            this.taxCodeErrorMessage = 'Chỉ được nhập số';
        }
    }

    // onInputChange(event: any): void {
    //   const input = event.target.value;
    //   event.target.value = input.replace(/[^0-9]/g, ''); // Loại bỏ tất cả ký tự không phải số
    //   this.companyForm.get('taxCode')?.setValue(event.target.value); // Cập nhật giá trị vào FormControl
    // }

    triggerFileInput(): void {
        const fileInput = document.getElementById(
            'fileInput'
        ) as HTMLInputElement;
        fileInput.click();
    }

    onFileSelect(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(): void {
        this.imageUrl = null;
        this.selectedCompany.logoPath = null;
        this.companyForm.patchValue({
            logoPath: null,
        });
    }

    onShortNameInput() {
        const shortNameControl = this.companyForm.get('abbreviation');
        if (shortNameControl?.value && shortNameControl.value.length > 50) {
            shortNameControl.setValue(shortNameControl.value.slice(0, 50));
        }
    }

    onCompanyCodeInput() {
        const companyCodeControl = this.companyForm.get('companyCode');
        if (companyCodeControl?.value && companyCodeControl.value.length > 30) {
            companyCodeControl.setValue(companyCodeControl.value.slice(0, 30));
        }
    }

    startEditing() {
        this.isEditing = true;
        this.originalFormValue = { ...this.companyForm.value };
        this.originalImageUrl = this.imageUrl;
    }

    // Lưu thay đổi
    saveChanges() {
        this.updateCompanyInfo();
    }

    // Hủy chỉnh sửa
    cancelEditing(): void {
        this.isEditing = false;
        this.showErrorsTaxCode = false;
        this.showErrorsFullName = false;

        this.companyForm.reset(this.originalFormValue);
        this.imageUrl = this.originalImageUrl;
    }

    togglePositionType() {
        this.isManualPosition = !this.isManualPosition;
    }

    updateCompanyInfo(): void {
        let hasError = false;

        if (!this.companyForm.get('fullName')?.valid) {
            this.showErrorsFullName = true;
            hasError = true;
        }

        const taxCode = this.companyForm.get('taxCode')?.value;
        if (
            !this.companyForm.get('taxCode')?.valid ||
            (taxCode && taxCode.length > 13)
        ) {
            this.showErrorsTaxCode = true;
            this.taxCodeErrorMessage =
                'Mã số thuế không hợp lệ, chỉ được nhập số, gồm 10 tới 13 chữ số'; // Thiết lập thông báo lỗi
            hasError = true;
        }

        if (!this.companyForm.get('companyCode')?.valid) {
            this.showErrorsCompanyCode = true;
            hasError = true;
        }

        // if (!this.companyForm.get('address')?.valid) {
        //   this.showErrorsAdress = true;
        //   hasError = true;
        // }

        // if (!this.companyForm.get('phoneNumber')?.valid) {
        //   hasError = true;
        // }

        // if (!this.companyForm.get('fax')?.valid) {
        //   hasError = true;
        // }

        if (hasError) {
            this.messages = [
                {
                    severity: 'error',
                    summary: 'Không thể lưu vì:',
                    detail: 'Thông tin đang có lỗi cần được chỉnh sửa',
                    life: 3000,
                },
            ];
            return;
        }

        const formData = new FormData();
        formData.append('id', this.companyForm.value.id);
        formData.append('fullName', this.companyForm.value.fullName || '');
        formData.append(
            'abbreviation',
            this.companyForm.value.abbreviation || ''
        );
        formData.append('taxCode', this.companyForm.value.taxCode || '');
        formData.append(
            'companyCode',
            this.companyForm.value.companyCode || ''
        );
        formData.append(
            'businessRegistrationCode',
            this.companyForm.value.businessRegistrationCode || ''
        );
        formData.append(
            'issuingAuthority',
            this.companyForm.value.issuingAuthority || ''
        );
        formData.append(
            'legalRepresentative',
            this.companyForm.value.legalRepresentative || ''
        );
        formData.append(
            'legalRepresentativeTitle',
            this.companyForm.value.legalRepresentativeTitle || ''
        );
        formData.append('address', this.companyForm.value.address || '');
        formData.append(
            'phoneNumber',
            this.companyForm.value.phoneNumber || ''
        );
        formData.append('fax', this.companyForm.value.fax || '');
        formData.append('email', this.companyForm.value.email || '');
        formData.append('website', this.companyForm.value.website || '');

        const incorporationDate = this.companyForm.value.incorporationDate;
        if (incorporationDate) {
            // Chuyển đổi ngày về múi giờ địa phương trước khi gửi
            const localIncorporationDate = new Date(incorporationDate);
            const timezoneOffset = localIncorporationDate.getTimezoneOffset();
            localIncorporationDate.setMinutes(
                localIncorporationDate.getMinutes() - timezoneOffset
            );

            formData.append(
                'incorporationDate',
                localIncorporationDate.toISOString()
            );
        }

        const businessRegistrationDate =
            this.companyForm.value.businessRegistrationDate;
        if (businessRegistrationDate) {
            // Chuyển đổi ngày về múi giờ địa phương trước khi gửi
            const localBusinessRegistrationDate = new Date(
                businessRegistrationDate
            );
            const timezoneOffset =
                localBusinessRegistrationDate.getTimezoneOffset();
            localBusinessRegistrationDate.setMinutes(
                localBusinessRegistrationDate.getMinutes() - timezoneOffset
            );

            formData.append(
                'businessRegistrationDate',
                localBusinessRegistrationDate.toISOString()
            );
        }

        if (this.selectedFile) {
            formData.append('logoImage', this.selectedFile);
        } else if (this.selectedCompany?.logoPath) {
            formData.append('logoPath', this.selectedCompany.logoPath);
        }

        const companyId = this.companyForm.value.id;

        this.companyService.updateCompanyInfo(formData, companyId).subscribe(
            (response) => {
                this.messages = [
                    {
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Cập nhật thành công',
                        life: 3000,
                    },
                ];
                setTimeout(() => {
                    this.router.navigate(['/company-informations']);
                }, 1000);
                this.isEditing = false;
            },
            (error) => {
                console.error('Error updating news:', error);
                this.messages = [
                    {
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Đã có lỗi xảy ra',
                        life: 3000,
                    },
                ];
            }
        );
    }
}
