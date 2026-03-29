import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { LeaveApplicationService } from 'src/app/core/services/leave-application.service';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService, SelectItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { DialogModule } from 'primeng/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveApplicationStatus } from 'src/app/core/enums/leave-application-status.enum';
import { DatePipe } from '@angular/common';
import { OrganiStructTypeService } from 'src/app/core/services/organi-struct-type.service';
import pagingConfig, { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_PER_PAGE_OPTIONS } from 'src/app/core/configs/paging.config';
import systemConfig from 'src/app/core/configs/system.config';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { an } from '@fullcalendar/core/internal-common';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { ConfirmDialogComponent } from 'src/app/core/modules/confirm-dialog/confirm-dialog.component';
import { CalendarModule } from 'primeng/calendar';
import { TimeSheetService } from 'src/app/core/services/time-sheet.service';
import { SummaryTimesheetNameEmployeeConfirmService } from 'src/app/core/services/summary-timesheet-name-employee-confirm.service';
import { SummaryTimesheetNameEmployeeConfirmStatus, TimekeepingMethod } from 'src/app/core/enums/summary-timesheet-name-employee-confirm-status.enum';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableColumnToggleDirective } from 'src/app/shared/directives/table-column-toggle.directive';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
	selector: 'app-show-time-sheet',
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
		OverlayPanelModule
	],
	providers: [DatePipe],
	templateUrl: './show-time-sheet.component.html',
	styleUrl: './show-time-sheet.component.scss'
})
export class ShowTimeSheetComponent implements OnInit {

	//enum
	summaryTimesheetNameEmployeeConfirmStatus = SummaryTimesheetNameEmployeeConfirmStatus;
	timekeepingMethod = TimekeepingMethod;
	//var
	breadcrumbs: any[];
	user: any;
	dialogMessage: any = '';
	timeSheets: any[] = [];
	selectedtimeSheets: any[] = [];
	selectedtimeSheet: any = {};
	showRejectTimeSheet: any = false;
	note: any = '';
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
		organization: null,
		keyWord: null,
		employeeId: null,
		employee: null,
		startDate: null,
		endDate: null,
		date: null,
		status: null,
		sortBy: null,
		orderBy: null,
	};

	constructor(private leaveApplicationService: LeaveApplicationService, private router: Router, private datePipe: DatePipe,
		private organiStructTypeService: OrganiStructTypeService,
		private route: ActivatedRoute,
		private employeeService: EmployeeService,
		private authService: AuthService,
		private messageService: MessageService,
		private timeSheetService: TimeSheetService,
		private summaryTimesheetNameEmployeeConfirmService: SummaryTimesheetNameEmployeeConfirmService

	) {
		this.authService.userCurrent.subscribe(user => {
			this.user = user;
		})
	}

	@ViewChild(ConfirmDialogComponent) confirmDialogComponent!: ConfirmDialogComponent;


	ngOnInit(): void {
		this.breadcrumbs = [
			{ label: 'Bảng công' },
			{ label: 'Danh sách bảng công' },
		];

		this.route.queryParams.subscribe((params) => {
			const request = {
				...params,
				employeeId: params['employeeId']
					? params['employeeId'] : this.user?.employee?.id,
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
				keyWord: this.queryParameters.keyWord ? this.queryParameters.keyWord.trim() : null,
				employeeId: this.queryParameters.employee?.id || this.queryParameters.employeeId || null,
				startDate: this.queryParameters.startDate || null,
				endDate: this.queryParameters.endDate || null,
				status: this.queryParameters.status != null ? this.queryParameters.status : null,
				sortBy: this.queryParameters.sortBy || null,
				orderBy: this.queryParameters.orderBy || null
			};
			this.queryParameters.startDate = params['startDate'] || null;
			this.queryParameters.endDate = params['endDate'] || null;
			this.getTimeSheets(request);


		});
	}

	//get data
	public getTimeSheets(request: any): any {
		const currentPageIndex = Number(request?.pageIndex) || 1;
		const currentPageSize = Number(request?.pageSize) || this.config.paging.pageSize;

		this.summaryTimesheetNameEmployeeConfirmService
			.pagingEmployee(request)
			.subscribe((result: any) => {
				if (result?.status) {
					const responseData = result?.data || {};
					const items = Array.isArray(responseData.items) ? responseData.items : [];

					if (
						currentPageIndex !== 1 &&
						items.length === 0
					) {
						const requestWithFirstPage = {
							...this.route.snapshot.queryParams,
							pageIndex: 1,
						};

						this.router.navigate([], {
							relativeTo: this.route,
							queryParams: requestWithFirstPage,
							queryParamsHandling: 'merge',
						});
						return;
					}

					this.timeSheets = items.map((item: any) => {
						const confirmInfo = item?.summaryTimesheetNameEmployeeConfirm || {};
						const status = confirmInfo.status;

						let statusLabel = '';
						switch (status) {
							case SummaryTimesheetNameEmployeeConfirmStatus.Pending:
								statusLabel = 'Đang chờ duyệt';
								break;
							case SummaryTimesheetNameEmployeeConfirmStatus.Confirm:
								statusLabel = 'Đã được phê duyệt';
								break;
							case SummaryTimesheetNameEmployeeConfirmStatus.Reject:
								statusLabel = 'Bị từ chối';
								break;
							default:
								statusLabel = 'Chưa được gửi';
								break;
						}

						let timekeepingMethodLabel = '';
						switch (item.timekeepingMethod) {
							case TimekeepingMethod.Hour:
								timekeepingMethodLabel = 'Theo giờ';
								break;
							case TimekeepingMethod.Day:
								timekeepingMethodLabel = 'Theo ngày';
								break;
							default:
								timekeepingMethodLabel = '';
								break;
						}

						const formattedStartDate = this.datePipe.transform(item?.startDate, 'dd-MM-yyyy') || '';
						const formattedEndDate = this.datePipe.transform(item?.endDate, 'dd-MM-yyyy') || '';
						const timeRange = formattedStartDate && formattedEndDate
							? `${formattedStartDate}=>${formattedEndDate}`
							: formattedStartDate || formattedEndDate;

						return {
							...item,
							summaryTimesheetNameEmployeeConfirm: confirmInfo,
							statusLabel,
							timekeepingMethodLabel,
							time: timeRange,
							startDate: formattedStartDate,
							endDate: formattedEndDate
						};
					});

					if (this.timeSheets.length === 0) {
						this.paging.pageIndex = 1;
					}

					const { items: _items, ...paging } = responseData;
					this.paging = {
						...this.paging,
						...paging,
						pageIndex: Number(paging?.pageIndex) || currentPageIndex,
						pageSize: Number(paging?.pageSize) || currentPageSize,
						totalRecords: Number(paging?.totalRecords) || 0,
						totalPages: Number(paging?.totalPages) || 0,
					};

					this.selectedtimeSheets = [];
					return;
				}

				this.timeSheets = [];
				this.selectedtimeSheets = [];
				this.paging = {
					...this.paging,
					pageIndex: 1,
					pageSize: currentPageSize,
					totalRecords: 0,
					totalPages: 0,
				};
			}, () => {
				this.timeSheets = [];
				this.selectedtimeSheets = [];
				this.paging = {
					...this.paging,
					pageIndex: 1,
					pageSize: currentPageSize,
					totalRecords: 0,
					totalPages: 0,
				};
			});
	}

	//search data
	onSearch() {
		const request = {
			...this.route.snapshot.queryParams,
			organizationId: this.queryParameters.organization?.data || null,
			keyWord: this.queryParameters.keyWord ? this.queryParameters.keyWord.trim() : null,
			employeeId: this.queryParameters.employee?.id || this.queryParameters.employeeId || null,
			startDate: this.queryParameters.startDate || null,
			endDate: this.queryParameters.endDate || null,
			date: this.queryParameters.date || null,
			status: this.queryParameters.status != null ? this.queryParameters.status : null,
			sortBy: this.queryParameters.sortBy || null,
			orderBy: this.queryParameters.orderBy || null,
			pageIndex: 1,
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
		const request = {
			...this.route.snapshot.queryParams,
			pageIndex: event.page + 1,
			pageSize: event.rows,
		};

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: request,
			queryParamsHandling: 'merge',
		});
	}

	getDisplayStartRecord(): number {
		const totalRecords = Number(this.paging?.totalRecords) || 0;
		if (totalRecords === 0 || !this.timeSheets?.length) {
			return 0;
		}

		const pageIndex = Number(this.paging?.pageIndex) || 1;
		const pageSize = Number(this.paging?.pageSize) || this.config.paging.pageSize;
		return (pageIndex - 1) * pageSize + 1;
	}

	getDisplayEndRecord(): number {
		const totalRecords = Number(this.paging?.totalRecords) || 0;
		if (totalRecords === 0 || !this.timeSheets?.length) {
			return 0;
		}

		const pageIndex = Number(this.paging?.pageIndex) || 1;
		const pageSize = Number(this.paging?.pageSize) || this.config.paging.pageSize;
		const pageStart = (pageIndex - 1) * pageSize;
		const currentRows = this.timeSheets.length;
		return Math.min(pageStart + currentRows, totalRecords);
	}

	getVisibleColumnCount(): number {
		const visibleColumns = this.columns.filter((col) => col.selected).length;
		return visibleColumns + 1;
	}



	//handle data
	handleUpdateStatus(timeSheet: any, status: any) {
		const request = {
			summaryTimesheetNameId: timeSheet.summaryTimesheetNameEmployeeConfirm.summaryTimesheetNameId,
			employeeId: timeSheet.summaryTimesheetNameEmployeeConfirm.employeeId,
			status: status,
			note: this.note,
			date: timeSheet.summaryTimesheetNameEmployeeConfirm.date
		}
		this.dialogMessage = `Bạn có muốn ${status === SummaryTimesheetNameEmployeeConfirmStatus.Confirm ? 'xác nhận' : 'từ chối'} bảng chấm công không?`;
		if (status == SummaryTimesheetNameEmployeeConfirmStatus.Confirm) {
			this.confirmDialogComponent.showDialog(() => {
				this.summaryTimesheetNameEmployeeConfirmService.createOrUpdate(request).subscribe(res => {
					if (res.status == true) {
						this.messageService.add({
							severity: 'success',
							summary: 'Thành công',
							detail: 'Xác nhận bảng công thành công',
						});
						this.timeSheets.find(t => t.id == timeSheet.id).summaryTimesheetNameEmployeeConfirm.status = status;
					}
				})

			});
		}
		else {
			this.selectedtimeSheet = timeSheet;
			this.showRejectTimeSheet = true;

		}

	}
	handleUpdateStatusRejectConfirm() {
		const request = {
			summaryTimesheetNameId: this.selectedtimeSheet.summaryTimesheetNameEmployeeConfirm.summaryTimesheetNameId,
			employeeId: this.selectedtimeSheet.summaryTimesheetNameEmployeeConfirm.employeeId,
			status: SummaryTimesheetNameEmployeeConfirmStatus.Reject,
			note: this.note,
			date: this.selectedtimeSheet.summaryTimesheetNameEmployeeConfirm.date
		}
		this.summaryTimesheetNameEmployeeConfirmService.createOrUpdate(request).subscribe(res => {
			if (res.status == true) {
				this.messageService.add({
					severity: 'success',
					summary: 'Thành công',
					detail: 'Xác nhận bảng công thành công',
				});
				this.timeSheets.find(t => t.id == this.selectedtimeSheet.id).summaryTimesheetNameEmployeeConfirm.status = SummaryTimesheetNameEmployeeConfirmStatus.Reject;
				this.selectedtimeSheet = {};
				this.showRejectTimeSheet = false;
			}
		})

	}
























	//front end
	getTimeSheetStatus(status: SummaryTimesheetNameEmployeeConfirmStatus): {
		text: string;
		color: string;
		bgColor: string;
	} {
		switch (status) {
			case SummaryTimesheetNameEmployeeConfirmStatus.Reject:
				return {
					text: 'Bị từ chối',
					color: '#721c24', // màu đỏ đậm
					bgColor: '#f8d7da', // màu đỏ nhạt
				};
			case SummaryTimesheetNameEmployeeConfirmStatus.Pending:
				return {
					text: 'Chờ xác nhận',
					color: '#856404', // màu cam nâu
					bgColor: '#fff3cd', // màu cam nhạt
				};
			case SummaryTimesheetNameEmployeeConfirmStatus.Confirm:
				return {
					text: 'Được chấp nhận',
					color: '#155724', // màu xanh lá đậm
					bgColor: '#d4edda', // màu xanh lá nhạt
				};
			case SummaryTimesheetNameEmployeeConfirmStatus.None:
				return {
					text: 'Chưa được gửi',
					color: '#155724', // màu xanh lá đậm
					bgColor: '#d4edda', // màu xanh lá nhạt
				};
			default:
				return {
					text: 'Tất cả trạng thái',
					color: 'black', // màu đen để rõ ràng
					bgColor: 'white', // màu trắng đơn giản
				};
		}
	}










	//front-end
	columns = [
		{ field: 'timekeepingSheetName', header: 'Tên bảng chấm công', selected: true },
		{ field: 'time', header: 'Thời gian', selected: true },
		{ field: 'timekeepingMethodLabel', header: 'Chấm công', selected: true },
		{ field: 'applyObject', header: 'Đơn vị áp dụng', selected: true },
		{ field: 'position', header: 'Vị trí áp dụng', selected: true },
		{ field: 'status', header: 'Trạng thái', selected: true },
		{ field: 'action', header: 'Hành động', selected: true }
	];

	viLocale = {
		firstDayOfWeek: 1,
		dayNames: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
		dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
		dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
		monthNames: ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu",
			"Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
		monthNamesShort: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
		today: 'Hôm nay',
		clear: 'Xóa'
	};

}
