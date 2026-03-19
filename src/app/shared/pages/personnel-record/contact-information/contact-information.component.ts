import { ProfileService } from 'src/app/core/services/profile.service';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressService } from 'src/app/core/services/address.service';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import contactInfoConstant from 'src/app/core/constants/contact-info.constant';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-contact-information',
    templateUrl: './contact-information.component.html',
    styleUrl: './contact-information.component.scss',
})
export class ContactInformationComponent {
    items: any;
    selectedCities!: any[];
    positionVisible: boolean = false;
    status: boolean = false;
    positionAddVisible: boolean = false;
    jobTitleVisible: boolean = false;
    date: any;
    checked: boolean = false;
    // cities: any[] | undefined;

    selectedCity: any | undefined;
    allowances: any;

    //Dialog
    allowanceVisible: boolean = false;
    citiesProvider: any[] = [];

    //Địa chỉ
    cities: any[] = [];
    districts: any[] = [];
    wards: any[] = [];
    selectedCountryId!: number;
    selectedCityId!: number;
    selectedDistrictId!: number;
    selectedWardId!: number;
    nationsCurrent: any;

    //Địa chỉ hiện tại
    citiesCurrent: any[] = [];
    districtsCurrent: any[] = [];
    wardsCurrent: any[] = [];
    selectedCountryIdCurrent!: number;
    selectedCityIdCurrent!: number;
    selectedDistrictIdCurrent!: number;
    selectedWardIdCurrent!: number;

    //UserCurrent
    userCurrent: any;
    profileById: any;

    public constant: any = {
        contactInfo: contactInfoConstant,
    };
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private addressService: AddressService,
        private fb: FormBuilder,
        private profileService: ProfileService,
        private authService: AuthService,
        private messageService: MessageService
    ) {
        this.createContactForm = this.fb.group({
            phoneNumber: [null],
            employeeId: [null],
            organizationPhone: [null],
            phonePersonHome: [null],
            organizationEmail: [null],
            anotherEmail: [null],
            skype: [null],
            facebook: [null],
            anotherPhoneNumber: [null],
            personEmail: [null],
            nationId: [null],
            nation: [null],
            cityId: [null],
            city: [null],
            districtId: [null],
            district: [null],
            wardId: [null],
            ward: [null],
            streetId: [null],
            street: [null],
            address: [null],
            homeNumber: [null],
            familyNumber: [null],
            homeRegistrationNumber: [null],
            isMaster: [null],
            residenceAddress: [null],
            emailEmergency: [null],
            isAtResidenceAddress: [null],
            currentNationId: [null],
            currentNation: [null],
            currentCityId: [null],
            currentCity: [null],
            currentDistrictId: [null],
            currentDistrict: [null],
            currentWardId: [null],
            currentWard: [null],
            currentStreetId: [null],
            currentStreet: [null],
            currentHomeNumberId: [null],
            currentHomeNumber: [null],
            currentAddresss: [null],
            fullName: [null],
            relationshipId: [null],
            relationshipName: [null],
            phoneNumberEmergency: [null],
            addressEmergency: [null],
            homePhoneEmergency: [null],
            insuranceDate: [null],
            insuranceContributionRate: [null],
            healthInsuranceNumber: [null],
            socialInsuranceNumber: [null],
            healthInsuranceCardNumber: [null],
            socialSecurityNumber: [null],
            isSyndicate: [null],
            issuranceStatus: [null],
            cityProvide: [null],
            cityProvideId: [null],
            cityProvideCode: [{ value: null, disabled: true }],
            heathcareRegistractionCode: [null],
            heathcareRegistractionLocation: [null],
            heathcareRegistracionNumber: [null],
            sameRegistration: [null],
        });

        // this.authService.userCurrent.subscribe((user) => {
        //     this.userCurrent = user;
        // });
    }

    ngOnInit() {
        // this.getCitiesByCountry(1);

        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
            // this.userCurrent?.employee?.id;

            this.profileService
                .getProfileByCustomerId({ id: user?.employee?.id })
                .subscribe((response) => {
                    this.profileById = response?.contactInfo;
                    this.getCitiesByCountry(1);
                    if (this.profileById?.cityId) {
                        this.getDistrictsByCity(this.profileById?.cityId);
                    }

                    if (this.profileById?.districtId) {
                        this.getWardsByDistrict(this.profileById?.districtId);
                    }
                    this.getCitiesByCountryCurrent(1);
                    if (this.profileById?.currentCityId) {
                        this.getDistrictsByCityCurrent(
                            this.profileById?.currentCityId
                        );
                    }

                    if (this.profileById?.currentDistrictId) {
                        this.getWardsByDistrictCurrent(
                            this.profileById?.currentDistrictId
                        );
                    }
                    console.log(response.phoneNumber);
                    this.createContactForm = this.fb.group({
                        employeeId: [this.profileById?.employeeId || null],
                        phoneNumber: [response.phoneNumber || null],
                        organizationPhone: [
                            this.profileById?.organizationPhone || null,
                        ],
                        phonePersonHome: [
                            this.profileById?.phonePersonHome || null,
                        ],
                        organizationEmail: [
                            this.profileById?.organizationEmail || null,
                        ],
                        anotherPhoneNumber: [
                            this.profileById?.anotherPhoneNumber || null,
                        ],
                        anotherEmail: [this.profileById?.anotherEmail || null],
                        skype: [this.profileById?.skype || null],
                        facebook: [this.profileById?.facebook || null],
                        personEmail: [
                            {
                                value: response.personalEmail || null,
                                disabled: true,
                            },
                        ],
                        nationId: [this.profileById?.nationId || null],
                        nation: [this.profileById?.nation || null],
                        cityId: [
                            this.cities.find(
                                (city) => city.id === this.profileById?.cityId
                            ) || null,
                        ],
                        city: [this.profileById?.cityId?.name || null],
                        districtId: [
                            this.districts.find(
                                (city) =>
                                    city.id === this.profileById?.districtId
                            ) || null,
                        ],
                        district: [this.profileById?.districtId?.name || null],
                        wardId: [
                            this.wards.find(
                                (city) => city.id === this.profileById?.wardId
                            ) || null,
                        ],
                        ward: [this.profileById?.wardId?.name || null],
                        streetId: [this.profileById?.streetId || null],
                        street: [this.profileById?.street || null],
                        address: [this.profileById?.address || null],
                        homeNumber: [this.profileById?.homeNumber || null],
                        familyNumber: [this.profileById?.familyNumber || null],
                        emailEmergency: [
                            this.profileById?.emailEmergency || null,
                        ],
                        homeRegistrationNumber: [
                            this.profileById?.homeRegistrationNumber || null,
                        ],
                        isMaster: [this.profileById?.isMaster || null],
                        residenceAddress: [
                            this.profileById?.residenceAddress || null,
                        ],
                        isAtResidenceAddress: [
                            this.profileById?.isAtResidenceAddress || null,
                        ],
                        currentNationId: [
                            this.profileById?.currentNationId || null,
                        ],
                        currentNation: [
                            this.profileById?.currentNation || null,
                        ],
                        currentCityId: [
                            this.profileById?.currentCityId || null,
                        ],
                        currentCity: [this.profileById?.currentCity || null],
                        currentDistrictId: [
                            this.profileById?.currentDistrictId || null,
                        ],
                        currentDistrict: [
                            this.profileById?.currentDistrict || null,
                        ],
                        currentWardId: [
                            this.wardsCurrent.find(
                                (city) =>
                                    city.id === this.profileById?.currentWardId
                            ) || null,
                        ],
                        currentWard: [this.profileById?.currentWard || null],
                        currentStreetId: [
                            this.profileById?.currentStreetId || null,
                        ],
                        currentStreet: [
                            this.profileById?.currentStreet || null,
                        ],
                        currentHomeNumberId: [
                            this.profileById?.currentHomeNumberId || null,
                        ],
                        currentHomeNumber: [
                            this.profileById?.currentHomeNumber || null,
                        ],
                        currentAddresss: [
                            this.profileById?.currentAddresss || null,
                        ],
                        fullName: [this.profileById?.fullName || null],
                        relationshipId: [
                            this.profileById?.relationshipId || null,
                        ],
                        relationshipName: [
                            this.profileById?.relationshipName || null,
                        ],
                        phoneNumberEmergency: [
                            this.profileById?.phoneNumberEmergency || null,
                        ],
                        addressEmergency: [
                            this.profileById?.addressEmergency || null,
                        ],
                        homePhoneEmergency: [
                            this.profileById?.homePhoneEmergency || null,
                        ],
                        insuranceDate: [
                            new Date(this.profileById?.insuranceDate) || null,
                        ],
                        insuranceContributionRate: [
                            this.profileById?.insuranceContributionRate || null,
                        ],
                        healthInsuranceNumber: [
                            this.profileById?.healthInsuranceNumber || null,
                        ],
                        socialInsuranceNumber: [
                            this.profileById?.socialInsuranceNumber || null,
                        ],
                        healthInsuranceCardNumber: [
                            this.profileById?.healthInsuranceCardNumber || null,
                        ],
                        socialSecurityNumber: [
                            this.profileById?.socialSecurityNumber || null,
                        ],
                        isSyndicate: [this.profileById?.isSyndicate || null],
                        issuranceStatus: [
                            this.profileById?.issuranceStatus || null,
                        ],
                        cityProvide: [
                            this.cities.find(
                                (city) =>
                                    city.id === this.profileById?.cityProvide
                            ) || null,
                        ],
                        cityProvideId: [
                            this.citiesProvider.find(
                                (city) =>
                                    city.id === this.profileById?.cityProvideId
                            ) || null,
                        ],
                        cityProvideCode: [
                            {
                                value:
                                    this.profileById?.cityProvideCode || null,
                                disabled: true,
                            },
                        ],
                        heathcareRegistractionCode: [
                            this.profileById?.heathcareRegistractionCode ||
                                null,
                        ],
                        heathcareRegistractionLocation: [
                            this.profileById?.heathcareRegistractionLocation ||
                                null,
                        ],
                        heathcareRegistracionNumber: [
                            this.profileById?.heathcareRegistracionNumber ||
                                null,
                        ],
                        sameRegistration: [false],
                    });

                    this.createContactForm
                        .get('sameRegistration')
                        ?.valueChanges.subscribe((isSame) => {
                            if (isSame) {
                                this.districtsCurrent = this.districts;
                                this.wardsCurrent = this.wards;
                                // Disable và gán giá trị của các trường tương ứng
                                this.createContactForm
                                    .get('currentNationId')
                                    ?.setValue(
                                        this.createContactForm.get('nationId')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentNationId')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentNation')
                                    ?.setValue(
                                        this.createContactForm.get('nation')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentNation')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentCityId')
                                    ?.setValue(
                                        this.createContactForm.get('cityId')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentCityId')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentCity')
                                    ?.setValue(
                                        this.createContactForm.get('city')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentCity')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentDistrictId')
                                    ?.setValue(
                                        this.createContactForm.get('districtId')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentDistrictId')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentDistrict')
                                    ?.setValue(
                                        this.createContactForm.get('district')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentDistrict')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentWardId')
                                    ?.setValue(
                                        this.createContactForm.get('wardId')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentWardId')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentWard')
                                    ?.setValue(
                                        this.createContactForm.get('ward')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentWard')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentStreetId')
                                    ?.setValue(
                                        this.createContactForm.get('streetId')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentStreetId')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentStreet')
                                    ?.setValue(
                                        this.createContactForm.get('street')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentStreet')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentHomeNumberId')
                                    ?.setValue(
                                        this.createContactForm.get('homeNumber')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentHomeNumberId')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentHomeNumber')
                                    ?.setValue(
                                        this.createContactForm.get('homeNumber')
                                            ?.value
                                    );
                                // this.createContactForm
                                //     .get('currentHomeNumber')
                                //     ?.disable();

                                this.createContactForm
                                    .get('currentAddresss')
                                    ?.setValue(
                                        this.createContactForm.get(
                                            'residenceAddress'
                                        )?.value
                                    );
                                // this.createContactForm
                                //     .get('currentAddresss')
                                //     ?.disable();

                                console.log(this.createContactForm.value);
                            } else {
                                // Enable tất cả các trường liên quan
                                this.createContactForm
                                    .get('currentNationId')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentNation')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentCityId')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentCity')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentDistrictId')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentDistrict')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentWardId')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentWard')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentStreetId')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentStreet')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentHomeNumberId')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentHomeNumber')
                                    ?.enable();
                                this.createContactForm
                                    .get('currentAddresss')
                                    ?.enable();

                                // this.createContactForm.get('nationId')?.enable();
                                // this.createContactForm.get('nation')?.enable();
                                // this.createContactForm.get('cityId')?.enable();
                                // this.createContactForm.get('city')?.enable();
                                // this.createContactForm.get('districtId')?.enable();
                                // this.createContactForm.get('district')?.enable();
                                // this.createContactForm.get('wardId')?.enable();
                                // this.createContactForm.get('ward')?.enable();
                                // this.createContactForm.get('streetId')?.enable();
                                // this.createContactForm.get('street')?.enable();
                                // this.createContactForm.get('homeNumberId')?.enable();
                                // this.createContactForm.get('homeNumber')?.enable();
                                // this.createContactForm.get('addresss')?.enable();
                            }
                        });
                });
        });
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Thêm mới' },
        ];
        // this.cities = [{ name: 'Việt Nam', code: 'VN' }];
        this.loadPositionGroups();
        this.loadPosition();
        this.loadUnit();
        // this.getCitiesByCountry(1);
    }
    // setupDisableFields() {
    //     const fieldsToCompare = [
    //         { key: 'nationId', currentKey: 'currentNationId' },
    //         { key: 'nation', currentKey: 'currentNation' },
    //         { key: 'cityId', currentKey: 'currentCityId' },
    //         { key: 'city', currentKey: 'currentCity' },
    //         { key: 'districtId', currentKey: 'currentDistrictId' },
    //         { key: 'district', currentKey: 'currentDistrict' },
    //         { key: 'wardId', currentKey: 'currentWardId' },
    //         { key: 'ward', currentKey: 'currentWard' },
    //         { key: 'streetId', currentKey: 'currentStreetId' },
    //         { key: 'street', currentKey: 'currentStreet' },
    //         { key: 'homeNumber', currentKey: 'currentHomeNumber' },
    //         { key: 'residenceAddress', currentKey: 'currentAddresss' },
    //     ];

    //     this.createContactForm
    //         .get('sameRegistration')
    //         ?.valueChanges.subscribe((isSame) => {
    //             if (isSame) {
    //                 let allFieldsMatch = true;

    //                 // Kiểm tra từng cặp trường
    //                 for (const field of fieldsToCompare) {
    //                     const originalValue = this.createContactForm.get(
    //                         field.key
    //                     )?.value;
    //                     const currentValue = this.createContactForm.get(
    //                         field.currentKey
    //                     )?.value;

    //                     // Nếu bất kỳ cặp nào không khớp
    //                     if (originalValue !== currentValue) {
    //                         allFieldsMatch = false;
    //                         break;
    //                     }
    //                 }

    //                 if (!allFieldsMatch) {
    //                     // Tắt sameRegistration nếu có trường không khớp
    //                     this.createContactForm
    //                         .get('sameRegistration')
    //                         ?.setValue(false, { emitEvent: false });
    //                     console.warn(
    //                         'Fields do not match. "sameRegistration" has been disabled.'
    //                     );
    //                     return;
    //                 }

    //                 // Nếu tất cả khớp, tiếp tục xử lý
    //                 this.districtsCurrent = this.districts;
    //                 this.wardsCurrent = this.wards;

    //                 for (const field of fieldsToCompare) {
    //                     const originalValue = this.createContactForm.get(
    //                         field.key
    //                     )?.value;
    //                     this.createContactForm
    //                         .get(field.currentKey)
    //                         ?.setValue(originalValue);
    //                     this.createContactForm.get(field.currentKey)?.disable();
    //                 }

    //                 console.log(
    //                     'All fields match. Form updated and fields disabled.'
    //                 );
    //             } else {
    //                 // Bật lại tất cả các trường khi "sameRegistration" là false
    //                 for (const field of fieldsToCompare) {
    //                     this.createContactForm.get(field.currentKey)?.enable();
    //                 }
    //                 console.log(
    //                     '"sameRegistration" is false. Fields re-enabled.'
    //                 );
    //             }
    //         });
    // }

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
    //api
    validationMessages = {
        phoneNumber: [
            {
                type: 'required',
                message: 'Mật khẩu nhập lại không được để trống',
            },
            { type: 'maxlength', message: 'Quá nhiều kí tự' },
            {
                type: 'minlength',
                message: 'Quá ít kí tự-Mật khẩu phải có ít nhất 8 kí tự',
            },
            {
                type: 'pattern',
                message:
                    'Mật khẩu phải bao gồm cả số và chữ, không chứa khoảng trắng hoặc ký tự đặc biệt',
            },
        ],
    };
    createContactForm: FormGroup;
    handleCreateContactRequest() {}
    onSubmit(): void {
        this.createContactForm.value.employeeId = this.userCurrent.employee.id;
        console.log(this.createContactForm.value);
        const formData = {
            employeeId: this.createContactForm.value?.employeeId,
            organizationPhone: this.createContactForm.value?.organizationPhone,
            phonePersonHome: this.createContactForm.value?.phonePersonHome,
            organizationEmail: this.createContactForm.value?.organizationEmail,
            anotherEmail: this.createContactForm.value?.anotherEmail,
            skype: this.createContactForm.value?.skype,
            facebook: this.createContactForm.value?.facebook,
            personEmail: this.createContactForm.value?.personEmail,
            nationId: this.createContactForm.value?.nationId,
            nation: this.createContactForm.value?.nation,

            cityId: this.createContactForm.value?.cityId?.id,
            city: this.createContactForm.value?.cityId?.name,

            districtId: this.createContactForm.value?.districtId?.id,
            district: this.createContactForm.value?.districtId?.name,

            wardId: this.createContactForm.value?.wardId?.id,
            ward: this.createContactForm.value?.wardId?.name,
            streetId: this.createContactForm.value?.streetId,
            address: this.createContactForm.value?.address,
            homeNumber: this.createContactForm.value?.homeNumber,

            //Địa chỉ hiện tại

            currentNationId: this.createContactForm.value?.currentNationId?.id,
            currentNation: this.createContactForm.value?.currentNationId?.name,
            currentCityId: this.createContactForm.value?.currentCityId?.id,
            currentCity: this.createContactForm.value?.currentCityId?.name,
            currentDistrictId:
                this.createContactForm.value?.currentDistrictId?.id,
            currentDistrict:
                this.createContactForm.value?.currentDistrict?.name,
            currentWardId: this.createContactForm.value?.currentWardId?.id,
            currentWard: this.createContactForm.value?.currentWardId?.name,

            currentStreetId: this.createContactForm.value?.currentStreetId?.id,
            currentStreet: this.createContactForm.value?.currentStreet?.name,
            currentHomeNumberId:
                this.createContactForm.value?.currentHomeNumberId?.name,
            currentHomeNumber: this.createContactForm.value?.currentHomeNumber,
            currentAddresss: this.createContactForm.value?.currentAddresss,

            //Địa chỉ hiện tại

            familyNumber: this.createContactForm.value?.familyNumber,
            homeRegistrationNumber:
                this.createContactForm.value?.homeRegistrationNumber,
            isMaster: this.createContactForm.value?.isMaster,
            residenceAddress: this.createContactForm.value?.residenceAddress,
            isAtResidenceAddress:
                this.createContactForm.value?.isAtResidenceAddress,
            fullName: this.createContactForm.value?.fullName,
            relationshipId: this.createContactForm.value?.relationshipId,
            relationshipName: this.createContactForm.value?.relationshipName,
            phoneNumberEmergency:
                this.createContactForm.value?.phoneNumberEmergency,
            addressEmergency: this.createContactForm.value?.addressEmergency,
            homePhoneEmergency:
                this.createContactForm.value?.homePhoneEmergency,
            insuranceDate: this.createContactForm.value?.insuranceDate,
            insuranceContributionRate:
                this.createContactForm.value?.insuranceContributionRate,
            healthInsuranceNumber:
                this.createContactForm.value?.healthInsuranceNumber,
            socialInsuranceNumber:
                this.createContactForm.value?.socialInsuranceNumber,
            healthInsuranceCardNumber:
                this.createContactForm.value?.healthInsuranceCardNumber,
            socialSecurityNumber:
                this.createContactForm.value?.socialSecurityNumber,
            isSyndicate: this.createContactForm.value?.isSyndicate,
            issuranceStatus: this.createContactForm.value?.issuranceStatus,
            cityProvide: this.createContactForm.value?.cityProvide?.id,
            cityProvideId: this.createContactForm.value?.cityProvide?.id,
            cityProvideCode: this.createContactForm.value?.cityProvide?.code,
            heathcareRegistractionCode:
                this.createContactForm.value?.heathcareRegistractionCode,
            heathcareRegistractionLocation:
                this.createContactForm.value?.heathcareRegistractionLocation,
            heathcareRegistracionNumber:
                this.createContactForm.value?.heathcareRegistracionNumber,
            sameRegistration: this.createContactForm.value?.sameRegistration,
            emailEmergency: this.createContactForm.value?.emailEmergency,
            anotherPhoneNumber:
                this.createContactForm.value?.anotherPhoneNumber,
        };
        console.log(formData);
        this.profileService
            .updateContactInfo({ id: this.profileById?.id }, formData)
            .subscribe((items) => {
                // this.toastService.showSuccess(
                //     'Thành công',
                //     'Thêm mới thông tin liên hệ thành công!'
                // );

                this.messageService.add({
                    severity: 'success',
                    summary: 'Thông báo',
                    detail: 'Cập nhật thông tin liên hệ thành công!',
                });
            });
    }

    getCitiesByCountry(countryId: number) {
        this.addressService
            .getCitiesByIdCountry({ id: countryId })
            .subscribe((response) => {
                this.cities = response.data;
                this.citiesProvider = response.data;
                // this.citiesCurrent = response.data;
                // console.log(this.cities);
                // console.log(
                //     this.cities.find(
                //         (city) => city.id === this.profileById?.cityId
                //     )
                // );

                this.createContactForm
                    .get('cityId')
                    ?.setValue(
                        this.cities.find(
                            (city) => city.id === this.profileById?.cityId
                        )
                    );

                // console.log(this.profileById);
                // console.log(
                //     this.cities.find(
                //         (city) => city.id === this.profileById?.cityProvideId
                //     )
                // );
                this.createContactForm
                    .get('cityProvideId')
                    ?.setValue(
                        this.cities.find(
                            (city) =>
                                city.id === this.profileById?.cityProvideId
                        )
                    );

                // this.createContactForm
                //     .get('currentCityId')
                //     ?.setValue(
                //         this.citiesCurrent.find(
                //             (city) =>
                //                 city.id === this.profileById?.currentCityId
                //         )
                //     );
            });
    }

    getDistrictsByCity(cityId: number) {
        this.addressService
            .getDistrictsByIdCity({ cityId: cityId })
            .subscribe((districts) => {
                this.districts = districts.data;

                this.createContactForm
                    .get('districtId')
                    ?.setValue(
                        this.districts.find(
                            (city) => city.id === this.profileById?.districtId
                        )
                    );
            });
    }

    getWardsByDistrict(districtId: number) {
        this.addressService
            .getWardsByIdDistrict({ districtId: districtId })
            .subscribe((wards) => {
                this.wards = wards.data;

                this.createContactForm
                    .get('wardId')
                    ?.setValue(
                        this.wards.find(
                            (city) => city.id === this.profileById?.wardId
                        )
                    );
            });
    }

    onCountryChange(countryId: number) {
        this.selectedCountryId = countryId;
        this.getCitiesByCountry(countryId);
        this.districts = [];
        this.wards = [];
    }

    onCityChange(data: any) {
        console.log(data);
        this.selectedCityId = data.value.id;
        this.getDistrictsByCity(data.value.id);
        this.districts = [];
        this.wards = [];

        console.log(this.districts);
        this.createContactForm.get('wardId')?.setValue(null);
        this.createContactForm.get('districtId')?.setValue(null);
    }

    onDistrictChange(districtId: any) {
        this.selectedDistrictId = districtId.value.id;
        this.getWardsByDistrict(districtId.value.id);
        this.wards = [];
        this.createContactForm.get('wardId')?.setValue(null);
    }

    onClearCity() {
        this.createContactForm.get('wardId')?.setValue(null);
        this.createContactForm.get('districtId')?.setValue(null);

        this.districts = [];
        this.wards = [];
    }

    onClearDistrict() {
        this.wards = [];
        this.createContactForm.get('wardId')?.setValue(null);
    }

    onClearWard() {
        this.createContactForm.get('wardId')?.setValue(null);
    }
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////
    // Địa chỉ hiện tại
    getCitiesByCountryCurrent(countryId: number) {
        this.addressService
            .getCitiesByIdCountry({ id: countryId })
            .subscribe((cities) => {
                this.citiesCurrent = cities.data;
                this.createContactForm
                    .get('currentCityId')
                    ?.setValue(
                        this.citiesCurrent.find(
                            (city) =>
                                city.id === this.profileById?.currentCityId
                        )
                    );
            });
    }

    getDistrictsByCityCurrent(cityId: number) {
        this.addressService
            .getDistrictsByIdCity({ cityId: cityId })
            .subscribe((districts) => {
                this.districtsCurrent = districts.data;

                console.log(this.districtsCurrent);
                this.createContactForm
                    .get('currentDistrictId')
                    ?.setValue(
                        this.districtsCurrent.find(
                            (city) =>
                                city.id === this.profileById?.currentDistrictId
                        )
                    );
            });
    }

    getWardsByDistrictCurrent(districtId: number) {
        this.addressService
            .getWardsByIdDistrict({ districtId: districtId })
            .subscribe((wards) => {
                this.wardsCurrent = wards.data;
                this.createContactForm
                    .get('currentWardId')
                    ?.setValue(
                        this.wardsCurrent.find(
                            (city) =>
                                city.id === this.profileById?.currentWardId
                        )
                    );
            });
    }

    onCountryChangeCurrent(countryId: number) {
        this.selectedCountryId = countryId;
        this.getCitiesByCountry(countryId);
        this.districtsCurrent = [];
        this.wardsCurrent = [];
    }

    onCityChangeCurrent(data: any) {
        this.selectedCityId = data.value.id;
        this.getDistrictsByCityCurrent(data.value.id);
        this.districtsCurrent = [];
        this.wardsCurrent = [];

        console.log(this.districts);
        this.createContactForm.get('currentWardId')?.setValue(null);
        this.createContactForm.get('currentDistrictId')?.setValue(null);
    }

    onDistrictChangeCurrent(districtId: any) {
        this.selectedDistrictId = districtId.value.id;
        this.getWardsByDistrictCurrent(districtId.value.id);
        this.wardsCurrent = [];
        this.createContactForm.get('currentWardId')?.setValue(null);
    }

    onClearCityCurrent() {
        this.createContactForm.get('currentWardId')?.setValue(null);
        this.createContactForm.get('currentDistrictId')?.setValue(null);

        this.districtsCurrent = [];
        this.wardsCurrent = [];
    }

    onClearDistrictCurrent() {
        this.wardsCurrent = [];
        this.createContactForm.get('currentWardId')?.setValue(null);
    }

    onClearWardCurrent() {
        this.createContactForm.get('currentWardId')?.setValue(null);
    }

    onCityChangeProvider(data: any) {
        this.createContactForm.get('cityProvide').setValue(data?.value);
        const control = this.createContactForm.get('cityProvideCode');
        if (control) {
            control.setValue(data?.value?.code);
        } else {
            console.warn('cityProvide control does not exist!');
        }
    }

    onClearCityProvider() {
        this.createContactForm.get('cityProvide')?.setValue(null);
    }
}
