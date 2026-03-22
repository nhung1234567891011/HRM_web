import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TreeSelectModule } from 'primeng/treeselect';
import pagingConfig, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { ProjectService } from 'src/app/core/services/project.service';
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';

@Component({
	selector: 'app-list-project-by-employee',
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
		TableColumnToggleDirective,
	],
	templateUrl: './list-project-by-employee.component.html',
	styleUrls: ['./list-project-by-employee.component.css']
})
export class ListProjectByEmployeeComponent implements OnInit {


	displayDialog: boolean = false;
	user: any;
	projects: any[] = [];
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

	constructor(
		private projectService: ProjectService,
		private authService: AuthService,
		private messageService: MessageService,
		private router: Router,


	) {
		this.authService.userCurrent.subscribe((user) => {
			this.user = user;
		});
	}

	ngOnInit() {
		this.getProjects();
	}

	getProjects() {
		const request = {
			pageIndex: 1,
			pageSize: 25,
			employeeId: this.user.employee.id,
		};
		this.projectService.getPagingByEmployee(request).subscribe(res => {
			this.projects = res.data.items;
			const { items, ...paging } = res;
			this.paging = paging;
		})
	}


	showDetail(departmentId:any,projectId: any) {
		this.router.navigate(['/department/container-view-department', departmentId!=null?departmentId:'null', 'project-in-department', projectId]);
		this.displayDialog=false;
	}


	showDialog() {
		this.displayDialog = true;
	}
}


export enum ProjectType {
	In, // Trong phòng ban 
	Out // Ngoài phòng ban
}
