import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { environment } from 'src/environments/environment';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import pagingConfig, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { PaginatorModule } from 'primeng/paginator';
import { DepartmentPermission, DepartmentPermissionConstant } from 'src/app/core/enums/department-permission.enum';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { ProjectService } from 'src/app/core/services/project.service';
import { DepartmentService } from 'src/app/core/services/department.service';
import { MessageService } from 'primeng/api';
import { markAllAsTouched } from 'src/app/core/helpers/validatorHelper';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';
@Component({
	selector: 'app-create-project',
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
		CalendarModule,
		ReactiveFormsModule,
		UtilityModule,
		InputTextareaModule,
		TableColumnToggleDirective,
	],
	templateUrl: './create-project.component.html',
	styleUrl: './create-project.component.scss'
})

export class CreateProjectComponent implements OnInit {

	isSubmitting = false;
	displayDialog: any = false;
	displayChooseEmployee: boolean = false;
	displayAssignRole: boolean = false;
	roles: any[] = [];
	departments: any[] = [];
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
	@Input() selectedDepartment: any;
	isDepartmentFromBox: boolean = false;
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


	constructor(private authService: AuthService, private employeeService: EmployeeService,
		private organiStructTypeService: OrganiStructTypeService,
		private cdr: ChangeDetectorRef,
		private projectService: ProjectService,
		private departmentService: DepartmentService,
		private fb: FormBuilder,
		private messageService: MessageService,


	) {
		this.createProjectForm = this.fb.group(
			{
				name: [null, Validators.required],
				departmentId: [null],
				dateRange: [null, Validators.required]
			}
		);
		this.authService.userCurrent.subscribe((user) => {
			this.user = user;
		});
	}

	ngOnInit(): void {
		this.getOrganizations();
		this.getEmployees();
		this.getDepartments();
		this.getRoles();
	}



	//employee select 
	getRoles() {
		this.projectService.getRoles().subscribe(res => {
			this.roles = res.data;
			this.selectedRole = res.data[0]?.id;

		})
	}

	getDepartments() {
		this.departmentService.getAllByEmployee({ organizationId: this.user.organization.id, employeeId:this.user.employee.id}).subscribe(res => {
			this.departments = res.data;
		})
	}

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
			this.user.employee.role = this.roles[0]?.id;
			this.homeEmployees.shift();
			this.homeEmployees.unshift(this.user.employee);
		});

	}
	getOrganizations() {
		const request = { id: this.user.organization.id };
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
			this.user.employee.role = this.roles[0]?.id;
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
		const keyWord = this.queryParameters.employeeName;
		this.getEmployees(keyWord);
	}
	onEmployeeSearchClear() {
		this.queryParameters.employee = null;
		this.queryParameters.employeeId = null;
	}

	onEmployeeSelect(event: any): void {
		const selectedEmployee = event.data;
		selectedEmployee.role = this.selectedRole;
		// console.log('Employee selected:', selectedEmployee);
	}

	onEmployeeUnselect(event: any): void {
		const unselectedEmployee = event.data;
		unselectedEmployee.role = '';
		// console.log('Employee unselected:', unselectedEmployee);
	}

	onEmployeeSelectAll(event: any): void {
		if (event.checked) {
			this.selectedEmployees.forEach(employee => {
				employee.role = this.selectedRole;
			});
		} else {
			this.employees.forEach(employee => {
				if (this.selectedEmployees.includes(employee)) {
					employee.role = this.roles[0]?.id;
				}
			});
		}
		// console.log('Updated selected employees:', this.selectedEmployees);
	}

	onRoleChange(newRole: string): void {
		this.selectedRole = newRole;
		this.selectedEmployees.forEach(employee => {
			employee.role = newRole;
		});
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

	onSubmitCreate() {
		if (this.isSubmitting) {
			return;
		}
		if (this.createProjectForm.valid) {
			const request = this.createProjectForm.value;
			request.organizationId = this.user.organization.id;
			let projectEmployeeRoleMappings = this.selectedEmployees.map(employee => ({
				employeeId: employee.id,
				projectRoleId: employee.role
			}));
			const homeEmployeeMappings = this.homeEmployees.map(employee => ({
				employeeId: employee.id,
				projectRoleId: employee.role
			}));
			projectEmployeeRoleMappings = projectEmployeeRoleMappings.concat(homeEmployeeMappings);

			request.projectEmployeeRoleMappings = projectEmployeeRoleMappings;

			request.startDate=request.dateRange[0]?.toISOString() || null,
			request.endDate=request.dateRange[1]?.toISOString() || null,

			this.isSubmitting = true;
			this.projectService.create(request).subscribe(
				(res) => {
					if (res.status == true) {
						this.messageService.add({
							severity: 'success',
							summary: 'Thành công',
							detail: 'Tạo dự án thành công',
						});
						this.displayDialog = false;
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
			markAllAsTouched(this.createProjectForm);
			this.messageService.add({
				severity: 'warning',
				summary: 'Cảnh báo',
				detail: 'Cần nhập đủ thông tin',
			});
		}
	}


	filterEmployee(event) {
	}







	showDialogAdd(departmentId: number = null) {
		if (departmentId != null) {
			const id = Number(departmentId);
			this.selectedDepartment = id;
			this.isDepartmentFromBox = true;
			this.createProjectForm?.get('departmentId')?.setValue(id);

		}
		this.displayDialog = true;
		// console.log(departmentId);
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




	// validate
	createProjectForm: FormGroup;
	validationMessages = {
		name: [
			{ type: 'required', message: 'Tên dự án không được để trống' },
		],
		departmentId: [
			{ type: 'required', message: 'Phòng ban không được để trống' },
		],
		dateRange: [
			{ type: 'required', message: 'Thời gian dự án là bắt buộc' },
		]
	};

}
