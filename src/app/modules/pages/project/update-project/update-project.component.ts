import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import pagingConfig, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { DepartmentPermission } from 'src/app/core/enums/department-permission.enum';
import { markAllAsTouched } from 'src/app/core/helpers/validatorHelper';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { DepartmentService } from 'src/app/core/services/department.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { environment } from 'src/environments/environment';
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';
@Component({
	selector: 'app-update-project',
	standalone: true,
	imports: [
		DialogModule,
		TableModule,
		ButtonModule,
		TabViewModule,
		CommonModule,
		FormsModule,
		MultiSelectModule,
		DropdownModule,
		CalendarModule,
		ReactiveFormsModule,
		TreeModule,
		TreeSelectModule,
		UtilityModule,
		InputTextModule,
		InputTextareaModule,
		PaginatorModule,
		RadioButtonModule,
		TableColumnToggleDirective,
	],
	templateUrl: './update-project.component.html',
	styleUrl: './update-project.component.scss'
})
export class UpdateProjectComponent implements OnInit {
	//flag
	displayModal: boolean = false;
	displayDialogAddEmployee: boolean = false;
	displayChooseEmployee: boolean = false;
	displayAssignRole: boolean = false;

	//var
	dialogMessage: any = '';
	departments: any[] = [];
	employeesIn: any[] = [];
	employeesNotIn: any[] = [];
	user: any;
	isSubmitting = false;
	roles: any[] = [];
	selectedEmployee: any;
	selectedEmployees: any[] = [];
	employees: any[] = [];
	baseImageUrl = environment.baseApiImageUrl;
	selectedRole: any = DepartmentPermission.FullAccess;

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

	public pagingEmployeesIn: any = {
		pageIndex: DEFAULT_PAGE_INDEX,
		pageSize: DEFAULT_PAGE_SIZE,
		sortBy: '',
		orderBy: '',
		totalRecords: 0,
		totalPages: 0,
	};
	public paging: any = {
		pageIndex: DEFAULT_PAGE_INDEX,
		pageSize: DEFAULT_PAGE_SIZE,
		sortBy: '',
		orderBy: '',
		totalRecords: 0,
		totalPages: 0,
	};

	@Input() project: any = {};

	@ViewChild(ConfirmDialogComponent)
	confirmDialogComponent!: ConfirmDialogComponent;
	constructor(
		private fb: FormBuilder,
		private departmentService: DepartmentService,
		private authService: AuthService,
		private messageService: MessageService,
		private projectService: ProjectService,
		private organiStructTypeService: OrganiStructTypeService,

	) {
		this.updateProjectForm = this.fb.group(
			{
				name: [null, Validators.required],
				description: [null],
				departmentId: [null],
				dateRange: [null, Validators.required]
			}
		);
		this.authService.userCurrent.subscribe((user) => {
			this.user = user;
		});
	}


	ngOnInit(): void {
		this.updateProjectForm.patchValue({
			name: this.project.name,
			description: this.project.description,
			departmentId: this.project.departmentId,
			// dateRange: {
			// 	start: new Date(this.project.startDate),
			// 	end: new Date(this.project.endDate)
			// }
			dateRange: [new Date(this.project.startDate), new Date(this.project.endDate)]

		});

		this.getDepartments();
		this.getRoles();

	}

	getDepartments() {
		this.departmentService.getAllByEmployee({ organizationId: this.user.organization.id, employeeId: this.user.employee.id }).subscribe(res => {
			this.departments = res.data;
		})
	}

	getRoles() {
		this.projectService.getRoles().subscribe(res => {
			this.roles = res.data;
			this.selectedRole = res.data[0]?.id;
		})
	}

	getEmployeeInProject(request: any) {
		this.projectService.pagingEmployeeInDepartment(request).subscribe(res => {
			this.employeesIn = res.items;
			const { items, ...paging } = res;
			this.pagingEmployeesIn = paging;
		})
	}

	getEmployeesNotInProject(keyWord: any = null, organization: any = null, projectId: any) {
		const request = {
			pageIndex: 1,
			pageSize: 25,
			organizationId: organization ? organization.node.data : this.user.organization.id,
			keyWord: keyWord,
			projectId: projectId
		};
		this.projectService.pagingEmployeeNotInDepartment(request).subscribe((res) => {
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
		});

	}


	showModal() {
		this.updateProjectForm.patchValue({
			name: this.project.name,
			description: this.project.description,
			departmentId: this.project.departmentId,
			dateRange: [new Date(this.project.startDate), new Date(this.project.endDate)]
		});
		this.displayModal = true;
		this.getEmployeeInProject({ projectId: this.project.id });
		this.getEmployeesNotInProject(null, null, this.project.id);
		this.getOrganizations();

	}

	onSubmitUpdate() {
		if (this.isSubmitting) {
			return;
		}
		if (this.updateProjectForm.valid) {
			const request = this.updateProjectForm.value;
			request.startDate = request.dateRange[0]?.toISOString() || null;
			request.endDate = request.dateRange[1]?.toISOString() || null;
			request.id = this.project.id;
			this.isSubmitting = true;
			this.projectService.updateDepartmentBasicInfo(request).subscribe(
				(res) => {
					if (res.status == true) {
						this.messageService.add({
							severity: 'success',
							summary: 'Thành công',
							detail: 'Cập nhập dự án thành công',
						});
						// this.displayModal = false;
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
			markAllAsTouched(this.updateProjectForm);
			this.messageService.add({
				severity: 'warning',
				summary: 'Cảnh báo',
				detail: 'Cần nhập đủ thông tin',
			});
		}
	}

	handleDeleteEmployee(lastName: any, firstName: any, projectId: any, employeeId: any) {
		this.dialogMessage = `Bạn có muốn xóa ${lastName + " " + firstName} ra khỏi dự án ${this.project.name} không?`;
		this.confirmDialogComponent.showDialog(() => {
			this.projectService.removeEmployeeFromProject({ employeeId: employeeId, projectId: projectId }).subscribe(res => {
				if (res.status == true) {
					this.messageService.add({
						severity: 'success',
						summary: 'Thông báo',
						detail: 'Thành công',
					});
					this.employeesIn = this.employeesIn.filter(item => item.employeeId != employeeId);
				}
			});
		});
	}

	handleUpdateRoleEmployee(projectId: any, employeeId: any, projectRoleId: any) {
		this.projectService.updateRoleEmployeeFromProject({ employeeId: employeeId, projectId: projectId, projectRoleId: projectRoleId }).subscribe(res => {
			if (res.status == true) {
				this.messageService.add({
					severity: 'success',
					summary: 'Thông báo',
					detail: 'Cập nhập quyền thành công ',
				});
			}
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
	onAddEmployee() {
		// Chuẩn bị một đối tượng request với danh sách các nhân viên và project ID
		const request = {
			projectId: this.project.id,
			employees: this.selectedEmployees.map(item => ({
				employeeId: item.id,
				projectRoleId: item.role
			}))
		};

		this.projectService.addMultipleEmployeeToProject(request).subscribe((res) => {
			if (res.status) {
				this.messageService.add({
					severity: 'success',
					summary: 'Thành công',
					detail: 'Thêm thành viên vào dự án thành công',
				});
				this.displayDialogAddEmployee = false;
				this.displayChooseEmployee = false;
				this.displayAssignRole = false;
				this.selectedEmployees = [];
				this.getEmployeeInProject({ projectId: this.project.id });
				this.getEmployeesNotInProject(null, null, this.project.id);

			}
		}, (err) => {
			this.messageService.add({
				severity: 'error',
				summary: 'Lỗi',
				detail: 'Có lỗi xảy ra khi thêm nhân viên: ' + err.message,
			});
		});
	}



	onChangeOrganization(organization: any) {
		const request = {
			pageIndex: 1,
			pageSize: 25,
			organizationId: organization ? organization.node.data : this.user.organization.id,
			keyWord: this.queryParameters.employee || null,
			projectId: this.project.id,
		};
		this.projectService.pagingEmployeeNotInDepartment(request).subscribe((res) => {
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
		});
	}

	onCheckboxChange(employee: any, event: any): void {

	}

	onPageEmployeeNotInProjectChange(event: any) {
		this.paging.pageIndex = event.page + 1;
		this.paging.pageSize = event.rows;
		const request = {
			pageIndex: this.paging.pageIndex,
			pageSize: this.paging.pageSize,
			organizationId: this.queryParameters.organization?.data || this.user.organization.id,
			keyWord: this.queryParameters.keyWord,
			projectId: this.project.id,
		};
		this.projectService.pagingEmployeeNotInDepartment(request).subscribe((res) => {
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
		});
	}

	onPageChange(event: any) {
		this.pagingEmployeesIn.pageIndex = event.page + 1;
		this.pagingEmployeesIn.pageSize = event.rows;
		const request = {
			projectId: this.project.id,
			pageIndex: this.pagingEmployeesIn.pageIndex,
			pageSize: this.pagingEmployeesIn.pageSize,
			// organizationId: this.queryParameters.organization?.data || this.user.organization.id,
			// keyWord: this.queryParameters.keyWord,
		};
		this.getEmployeeInProject(request);
	}
	onSearch() {
	}
	onRefreshSearch() {
		this.getEmployeesNotInProject(null, null, this.project.id);
	}
	onEmployeeSearch(event: any): void {
		const keyWord = this.queryParameters.employeeName;
		this.getEmployeesNotInProject(keyWord, null, this.project.id);
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


	// validate
	updateProjectForm: FormGroup;
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





	onShowAddEmployee() {
		this.displayDialogAddEmployee = true;
		this.displayChooseEmployee = false;
		this.displayAssignRole = false;
		this.selectedEmployees = [];
		this.getEmployeeInProject({ projectId: this.project.id });
		this.getEmployeesNotInProject(null, null, this.project.id);
	}

	onChooseEmployee() {
		this.displayDialogAddEmployee = false;
		this.displayChooseEmployee = true;
		this.displayAssignRole = false;
	}

	onContinueAssignRole() {
		this.displayDialogAddEmployee = false;
		this.displayChooseEmployee = false;
		this.displayAssignRole = true;
	}

	onContinueAdd() {
		this.displayDialogAddEmployee = true;
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


}
