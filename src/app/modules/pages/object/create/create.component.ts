import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/global/loading.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { ObjectService } from 'src/app/core/services/object.service';
import { OrganizationService } from './../../../../core/services/organization.service';
import { StaffTitleService } from './../../../../core/services/staff-title.service';
import { GroupPositionService } from './../../../../core/services/group-position.service';
import { StaffPositionService } from './../../../../core/services/staff-position.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { aN, an, dA } from '@fullcalendar/core/internal-common';
import { noWhitespaceValidator } from 'src/app/shared/validator';
import { Workingstatus } from 'src/app/core/enums/working-status.enum';
import { AccountStatus } from 'src/app/core/enums/status-account.enum';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { environment } from 'src/environments/environment';
import { emailstatus } from 'src/app/core/enums/check-email.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from 'src/app/core/services/address.service';

//phân quyền
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {

  items: any;
  cities!: any[];
  selectedCities!: any[];
  positionVisible: boolean = false;
  jobTitleVisible: boolean = false;
  status: boolean = false;
  positionAddVisible: boolean = false;
  groupAddVisible: boolean = false;
  staffPositionCreateForm: FormGroup;

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
  emailStatusOptions: any[];

  positionName: any[] = [];
  employeeDetails: any[] = [];


  isParentUnitInvalid: boolean = false; // Cờ kiểm tra lỗi
  isParentUnitClicked: boolean = false; // Cờ focus kiểm tra

  employeeForm: FormGroup;
  employeeCode: string | null = null;
  // Các biến trạng thái cho checkbox
  isPerson: boolean = false;
  isEmployee: boolean = false;
  display: boolean = false;
  employeeData: any;
  nodes: any[];
  IDTreeNodes: number;
  accountStatus = emailstatus.NotSend;

  isSubmitting: boolean = false;


  //Biến địa chỉ
  districts: any[] = [];
  wards: any[] = [];
  citiesProvider: any[] = [];
  selectedCountryId!: number;
  selectedCityId!: number;
  selectedDistrictId!: number;


  //constans
  permissionConstant = PermissionConstant


  ngOnInit() {

    this.employeeForm.get('personalEmail')?.valueChanges.subscribe((personalEmailValue) => {
      // Cập nhật giá trị của 'accountEmail'
      this.employeeForm.get('accountEmail')?.setValue(personalEmailValue, { emitEvent: false });
    });

    this.employeeForm.get('lastName')?.valueChanges.subscribe(() => {
      this.updateFullName();
    });
    this.employeeForm.get('firstName')?.valueChanges.subscribe(() => {
      this.updateFullName();
    });

    this.workingStatusOptions = [
      { label: 'Đang làm việc', value: Workingstatus.Active },  // Giá trị số 0
      { label: 'Đã nghỉ việc', value: Workingstatus.Inactive } // Giá trị số 1
    ];

    this.accountStatus = emailstatus.NotSend;

    this.items = [
      { label: 'Hệ thống' },
      { label: 'Đối tượng', routerLink: '/object' },
      { label: 'Thêm mới' },
    ];

    this.loadOrganization();
    this.loadPositionGroups();
    this.loadStaffTitle();
    this.loadUnit();
    this.loadNameposition();
    this.loadcompany();
    this.loadEmployeeDetails();
    this.getCitiesByCountry(1);
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
  loadNameposition(): void {
    this.staffPositionService.getPaging({pageSize: 3000}).subscribe((results) => {
      this.positionName = results.data.items.map((item: any) => ({
        label: item.positionName,
        value: item.id,
      }));
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

  loadUnit(): void { }

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
    const selectedNode = event.value;
    const organizationId = selectedNode ? selectedNode.data : null;
    this.employeeForm.get('organizationId')?.setValue(organizationId);
    this.validateParentUnit();
  }

  onNodeSelect(event: any) {
    const selectedNode = event.value;
    console.log('Selected node:', selectedNode);
    if (selectedNode) {
      console.log('Selected node data:', selectedNode.data);
    }
  }

  loadOrganization(): void {
    // this.organizations = this.organizationsService.value;
    this.organizationService.getPaging({ id: 1 }).subscribe((results) => {
      // this.organizations = this.transformData([results.data]);
      this.organizations = [this.convertToTree(results.data)];
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
      data: node.data,  // Gán dữ liệu vào thuộc tính 'data'
      children: node.children || [],  // Nếu không có children, gán mảng rỗng
    };
  }


  listCompanyToTreeSelect() {
    if (Array.isArray(this.organizations)) {
      this.nodes = this.organizations.map((company) =>
        this.mapToTreeNode(company)
      );
    } else {
      console.error(
        'listCompany không phải là mảng',
        this.organizations
      );
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
    private router: Router,
    private address: AddressService,
    private messageService: MessageService,

    //phân quyền
    public permisson : HasPermissionHelper

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
      employeeCode: ['SMOxxxx'],
      objectTypeE: [null],
      objectTypeU: [null],
      codeObject: [null],
      lastName: [null, [Validators.required, Validators.maxLength(100), Validators.pattern(/^\S.*$/)]],
      firstName: [null, [Validators.required, Validators.maxLength(100), Validators.pattern(/^\S.*$/)]],
      fullbemName: [{ value: '', disabled: true }],
      dateOfBirth: [null],
      avatarUrl: [null],
      organizations: [null, Validators.required],
      cityId: [null],
      city: [null],
      districtId: [null],
      district: [null],
      wardId: [null],
      ward: [null],
      address: [null, [Validators.maxLength(255)]],
      phoneNumber: this.formBuilder.control(null, {
        validators: [Validators.required, Validators.pattern(/^(\d{10})$/)],
        updateOn: 'blur'
      }),
      personalEmail: [null, [Validators.required, Validators.email]],
      sex: [0],
      staffPositionId: [null, Validators.required],
      staffTitleId: [null, Validators.required],
      managerDirectId: [null, Validators.required],
      organizationId: [null, Validators.required],
      workingStatus: [null, Validators.required],
      probationDate: [null],
      officialDate: [null],
      workPhoneNumber: this.formBuilder.control(null, {
        validators: [Validators.pattern(/^(\d{10})$/)],
        updateOn: 'blur'
      }),
      companyEmail: [null, [Validators.email]],
      accountEmail: [null, [Validators.required, Validators.email]],
      companyId: [null, Validators.required],
      accountStatus: [null],
    });
  }

  //Địa chỉ
  getCitiesByCountry(countryId: number) {
    this.address
      .getCitiesByIdCountry({ id: countryId })
      .subscribe((response) => {
        this.cities = response.data;
        this.citiesProvider = response.data;

        this.employeeForm
          .get('cityId')
          ?.setValue(
            this.cities.find(
              (city) => city.id === this.employeeData?.cityId
            )
          );
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


  getDistrictsByCity(cityId: number) {
    this.address
      .getDistrictsByIdCity({ cityId: cityId })
      .subscribe((districts) => {
        this.districts = districts.data;

        this.employeeForm
          .get('districtId')
          ?.setValue(
            this.districts.find(
              (city) => city.id === this.employeeData?.districtId
            )
          );
      });
  }

  getWardsByDistrict(districtId: number) {
    this.address
      .getWardsByIdDistrict({ districtId: districtId })
      .subscribe((wards) => {
        this.wards = wards.data;

        this.employeeForm
          .get('wardId')
          ?.setValue(
            this.wards.find(
              (city) => city.id === this.employeeData?.wardId
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
    console.log(this.selectedCityId)
    this.getDistrictsByCity(data.value.id);
    this.districts = [];
    this.wards = [];

    console.log(this.districts);
    this.employeeForm.get('wardId')?.setValue(null);
    this.employeeForm.get('districtId')?.setValue(null);
  }

  onDistrictChange(districtId: any) {
    this.selectedDistrictId = districtId.value.id;
    this.getWardsByDistrict(districtId.value.id);
    this.wards = [];
    this.employeeForm.get('wardId')?.setValue(null);
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

  updateFullName() {
    const lastName = this.employeeForm.get('lastName')?.value || '';
    const firstName = this.employeeForm.get('firstName')?.value || '';
    const fullbemName = `${lastName} ${firstName}`.trim(); // Kết hợp họ và đệm + tên

    this.employeeForm.get('fullbemName')?.setValue(fullbemName);
  }

  reloadFormData(data: any) {
    // Reload lại dữ liệu vào form (ví dụ từ API response)
    this.employeeForm.patchValue({
      firstName: data.firstName,
      lastName: data.lastName,
      fullname: data.fullName,
      dateOfBirth: data.dateOfBirth,
      avatarUrl: data.avatarUrl,
      address: data.address,
      phoneNumber: data.phoneNumber,
      personalEmail: data.personalEmail,
      sex: data.sex,
      managerDirectId: data.managerDirectId,
      staffPositionId: data.staffPositionId,
      staffTitleId: data.staffTitleId,
      organizationId: data.organizationId,
      workingStatus: data.workingStatus,
      probationDate: data.probationDate,
      officialDate: data.officialDate,
      workPhoneNumber: data.workPhoneNumber,
      companyEmail: data.companyEmail,
      accountEmail: data.accountEmail,
      companyId: data.companyId,
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
  item = [
    { label: 'Hệ thống', url: '/' },
    { label: 'Thêm đối tượng' }
  ];

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
        this.imageUrlForm = file
        this.imageUrl = e.target?.result;
        console.log(this.imageUrl)
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
    this.imageUrl = null;
    this.employeeData.avatarUrl = '';
  }

  genderOptions: any[] = [
    { label: 'Nam', value: 1 },
    { label: 'Nữ', value: 0 },
    { label: 'Khác', value: 2 }
  ]; // Các lựa chọn giới tính, giá trị tương ứng với sex (1 là Nam, 0 là Nữ)



  dropdownIcon = 'pi pi-chevron-down'; // Mặc định mũi tên xuống

  onDropdownShow() {
    this.dropdownIcon = 'pi pi-chevron-up'; // Thay đổi mũi tên khi dropdown mở
  }

  onDropdownHide() {
    this.dropdownIcon = 'pi pi-chevron-down'; // Thay đổi lại mũi tên khi dropdown đóng
  }

  // Hành động nút "Hủy"
  onCancel() {
    this.display = false;
    this.staffPositionCreateForm.reset();
  }

  onAddSuccess() {
    const selectedOrganizationId = this.staffPositionCreateForm.get('organizationId')?.value;
    this.staffPositionCreateForm.patchValue({ organizationId: selectedOrganizationId });
  }

  onCancelAll() {
    this.employeeForm.reset();
    this.router.navigate(['/object']);
  }

  // Hàm gọi khi click vào icon
  showDialog() {
    this.display = true;
  }

  //validate họ và đệm
  fullName: string = ''; // Họ và tên
  isFullNameInvalid: boolean = false; // Lỗi khi chỉ nhập khoảng trắng
  isFullNameEmpty: boolean = false;  // Lỗi khi để trống hoàn toàn
  isInputFocused: boolean = false;   // Kiểm tra xem input có đang được focus không

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
    }
    else {
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
  firstName: string = '';  // Tên
  isFirstNameEmpty: boolean = false;  // Kiểm tra khi trường tên trống
  isFirstNameSpace: boolean = false;  // Kiểm tra khi chỉ có khoảng trắng

  validateFirstName() {
    // Kiểm tra nếu trường tên trống
    if (this.firstName === '') {
      this.isFirstNameEmpty = true;
      this.isFirstNameSpace = false;
    }
    // Kiểm tra nếu trường tên chỉ chứa khoảng trắng
    else if (this.firstName.trim() === '' || this.firstName.startsWith(' ')) {
      this.isFirstNameEmpty = false;
      this.isFirstNameSpace = true;
    } else {
      this.isFirstNameEmpty = false;
      this.isFirstNameSpace = false;
    }
  }

  emailcn: string = ''; //Email cá nhân

  emailtk: string = '';  // Email tài khoản
  isEmailInvalid: boolean = false;  // Lỗi khi email không hợp lệ
  isEmailExists: boolean = false;   // Lỗi khi email đã tồn tại
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
      for (const orgId of this.staffPositionCreateForm.value.organizations) {
        organizationPositions.push({
          organizationId: orgId.data,
        });
      }

      const formData = {
        positionCode: this.staffPositionCreateForm.value.code.trim(),
        positionName: this.staffPositionCreateForm.value.name.trim(),
        groupPositionId: this.staffPositionCreateForm.value.locationGroup,
        staffTitleId: this.staffPositionCreateForm.value.title,
        organizationPositions: organizationPositions,
      };

      this.staffPositionService.create(formData).subscribe({
        next: (response) => {
          this.loadingService.hide();
          if (response.status) {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Tạo vị trí thành công!',
          });

            // Làm mới form
            this.staffPositionCreateForm.reset();
            this.loadNameposition();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: response.message,
          });
          }
        },
        error: (error) => {
          this.loadingService.hide();
          if (error.status === 400) {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: error.error?.detail || 'Dữ liệu không hợp lệ.',
          });
          } else if (error.status === 404) {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi 404',
              detail: error.detail,
          });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Đã xảy ra lỗi trong quá trình xử lý.',
          });
          }
        },
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
    
    // if (this.isSubmitting) {
    //   return; // Chặn submit nếu đang xử lý
    // }
    const sexValue = this.employeeForm.get('sex')?.value;
    const employeeData = this.employeeForm.value;

    const organizationId = this.employeeForm.get('organizationId')?.value.data;
    console.log("dữ liệu", employeeData);

    const workingStatus = this.employeeForm.get('workingStatus')?.value;
    console.log('Working Status (number):', workingStatus); // Kiểm tra giá trị số
    // Nếu backend yêu cầu giá trị chuỗi "Active" hoặc "Inactive"
    const workingStatusString = workingStatus === Workingstatus.Active ? 0 : 1;
    console.log('Working Status (string):', workingStatusString);
    employeeData.workingStatus = workingStatusString;

    employeeData.accountStatus = this.accountStatus;

    const city = this.employeeForm.get('cityId')?.value || {};
    const district = this.employeeForm.get('districtId')?.value || {};
    const ward = this.employeeForm.get('wardId')?.value || {};

    const formData = new FormData();
    //formData.append('CompanyId', employeeData.companyId);
    formData.append('EmployeeCode', employeeData.employeeCode || '');
    formData.append('LastName', employeeData.lastName);
    formData.append('FirstName', employeeData.firstName);


    formData.append('CityId', city.id ? city.id : '');
    formData.append('City', city.name ? city.name : '');

    formData.append('DistrictId', district.id ? district.id : '');
    formData.append('District', district.name ? district.name : '');

    formData.append('WardId', ward.id ? ward.id : '');
    formData.append('Ward', ward.name ? ward.name : '');

    formData.append('Address', employeeData.address ? employeeData.address : "");

    formData.append('PhoneNumber', employeeData.phoneNumber);
    formData.append('PersonalEmail', employeeData.personalEmail);
    formData.append('Sex', employeeData.sex);
    formData.append('StaffPositionId', employeeData.staffPositionId);
    formData.append('StaffTitleId', employeeData.staffTitleId);
    formData.append('ManagerDirectId', employeeData.managerDirectId);

    const formatToLocalDateString = (date: Date): string => {
      return date.toLocaleDateString('en-CA'); // Định dạng yyyy-MM-dd
    };

    const dateOfBirth = employeeData.dateOfBirth
      ? formatToLocalDateString(new Date(employeeData.dateOfBirth))
      : "";
    const officialDate = employeeData.officialDate
      ? formatToLocalDateString(new Date(employeeData.officialDate))
      : "";
    const probationDate = employeeData.probationDate
      ? formatToLocalDateString(new Date(employeeData.probationDate))
      : "";

    formData.append('DateOfBirth', dateOfBirth);
    formData.append('OfficialDate', officialDate);
    formData.append('ProbationDate', probationDate);

    formData.append('OrganizationId', organizationId);
    formData.append('WorkingStatus', employeeData.workingStatus);
    formData.append('WorkPhoneNumber', employeeData.workPhoneNumber ? employeeData.workPhoneNumber : "");
    formData.append('CompanyEmail', employeeData.companyEmail ? employeeData.companyEmail : "");
    formData.append('AccountEmail', employeeData.accountEmail);
    formData.append('AvatarImage', this.imageUrlForm);

    formData.append('CompanyId', employeeData.companyId);
    formData.append('AccountStatus', employeeData.accountStatus);



    this.loadingService.show();
    this.object.createObject(formData).subscribe(
      (response) => {
        this.loadingService.hide();
        // this.isSubmitting = true;
        if (response.status) {
          const employeeCode = response.data?.employeeCode;
          this.employeeForm.patchValue({ employeeCode: employeeCode });
          const employid = response.data?.id;
          if (this.accountStatus === emailstatus.Peding && employid) {
            // Pass all 4 required arguments
            this.sendActivationEmailRequest(
              employeeData.accountEmail,
              employid,  // Assuming employeeId is available in employeeData
              employeeData.firstName + ' ' + employeeData.lastName,  // Assuming you can construct the name
              employeeData.phoneNumber
            );
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Thêm nhân viên thành công!',
          });


          this.router.navigate(['/object']);

          this.employeeForm.reset();
          this.employeeForm.patchValue({ sex: sexValue });
          this.imageUrl = null;
        } else {

          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: 'Không thể thêm thông tin nhân viên',
          });

        }
      },
      (error) => {
        this.loadingService.hide();
        // this.employeeForm.patchValue({ organizationId: organizationId });
        // this.isSubmitting = true;
        // Xử lý lỗi dựa trên mã trạng thái
        if (error.status === 400) {
          if (error.error?.detail === 'Email đã tồn tại.') {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Email đã tồn tại. Vui lòng sử dụng email khác.',
          });
          } else if (error.error?.detail === 'PhoneNumber đã tồn tại.') {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Số điện thoại đã tồn tại. Vui lòng sử dụng số khác.',
          });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: error.error?.detail || 'Dữ liệu không hợp lệ.',
          });
          }
        } else if (error.status === 404) {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi 404',
            detail: error.detail,
        });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Đã xảy ra lỗi trong quá trình xử lý.',
        });
        }
      }
    );
  }

  //sơn đẹp trai
  isResendEmail = false;
  baseFEUrl = environment.baseFeUrl;
  selectedEmail: any;
  selectedEmployee: any;

  baseImageUrl = environment.baseApiImageUrl

  handleEmailActivationChange(event: any) {
    // Khi checkbox thay đổi, kiểm tra giá trị và cập nhật sendActivationEmail
    this.accountStatus = event.checked ? emailstatus.Peding : emailstatus.NotSend;
  }
  // Gửi yêu cầu kích hoạt email
  sendActivationEmailRequest(email: string, employeeId: number, name: string, phoneNumber: string) {
    const request = {
      employeeId: employeeId,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      urlClient: this.baseFEUrl
    };
    this.authService.sendEmailActive(request).subscribe(
      (res) => {
        console.log(res.status);
        if (res.status) {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Email được gửi kích hoạt thành công!',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: res.message,
        });
        }
        console.log(res)
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
