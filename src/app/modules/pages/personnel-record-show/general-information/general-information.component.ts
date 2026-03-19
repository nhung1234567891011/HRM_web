import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-general-information',
//   templateUrl: './general-information.component.html',
//   styleUrl: './general-information.component.scss'
// })
// export class GeneralInformationComponent {

// }

import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import {
    dateOfBirthValidator,
    noWhitespaceValidator,
} from 'src/app/shared/validator';
import { ProfileService } from 'src/app/core/services/profile.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-general-information',
    templateUrl: './general-information.component.html',
    styleUrl: './general-information.component.scss',
})
export class GeneralInformationComponent {
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
    dataGetById: any;

    profiles: any;
    id: number;

    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder,
        private profileService: ProfileService,
        private objectservice: ObjectService,
        private router: ActivatedRoute
    ) {
        this.generalInfoCreateForm = this.formBuilder.group({
            code: [{ value: null, disabled: true }], // Mã số nhân viên
            placeOfOrigin: [{ value: null, disabled: true }], // Quê quán
            firstAndMiddleName: [{ value: null, disabled: true }], // Họ và tên đệm
            maritalStatus: [{ value: null, disabled: true }], // Tình trạng hôn nhân
            name: [{ value: null, disabled: true }], // Tên
            fullName: [{ value: null, disabled: true }], // Tên đầy đủ
            personalTax: [{ value: null, disabled: true }], // Mã số thuế cá nhân
            familyComposition: [{ value: null, disabled: true }], // Thành phần gia đình
            otherName: [{ value: null, disabled: true }], // Tên khác
            selfComposition: [{ value: null, disabled: true }], // Thành phần bản thân
            dateOfBirth: [{ value: null, disabled: true }], // Ngày sinh
            ethnicity: [{ value: null, disabled: true }], // Dân tộc
            gender: [{ value: null, disabled: true }], // Giới tính
            placeOfBirth: [{ value: null, disabled: true }], // Nơi sinh
            religion: [{ value: null, disabled: true }], // Tôn giáo
            nationality: [{ value: null, disabled: true }], // Quốc tịch
            phoneNumber: [{ value: null, disabled: true }], // Số điện thoại di động
            idType: [{ value: null, disabled: true }], // Loại giấy tờ
            idNumber: [{ value: null, disabled: true }], // Số giấy tờ
            passportNumber: [{ value: null, disabled: true }], // Số hộ chiếu
            idIssueDate: [{ value: null, disabled: true }], // Ngày cấp giấy tờ
            passportIssueDate: [{ value: null, disabled: true }], // Ngày cấp hộ chiếu
            idIssuePlace: [{ value: null, disabled: true }], // Nơi cấp giấy tờ
            passportIssuePlace: [{ value: null, disabled: true }], // Nơi cấp hộ chiếu
            idExpiryDate: [{ value: null, disabled: true }], // Ngày hết hạn giấy tờ
            passportExpiryDate: [{ value: null, disabled: true }], // Ngày hết hạn hộ chiếu
            educationLevel: [{ value: null, disabled: true }], // Trình độ văn hóa
            trainingLevel: [{ value: null, disabled: true }], // Trình độ đào tạo
            trainingPlace: [{ value: null, disabled: true }], // Nơi đào tạo
            department: [{ value: null, disabled: true }], // Khoa
            major: [{ value: null, disabled: true }], // Chuyên ngành
            graduationYear: [{ value: null, disabled: true }], // Năm tốt nghiệp
            classification: [{ value: null, disabled: true }], // Xếp loại
            bornLocation: [{ value: null, disabled: true }], // nơi sinh
        });
    }
    ngOnInit() {
        this.id = +this.router.snapshot.paramMap.get('id')!;
        const resquest = {
            Id: this.id,
        };
        this.getById(resquest);
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
            { label: 'Chi tiết' },
        ];
        this.gender = [
            { label: 'Nam', value: 1 },
            { label: 'Nữ', value: 0 },
            { label: 'Khác', value: 'other' },
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

    show() {
        console.log(1);
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }

    startLoading() {
        this.loadingService.show();
    }

    getById(resquest: any) {
        this.objectservice.getInforEmployee(resquest).subscribe((res) => {
            this.dataGetById = res;

            this.generalInfoCreateForm.patchValue({
                code: this.dataGetById.employeeCode, // Mã số nhân viên
                placeOfOrigin: this.dataGetById.address, // Quê quán
                firstAndMiddleName: this.dataGetById.lastName, // Họ và tên đệm
                maritalStatus: this.dataGetById?.profileInfo?.marriageStatus, // Tình trạng hôn nhân (cần xác định thêm)
                name: this.dataGetById.firstName, // Tên
                fullName: `${this.dataGetById.lastName} ${this.dataGetById.firstName}`, // Tên đầy đủ
                personalTax: this.dataGetById?.profileInfo.personalTaxNumber, // Mã số thuế cá nhân (chưa có dữ liệu)
                familyComposition: this.dataGetById?.profileInfo?.typeFamily, // Thành phần gia đình (chưa có dữ liệu)
                otherName: this.dataGetById?.profileInfo?.anotherName, // Tên khác (chưa có dữ liệu)
                selfComposition: this.dataGetById?.profileInfo?.typePersonal, // Thành phần bản thân (chưa có dữ liệu)
                dateOfBirth: new Date(this.dataGetById?.dateOfBirth), // Ngày sinh
                ethnicity: this.dataGetById?.profileInfo.tripe, // Dân tộc (chưa có dữ liệu)
                gender: this.dataGetById?.sex, // Giới tính
                placeOfBirth: null, // Nơi sinh (chưa có dữ liệu)
                religion: this.dataGetById?.profileInfo?.religion, // Tôn giáo (chưa có dữ liệu)
                nationality: this.dataGetById.profileInfo?.nation, // Quốc tịch (chưa có dữ liệu)
                phoneNumber: this.dataGetById?.phoneNumber, // Số điện thoại di động
                idType: this.dataGetById?.profileInfo.typePaper, // Loại giấy tờ (chưa có dữ liệu)
                idNumber: this.dataGetById.profileInfo?.paperNumber, // Số giấy tờ (chưa có dữ liệu)
                passportNumber: this.dataGetById.profileInfo?.passportNumber, // Số hộ chiếu (chưa có dữ liệu)
                idIssueDate: 
                    new Date(
                        this.dataGetById.profileInfo?.paperProvideDate
                    ),
                 // Ngày cấp giấy tờ (chưa có dữ liệu)
                passportIssueDate: 
                    new Date(this.dataGetById?.profileInfo?.passportProvideDate),
                 // Ngày cấp hộ chiếu (chưa có dữ liệu)
                idIssuePlace:
                    this.dataGetById.profileInfo?.paperProvideLocation, // Nơi cấp giấy tờ (chưa có dữ liệu)
                passportIssuePlace:
                    this.dataGetById.profileInfo?.paperProvideLocation, // Nơi cấp hộ chiếu (chưa có dữ liệu)
                idExpiryDate: new Date(
                    this.dataGetById.profileInfo?.expirePaperDate
                ), // Ngày hết hạn giấy tờ (chưa có dữ liệu)
                passportExpiryDate: new Date(
                    this.dataGetById.profileInfo?.expirePassportDate
                ), // Ngày hết hạn hộ chiếu (chưa có dữ liệu)
                educationLevel: this.dataGetById.profileInfo?.cultureLevel, // Trình độ văn hóa (chưa có dữ liệu)
                trainingLevel: this.dataGetById.profileInfo?.educationLevel, // Trình độ đào tạo (chưa có dữ liệu)
                trainingPlace:
                    this.dataGetById.profileInfo?.educationTraningLocation, // Nơi đào tạo (chưa có dữ liệu)
                department: this.dataGetById.profileInfo?.faculty, // Khoa (chưa có dữ liệu)
                major: this.dataGetById.profileInfo?.specialized, // Chuyên ngành (chưa có dữ liệu)
                graduationYear: this.dataGetById.profileInfo?.graduateDate, // Năm tốt nghiệp (chưa có dữ liệu)
                classification:
                    this.dataGetById.profileInfo?.graduationClassification, // Xếp loại (chưa có dữ liệu)
                bornLocation: this.dataGetById?.profileInfo?.bornLocation,
            });
        });
    }
}
