import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { TreeSelectModule } from 'primeng/treeselect';
import { dateRangeValidator, markAllAsTouched } from 'src/app/core/helpers/validatorHelper';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { DelegationService } from 'src/app/core/services/delegation.service';
import { DepartmentService } from 'src/app/core/services/department.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';

@Component({
	selector: 'app-delegacy-dialog',
	standalone: true,
	imports:
		[
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
			BrowserModule,
			TreeSelectModule,
			UtilityModule,
			TableColumnToggleDirective,
		],
	providers: [DatePipe],

	templateUrl: './delegacy-dialog.component.html',
	styleUrl: './delegacy-dialog.component.scss'
})
export class DelegacyDialogComponent implements OnInit {

	//flash
	isSubmitting = false;
	displayModal: boolean = false;
	displayDelegateModal: boolean = false;
	calendarIcon: string = 'pi pi-calendar';
	user: any;
	delegations = [
		{ delegateName: 'Nguyen Hai Duong', project: 'Kế toán nội bộ', timeFrame: '1/02/2024 - 1/4/2024' }
	];
	departments: any[] = [];
	employees = [
		{ id: 1, name: 'Nguyen Hai Duong' },
		{ id: 2, name: 'Le Thi Hoa' }
	];
	// projects = [
	// 	{ id: 1, name: 'Kế toán thuế' },
	// 	{ id: 2, name: 'Kế toán nội bộ' }
	// ];

	projects: any[] = [];
	selectedProjects: TreeNode[] = [];
	selectedEmployee = null; startDate: Date;
	endDate: Date;

	constructor(
		private delegationService: DelegationService,
		private authService: AuthService,
		private departmentService: DepartmentService,
		private employeeService: EmployeeService,
		private projectService: ProjectService,
		private fb: FormBuilder,
		private messageService: MessageService,

	) {

		this.createDelegacyForm = this.fb.group(
			{
				startDate: [null, [Validators.required]],
				endDate: [null, [Validators.required]],
				projectIds: [[], [Validators.required]],
				employeeIds: [[], [Validators.required]],

			},
			{
				validators: dateRangeValidator()

			}
		);
		this.authService.userCurrent.subscribe(res => {
			this.user = res;
		})

	}


	ngOnInit(): void {
		this.getDelegations();
		this.getEmployees();
		this.getDepartments();
		this.getProjects();
	}

	getDelegations() {
		this.delegationService.getAllByEmployeeDelegation({ employeeDelegationId: this.user.employee.id }).subscribe(res => {
			this.delegations = res.data;
		})
	}

	getDepartments() {
		this.departmentService.getAllByEmployee({ organizationId: this.user.organization.id, employeeId: this.user.employee?.id }).subscribe(res => {
			if (res && res.data) {
				// const mappedDepartments = res.data.map(department => ({
				// 	label: department.name || 'Không tên',
				// 	value: department.id,
				// 	projects: department.projects ? department.projects.map(project => ({
				// 		label: project.name || 'Không tên dự án',
				// 		value: project.id
				// 	})) : []
				// }));
				// this.departments = mappedDepartments;
				this.departments = this.transformData(res.data);
			}
		});
	}

	getEmployees() {
		const request = {
			pageIndex: 1,
			pageSize: 10000,
			organizationId: this.user.organization.id,
		};
		this.employeeService.paging(request).subscribe((res) => {
			this.employees = res.items.map((data) => {
				const fullName = data.lastName + ' ' + data.firstName;
				return {
					...data,
					fullName: fullName,
				};
			});
		});
	}

	getProjects() {
		this.projectService.getAllByEmployee({ employeeId: this.user.employee.id }).subscribe(res => {
			this.projects = res.data;
		})
	}

	showDialog() {
		this.displayModal = true;
	}

	showDelegateDialog() {
		this.displayModal = false;
		this.displayDelegateModal = true;
	}


	onSubmit() {
		if (this.isSubmitting) {
			return;
		}
		if (this.createDelegacyForm.valid) {
			const request = this.createDelegacyForm.value;
			request.employeeDelegationId = this.user.employee.id;
			this.delegationService.create(request).subscribe(
				(res) => {
					if (res.status == true) {
						this.messageService.add({
							severity: 'success',
							summary: 'Thành công',
							detail: 'Thêm ủy quyền thành công',
						});
						//xong
						this.displayModal = true;
						this.displayDelegateModal = false;
						this.getDelegations();

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
			markAllAsTouched(this.createDelegacyForm);
			this.messageService.add({
				severity: 'warning',
				summary: 'Cảnh báo',
				detail: 'Cần nhập đủ thông tin',
			});
		}
	}



	//change data
	transformData(departments: any[]): any[] {
		return departments.map(department => {
			return {
				label: department.name,
				data: department.id,
				selectable: false,
				children: department.projects.map(project => ({
					label: project.name,
					data: project.id,
					selectable: true,
				}))
			};
		});
	}



	// validate
	createDelegacyForm: FormGroup;
	validationMessages = {
		startDate: [
			{ type: 'required', message: 'Ngày bắt đầu không được để trống' },
		],
		endDate: [
			{ type: 'required', message: 'Ngày kết thúc không được để trống' },
			{
				type: 'dateRange',
				message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu',
			},
		],
		employeeIds: [
			{ type: 'required', message: 'Phải chọn ít nhất 1 người được ủy quyền' },
		],
		projectIds: [
			{ type: 'required', message: 'Phải chọn ít nhất 1 dự án ủy quyền' },
		],
	};

}
