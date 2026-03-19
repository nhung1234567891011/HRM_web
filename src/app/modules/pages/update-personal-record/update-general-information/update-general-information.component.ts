// import { Component, OnInit } from '@angular/core';
// import { LoadingService } from 'src/app/core/services/global/loading.service';
// import { ToastService } from 'src/app/core/services/global/toast.service';
// import { FormBuilder, FormGroup } from '@angular/forms';

// @Component({
//   selector: 'app-update-general-information',
//   templateUrl: './update-general-information.component.html',
//   styleUrl: './update-general-information.component.scss'
// })
// export class UpdateGeneralInformationComponent {
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
//     generalInfoForm: FormGroup;
//     //Dialog
//     allowanceVisible: boolean = false;
//     constructor(
//         private toastService: ToastService,
//         private loadingService: LoadingService,
//         private formBuilder: FormBuilder
//     ) {
//         this.generalInfoForm = this.formBuilder.group({});
//     }
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import {
    dateOfBirthValidator,
    noWhitespaceValidator,
} from 'src/app/shared/validator';
import { ProfileService } from 'src/app/core/services/profile.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-update-general-information',
    templateUrl: './update-general-information.component.html',
    styleUrl: './update-general-information.component.scss',
})
export class UpdateGeneralInformationComponent {
    items: any;
    selectedCities!: any[];
    positionVisible: boolean = false;
    status: boolean = false;
    positionAddVisible: boolean = false;
    jobTitleVisible: boolean = false;
    date: any;
    checked: boolean = false;
    cities: any[] | undefined;
    gender: any;
    selectedCity: any | undefined;
    allowances: any;
    //Dialog
    allowanceVisible: boolean = false;
    generalInfoCreateForm: FormGroup;
    userCurrent: any;
    profiles: any;
    profileById: any;

    employees: any;
    id: any;
    imageUrl: string = environment.baseApiImageUrl;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder,
        private profileService: ProfileService,
        private authService: AuthService,
        private router: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.generalInfoCreateForm = this.formBuilder.group({
            code: [null, [Validators.required, noWhitespaceValidator()]], // Mã số nhân viên
            placeOfOrigin: [null], // Quê quán
            firstAndMiddleName: [
                null,
                [Validators.required, noWhitespaceValidator()],
            ], // Họ và tên đệm
            maritalStatus: [null], // Tình trạng hôn nhân
            name: [null, [Validators.required, noWhitespaceValidator()]], // Tên
            fullName: [{ value: null, disabled: true }], // Tên đầy đủ
            personalTax: [null], // Mã số thuế cá nhân
            familyComposition: [null], // Thành phần gia đình
            otherName: [null], // Tên khác
            selfComposition: [null], // Thành phần bản thân
            dateOfBirth: [null, dateOfBirthValidator()], // Ngày sinh
            ethnicity: [null], // Dân tộc
            gender: [null], // Giới tính
            placeOfBirth: [null], // Nơi sinh
            religion: [null], // Tôn giáo
            nationality: [null], // Quốc tịch
            phoneNumber: [null, [noWhitespaceValidator()]], // Số điện thoại di động
            idType: [null], // Loại giấy tờ
            idNumber: [null], // Số giấy tờ
            passportNumber: [null], // Số hộ chiếu
            idIssueDate: [null], // Ngày cấp giấy tờ
            passportIssueDate: [null], // Ngày cấp hộ chiếu
            idIssuePlace: [null], // Nơi cấp giấy tờ
            passportIssuePlace: [null], // Nơi cấp hộ chiếu
            idExpiryDate: [null], // Ngày hết hạn giấy tờ
            passportExpiryDate: [null], // Ngày hết hạn hộ chiếu
            educationLevel: [null], // Trình độ văn hóa
            trainingLevel: [null], // Trình độ đào tạo
            trainingPlace: [null], // Nơi đào tạo
            department: [null], // Khoa
            major: [null], // Chuyên ngành
            graduationYear: [null], // Năm tốt nghiệp
            classification: [null], // Xếp loại
        });
    }
    ngOnInit() {
        this.id = +this.router.snapshot.paramMap.get('id')!;

        this.gender = [
            { label: 'Nam', value: 1 },
            { label: 'Nữ', value: 0 },
            { label: 'Khác', value: 2 },
        ];
        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
            this.profileService
                .getProfileByCustomerId({ id: this.id })
                .subscribe((response) => {
                    this.employees = response;
                    this.profileById = response?.profileInfo;
                    console.log(this.profileById.anotherName);
                    this.generalInfoCreateForm = this.formBuilder.group({
                        code: [
                            { value: response?.employeeCode, disabled: true },
                            [Validators.required, noWhitespaceValidator()],
                        ], // Mã số nhân viên
                        placeOfOrigin: [this.profileById.originalLocation], // Quê quán
                        firstAndMiddleName: [
                            { value: response.lastName, disabled: true },
                            [Validators.required, noWhitespaceValidator()],
                        ], // Họ và tên đệm
                        maritalStatus: [this.profileById.marriageStatus], // Tình trạng hôn nhân
                        name: [
                            { value: response?.firstName, disabled: true },
                            [Validators.required, noWhitespaceValidator()],
                        ], // Tên
                        fullName: [
                            {
                                value:
                                    response.lastName +
                                    ' ' +
                                    response.firstName,
                                disabled: true,
                            },
                        ], // Tên đầy đủ
                        personalTax: [this.profileById.personalTaxNumber], // Mã số thuế cá nhân
                        familyComposition: [this.profileById.typeFamily], // Thành phần gia đình
                        otherName: [this.profileById.anotherName], // Tên khác
                        selfComposition: [this.profileById.typePersonal], // Thành phần bản thân
                        dateOfBirth: [
                            new Date(response.dateOfBirth),
                            dateOfBirthValidator(),
                        ], // Ngày sinh
                        ethnicity: [this.profileById.tripe], // Dân tộc
                        gender: [{ value: response.sex, disabled: true }], // Giới tính
                        placeOfBirth: [this.profileById.bornLocation], // Nơi sinh
                        religion: [this.profileById.religion], // Tôn giáo
                        nationality: [this.profileById.nation], // Quốc tịch
                        phoneNumber: [
                            response.phoneNumber,
                            [noWhitespaceValidator()],
                        ], // Số điện thoại di động
                        idType: [this.profileById.typePaper], // Loại giấy tờ
                        idNumber: [this.profileById.paperNumber], // Số giấy tờ
                        passportNumber: [this.profileById.passportNumber], // Số hộ chiếu
                        idIssueDate: [
                            new Date(this.profileById.paperProvideDate),
                        ], // Ngày cấp giấy tờ
                        passportIssueDate: [
                            new Date(this.profileById.passportProvideDate),
                        ], // Ngày cấp hộ chiếu
                        idIssuePlace: [this.profileById.paperProvideLocation], // Nơi cấp giấy tờ
                        passportIssuePlace: [
                            this.profileById.passportProvideLocation,
                        ], // Nơi cấp hộ chiếu
                        idExpiryDate: [
                            new Date(this.profileById.expirePaperDate),
                        ], // Ngày hết hạn giấy tờ
                        passportExpiryDate: [
                            new Date(this.profileById.expirePassportDate),
                        ], // Ngày hết hạn hộ chiếu
                        educationLevel: [this.profileById.cultureLevel], // Trình độ văn hóa
                        trainingLevel: [this.profileById.educationLevel], // Trình độ đào tạo
                        trainingPlace: [
                            this.profileById.educationTraningLocation,
                        ], // Nơi đào tạo
                        department: [this.profileById.faculty], // Khoa
                        major: [this.profileById.specialized], // Chuyên ngành
                        graduationYear: [this.profileById.graduateDate], // Năm tốt nghiệp
                        classification: [
                            this.profileById.graduationClassification,
                        ], // Xếp loại
                    });
                });
        });

        this.generalInfoCreateForm
            .get('firstAndMiddleName')
            ?.valueChanges.subscribe(() => {
                this.updateFullName();
            });

        this.generalInfoCreateForm.get('name')?.valueChanges.subscribe(() => {
            this.updateFullName();
        });
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Chỉnh sửa' },
        ];

        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
        ];
        this.loadPositionGroups();
        this.loadPosition();
        this.loadUnit();
    }

    updateFullName() {
        const firstAndMiddleName =
            this.generalInfoCreateForm.get('firstAndMiddleName')?.value || '';
        const name = this.generalInfoCreateForm.get('name')?.value || '';
        const fullName = `${firstAndMiddleName} ${name}`.trim();

        this.generalInfoCreateForm
            .get('fullName')
            ?.setValue(fullName, { emitEvent: false });
    }

    loadPositionGroups(): void {}
    loadPosition(): void {}
    loadUnit(): void {}

    startLoading() {
        this.loadingService.show();
    }

    onSubmit(): void {
        console.log(this.generalInfoCreateForm.value);
        const formData = {
            EmployeeId: this.id, // Mã nhân viên
            // Employee: name, // Tên nhân viên
            // ProfileCode: code, // Mã hồ sơ
            // anotherName: this.generalInfoCreateForm.value?.otherName,
            originalLocation: this.generalInfoCreateForm.value?.placeOfOrigin,
            bornLocation: this.generalInfoCreateForm.value?.placeOfBirth,
            MarriageStatus: this.generalInfoCreateForm.value?.maritalStatus, // Tình trạng hôn nhân (Độc thân, Đã kết hôn, v.v.)
            PersonalTaxNumber: this.generalInfoCreateForm.value?.personalTax, // Số thuế cá nhân
            TypeFamily: this.generalInfoCreateForm.value?.familyComposition, // Loại hình gia đình (Ví dụ: hạt nhân, truyền thống)
            TypePersonal: this.generalInfoCreateForm.value?.selfComposition, // Loại hình cá nhân (Ví dụ: nhân viên hợp đồng, chính thức)
            Tripe: this.generalInfoCreateForm.value?.ethnicity, // Dân tộc
            Religion: this.generalInfoCreateForm.value?.religion, // Tôn giáo
            Nation: this.generalInfoCreateForm.value?.nationality, // Quốc tịch
            TypePaper: this.generalInfoCreateForm.value?.idType, // Loại giấy tờ (Ví dụ: CMND, CCCD)
            PaperNumber: this.generalInfoCreateForm.value?.idNumber, // Số giấy tờ
            PaperProvideDate: this.generalInfoCreateForm.value?.idIssueDate, // Ngày cấp giấy tờ
            PaperProvideLocation:
                this.generalInfoCreateForm.value?.idIssuePlace, // Nơi cấp giấy tờ
            ExpirePaperDate: this.generalInfoCreateForm.value?.idExpiryDate, // Ngày hết hạn giấy tờ
            PassportNumber: this.generalInfoCreateForm.value?.passportNumber, // Số hộ chiếu
            PassportProvideDate:
                this.generalInfoCreateForm.value?.passportIssueDate, // Ngày cấp hộ chiếu
            PassportProvideLocation:
                this.generalInfoCreateForm.value?.passportIssuePlace, // Nơi cấp hộ chiếu
            ExpirePassportDate:
                this.generalInfoCreateForm.value?.passportExpiryDate, // Ngày hết hạn hộ chiếu
            CultureLevel: this.generalInfoCreateForm.value?.educationLevel, // Trình độ văn hóa (Ví dụ: 12/12, 9/12)
            EducationLevel: this.generalInfoCreateForm.value?.trainingLevel, // Trình độ học vấn (Ví dụ: Đại học, Cao đẳng)
            EducationTraningLocation:
                this.generalInfoCreateForm.value?.trainingPlace, // Nơi đào tạo
            Faculty: this.generalInfoCreateForm.value?.department, // Khoa (nếu học đại học)
            Specialized: this.generalInfoCreateForm.value?.major, // Chuyên ngành
            GraduateDate: this.generalInfoCreateForm.value?.graduationYear, // Ngày tốt nghiệp
            GraduationClassification:
                this.generalInfoCreateForm.value?.classification, // Xếp loại tốt nghiệp (Giỏi, Khá, Trung bình)
            anotherName: this.generalInfoCreateForm.value?.otherName,
        };

        //             {
        //     "code": "fsdfsdfs", // Mã định danh hoặc mã cá nhân
        //     "placeOfOrigin": "dsfdsfdsf", // Nơi sinh
        //     "firstAndMiddleName": "fsdfdsf", // Họ và tên đệm
        //     "maritalStatus": null, // Tình trạng hôn nhân
        //     "name": null, // Tên
        //     "fullName": null, // Họ và tên đầy đủ
        //     "personalTax": null, // Mã số thuế cá nhân
        //     "familyComposition": null, // Thành phần gia đình
        //     "otherName": null, // Tên khác
        //     "selfComposition": null, // Thành phần cá nhân
        //     "dateOfBirth": null, // Ngày sinh
        //     "ethnicity": null, // Dân tộc
        //     "gender": null, // Giới tính
        //     "placeOfBirth": null, // Nơi sinh
        //     "religion": null, // Tôn giáo
        //     "nationality": null, // Quốc tịch
        //     "phoneNumber": null, // Số điện thoại
        //     "idType": null, // Loại giấy tờ tùy thân
        //     "idNumber": null, // Số giấy tờ tùy thân
        //     "passportNumber": null, // Số hộ chiếu
        //     "idIssueDate": null, // Ngày cấp giấy tờ tùy thân
        //     "passportIssueDate": null, // Ngày cấp hộ chiếu
        //     "idIssuePlace": null, // Nơi cấp giấy tờ tùy thân
        //     "passportIssuePlace": null, // Nơi cấp hộ chiếu
        //     "idExpiryDate": null, // Ngày hết hạn giấy tờ tùy thân
        //     "passportExpiryDate": null, // Ngày hết hạn hộ chiếu
        //     "educationLevel": null, // Trình độ học vấn
        //     "trainingLevel": null, // Trình độ đào tạo
        //     "trainingPlace": null, // Nơi đào tạo
        //     "department": null, // Phòng ban
        //     "major": null, // Chuyên ngành
        //     "graduationYear": null, // Năm tốt nghiệp
        //     "classification": null // Xếp loại
        // }

        this.profileService
            .updateGeneralInfo({ id: this.profileById.id }, formData)
            .subscribe((results) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: 'Thêm mới thông tin chung hồ sơ thành công',
                });
            });
    }
}
