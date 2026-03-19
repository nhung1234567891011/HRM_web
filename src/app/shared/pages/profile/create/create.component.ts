import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import {
    dateOfBirthValidator,
    noWhitespaceValidator,
} from 'src/app/shared/validator';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
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
    generalInfoCreateForm: FormGroup;
    //Dialog
    allowanceVisible: boolean = false;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder
    ) {}
    ngOnInit() {
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Thêm mới' },
        ];
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
        ];

        this.gender = [
            { label: 'Nam', value: 'male' },
            { label: 'Nữ', value: 'female' },
            { label: 'Khác', value: 'other' },
        ];
        this.loadPositionGroups();
        this.loadPosition();
        this.loadUnit();

        this.generalInfoCreateForm = this.formBuilder.group({
            // Thông tin chung
            code: [null], // Mã số nhân viên
            placeOfOrigin: [null], // Quê quán
            firstAndMiddleName: [
                null,
                [Validators.required, noWhitespaceValidator()],
            ], // Họ và tên đệm
            maritalStatus: [null], // Tình trạng hôn nhân
            name: [null, [Validators.required, noWhitespaceValidator()]], // Tên
            fullName: [null], // Tên đầy đủ
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
            major: [null], // Chuyên ngành
            graduationYear: [null], // Năm tốt nghiệp
            department: [null], // Khoa
            classification: [null], // Xếp loại

            //Contact Information
            mobilePhone: [null], // Mobile Phone
            workPhone: [null], // Work Phone
            homePhone: [null], // Home Phone
            otherPhone: [null], // Other Phone
            workEmail: [null], // Work Email
            personalEmail: [null], // Personal Email
            otherEmail: [null], // Other Email
            skype: [null], // Skype
            facebook: [null], // Facebook

            // Household Registration Information
            country: [null], // Country
            provinceCity: [null], // Province/City
            district: [null], // District
            ward: [null], // Ward/Commune
            street: [null], // House Number, Street
            householdNumber: [null], // Household Number
            familyCode: [null], // Family Code
            isHouseholdHead: [false], // Is Household Head
            permanentAddress: [null], // Permanent Address (HKTT)
        });
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
    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'auto' });
        }
    }
}
