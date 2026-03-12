import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService, SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { DialogModule } from 'primeng/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import pagingConfig, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RoleService } from 'src/app/core/services/decentralization/role.service';
import { TruncatePipe } from 'src/app/core/pipes/truncate.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-show-role',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableModule,
		CheckboxModule,
		ButtonModule,
		PaginatorModule,
		InputTextModule,
		DropdownModule,
		ToolbarModule,
		BreadcrumbModule,
		TreeSelectModule,
		DialogModule,
		FormsModule,
		AutoCompleteModule,
		UtilityModule,
		CalendarModule,
		InputTextareaModule,
		TruncatePipe
	],
	providers: [DatePipe],
	templateUrl: './show-role.component.html',
	styleUrl: './show-role.component.scss'
})
export class ShowRoleComponent implements OnInit {
	//var 
	breadcrumbs: any[];
	user: any;
	roles:any[]=[];
	selectedRoles:any[]=[];

	@ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
	//search
	paging: any = {
		pageIndex: DEFAULT_PAGE_INDEX,
		pageSize: DEFAULT_PAGE_SIZE,
		sortBy: '',
		orderBy: '',
		totalRecords: 0,
		totalPages: 0,
	};
	config: any = {
		paging: pagingConfig.default,
		baseUrl: systemConfig.baseFileSystemUrl,
		perPageOptions: DEFAULT_PER_PAGE_OPTIONS,
		pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
	};
	queryParameters: any = {
		...this.config.paging,
		organizationId: null,
		name: null,
		description: null,
		sortBy: null,
		orderBy: null,
	};
	constructor(private router: Router, private datePipe: DatePipe,
		private organiStructTypeService: OrganiStructTypeService,
		private route: ActivatedRoute,
		private employeeService: EmployeeService,
		private authService: AuthService,
		private messageService: MessageService,
		private roleService: RoleService,
		private toastr: ToastrService,

	) {
		this.authService.userCurrent.subscribe(user => {
			this.user = user;
		})
	}


	ngOnInit(): void {
		this.breadcrumbs = [
			{ label: 'Danh sách vai trò', routeLink: '/decentralization/role' },
			{ label: 'Danh sách' },
		];

		this.route.queryParams.subscribe((params) => {
			const request = {
				...params,
				organizationId: params['organizationId']
					? params['organizationId'] : this.user.organization.id,
				pageIndex: params['pageIndex']
					? params['pageIndex']
					: this.config.paging.pageIndex,
				pageSize: params['pageSize']
					? params['pageSize']
					: this.config.paging.pageSize
			};
			this.queryParameters = {
				...params,
				organizationId: this.queryParameters.organization?.data || null,
				name: this.queryParameters.name ? this.queryParameters.name.trim() : null,
				description: this.queryParameters.description ? this.queryParameters.description : null,
				sortBy: this.queryParameters.sortBy || null,
				orderBy: this.queryParameters.orderBy || null
			};
			this.getRoles(request);
		});
	}


	//get data
	getRoles(request: any) {
		this.roleService.getPaging(request).subscribe(res => {
			if (res.status == true) {
				this.roles = res.data.items;
				if (this.roles.length === 0) {
					this.paging.pageIndex = 1;
				}

				const { items, ...paging } = res.data;
				this.paging = paging;

				this.selectedRoles = [];
			}
		})
	}
	//search data
	onSearch() {
		this.route.queryParams.subscribe(params => {
			const request = {
				...params,
				organizationId: this.queryParameters.organization?.data || null,
				name: this.queryParameters.name ? this.queryParameters.name.trim() : null,
				description: this.queryParameters.description ? this.queryParameters.description : null,
				sortBy: this.queryParameters.sortBy || null,
				orderBy: this.queryParameters.orderBy || null
			};

			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: request,
				queryParamsHandling: 'merge',
			});
		});
	}

	onPageChange(event: any) {
		this.paging.pageIndex = event.page + 1;
		this.paging.pageSize = event.rows;
		this.route.queryParams.subscribe((params) => {
			const request = {
				...params,
				pageIndex: event.page + 1,
				pageSize: event.rows,
			};

			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: request,
				queryParamsHandling: 'merge',
			});
		});
	}

	onRefreshSearch() {
		this.route.queryParams.subscribe(params => {
			const request = {
				...params,
				organizationId: null,
				name: null,
				description: null,
				sortBy: null,
				orderBy: null
			};

			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: request,
				queryParamsHandling: 'merge',
			});
		});
	}

	//handle data
	handleDelete(role: any) {
		this.confirmDialog.message = `Bạn có chắc chắn muốn xoá vai trò "${role.name}"?`;
		this.confirmDialog.showDialog(() => {
			this.roleService.delete(role.id).subscribe({
				next: (res: any) => {
					if (res?.status) {
						this.toastr.success(res.message || 'Xoá vai trò thành công!');
					} else {
						this.toastr.error(res?.message || 'Xoá vai trò thất bại!');
					}
					this.reloadRoles();
				},
				error: (err) => {
					console.error(err);
					this.toastr.error('Có lỗi xảy ra khi xoá vai trò!');
				}
			});
		});
	}

	  reloadRoles() {
		const params = this.route.snapshot.queryParams;
		const request = {
		  ...params,
		  organizationId: params['organizationId']
			? params['organizationId']
			: this.user.organization.id,
		  pageIndex: params['pageIndex']
			? params['pageIndex']
			: this.config.paging.pageIndex,
		  pageSize: params['pageSize']
			? params['pageSize']
			: this.config.paging.pageSize,
		};
	
		this.getRoles(request);
	  }

	onAdd(){
		this.router.navigate(['/decentralization/role/create'])
	}

	
	//data front end
	columns = [
		{ field: 'name', header: 'Tên quyền hạn', selected: true },
		{ field: 'description', header: 'Mô tả', selected: true },
		{ field: 'action', header: 'Hành động', selected: true }
	];

	expandState = {};

	toggleDescription(id) {
	  this.expandState[id] = !this.expandState[id];
	}

}
