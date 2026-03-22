import { TabViewModule } from 'primeng/tabview';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { TreeSelectModule } from 'primeng/treeselect';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import pagingConfig, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/configs/paging.config';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { DepartmentPermission, DepartmentPermissionConstant } from 'src/app/core/enums/department-permission.enum';
import systemConfig from 'src/app/core/configs/system.config';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { DepartmentService } from 'src/app/core/services/department.service';
import { MessageService } from 'primeng/api';
import { markAllAsTouched } from 'src/app/core/helpers/validatorHelper';
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';

@Component({
	selector: 'app-establish',
	standalone: true,
	imports: [
		CommonModule,
		DialogModule,
		ButtonModule,
		DropdownModule,
		InputTextModule,
		FormsModule,
		AutoCompleteModule,
		TableModule,
		CheckboxModule,
		TreeSelectModule,
		PaginatorModule,
		RadioButtonModule,
		InputTextModule,
		TabViewModule,
		CalendarModule,
		InputTextareaModule,
		UtilityModule,
		TableColumnToggleDirective,

	],
	templateUrl: './establish.component.html',
	styleUrls: ['./establish.component.css']
})
export class EstablishComponent implements OnInit {

	isSubmitting = false;


	visible: boolean = false;
	visibleEmp: boolean = false;
	displayDialog: any = false;
	visibleRole: boolean = false;
	displayChooseEmployee: boolean = false;
	displayAssignRole: boolean = false;

	employee: any;
	employeeEmail: string = '';
	selectedEmployee: any;
	selectedEmployees: any[] = [];
	homeEmployees: any[] = [];
	filteredEmployees: any[];
	user: any;
	baseImageUrl = environment.baseApiImageUrl;


	structures: any[] = [{ name: 'Tất cả cơ cấu', code: 'all' }];
	selectedStructure: any;

	employees: any[] = [];

	// selectedDepartment: any = null;
	@Input() departmentId: any;
	isDepartmentFromBox: boolean = false;
	departments: any[] = []
	department: any = {};
	dateRange: Date[] | null = null;


	//employee select
	public paging: any = {
		pageIndex: DEFAULT_PAGE_INDEX,
		pageSize: DEFAULT_PAGE_SIZE,
		sortBy: '',
		orderBy: '',
		totalRecords: 0,
		totalPages: 0,
	};
	public config: any = {
		paging: pagingConfig.default,
		baseUrl: systemConfig.baseFileSystemUrl,
		perPageOptions: DEFAULT_PER_PAGE_OPTIONS,
		pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
	};
	public queryParameters: any = {
		...this.config.paging,
		organizationId: null,
		organization: null,
		keyWord: null,
		employeeId: null,
		employee: null,
		startDate: null,
		endDate: null,
		numberOfDays: null,
		typeOfLeaveId: null,
		salaryPercentage: null,
		reasonForLeave: null,
		note: null,
		status: null,
		sortBy: null,
		orderBy: null,
	};
	organizations: any[] = [];

	//assign role
	selectedRole: any = DepartmentPermission.FullAccess;

	//constant
	permissionOptions = DepartmentPermissionConstant;

	selectedCategories: any[] = [];

	categories: any[] = [
		{ name: 'Accounting', key: 'A' },
		{ name: 'Marketing', key: 'M' },
		{ name: 'Production', key: 'P' },
		{ name: 'Research', key: 'R' }
	];

	constructor(private authService: AuthService, private employeeService: EmployeeService,
		private organiStructTypeService: OrganiStructTypeService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		private departmentService: DepartmentService,
		private messageService: MessageService,


	) {
		this.authService.userCurrent.subscribe((user) => {
			this.user = user;
		});
		this.updateDepartmentForm = this.fb.group(
			{
				name: [null, Validators.required],
				description: [null],

			}
		);
		this.authService.userCurrent.subscribe((user) => {
			this.user = user;
		});
	}

	ngOnInit() {
	}
	getDepartment(departmentId: any) {
		this.departmentService.getById({ id: departmentId }).subscribe(res => {
			this.department = res.data;
		})
	}


	showDialog(departmentId: number = null) {
		if (departmentId != null) {
			const id = Number(departmentId);
			this.departmentId = id;
			this.departmentService.getById({ id: departmentId }).subscribe(res => {
				this.department = res.data;
				this.updateDepartmentForm.patchValue({
					name: this.department.name,
					description: this.department.description,
				});
			})
		}
		this.displayDialog = true;

		this.getOrganizations();
		this.getEmployees();
		this.visible = true;

	}

	closeDialog() {

		this.visible = false;
	}

	showDialogEmp() {
		this.getOrganizations();
		this.getEmployees();
		this.visibleEmp = true;
	}

	closeDialogEmp() {
		this.visibleEmp = false;
	}

	addEmployee() {
		if (this.selectedEmployee && !this.employees.find(m => m.email === this.selectedEmployee.email)) {
			this.employees.push(this.selectedEmployee);
		}
	}

	removeEmployee(employee) {
		this.selectedEmployees = this.selectedEmployees.filter(m => m !== employee);
	}

	editEmployee(employee) {
	}

	save() {

	}

	filterEmployee(event) {
	}







	showDialogAdd(departmentId: number = null) {
		if (departmentId != null) {
			const id = Number(departmentId);
			this.departmentId = id;
			this.isDepartmentFromBox = true;
		}
		this.displayDialog = true;
	}

	closeDialogAdd() {
		this.displayDialog = false;
	}

	onChooseEmployee() {
		this.displayDialog = false;
		this.displayChooseEmployee = true;
		this.displayAssignRole = false;
	}

	onContinueAssignRole() {
		this.displayDialog = false;
		this.displayChooseEmployee = false;
		this.displayAssignRole = true;
	}

	onContinueAdd() {
		this.displayDialog = true;
		this.displayChooseEmployee = false;
		this.displayAssignRole = false;
	}
	//employee select
	getEmployees(keyWord: any = null, organization: any = null) {
		const request = {
			pageIndex: 1,
			pageSize: 25,
			organizationId: organization ? organization.node.data : this.user.organization.id,
			keyWord: keyWord,
		};
		this.employeeService.paging(request).subscribe((res) => {
			this.employees = res.items.filter(item => item.id !== this.user.employee.id).map((data) => {
				const fullName = data.lastName + ' ' + data.firstName;
				return {
					...data,
					fullName: fullName,
					displayLabel: `${fullName} - ${data.accountEmail}`,
				};
			});
			const { items, ...paging } = res;
			this.paging = paging;
			//
			this.user.employee.fullName = this.user.employee.lastName + ' ' + this.user.employee.firstName
			this.user.employee.organization = this.user.organization;
			this.user.employee.permission = this.permissionOptions.find(x => x.key == DepartmentPermission.FullAccess).key;
			this.homeEmployees.shift();
			this.homeEmployees.unshift(this.user.employee);
		});

	}
	getOrganizations() {
		const request = { id: this.user.organization.id };;
		this.organiStructTypeService
			.getOrganiStructType(request.id)
			.subscribe((res) => {
				if (res && res.data) {
					this.organizations = [this.handleConvertToTree(res.data)];
				} else {
					this.organizations = [];
				}

				this.handleConvertToTreeSelect();
			});
	}
	onRefreshSearch() {
		this.getEmployees(null);
	}


	onChangeOrganization(organization: any) {
		const request = {
			pageIndex: 1,
			pageSize: 25,
			organizationId: organization ? organization.node.data : this.user.organization.id,
			keyWord: this.queryParameters.employee || null,
		};
		this.employeeService.paging(request).subscribe((res) => {
			this.employees = res.items.filter(item => item.id !== this.user.employee.id).map((data) => {
				const fullName = data.lastName + ' ' + data.firstName;
				return {
					...data,
					fullName: fullName,
					displayLabel: `${fullName} - ${data.accountEmail}`,
				};
			});
			const { items, ...paging } = res;
			this.paging = paging;
			//
			this.user.employee.fullName = this.user.employee.lastName + ' ' + this.user.employee.firstName
			this.user.employee.organization = this.user.organization;
			this.user.employee.permission = this.permissionOptions.find(x => x.key == DepartmentPermission.FullAccess).key;
			this.homeEmployees.shift();
			this.homeEmployees.unshift(this.user.employee);
		});
	}

	onCheckboxChange(employee: any, event: any): void {

	}
	onPageChange(event: any) {
		this.paging.pageIndex = event.page + 1;
		this.paging.pageSize = event.rows;
		const request = {
			pageIndex: this.paging.pageIndex,
			pageSize: this.paging.pageSize,
			organizationId: this.queryParameters.organization?.data || this.user.organization.id,
			keyWord: this.queryParameters.keyWord,
		};
		this.employeeService.paging(request).subscribe((res) => {
			this.employees = res.items.filter(item => item.id !== this.user.employee.id).map((data) => {
				const fullName = data.lastName + ' ' + data.firstName;
				return {
					...data,
					fullName: fullName,
					displayLabel: `${fullName} - ${data.accountEmail}`,
				};
			});
			const { items, ...paging } = res;
			this.paging = paging;
			//
			this.user.employee.fullName = this.user.employee.lastName + ' ' + this.user.employee.firstName
			this.user.employee.organization = this.user.organization;
			this.user.employee.permission = this.permissionOptions.find(x => x.key == DepartmentPermission.FullAccess).key;
			this.homeEmployees.shift();
			this.homeEmployees.unshift(this.user.employee);
		});
	}
	onSearch() {
	}

	onEmployeeSearch(event: any): void {
		// this.getEmployees();
		// console.log("event",event);
		// const keyWord = event.data;
		const keyWord = this.queryParameters.employeeName;
		this.getEmployees(keyWord);
	}
	onEmployeeSearchClear() {
		this.queryParameters.employee = null;
		this.queryParameters.employeeId = null;
	}













	//  function convert
	handleConcatenatePropertyValues(
		items: any[],
		propertyName1: string
	): string {
		if (!items || items.length === 0) {
			return '';
		}
		return items
			.map((item) => item[propertyName1])
			.filter((value) => value)
			.join(', ');
	}
	handleConvertToTree(node: any): any {
		if (!node.id) {
			console.log('node không có id:', node);
		}
		return {
			label: node.organizationName,
			data: node.id,
			children: (node.organizationChildren || []).map((child: any) =>
				this.handleConvertToTree(child)
			),
		};
	}

	handleMapToTreeNode(node: any): any {
		return {
			label: node.label,
			data: node.data,
			children: node.children || [],
		};
	}

	handleConvertToTreeSelect() {
		if (Array.isArray(this.organizations)) {
			this.organizations = this.organizations.map((organization) =>
				this.handleMapToTreeNode(organization)
			);
		} else {
			console.error(
				'organizations không phải là mảng',
				this.organizations
			);
		}
	}




	onSubmitUpdateBaseInfo() {
		if (this.isSubmitting) {
			return;
		}
		if (this.updateDepartmentForm.valid) {
			const request = this.updateDepartmentForm.value;
			request.id = this.departmentId;

			this.isSubmitting = true;
			this.departmentService.updateDepartmentBasicInfo(request).subscribe(
				(res) => {
					if (res.status == true) {
						this.messageService.add({
							severity: 'success',
							summary: 'Thành công',
							detail: 'Cập nhập ban thành công',
						});
						// this.displayDialog = false;
					}
					else {
						this.messageService.add({
							severity: 'error',
							summary: 'Thất bại',
							detail: res.message,
						});
					}
				},
				(exception) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Lỗi',
						detail: 'Lỗi hệ thống',
					});
					this.isSubmitting = false;

				},
				() => {
					this.isSubmitting = false;
				})
		}
		else {
			markAllAsTouched(this.updateDepartmentForm);
			this.messageService.add({
				severity: 'warning',
				summary: 'Cảnh báo',
				detail: 'Cần nhập đủ thông tin',
			});
		}
	}






	// validate
	updateDepartmentForm: FormGroup;
	validationMessages = {
		name: [
			{ type: 'required', message: 'Tên phòng ban không được để trống' },
		]
	};


}
