import { ProfileService } from 'src/app/core/services/profile.service';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-contact-information',
//   templateUrl: './contact-information.component.html',
//   styleUrl: './contact-information.component.scss'
// })
// export class ContactInformationComponent {

// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressService } from 'src/app/core/services/address.service';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ActivatedRoute } from '@angular/router';
import { ObjectService } from 'src/app/core/services/object.service';

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
    id: number;
    dataGetById: any;
    listSercurity: any;
    createContactForm: FormGroup;
    relationship;
    any;
    constructor(
        private toastService: ToastService,
        private loadingService: LoadingService,
        private addressService: AddressService,
        private fb: FormBuilder,
        private profileService: ProfileService,
        private router: ActivatedRoute,
        private objectservice: ObjectService
    ) {
        this.createContactForm = this.fb.group({
            employeeId: [{ value: null, disabled: true }],
            phoneNumber: [{ value: null, disabled: true }],
            organizationPhone: [{ value: null, disabled: true }],
            phonePersonHome: [{ value: null, disabled: true }],
            organizationEmail: [{ value: null, disabled: true }],
            anotherEmail: [{ value: null, disabled: true }],
            skype: [{ value: null, disabled: true }],
            facebook: [{ value: null, disabled: true }],
            personEmail: [{ value: null, disabled: true }],
            nationId: [{ value: null, disabled: true }],
            cityProvideId: [{ value: null, disabled: true }],
            // nation: [{ value: null, disabled: true }],
            cityId: [{ value: null, disabled: true }],
            city: [{ value: null, disabled: true }],
            districtId: [{ value: null, disabled: true }],
            district: [{ value: null, disabled: true }],
            wardId: [{ value: null, disabled: true }],
            ward: [{ value: null, disabled: true }],
            streetId: [{ value: null, disabled: true }],
            street: [{ value: null, disabled: true }],
            address: [{ value: null, disabled: true }],
            homeNumber: [{ value: null, disabled: true }],
            familyNumber: [{ value: null, disabled: true }],
            homeRegistrationNumber: [{ value: null, disabled: true }],
            isMaster: [{ value: null, disabled: true }],
            residenceAddress: [{ value: null, disabled: true }],
            isAtResidenceAddress: [{ value: null, disabled: true }],
            currentNationId: [{ value: null, disabled: true }],
            currentNation: [{ value: null, disabled: true }],
            currentCityId: [{ value: null, disabled: true }],
            currentCity: [{ value: null, disabled: true }],
            currentDistrictId: [{ value: null, disabled: true }],
            currentDistrict: [{ value: null, disabled: true }],
            currentWardId: [{ value: null, disabled: true }],
            currentWard: [{ value: null, disabled: true }],
            currentStreetId: [{ value: null, disabled: true }],
            currentStreet: [{ value: null, disabled: true }],
            currentHomeNumberId: [{ value: null, disabled: true }],
            currentHomeNumber: [{ value: null, disabled: true }],
            currentAddresss: [{ value: null, disabled: true }],
            fullName: [{ value: null, disabled: true }],
            relationshipId:  [{ value: null, disabled: true }],
            relationshipName: [{ value: null, disabled: true }],
            phoneNumberEmergency: [{ value: null, disabled: true }],
            addressEmergency: [{ value: null, disabled: true }],
            homePhoneEmergency: [{ value: null, disabled: true }],
            insuranceDate:  [{ value: null, disabled: true }],
            insuranceContributionRate: [{ value: null, disabled: true }],
            healthInsuranceNumber: [{ value: null, disabled: true }],
            socialInsuranceNumber: [{ value: null, disabled: true }],
            healthInsuranceCardNumber: [{ value: null, disabled: true }],
            socialSecurityNumber: [{ value: null, disabled: true }],
            isSyndicate: [{ value: null, disabled: true }],
            issuranceStatus: [{ value: null, disabled: true }],
            cityProvide: [{ value: null, disabled: true }],
            cityProvideCode: [{ value: null, disabled: true }],
            heathcareRegistractionCode: [{ value: null, disabled: true }],
            heathcareRegistractionLocation: [{ value: null, disabled: true }],
            heathcareRegistracionNumber: [{ value: null, disabled: true }],
            emailEmergency: [{ value: null, disabled: true }],
            anotherPhoneNumber: [{ value: null, disabled: true }],
            checkboxTreefamily:[{ value: null, disabled: true }]
        });
        this.listSercurity = [
            { title: 'Đang tham gia', code: 1 },
            { title: 'Đang nghỉ thai sản ', code: 2 },
            { title: 'Đang nghỉ ốm ', code: 3 },
            { title: 'Đang nghỉ không lương', code: 4 },
            { title: 'Đã nghỉ việc', code: 5 },
            { title: 'Không tham gia', code: 6 },
        ];

        this.relationship = [
            {
                label: 'Là cha',
                value: 1,
            },
            {
                label: 'Là mẹ',
                value: 2,
            },
            {
                label: 'Là con trai',
                value: 3,
            },
            {
                label: 'Là con gái',
                value: 4,
            },
            {
                label: 'Là anh trai',
                value: 5,
            },
            {
                label: 'Là chị gái',
                value: 6,
            },
            {
                label: 'Là em trai',
                value: 7,
            },
            {
                label: 'Là em gái',
                value: 8,
            },
            {
                label: 'Là ông nội',
                value: 9,
            },
            {
                label: 'Là bà nội',
                value: 10,
            },
            {
                label: 'Là ông ngoại',
                value: 11,
            },
            {
                label: 'Là bà ngoại',
                value: 12,
            },
            {
                label: 'Là cháu trai',
                value: 13,
            },
            {
                label: 'Là cháu gái',
                value: 14,
            },
            {
                label: 'Là bạn bè',
                value: 15,
            },
            {
                label: 'Là đồng nghiệp',
                value: 16,
            },
            {
                label: 'Là vợ',
                value: 17,
            },
            {
                label: 'Là chồng',
                value: 18,
            },
            {
                label: 'Là người yêu',
                value: 19,
            },
        ];
    }

    ngOnInit() {
        this.id = +this.router.snapshot.paramMap.get('id')!;
        const resquest = {
            Id: this.id,
        };
        this.getById(resquest);
        this.items = [
            { label: 'Thông tin nhân sự' },
            { label: 'Hồ sơ', routerLink: '/profile' },
            { label: 'Chi tiết' },
        ];
        this.loadPositionGroups();
        this.loadPosition();
        this.loadUnit();
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

    handleCreateContactRequest() {}

    onSubmit(): void {
        console.log(this.createContactForm.value);

        this.profileService
            .createContactInfo(this.createContactForm.value)
            .subscribe((items) => {
                this.toastService.showSuccess(
                    'Thành công',
                    'Thêm mới thông tin liên hệ thành công!'
                );
            });
    }

    // getCitiesByCountry(countryId: number) {
    //     this.addressService
    //         .getCitiesByIdCountry({ id: countryId })
    //         .subscribe((cities) => {
    //             this.cities = cities.data;
    //             //console.log(cities)
    //         });
    // }

    getDistrictsByCity(cityId: number) {
        this.addressService
            .getDistrictsByIdCity({ cityId: cityId })
            .subscribe((districts) => {
                this.districts = districts.data;
            });
    }

    getWardsByDistrict(districtId: number) {
        this.addressService
            .getWardsByIdDistrict({ districtId: districtId })
            .subscribe((wards) => {
                this.wards = wards.data;
            });
    }

    onCountryChange(countryId: number) {
        this.selectedCountryId = countryId;
        this.getCitiesByCountry(countryId);
        this.districts = [];
        this.wards = [];
    }

    onCityChange(data: any) {
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
    citiesProvider: any;
    namecity: string;
    getCitiesByCountry(countryId: number) {
        this.addressService
            .getCitiesByIdCountry({ id: countryId })
            .subscribe((response) => {
                this.cities = response.data;
                this.citiesProvider = response.data;
                console.log(
                    this.citiesProvider.find(
                        (city) =>
                            city.id ===
                            this.dataGetById?.contactInfo?.cityProvideId
                    )
                );
                this.createContactForm
                    .get('cityProvideId')
                    ?.setValue(
                        this.cities.find(
                            (city) =>
                                city.id ===
                                this.dataGetById?.contactInfo?.cityProvideId
                        ).name
                    );
            });

    }

    getDistrictsByCityCurrent(cityId: number) {
        this.addressService
            .getDistrictsByIdCity({ cityId: cityId })
            .subscribe((districts) => {
                this.districtsCurrent = districts.data;
            });
    }

    getWardsByDistrictCurrent(districtId: number) {
        this.addressService
            .getWardsByIdDistrict({ districtId: districtId })
            .subscribe((wards) => {
                this.wardsCurrent = wards.data;
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
        this.getDistrictsByCity(data.value.id);
        this.districtsCurrent = [];
        this.wardsCurrent = [];

        console.log(this.districts);
        this.createContactForm.get('wardId')?.setValue(null);
        this.createContactForm.get('districtId')?.setValue(null);
    }

    onDistrictChangeCurrent(districtId: any) {
        this.selectedDistrictId = districtId.value.id;
        this.getWardsByDistrict(districtId.value.id);
        this.wardsCurrent = [];
        this.createContactForm.get('wardId')?.setValue(null);
    }

    onClearCityCurrent() {
        this.createContactForm.get('wardId')?.setValue(null);
        this.createContactForm.get('districtId')?.setValue(null);

        this.districtsCurrent = [];
        this.wardsCurrent = [];
    }

    onClearDistrictCurrent() {
        this.wardsCurrent = [];
        this.createContactForm.get('wardId')?.setValue(null);
    }

    onClearWardCurrent() {
        this.createContactForm.get('wardId')?.setValue(null);
    }

    getById(resquest: any) {
        this.objectservice.getInforEmployee(resquest).subscribe((res) => {
            this.dataGetById = res;
            // console.log(this.createContactForm.get('cityProvide'));

            // console.log(
            //     this.cities.find(
            //         (city) =>
            //             city.id === this.dataGetById?.contactInfo?.cityProvideId
            //     )
            // );

            this.getCitiesByCountry(1);

            // this.createContactForm
            //     .get('cityProvideId')
            //     ?.setValue(
            //         this.cities.find(
            //             (city) =>
            //                 city.id ===
            //                 this.dataGetById?.contactInfo?.cityProvideId
            //         )
            //     );
            console.log();
            this.createContactForm.patchValue({
                employeeId: [null],
                phoneNumber: this.dataGetById?.phoneNumber,
                organizationPhone:
                    this.dataGetById?.contactInfo?.organizationPhone,
                phonePersonHome: this.dataGetById?.contactInfo?.phonePersonHome,
                anotherPhoneNumber:
                    this.dataGetById?.contactInfo?.anotherPhoneNumber,
                organizationEmail:
                    this.dataGetById?.contactInfo?.organizationEmail,
                anotherEmail: this.dataGetById?.contactInfo?.anotherEmail,
                skype: this.dataGetById?.contactInfo?.skype,
                facebook: this.dataGetById?.contactInfo?.facebook,
                personEmail: this.dataGetById?.accountEmail,
                nationId: this.dataGetById?.contactInfo?.nationId,
                // nation: this.dataGetById?.contactInfo?.nation,
                cityId: this.dataGetById?.contactInfo?.cityId,
                city: this.dataGetById?.contactInfo?.city,
                districtId: this.dataGetById?.contactInfo?.districtId,
                district: this.dataGetById?.contactInfo?.district,
                wardId: this.dataGetById?.contactInfo?.wardId,
                ward: this.dataGetById?.contactInfo?.ward,
                streetId: this.dataGetById?.contactInfo?.streetId,
                street: this.dataGetById?.contactInfo?.street,
                address: this.dataGetById?.contactInfo?.address,
                homeNumber: this.dataGetById?.contactInfo?.homeNumber,
                familyNumber: this.dataGetById?.contactInfo?.familyNumber,
                homeRegistrationNumber:
                    this.dataGetById?.contactInfo?.homeRegistrationNumber,
                isMaster: this.dataGetById?.contactInfo?.isMaster,
                residenceAddress:
                    this.dataGetById?.contactInfo?.residenceAddress,
                isAtResidenceAddress:
                    this.dataGetById?.contactInfo?.isAtResidenceAddress,
                currentNationId: this.dataGetById?.contactInfo?.currentNationId,
                currentNation: this.dataGetById?.contactInfo?.currentNation,
                currentCityId: this.dataGetById?.contactInfo?.currentCityId,
                currentCity: this.dataGetById?.contactInfo?.currentCity,
                currentDistrictId:
                    this.dataGetById?.contactInfo?.currentDistrictId,
                currentDistrict: this.dataGetById?.contactInfo?.district,
                currentWardId: this.dataGetById?.contactInfo?.currentWardId,
                currentWard: this.dataGetById?.contactInfo?.currentWard,
                currentStreetId: this.dataGetById?.contactInfo?.currentStreetId,
                currentStreet: this.dataGetById?.contactInfo?.currentStreet,
                currentHomeNumberId:
                    this.dataGetById?.contactInfo?.currentHomeNumberId,
                currentHomeNumber:
                    this.dataGetById?.contactInfo?.currentHomeNumber,
                currentAddresss: this.dataGetById?.contactInfo?.currentAddresss,
                fullName: this.dataGetById?.contactInfo?.fullName,
                relationshipId: this.dataGetById?.contactInfo?.relationshipId,
                relationshipName:
                    this.dataGetById?.contactInfo?.relationshipName,
                phoneNumberEmergency:
                    this.dataGetById?.contactInfo?.phoneNumberEmergency,
                addressEmergency:
                    this.dataGetById?.contactInfo?.addressEmergency,
                homePhoneEmergency:
                    this.dataGetById?.contactInfo?.homePhoneEmergency,
                insuranceDate: new Date(
                    this.dataGetById?.contactInfo?.insuranceDate
                ),
                insuranceContributionRate:
                    this.dataGetById?.contactInfo?.insuranceContributionRate,
                healthInsuranceNumber:
                    this.dataGetById?.contactInfo?.healthInsuranceNumber,
                socialInsuranceNumber:
                    this.dataGetById?.contactInfo?.socialInsuranceNumber,
                healthInsuranceCardNumber:
                    this.dataGetById?.contactInfo?.healthInsuranceCardNumber,
                socialSecurityNumber:
                    this.dataGetById?.contactInfo?.socialSecurityNumber,
                isSyndicate: this.dataGetById?.contactInfo?.isSyndicate,
                issuranceStatus: this.dataGetById?.contactInfo?.issuranceStatus,
                // cityProvideId: this.cities.find(
                //     (city) =>
                //         city.id === this.dataGetById?.contactInfo?.cityProvideId
                // ),
                cityProvide: this.dataGetById?.contactInfo.cityProvideId,
                cityProvideCode: this.dataGetById?.contactInfo.cityProvideCode,
                heathcareRegistractionCode:
                    this.dataGetById?.contactInfo?.heathcareRegistractionCode,
                heathcareRegistractionLocation:
                    this.dataGetById?.contactInfo
                        ?.heathcareRegistractionLocation,
                heathcareRegistracionNumber:
                    this.dataGetById?.contactInfo?.heathcareRegistracionNumber,
                emailEmergency: this.dataGetById?.contactInfo?.emailEmergency,
            });

        });
    }
}
