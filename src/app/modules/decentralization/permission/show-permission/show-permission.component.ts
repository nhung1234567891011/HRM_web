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
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';

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
		InputTextareaModule,
		TableColumnToggleDirective,
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
	currentPageReport: string = '';
	columnSearch: string = '';
	showColumnPanel: boolean = false;
	tempColumnVisibility: Record<string, boolean> = {};
	createParentPermission: any = null;

	// dialog CRUD
	displayPermissionDialog = false;
	permissionDialogMode: 'create' | 'edit' | 'view' = 'create';
	permissionForm: any = {
		id: null,
		name: null,
		displayName: null,
		description: null,
		section: Section.Privilege,
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

	get pageSize(): number {
		return this.paging?.pageSize || DEFAULT_PAGE_SIZE;
	}

	get pageIndex(): number {
		return this.paging?.pageIndex || DEFAULT_PAGE_INDEX;
	}

	get totalRecords(): number {
		return this.paging?.totalRecords || 0;
	}
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
			{ label: 'Quyền hạn' },
			{ label: 'Quyền' },
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

		this.tempColumnVisibility = this.columns.reduce((acc, col) => {
			acc[col.field] = col.selected !== false;
			return acc;
		}, {} as Record<string, boolean>);
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
				this.updateCurrentPageReport();

				this.selectedPermissions = [];
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
		this.updateCurrentPageReport();
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

	openCreateParentDialog() {
		this.openCreateDialog(null);
	}

	openCreateDialog(parentPermission: any) {
		this.permissionDialogMode = 'create';
		this.createParentPermission = parentPermission ?? null;
		this.permissionForm = {
			id: null,
			name: null,
			displayName: null,
			description: null,
			section: parentPermission?.section ?? Section.Privilege,
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
		};
		this.displayPermissionDialog = true;
	}

	savePermission() {
		if (this.permissionDialogMode === 'view') return;

		const description = this.permissionForm.description?.trim();

		const payload = {
			name: this.permissionForm.name?.trim(),
			displayName: this.permissionForm.displayName?.trim(),
			description: description ? description : null,
			section: this.permissionForm.section ?? null,
		};

		const isCreateParentPermission =
			this.permissionDialogMode === 'create' && !this.createParentPermission;
		const isUpdatePermission = this.permissionDialogMode === 'edit';

		if (
			(isCreateParentPermission || isUpdatePermission) &&
			(!payload.name ||
				!payload.displayName ||
				payload.section === null ||
				payload.section === undefined ||
				!payload.description)
		) {
			this.messageService.add({
				severity: 'error',
				summary: 'Thiếu thông tin',
				detail: 'Vui lòng nhập đầy đủ Mã quyền hạn, Tên hiển thị, Phân hệ và Mô tả.',
			});
			return;
		}

		if (!payload.name || !payload.displayName) {
			this.messageService.add({
				severity: 'error',
				summary: 'Thiếu thông tin',
				detail: 'Vui lòng nhập Tên quyền hạn và Tên hiển thị.',
			});
			return;
		}

		if (this.permissionDialogMode === 'create') {
			const parentPermissionId = this.createParentPermission?.id ?? null;

			this.permissionService.create({
				...payload,
				parentPermissionId
			}).subscribe((res: any) => {
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
				this.createParentPermission = null;
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
				this.createParentPermission = null;
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
		{ field: 'name', header: 'Mã quyền hạn', selected: true },
		{ field: 'displayName', header: 'Tên hiển thị quyền hạn', selected: true },
		{ field: 'description', header: 'Mô tả', selected: true },
		{ field: 'action', header: 'Hành động', selected: true }
	];

	get filteredColumnOptions() {
		const keyword = this.columnSearch.trim().toLowerCase();
		if (!keyword) {
			return this.columns;
		}

		return this.columns.filter((col) =>
			col.header.toLowerCase().includes(keyword)
		);
	}

	toggleColumnPanel(): void {
		if (this.showColumnPanel) {
			this.closeColumnPanel();
			return;
		}

		this.tempColumnVisibility = this.columns.reduce((acc, col) => {
			acc[col.field] = col.selected !== false;
			return acc;
		}, {} as Record<string, boolean>);
		this.columnSearch = '';
		this.showColumnPanel = true;
	}

	closeColumnPanel(): void {
		this.showColumnPanel = false;
		this.columnSearch = '';
	}

	onTempColumnToggle(field: string): void {
		this.tempColumnVisibility[field] = !this.tempColumnVisibility[field];
	}

	isTempColumnVisible(field: string): boolean {
		return this.tempColumnVisibility[field] !== false;
	}

	selectAllColumns(): void {
		this.columns.forEach((col) => {
			this.tempColumnVisibility[col.field] = true;
		});
	}

	clearAllColumns(): void {
		this.columns.forEach((col) => {
			this.tempColumnVisibility[col.field] = false;
		});
	}

	applyColumnChanges(): void {
		this.columns = this.columns.map((col) => ({
			...col,
			selected: this.tempColumnVisibility[col.field] !== false,
		}));
		this.showColumnPanel = false;
	}

	isColumnVisible(field: string): boolean {
		return this.columns.find((col) => col.field === field)?.selected !== false;
	}

	updateCurrentPageReport(): void {
		const totalRecords = Number(this.paging?.totalRecords || 0);
		const pageIndex = Number(this.paging?.pageIndex || 1);
		const pageSize = Number(this.paging?.pageSize || 10);

		if (totalRecords <= 0) {
			this.currentPageReport =
				'<strong>0</strong> - <strong>0</strong> trong <strong>0</strong> bản ghi';
			return;
		}

		const startRecord = (pageIndex - 1) * pageSize + 1;
		const endRecord = Math.min(pageIndex * pageSize, totalRecords);
		this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${totalRecords}</strong> bản ghi`;
	}

}




