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
import { PermissionService } from 'src/app/core/services/decentralization/permission.service';
import { Section, SectionLabel } from 'src/app/core/enums/section.enum';

@Component({
	selector: 'app-show-permission',
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
		InputTextareaModule
	],
	providers: [DatePipe],
	templateUrl: './show-permission.component.html',
	styleUrl: './show-permission.component.scss'
})
export class ShowPermissionComponent implements OnInit {
	//var 
	breadcrumbs: any[];
	user: any;
	permissions: any[] = [];
	permissionsTree: any[] = [];
	selectedPermissions: any[] = [];
	parentPermissionOptions: Array<{ label: string; value: number }> = [];

	// dialog CRUD
	displayPermissionDialog = false;
	permissionDialogMode: 'create' | 'edit' | 'view' = 'create';
	permissionForm: any = {
		id: null,
		name: null,
		displayName: null,
		description: null,
		section: Section.Privilege,
		parentPermissionId: null,
	};
	sectionLabel = SectionLabel;
	section = Section;
	confirmMessage = 'Bạn có chắc chắn muốn xóa quyền này không?';
	@ViewChild(ConfirmDialogComponent) confirmDialogComponent!: ConfirmDialogComponent;
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
		keyword: null,
		sortBy: null,
		orderBy: null,
	};
	constructor(private router: Router, private datePipe: DatePipe,
		private organiStructTypeService: OrganiStructTypeService,
		private route: ActivatedRoute,
		private employeeService: EmployeeService,
		private authService: AuthService,
		private messageService: MessageService,
		private permissionService: PermissionService

	) {
		this.authService.userCurrent.subscribe(user => {
			this.user = user;
		})
	}


	ngOnInit(): void {
		this.breadcrumbs = [
			{ label: 'Danh sách quyền hạn', routeLink: '/decentralization/permission' },
			{ label: 'Danh sách' },
		];
		this.route.queryParams.subscribe((params) => {
			const keyword = params['keyword'] ? String(params['keyword']).trim() : null;
			const pageIndex = params['pageIndex']
				? Number(params['pageIndex'])
				: this.config.paging.pageIndex;
			const pageSize = params['pageSize']
				? Number(params['pageSize'])
				: this.config.paging.pageSize;

			const request = {
				...params,
				organizationId: params['organizationId']
					? params['organizationId']
					: this.user?.organization?.id,
				pageIndex,
				pageSize,
				keyword,
			};

			this.queryParameters = {
				...this.queryParameters,
				keyword,
				organizationId: request.organizationId,
				sortBy: params['sortBy'] || null,
				orderBy: params['orderBy'] || null,
			};

			this.paging.pageIndex = pageIndex;
			this.paging.pageSize = pageSize;

			this.getPermissions(request);
		});
	}

	private flattenPermissions(nodes: any[], level: number = 0): any[] {
		const result: any[] = [];
		(nodes || []).forEach((node) => {
			result.push({ ...node, _level: level });
			if (node?.childrens?.length) {
				result.push(...this.flattenPermissions(node.childrens, level + 1));
			}
		});
		return result;
	}

	private rebuildParentOptions() {
		this.parentPermissionOptions = (this.permissions || [])
			.filter((p) => p?.id != null)
			.map((p) => {
				const prefix = p?._level ? `${'— '.repeat(p._level)}` : '';
				const label = `${prefix}${p.displayName || p.name || ''}`.trim();
				return { label: label || `#${p.id}`, value: p.id };
			});
	}


	//get data
	getPermissions(request: any) {
		const apiRequest = {
			...request,
			name: request.keyword ? request.keyword : null,
			description: request.keyword ? request.keyword : null,
			displayName: request.keyword ? request.keyword : null
		};

		this.permissionService.paging(apiRequest).subscribe(res => {
			if (res.status == true) {
				this.permissionsTree = res.data.items;
				this.permissions = this.flattenPermissions(res.data.items);
				if (this.permissions.length === 0) {
					this.paging.pageIndex = 1;
				}

				const { items, ...paging } = res.data;
				this.paging = paging;

				this.selectedPermissions = [];
				this.rebuildParentOptions();
			}
		})
	}
	//search data
	onSearch() {
		const params = this.route.snapshot.queryParams;
		const keyword = this.queryParameters.keyword
			? String(this.queryParameters.keyword).trim()
			: null;
		const request = {
			...params,
			pageIndex: 1,
			organizationId: params['organizationId'] || this.user?.organization?.id || null,
			keyword: keyword,
			sortBy: this.queryParameters.sortBy || null,
			orderBy: this.queryParameters.orderBy || null
		};

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: request,
			queryParamsHandling: 'merge',
		});
	}

	onPageChange(event: any) {
		this.paging.pageIndex = event.page + 1;
		this.paging.pageSize = event.rows;
		const params = this.route.snapshot.queryParams;
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
	}

	onRefreshSearch() {
		this.queryParameters.keyword = null;

		const params = this.route.snapshot.queryParams;
		const request = {
			...params,
			pageIndex: 1,
			organizationId: null,
			keyword: null,
			sortBy: null,
			orderBy: null
		};

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: request,
			queryParamsHandling: 'merge',
		});
	}

	openCreateDialog() {
		this.permissionDialogMode = 'create';
		this.permissionForm = {
			id: null,
			name: null,
			displayName: null,
			description: null,
			section: Section.Privilege,
			parentPermissionId: null,
		};
		this.displayPermissionDialog = true;
	}

	openEditDialog(permission: any, mode: 'edit' | 'view' = 'edit') {
		this.permissionDialogMode = mode;
		this.permissionForm = {
			id: permission?.id ?? null,
			name: permission?.name ?? null,
			displayName: permission?.displayName ?? null,
			description: permission?.description ?? null,
			section: permission?.section ?? Section.Privilege,
			parentPermissionId: permission?.parentPermissionId ?? null,
		};
		this.displayPermissionDialog = true;
	}

	savePermission() {
		if (this.permissionDialogMode === 'view') return;

		const payload = {
			name: this.permissionForm.name?.trim(),
			displayName: this.permissionForm.displayName?.trim(),
			description: this.permissionForm.description ?? null,
			section: this.permissionForm.section,
			parentPermissionId: this.permissionForm.parentPermissionId ?? null,
		};

		if (!payload.name || !payload.displayName) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Thiếu thông tin',
				detail: 'Vui lòng nhập Tên quyền hạn và Tên hiển thị.',
			});
			return;
		}

		if (this.permissionDialogMode === 'create') {
			this.permissionService.create(payload).subscribe((res: any) => {
				if (res?.status === false) {
					this.messageService.add({
						severity: 'error',
						summary: 'Thất bại',
						detail: res?.message || 'Thêm quyền thất bại',
					});
					return;
				}
				this.messageService.add({
					severity: 'success',
					summary: 'Thành công',
					detail: res?.message || 'Thêm quyền hạn thành công',
				});
				this.displayPermissionDialog = false;
				this.reloadData();
			});
			return;
		}

		const id = this.permissionForm.id;
		this.permissionService.update({ id }, payload).subscribe((res: any) => {
			if (res?.status) {
				this.messageService.add({
					severity: 'success',
					summary: 'Thành công',
					detail: res?.message || 'Cập nhật quyền hạn thành công',
				});
				this.displayPermissionDialog = false;
				this.reloadData();
			} else {
				this.messageService.add({
					severity: 'error',
					summary: 'Thất bại',
					detail: res?.message || 'Cập nhật quyền hạn thất bại',
				});
			}
		});
	}

	requestDelete(permission: any) {
		const id = permission?.id;
		if (!id) return;

		this.confirmMessage = `Bạn có chắc chắn muốn xóa quyền "${permission?.displayName || permission?.name}" không?`;
		this.confirmDialogComponent.showDialog(() => {
			this.permissionService.delete({ id }).subscribe((res: any) => {
				if (res?.status) {
					this.messageService.add({
						severity: 'success',
						summary: 'Thành công',
						detail: res?.message || 'Xóa quyền hạn thành công',
					});
					this.reloadData();
				} else {
					this.messageService.add({
						severity: 'error',
						summary: 'Thất bại',
						detail: res?.message || 'Xóa quyền hạn thất bại',
					});
				}
			});
		});
	}

	private reloadData() {
		const params = this.route.snapshot.queryParams;
		const request = {
			...params,
			pageIndex: params['pageIndex']
				? params['pageIndex']
				: this.config.paging.pageIndex,
			pageSize: params['pageSize']
				? params['pageSize']
				: this.config.paging.pageSize,
		};
		this.getPermissions(request);
	}


	//data front end
	columns = [
		{ field: 'name', header: 'Tên quyền hạn', selected: true },
		{ field: 'displayName', header: 'Tên hiển thị quyền hạn', selected: true },
		{ field: 'description', header: 'Mô tả', selected: true },
		{ field: 'action', header: 'Hành động', selected: true }
	];

}




