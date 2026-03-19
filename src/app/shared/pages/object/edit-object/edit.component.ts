import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { OrganizationService } from './../../../../core/services/organization.service';
import { StaffTitleService } from './../../../../core/services/staff-title.service';
import { GroupPositionService } from './../../../../core/services/group-position.service';
import { StaffPositionService } from './../../../../core/services/staff-position.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { aN, an } from '@fullcalendar/core/internal-common';
import { noWhitespaceValidator } from 'src/app/shared/validator';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router'; // Nhớ import Router
import { AddressService } from 'src/app/core/services/address.service';
import { MessageService } from 'primeng/api';

//phân quyền
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.css',
})
export class EditComponent {
    items: any;
    cities!: any[];
    selectedCities!: any[];
    positionVisible: boolean = false;
    jobTitleVisible: boolean = false;
    status: boolean = false;
    positionAddVisible: boolean = false;
    groupAddVisible: boolean = false;
    staffPositionCreateForm: FormGroup;
    organizationId: number = null;
    groupPositions: any;
    staffTitles: any;
    selectedOrganizations: any;
    positions: any;
    organizations: any;
    fullname: any;

    selectedPosition: any;
    selectedTitle: any;
    groupPositionsCreateForm: FormGroup;
    staffTitleCreateForm: FormGroup;

    workingStatusOptions: any[];

    positionName: any[] = [];

    isParentUnitInvalid: boolean = false; // Cờ kiểm tra lỗi
    isParentUnitClicked: boolean = false; // Cờ focus kiểm tra

    employeeForm: FormGroup;

    // Các biến trạng thái cho checkbox
    isPerson: boolean = false;
    isEmployee: boolean = false;
    display: boolean = false;
    employeeData: any;
    nodes: any[];
    IDTreeNodes: number;

    id: string;

    ImgUrl: string = environment.baseApiImageUrl;

    employeeDetails: any[] = [];
    objectById: any;

    //Biến địa chỉ
    districts: any[] = [];
    wards: any[] = [];
    citiesProvider: any[] = [];
    selectedCountryId!: number;
    selectedCityId!: number;
    selectedDistrictId!: number;

    //constans
    permissionConstant = PermissionConstant;

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');
        this.employeeForm = this.formBuilder.group({
            employeeCode: [{ value: '', disabled: true }, Validators.required],
            lastName: ['', Validators.required],
            firstName: ['', Validators.required],
            dateOfBirth: [''],
            sex: ['', Validators.required],
            cityId: [null],
            city: [null],
            districtId: [null],
            district: [null],
            wardId: [null],
            ward: [null],

            address: [''],
            phoneNumber: [
                '',
                [Validators.required, Validators.pattern(/^(\d{10})$/)],
            ],
            personalEmail: [''],
            organizationId: ['', Validators.required],
            staffPositionId: [''],
            companyId: [''],
            staffTitleId: ['', Validators.required],
            workingStatus: ['', Validators.required],
            probationDate: [''],
            officialDate: [''],
            managerDirectId: ['', Validators.required],
            leaveJobDate: [''],
            workPhoneNumber: ['', [Validators.pattern(/^(\d{10})$/)]],
            companyEmail: [''],
            accountEmail: ['', Validators.required],
            acountStatus: [false],
        });

        this.object.getId({ id: this.id }).subscribe(
            (response) => {
                console.log('Dữ liệu từ API:', response);
                this.loadingService.hide();

                if (response) {
                    // const organizations = response.organizationLeaders?.map((org) => ({
                    //   label: org.organizationName,
                    //   value: org.organizationId,
                    // })) || [];

                    // if (organizations.length === 0) {
                    //   organizations.push({
                    //     label: "Chọn đơn vị",
                    //     value: null,
                    //   });
                    // }
                    const organizationId = response.organizationId;
                    this.loadOrganization(organizationId);
                    this.loadNameposition(organizationId);
                    this.employeeData = response;
                    if (response.cityId) {
                        this.employeeForm
                            .get('cityId')
                            ?.setValue(response.cityId);
                        this.getDistrictsByCity(
                            response.cityId,
                            response.districtId
                        );
                    }
                    console.log(
                        'this.form.cityId',
                        this.employeeForm.get('cityId')?.value
                    );
                    if (response.districtId) {
                        this.employeeForm
                            .get('districtId')
                            ?.setValue(response.districtId);
                        this.getWardsByDistrict(
                            response.districtId,
                            response.wardId
                        );
                    }

                    this.objectById = response;
                    let probationDate = response.probationDate
                        ? new Date(response.probationDate)
                        : null;
                    let officialDate = response.officialDate
                        ? new Date(response.officialDate)
                        : null;
                    let dateOfBirth = response.dateOfBirth
                        ? new Date(response.dateOfBirth)
                        : null;
                    let leaveJobDate = response.leaveJobDate
                        ? new Date(response.leaveJobDate)
                        : null;
                    console.log('Converted Probation Date:', probationDate);
                    console.log('Converted Official Date:', officialDate);

                    // Gán giá trị dữ liệu vào form control
                    this.employeeForm.patchValue({
                        employeeCode: response.employeeCode,
                        lastName: response.lastName,
                        firstName: response.firstName,
                        dateOfBirth: dateOfBirth,
                        sex: response.sex,
                        cityId: response.cityId,
                        city: response.city,
                        districtId: response.districtId,
                        district: response.district,
                        wardId: response.wardId,
                        ward: response.ward,

                        address: response.address,
                        phoneNumber: response.phoneNumber,
                        personalEmail: response.personalEmail,
                        organizationId: this.organizations,
                        staffPositionId: response.staffPositionId,
                        companyId: response.companyId,
                        staffTitleId: response.staffTitleId,
                        workingStatus: response.workingStatus,
                        probationDate: probationDate,
                        officialDate: officialDate,
                        leaveJobDate: leaveJobDate,
                        workPhoneNumber: response.workPhoneNumber,
                        companyEmail: response.companyEmail,
                        managerDirectId: response.managerDirectId,
                        accountEmail: response.accountEmail,
                        acountStatus: response.acountStatus,
                    });

                    // console.log("Giá trị form sau patch:", this.employeeForm.value);
                    if (response.avatarUrl) {
                        this.imageUrl = `${response.avatarUrl}`;
                    }
                } else {
                    this.toastService.showError('Thất bại', response.message);
                }
            },
            (error) => {
                this.loadingService.hide();
                this.toastService.showError(
                    'Lỗi',
                    'Có lỗi xảy ra, vui lòng thử lại!'
                );
            }
        );

        this.workingStatusOptions = [
            { label: 'Đang làm việc', value: Workingstatus.Active }, // Giá trị số 0
            { label: 'Đã nghỉ việc', value: Workingstatus.Inactive }, // Giá trị số 1
        ];

        this.items = [
            { label: 'Hệ thống' },
            { label: 'Đối tượng', routerLink: '/object' },
            { label: 'Chỉnh sửa' },
        ];

        this.loadPositionGroups();
        this.loadStaffTitle();
        this.loadUnit();
        // this.loadNameposition();
        this.loadcompany();
        this.loadEmployeeDetails();
        this.getCitiesByCountry(1);
    }

    //Địa chỉ
    getCitiesByCountry(countryId: number) {
        this.address
            .getCitiesByIdCountry({ id: countryId })
            .subscribe((response) => {
                this.cities = response.data;
                this.citiesProvider = response.data;
                console.log('this.employee', this.employeeData);
                console.log('this.cities', this.cities);
                // this.employeeForm
                //     .get('cityId')
                //     ?.setValue(
                //         this.cities.find(
                //             (city) => city.id === this.employeeData?.cityId
                //         )
                //     );
                // this.employeeForm
                //   .get('cityProvideId')
                //   ?.setValue(
                //     this.cities.find(
                //       (city) =>
                //         city.id === this.employeeData?.cityProvideId
                //     )
                //   );
            });
    }

    getDistrictsByCity(cityId: number, districtId?: number) {
        this.address
            .getDistrictsByIdCity({ cityId: cityId })
            .subscribe((districts) => {
                this.districts = districts.data;
                if (districtId) {
                    console.log(districtId);
                    this.employeeForm.get('districtId')?.setValue(districtId);
                }
            });
    }

    getWardsByDistrict(districtId: number, wardId?: number) {
        this.address
            .getWardsByIdDistrict({ districtId: districtId })
            .subscribe((wards) => {
                this.wards = wards.data;
                if (wardId) {
                    this.employeeForm.get('wardId')?.setValue(wardId);
                }
            });
    }

    onCountryChange(countryId: number) {
        this.selectedCountryId = countryId;
        this.getCitiesByCountry(countryId);
    }

    onCityChange(data: any) {
        console.log(data);
        this.selectedCityId = data.value;
        console.log(this.selectedCityId);
        this.getDistrictsByCity(data.value);

        console.log(this.districts);
        this.employeeForm.get('wardId')?.setValue(null);
        this.employeeForm.get('districtId')?.setValue(null);
    }

    onDistrictChange(districtId: any) {
        console.log(districtId);
        this.selectedDistrictId = districtId.value;
        this.employeeForm.get('wardId')?.setValue(null);
        this.getWardsByDistrict(this.selectedDistrictId);
    }

    onClearCity() {
        this.employeeForm.get('wardId')?.setValue(null);
        this.employeeForm.get('districtId')?.setValue(null);

        this.districts = [];
        this.wards = [];
    }

    onClearDistrict() {
        this.wards = [];
        this.employeeForm.get('wardId')?.setValue(null);
    }

    onClearWard() {
        this.employeeForm.get('wardId')?.setValue(null);
    }

    //load quản lý
    loadEmployeeDetails(): void {
        this.object.getAllEmployee().subscribe((results) => {
            this.employeeDetails = results.items.map((item: any) => ({
                label: `${item.lastName} ${item.firstName} - ${item.employeeCode}`,
                value: item.id,
            }));
        });
    }

    //load tên vị trí
    loadNameposition(organizationId?: number): void {
        let request = {
            pageIndex: 1,
            pageSize: 3000,
            organizationId: organizationId,
            status: true,
        };
        this.staffPositionService.getPaging(request).subscribe((results) => {
            this.positionName = results.data.items.map((item: any) => ({
                label: item.positionName,
                value: item.id,
            }));
            console.log('this.staffposition', results);
            console.log('positionName', this.positionName);
        });
    }

    //load nhóm vị trí
    loadPositionGroups(): void {
        this.groupPositionService.getAll().subscribe((results) => {
            this.groupPositions = results.data;
        });
    }

    loadStaffTitle(): void {
        this.staffTitleService.getAll().subscribe((results) => {
            this.staffTitles = results.data;
        });
    }

    //load công ty trực thuộc
    loadcompany(): void {
        this.object.getPaging().subscribe((results) => {
            this.fullName = results.data.items.map((item: any) => ({
                label: item.fullName,
                value: item.id,
            }));
        });
    }

    loadUnit(): void {}

    show() {
        this.toastService.showSuccess('Thành công', 'Thêm mới th');
    }

    startLoading() {
        this.loadingService.show();
    }

    showPositionGroupDal() {
        this.positionVisible = true;
        this.selectedPosition =
            this.staffPositionCreateForm.value.locationGroup;
    }

    handleSelectPositionGroup() {
        if (this.selectedPosition) {
            this.staffPositionCreateForm.patchValue({
                locationGroup: Number(this.selectedPosition),
            });
            this.positionVisible = false;
        }
    }

    showTitleDal() {
        this.jobTitleVisible = true;
        this.selectedTitle = this.staffPositionCreateForm.value.title;
    }

    handleSelectTitle() {
        if (this.selectedTitle) {
            this.staffPositionCreateForm.patchValue({
                title: Number(this.selectedTitle),
            });
            this.jobTitleVisible = false;
        }
    }

    handleTreeSelectFocusOut(event: FocusEvent): void {
        const target = event.relatedTarget as HTMLElement;
        const isInsideTreeSelect = target?.closest('.custom-tree-select');

        if (target && target.closest('[aria-hidden="true"]')) {
            event.preventDefault();
        }
        if (!isInsideTreeSelect) {
            this.isParentUnitClicked = true;
            this.validateParentUnit();
        }
    }

    validateParentUnit(): void {
        const parentUnitControl = this.employeeForm.get('organizationId');
        const value = parentUnitControl?.value;
        this.isParentUnitInvalid = !value || value === 'Chọn đơn vị';
    }

    onParentUnitChange(event: any): void {
        const selectedNode = event.node;
        const organizationId = selectedNode ? selectedNode.data : null;
        this.employeeForm.get('organizationId')?.setValue(organizationId);
        this.validateParentUnit();
        console.log('selectNode', selectedNode);
        console.log('changeOrganization', organizationId);
        this.loadNameposition(organizationId);
    }

    onNodeSelect(event: any) {
        const selectedNode = event.value;
        console.log('Selected node:', selectedNode);
        if (selectedNode) {
            console.log('Selected node data:', selectedNode.data);
        }
    }

    loadOrganization(organizationId?: number): void {
        // this.organizations = this.organizationsService.value;
        this.organizationService.getPaging({ id: 1 }).subscribe((results) => {
            // this.organizations = this.transformData([results.data]);
            this.organizations = [this.convertToTree(results.data)];
            console.log('a', this.organizations);

            if (organizationId) {
                // BINDING DATA
                const selectedParentOrganization = this.organizations.find(
                    (item) => item.data === organizationId
                );
                if (selectedParentOrganization) {
                    this.employeeForm
                        .get('organizationId')
                        .setValue(selectedParentOrganization);
                } else {
                    // HANDLE FOR CHILDREN CASE - TODO: MUST UPDATE LOGIC IF HAS MORE THAN 1 ITEM IN TREE SELECT
                    // ASSUMPTION JUST HAVE 1 ITEM IN TREE SELECT FOR THIS CASE
                    const selectedChildrenOrganization =
                        this.organizations[0].children.find(
                            (item) => item.data === organizationId
                        );
                    this.employeeForm
                        .get('organizationId')
                        .setValue(selectedChildrenOrganization);
                }
            }
        });
        // });
    }
    // hàm lay tree
    convertToTree(node: any): any {
        if (!node.id) {
            console.log('Node không có id:', node);
        }
        return {
            label: node.organizationName,
            data: node.id,
            children: (node.organizationChildren || []).map((child: any) =>
                this.convertToTree(child)
            ),
        };
    }

    mapToTreeNode(node: any): any {
        // Gán giá trị của node.data cho this.IDTreeNodes
        return {
            label: node.label,
            data: node.data, // Gán dữ liệu vào thuộc tính 'data'
            children: node.children || [], // Nếu không có children, gán mảng rỗng
        };
    }

    listCompanyToTreeSelect() {
        if (Array.isArray(this.organizations)) {
            this.nodes = this.organizations.map((company) =>
                this.mapToTreeNode(company)
            );
        } else {
            console.error('listCompany không phải là mảng', this.organizations);
        }
    }
    ///

    transformData(data: any): any[] {
        return data.map((item: any) => ({
            label: item.organizationName,
            data: item.id,
            children: item.organizationChildren
                ? this.transformData(item.organizationChildren)
                : [],
        }));
    }

    showFormErrors() {
        for (const control in this.employeeForm.controls) {
            if (this.employeeForm.controls[control].invalid) {
                console.log(`${control} không hợp lệ`);
            }
        }
    }

    // Hàm hiển thị lỗi cho từng trường
    // showFormErrors() {
    //   const errors = [];
    //   for (const controlName in this.employeeForm.controls) {
    //     const control = this.employeeForm.get(controlName);
    //     if (control && control.invalid) {
    //       // Log giá trị và trạng thái lỗi của từng trường
    //       console.log('Thông tin FormControl staffTitleId :', this.employeeForm.get('staffTitleId'));
    //     }
    //   }
    //   return errors;
    // }

    constructor(
        private object: ObjectService,
        private toastService: ToastService,
        private loadingService: LoadingService,
        private formBuilder: FormBuilder,
        private groupPositionService: GroupPositionService,
        private staffPositionService: StaffPositionService,
        private staffTitleService: StaffTitleService,
        private organizationService: OrganizationService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private routerr: Router,
        private address: AddressService,
        private messageService: MessageService,

        //phân quyền
        public permisson: HasPermissionHelper
    ) {
        this.staffPositionCreateForm = this.formBuilder.group({
            code: [null, [Validators.required, noWhitespaceValidator()]],
            locationGroup: [null],
            name: [null, [Validators.required, noWhitespaceValidator()]],
            organizations: [null, Validators.required],
            group: [null],
            title: [null],
        });

        this.staffPositionCreateForm
            .get('locationGroup')
            .valueChanges.subscribe((value) => {
                console.log('Selected Position ID:', value);
                this.selectedPosition = value;
            });

        this.groupPositionsCreateForm = this.formBuilder.group({
            groupPositionName: [null],
        });

        this.staffTitleCreateForm = this.formBuilder.group({
            staffTitleName: [null],
        });

        this.employeeForm = this.formBuilder.group({
            objectTypeE: [null],
            objectTypeU: [null],
            employeeCode: [null],
            lastName: [null, [Validators.required, Validators.maxLength(100)]],
            firstName: [null, [Validators.required, Validators.maxLength(100)]],
            dateOfBirth: [null, Validators.required],
            avatarUrl: [null],
            organizations: [null],
            cityId: [null],
            city: [null],
            districtId: [null],
            district: [null],
            wardId: [null],
            ward: [null],

            address: [null, [Validators.required, Validators.maxLength(255)]],
            phoneNumber: [
                null,
                [Validators.required, Validators.pattern('^\\+?[0-9]*$')],
            ],
            personalEmail: [null, [Validators.required, Validators.email]],
            sex: [0],
            staffPositionId: [null, Validators.required],
            staffTitleId: [null, Validators.required],
            managerId: [null, Validators.required],
            managerDirectId: [null, Validators.required],
            organizationId: [null, Validators.required],
            workingStatus: [null, Validators.required],
            probationDate: [null],
            leaveJobDate: [null],
            officialDate: [null],
            workPhoneNumber: [null, [Validators.pattern('^\\+?[0-9]*$')]],
            companyEmail: [null, [Validators.required, Validators.email]],
            accountEmail: [null],
            companyId: [null, Validators.required],

            acountStatus: [null],
        });
    }

    // this.employeeForm = this.formBuilder.group({
    //   objectType : [null],
    //   objectTypeEmail: [null],
    //   selectedJobPosition: [null],
    //   selectedStatus: [null],
    //   codeObject: [null],
    //   lastName: [null, [Validators.required, Validators.maxLength(100)]],
    //   firstName: [null, [Validators.required, Validators.maxLength(100)]],
    //   dateOfBirth: [null, Validators.required],
    //   avatarUrl: [null],
    //   organizations: [null],
    //   title: [null],
    //   address: [null, [Validators.required, Validators.maxLength(255)]],
    //   phoneNumber: [null, [Validators.required, Validators.pattern('^\\+?[0-9]*$')]],
    //   personalEmail: [null, [Validators.required, Validators.email]],
    //   sex: [null, Validators.required],
    //   staffPositionId: [null, Validators.required],
    //   staffTitleId: [null, Validators.required],
    //   managerId: [null],
    //   organizationId: [null, Validators.required],
    //   workingStatus: [null, Validators.required],
    //   probationDate: [null],
    //   officialDate: [null],
    //   workPhoneNumber: [null],
    //   companyEmail: [null, [Validators.required, Validators.email]],
    //   accountEmail: [null],
    //   accountStatus: [null, Validators.required],
    // });

    //chuyển hướng
    item = [{ label: 'Hệ thống', url: '/' }, { label: 'Thêm đối tượng' }];

    handleCreateStaffTitle(): void {
        if (this.staffTitleCreateForm.valid) {
            this.staffTitleService
                .create(this.staffTitleCreateForm.value)
                .subscribe((result) => {
                    if (result.status) {
                        this.loadStaffTitle();
                        this.staffTitleCreateForm.reset();
                    }
                });
        }
    }

    handleCreateGroupPosition(): void {
        if (this.groupPositionsCreateForm.valid) {
            this.groupPositionService
                .create(this.groupPositionsCreateForm.value)
                .subscribe((result) => {
                    if (result.status) {
                        this.groupPositionsCreateForm.reset();
                        this.loadPositionGroups();
                    }
                });
        }
    }

    imageUrl: any;
    imageUrlForm: any;

    onFileSelect(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imageUrlForm = file;
                this.imageUrl = e.target?.result;
                console.log(this.imageUrl);
                this.employeeData.avatarUrl = this.imageUrl;
            };
            reader.readAsDataURL(file);
        }
    }

    triggerFileInput() {
        const fileInput = document.getElementById('fileInput') as HTMLElement;
        fileInput.click();
    }

    removeImage() {
        if (this.objectById.avatarUrl) {
            this.objectById.avatarUrl = null;
            this.imageUrl = null;
            console.log('Avatar đã bị xóa');
        } else {
            this.imageUrl = null;
            this.employeeData.avatarUrl = '';
            console.log('Không có ảnh để xóa');
        }
    }

    genderOptions: any[] = [
        { label: 'Nam', value: 1 },
        { label: 'Nữ', value: 0 },
        { label: 'Khác', value: 2 },
    ]; // Các lựa chọn giới tính, giá trị tương ứng với sex (1 là Nam, 0 là Nữ)

    dropdownIcon = 'pi pi-chevron-down'; // Mặc định mũi tên xuống

    onDropdownShow() {
        this.dropdownIcon = 'pi pi-chevron-up'; // Thay đổi mũi tên khi dropdown mở
    }

    onDropdownHide() {
        this.dropdownIcon = 'pi pi-chevron-down'; // Thay đổi lại mũi tên khi dropdown đóng
    }

    // Hành động nút "Hủy"
    onCancelAll() {
        this.employeeForm.reset();
    }

    //validate họ và đệm
    fullName: string = ''; // Họ và tên
    isFullNameInvalid: boolean = false; // Lỗi khi chỉ nhập khoảng trắng
    isFullNameEmpty: boolean = false; // Lỗi khi để trống hoàn toàn
    isInputFocused: boolean = false; // Kiểm tra xem input có đang được focus không

    validateFullName() {
        // Kiểm tra ô input trống
        if (this.fullName === '') {
            this.isFullNameEmpty = true;
            this.isFullNameInvalid = false;
        }
        // Kiểm tra nếu chỉ có khoảng trắng ở đầu hoặc toàn bộ chuỗi là khoảng trắng
        else if (this.fullName.trim() === '' || this.fullName.startsWith(' ')) {
            this.isFullNameInvalid = true;
            this.isFullNameEmpty = false;
        } else {
            this.isFullNameEmpty = false;
            this.isFullNameInvalid = false;
        }
    }

    // notice
    onFocus() {
        this.isInputFocused = true;
    }

    // Hàm onBlur riêng cho ô "Họ và đệm"
    onBlurFullName() {
        this.isInputFocused = false;
        this.validateFullName(); // Chỉ validate "Họ và đệm"
    }

    // Hàm onBlur riêng cho ô "Tên"
    onBlurFirstName() {
        this.validateFirstName(); // Chỉ validate "Tên"
    }

    // Validate Tên
    firstName: string = ''; // Tên
    isFirstNameEmpty: boolean = false; // Kiểm tra khi trường tên trống
    isFirstNameSpace: boolean = false; // Kiểm tra khi chỉ có khoảng trắng

    validateFirstName() {
        // Kiểm tra nếu trường tên trống
        if (this.firstName === '') {
            this.isFirstNameEmpty = true;
            this.isFirstNameSpace = false;
        }
        // Kiểm tra nếu trường tên chỉ chứa khoảng trắng
        else if (
            this.firstName.trim() === '' ||
            this.firstName.startsWith(' ')
        ) {
            this.isFirstNameEmpty = false;
            this.isFirstNameSpace = true;
        } else {
            this.isFirstNameEmpty = false;
            this.isFirstNameSpace = false;
        }
    }

    emailcn: string = ''; //Email cá nhân

    emailtk: string = ''; // Email tài khoản
    isEmailInvalid: boolean = false; // Lỗi khi email không hợp lệ
    isEmailExists: boolean = false; // Lỗi khi email đã tồn tại
    // Mảng email đã tồn tại (giả sử đây là ví dụ)
    existingEmails: string[] = ['example1@example.com', 'test@example.com'];

    // Hàm kiểm tra email khi mất focus
    validateEmail() {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com)$/;

        // Kiểm tra định dạng email
        if (!emailRegex.test(this.emailtk)) {
            this.isEmailInvalid = true;
            return;
        } else {
            this.isEmailInvalid = false;
        }

        // Kiểm tra xem email có trùng không
        if (this.existingEmails.includes(this.emailtk)) {
            this.isEmailExists = true;
        } else {
            this.isEmailExists = false;
        }
    }

    onSubmit() {
        if (this.staffPositionCreateForm.valid) {
            this.loadingService.show();
            const organizationPositions = [];
            for (const orgId of this.staffPositionCreateForm.value
                .organizations) {
                organizationPositions.push({
                    organizationId: orgId.data,
                });
            }

            const formData = {
                positionCode: this.staffPositionCreateForm.value.code.trim(),
                positionName: this.staffPositionCreateForm.value.name.trim(),
                groupPositionId:
                    this.staffPositionCreateForm.value.locationGroup,
                staffTitleId: this.staffPositionCreateForm.value.title,
                organizationPositions: organizationPositions,
            };
            this.staffPositionService.create(formData).subscribe((response) => {
                if (response.status) {
                    this.loadingService.hide();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Tạo vị trí thành công!',
                    });
                } else {
                    this.loadingService.hide();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: `${response.message}`,
                    });
                }
            });
        } else {
            this.staffPositionCreateForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Chú ý',
                detail: 'Vui lòng nhập thông tin!',
            });
        }
    }

    onSubmitForm() {
        if (this.employeeForm.valid) {
        }
        // const organizationId = this.employeeForm.get('organizationId')?.value.data
        // console.log(organizationId);
        // this.employeeForm.get('organizationId')?.setValue(organizationId);
        const sexValue = this.employeeForm.get('sex')?.value;

        if (!this.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không tìm thấy ID nhân viên cần sửa.',
            });
            return;
        }

        const employeeData = this.employeeForm.value;
        console.log('dữ liệu', employeeData);

        const workingStatus = this.employeeForm.get('workingStatus')?.value;
        console.log('Working Status (number):', workingStatus); // Kiểm tra giá trị số
        // Nếu backend yêu cầu giá trị chuỗi "Active" hoặc "Inactive"
        const workingStatusString =
            workingStatus === Workingstatus.Active ? 0 : 1;
        console.log('Working Status (string):', workingStatusString);
        employeeData.workingStatus = workingStatusString;

        this.employeeForm.patchValue({
            avatarUrl: this.imageUrl,
        });

        const city =
            this.cities.find(
                (city) => city.id === this.employeeForm.get('cityId')?.value
            ) || {};
        const district =
            this.districts.find(
                (district) =>
                    district.id === this.employeeForm.get('districtId')?.value
            ) || {};
        const ward =
            this.wards.find(
                (ward) => ward.id === this.employeeForm.get('wardId')?.value
            ) || {};

        const formData = new FormData();
        //formData.append('CompanyId', employeeData.companyId);

        formData.append(
            'EmployeeCode',
            this.employeeForm.get('employeeCode')?.value
        );
        formData.append(
            'LastName',
            employeeData.lastName ? employeeData.lastName : ''
        );
        formData.append(
            'FirstName',
            employeeData.firstName ? employeeData.firstName : ''
        );

        formData.append('CityId', city.id ? city.id : '');
        formData.append('City', city.name ? city.name : '');

        formData.append('DistrictId', district.id ? district.id : '');
        formData.append('District', district.name ? district.name : '');

        formData.append('WardId', ward.id ? ward.id : '');
        formData.append('Ward', ward.name ? ward.name : '');

        formData.append(
            'Address',
            employeeData.address ? employeeData.address : ''
        );
        formData.append(
            'PhoneNumber',
            employeeData.phoneNumber ? employeeData.phoneNumber : ''
        );
        formData.append(
            'PersonalEmail',
            employeeData.personalEmail ? employeeData.personalEmail : ''
        );
        formData.append('Sex', employeeData.sex);
        formData.append('StaffPositionId', employeeData.staffPositionId);
        formData.append('StaffTitleId', employeeData.staffTitleId);

        const formatToLocalDateString = (date: Date): string => {
            return date.toLocaleDateString('en-CA'); // Định dạng yyyy-MM-dd
        };

        const dateOfBirth = employeeData.dateOfBirth
            ? formatToLocalDateString(new Date(employeeData.dateOfBirth))
            : '';
        const officialDate = employeeData.officialDate
            ? formatToLocalDateString(new Date(employeeData.officialDate))
            : '';
        const probationDate = employeeData.probationDate
            ? formatToLocalDateString(new Date(employeeData.probationDate))
            : '';
        const leaveJobDate = employeeData.leaveJobDate
            ? formatToLocalDateString(new Date(employeeData.leaveJobDate))
            : '';

        if (officialDate && leaveJobDate) {
            const officialDateParsed = new Date(officialDate);
            const leaveJobDateParsed = new Date(leaveJobDate);

            if (leaveJobDateParsed < officialDateParsed) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Thất bại',
                    detail: 'Cập nhật lại ngày nghỉ việc',
                });
                return;
            }
        }

        formData.append('DateOfBirth', dateOfBirth);
        formData.append('OfficialDate', officialDate);
        formData.append('ProbationDate', probationDate);
        formData.append('LeaveJobDate', leaveJobDate);

        console.log(employeeData.organizationId);
        formData.append('OrganizationId', employeeData.organizationId?.data);
        formData.append('WorkingStatus', employeeData.workingStatus);
        formData.append(
            'WorkPhoneNumber',
            employeeData.workPhoneNumber ? employeeData.workPhoneNumber : ''
        );
        formData.append(
            'CompanyEmail',
            employeeData.companyEmail ? employeeData.companyEmail : ''
        );
        formData.append('AccountEmail', employeeData.accountEmail);
        if (this.imageUrlForm) {
            formData.append('AvatarImage', this.imageUrlForm);
        } else {
            formData.append('AvatarUrl', this.imageUrl);
        }
        formData.append('ManagerDirectId', employeeData.managerDirectId);

        formData.append('CompanyId', employeeData.companyId);

        formData.append('AcountStatus', employeeData.acountStatus);

        console.log('Dữ liệu sau khi gửi: ', employeeData.organizationId);
        this.loadingService.show();
        this.object.updateObject(this.id, formData).subscribe(
            (response) => {
                this.loadingService.hide();
                if (response.status) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Sửa thông tin nhân viên thành công!',
                    });

                    // Điều hướng về màn danh sách
                    this.routerr.navigate(['/object']);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: 'Không thể sửa thông tin nhân viên',
                    });
                }
            },
            (error) => {
                this.loadingService.hide();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Có lỗi xảy ra, vui lòng thử lại!',
                });
            }
        );
    }

    //sơn đẹp trai
    isResendEmail = false;
    baseFEUrl = environment.baseFeUrl;
    acountStatus: false;
    selectedEmail: any;
    selectedEmployee: any;

    baseImageUrl = environment.baseApiImageUrl;

    handleEmailActivationChange(event: any) {
        // Khi checkbox thay đổi, kiểm tra giá trị và cập nhật sendActivationEmail
        this.acountStatus = event.checked;
    }
    // Gửi yêu cầu kích hoạt email
    sendActivationEmailRequest(email: string) {
        const request = {
            email: email,
            urlClient: this.baseFEUrl,
        };
        this.authService.resendEmailActive(request).subscribe(
            (res) => {
                if (res.status) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Thành công',
                        detail: 'Email kích hoạt đã được gửi thành công.',
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Thất bại',
                        detail: res.message,
                    });
                }
                console.log(res);
            },
            (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: 'Lỗi hệ thống',
                });
                console.log(error?.error.Message);
            }
        );
    }
}
