import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { StaffDetailService } from 'src/app/core/services/staff-detail.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';
import { TimeSheetService } from 'src/app/core/services/time-sheet.service';

@Component({
  selector: 'app-detailed-attendance',
  templateUrl: './detailed-attendance.component.html',
  styleUrl: './detailed-attendance.component.scss',
  providers: [ConfirmationService],
})
export class DetailedAttendanceComponent implements OnInit {
  messages: any[] = [];
  filteredName: any[] = [];
  selectedEmployee: any;
  detailTimesheet: any;
  items: MenuItem[] | undefined;
  pageSize: number = 30;
  pageIndex: number = 1;
  totalRecords: number = 0;
  currentPageReport: string = '';
  currentMonthYear: Date;
  filteredAttendance = [];
  selectedUnit: any = null;
  treeData: TreeNode[] = [];
  staffPosition: any[] = [];
  selectedNode: any;
  displayDialog: boolean = false;
  detailForm!: FormGroup;
  optionPosition: any;
  invalidDateRange = false;
  selectedDate: Date = new Date();
  showDateError: boolean = false;
  timekeepingMethodOption = [
    { label: 'Theo giờ', value: 0 },
    { label: 'Theo ngày', value: 1 }
  ];
  expandedRows: { [key: number]: boolean } = {};

  showErrorOrganizationId: boolean = false;
  showErrorTimekeepingSheetName: boolean = false;
  showErrorStartDate: boolean = false;
  showErrorEndDate: boolean = false;
  showErrorTimekeepingMethod: boolean = false;
  showErrorDetailTimesheet: boolean = false;
  public userCurrent: any;
  public permissionConstant = PermissionConstant;

  constructor(
    private organizationService: OrganizationService,
    private staffPositionService: StaffPositionService,
    private staffDetailService: StaffDetailService,
    private timeSheetService: TimeSheetService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    public permisionHelper: HasPermissionHelper
  ) {
    this.authService.userCurrent.subscribe((user) => {
      this.userCurrent = user;
    });
  }


  ngOnInit() {
        this.items = [
            { label: 'Chấm công' },
            { label: 'Chấm công chi tiết' },
        ];

    this.currentMonthYear = new Date(); // Tháng năm hiện tại
    this.initForm();
    this.getOrganizations();
    this.getStaffPosition();
    this.getPagingDetailTimesheet();

    this.detailForm.valueChanges.subscribe(() => {
      this.checkDateDifference();
    });
  }

  initForm() {
    this.detailForm = this.fb.group({
      organizationId: [null, Validators.required],
      timekeepingSheetName: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      timekeepingMethod: ['', Validators.required],
      detailTimesheetNameStaffPositions: [[], Validators.required],
    });
  }

  checkDateDifference() {
    const startDate = this.detailForm.get('startDate')?.value;
    const endDate = this.detailForm.get('endDate')?.value;

    if (startDate && endDate) {
      // Chuyển ngày về 0h:00m:00s (mốc nửa đêm)
      const startAtMidnight = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      const endAtMidnight = new Date(new Date(endDate).setHours(0, 0, 0, 0));

      // Tính khoảng cách ngày (bao gồm cả ngày bắt đầu)
      const differenceInMs = endAtMidnight.getTime() - startAtMidnight.getTime();
      const dayDifference = differenceInMs / (1000 * 60 * 60 * 24) + 1; // +1 để tính cả ngày bắt đầu

      // Kiểm tra nếu lớn hơn 31 ngày
      this.showDateError = dayDifference > 31;
    } else {
      this.showDateError = false;
    }
  }


  getWorkStatus(isLock: any): {
    text: string;
    color: string;
    bgcolor: string;
  } {
    switch (isLock) {
      case true:
        return {
          text: 'Khóa',
          color: '#155724', // Màu xanh lá đậm hơn
          bgcolor: '#d4edda', // Màu xanh lá nhạt hơn
        };
      case false:
        return {
          text: 'Chưa khóa',
          color: '#494949', // Màu xám đậm hơn
          bgcolor: '#ececec', // Màu xám nhạt hơn
        };
      default:
        return {
          text: 'Không rõ', // Để xác định trạng thái không xác định
          color: 'black',
          bgcolor: 'white',
        };
    }
  }

  toggleRow(id: string, event: Event): void {
    event.preventDefault(); // Ngăn không reload trang
    this.expandedRows[id] = !this.expandedRows[id]; // Đổi trạng thái mở/đóng của hàng theo id
  }

  getPagingDetailTimesheet(): void {
    const month = this.currentMonthYear.getMonth() + 1; // Tháng bắt đầu từ 0
    const year = this.currentMonthYear.getFullYear();
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      Month: month,
      Year: year,
      name: this.selectedEmployee?.displayName || "",
      organizationId: this.selectedNode?.data?.id || this.userCurrent.organization.id,
    };

    this.staffDetailService.getPaging(request)
      .subscribe(
        (response: any) => {
          this.detailTimesheet = response.data.items.map(item => {
            const positionNames = item.detailTimesheetNameStaffPositions.map(position => position.positionName).join(', ');
            return {
              ...item,
              positionNames: positionNames
            };
          });
          this.totalRecords = response.data.totalRecords;
          this.updateCurrentPageReport();
        },
        (error: any) => {
          console.error(error);
        }
      );
  }

  searchName(event: any): void {
    const query = event.query.toLowerCase();

    this.staffDetailService.getPaging({
      name: query,
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    }).subscribe((response: any) => {
      this.filteredName = response.data.items.map((item: any) => ({
        displayName: item.timekeepingSheetName, // Lấy timekeepingSheetName
        id: item.id
      }));
    }, (error: any) => {
      console.error(error);
    });
  }


  getOrganizations(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    };
    this.organizationService.getPagingAll(request).subscribe((response) => {
      if (response.status) {
        this.treeData = this.transformToTreeNode(response.data.items);
        const selectedNode = this.findNodeById(this.treeData, this.userCurrent.organization.id);
        if (selectedNode) {
          this.selectedNode = selectedNode;
        }
      }
    });
  }
  findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.data.id === id) {
        return node; // Nếu tìm thấy node phù hợp
      }
      if (node.children && node.children.length > 0) {
        const found = this.findNodeById(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null; // Không tìm thấy
  }
  getStaffPosition(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    };
    this.staffPositionService.getPaging(request).subscribe((response) => {
      if (response.status) {
        this.staffPosition = response.data.items.map((item: any) => ({
          id: item.id,
          name: item.positionName
        }));
      }
    });
  }

  transformToTreeNode(data: any[]): TreeNode[] {
    return data.map(item => ({
      label: item.organizationName,
      data: item,
      children: item.organizationChildren ? this.transformToTreeNode(item.organizationChildren) : [],
      expanded: false
    }));
  }

  isAllPositionsMatch(positionNames: string): boolean {
    // Tạo một mảng các vị trí từ `positionNames`
    const positions = positionNames.split(', ').map(name => name.trim());

    // Kiểm tra xem tất cả các vị trí trong `positions` có tồn tại trong `this.staffPosition`
    // Nếu một vị trí không có trong `staffPosition`, trả về false
    return positions.length === this.staffPosition.length &&
      positions.every(positionName =>
        this.staffPosition.some(staffPos => staffPos.name === positionName)
      );
  }

  showDialogAdd() {
    this.displayDialog = true;
  }

  closeDialogAdd() {
    this.displayDialog = false; // Đóng dialog
    this.detailForm.reset(); // Reset form về trạng thái ban đầu
    this.showErrorOrganizationId = false;
    this.showErrorDetailTimesheet = false;
    this.showErrorTimekeepingSheetName = false;
    this.showErrorStartDate = false;
    this.showErrorEndDate = false;
    this.showErrorTimekeepingMethod = false;
    this.invalidDateRange = false; // Reset thông báo lỗi khoảng cách ngày
  }


  formatTimeRange(time: { startDate: Date; endDate: Date }): string {
    const startDate = time.startDate.toLocaleDateString('vi-VN');
    const endDate = time.endDate.toLocaleDateString('vi-VN');
    return `${startDate} - ${endDate}`;
  }

  // Chuyển về tháng trước
  prevMonth(): void {
    const prev = new Date(this.currentMonthYear);
    prev.setMonth(this.currentMonthYear.getMonth() - 1);
    this.currentMonthYear = prev;
    this.getPagingDetailTimesheet();
  }

  // Chuyển sang tháng sau
  nextMonth(): void {
    const next = new Date(this.currentMonthYear);
    next.setMonth(this.currentMonthYear.getMonth() + 1);
    this.currentMonthYear = next;
    this.getPagingDetailTimesheet();
  }


  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.pageIndex = event.page + 1;
    this.getPagingDetailTimesheet();
  }

  goToPreviousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.getPagingDetailTimesheet();
    }
  }

  goToNextPage(): void {
    const lastPage = Math.ceil(this.totalRecords / this.pageSize);
    if (this.pageIndex < lastPage) {
      this.pageIndex++;
      this.getPagingDetailTimesheet();
    }
  }
  updateCurrentPageReport(): void {
    const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
    const endRecord = Math.min(
      this.pageIndex * this.pageSize,
      this.totalRecords
    );
    if (this.totalRecords === 0) {
      this.currentPageReport = `<strong>0</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
    }
    if (this.totalRecords > 0) {
      this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
    }
  }

  addTimesheetDetail(): void {
    const detailData = this.detailForm.value;
    let hasError = false;

    if (!detailData.organizationId || detailData.organizationId.length === 0) {
      this.showErrorOrganizationId = true;
      hasError = true;
    }

    if (!detailData.detailTimesheetNameStaffPositions || detailData.detailTimesheetNameStaffPositions.length === 0) {
      this.showErrorDetailTimesheet = true;
      hasError = true;
    }

    if (!detailData.timekeepingSheetName || detailData.timekeepingSheetName.length === 0) {
      this.showErrorTimekeepingSheetName = true;
      hasError = true;
    }

    if (!detailData.startDate || detailData.startDate.length === 0) {
      this.showErrorStartDate = true;
      hasError = true;
    }

    if (!detailData.endDate || detailData.endDate.length === 0) {
      this.showErrorEndDate = true;
      hasError = true;
    }

    if (!detailData.timekeepingMethod && detailData.timekeepingMethod.length === 0) {
      this.showErrorTimekeepingMethod = true;
      hasError = true;
    }

    if (hasError) {
      this.messages = [
        {
          severity: 'error',
          summary: 'Không thể lưu vì:',
          detail: 'Đang có lỗi cần được chỉnh sửa',
          life: 3000,
        },
      ];
      return;
    }

    const formValue = this.detailForm.value;

    const selectedStaffPositionIds = formValue.detailTimesheetNameStaffPositions.map((item: any) => item.id);

    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);

    // Lấy múi giờ địa phương và điều chỉnh ngày
    const startOffset = startDate.getTimezoneOffset() * 60000; // Múi giờ trong mili giây
    const localStartDate = new Date(startDate.getTime() - startOffset).toISOString(); // Thời gian điều chỉnh theo múi giờ địa phương

    const endOffset = endDate.getTimezoneOffset() * 60000; // Múi giờ trong mili giây
    const localEndDate = new Date(endDate.getTime() - endOffset).toISOString();

    const payload = {
      organizationId: formValue.organizationId?.data?.id,
      timekeepingSheetName: formValue.timekeepingSheetName,
      startDate: localStartDate,
      endDate: localEndDate,
      timekeepingMethod: formValue.timekeepingMethod,
      detailTimesheetNameStaffPositions: selectedStaffPositionIds.map((staffPositionId: number) => ({
        staffPositionId: staffPositionId
      }))
    };

    // Gửi API
    this.staffDetailService.create(payload).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.messages = [
            {
              severity: 'success',
              summary: 'Thành công',
              detail: 'Thêm mới thành công',
              life: 3000,
            },
          ];
          this.closeDialogAdd();
          this.getPagingDetailTimesheet();
        } else {
          this.messages = [
            {
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Đã có lỗi xảy ra',
              life: 3000,
            },
          ];
        }
      },
      error: (error) => {
        this.messages = [
          {
            severity: 'error',
            summary: 'Thất bại',
            detail: 'Đã có lỗi xảy ra',
            life: 3000,
          },
        ];
      }
    });
  }

  /** Điều hướng sang trang xem chi tiết bảng chấm công */
  viewDetailTimesheet(detail: any): void {
    if (detail?.id) {
      this.router.navigate(['/timesheet', detail.id]);
    }
  }

  /** Xác nhận và gọi API xóa bảng chấm công chi tiết */
  confirmDeleteDetailTimesheet(event: Event, detail: any): void {
    if (!detail?.id) return;
    const name = detail.timekeepingSheetName || 'bảng chấm công';
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Bạn có chắc chắn muốn xóa bảng chấm công "${name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.timeSheetService.delete(detail.id).subscribe({
          next: (response: any) => {
            if (response?.status) {
              this.messages = [
                { severity: 'success', summary: 'Thành công', detail: response.message || 'Xóa bảng chấm công chi tiết thành công.', life: 3000 },
              ];
              this.getPagingDetailTimesheet();
            } else {
              this.messages = [
                { severity: 'warn', summary: 'Thông báo', detail: response?.message || 'Không thể xóa.', life: 3000 },
              ];
            }
          },
          error: (err: any) => {
            const msg = err?.error?.message || err?.message || 'Không thể xóa bảng chấm công chi tiết.';
            this.messages = [
              { severity: 'error', summary: 'Lỗi', detail: msg, life: 5000 },
            ];
          },
        });
      },
      reject: () => {},
    });
  }

}
