import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, TreeNode } from 'primeng/api';
import { CheckinCheckoutService } from 'src/app/core/services/checkin-checkout.service';
import { CompanyInfoService } from 'src/app/core/services/company-info.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { ShiftWorkService } from 'src/app/core/services/shift-work.service';
import { ShiftService } from 'src/app/core/services/shift.service';

@Component({
  selector: 'app-apply-checkin-checkout',
  templateUrl: './apply-checkin-checkout.component.html',
  styleUrl: './apply-checkin-checkout.component.scss'
})
export class ApplyCheckinCheckoutComponent implements OnInit {
  messages: any[] = [];
  checkInCheckOuts!: any;
  employees: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any;
  selectedContract: any;
  items: MenuItem[] | undefined;
  pageSize: number = 30;
  unitOptions: any[] = [];
  pageIndex: number = 1;
  totalRecords: number = 0;
  currentPageReport: string = '';
  keyWord: string = '';
  treeData: TreeNode[] = [];
  selectedNode: any;
  isTerminateDialogVisible: boolean = false;
  updateExpiryDate = 'no';
  expiryDate: Date | null = null;
  selectedContractId: number | null = null;
  effectiveDate: Date | null = null;
  selectedContractStatus: any = null;
  selectedCompany: any = {};
  contractDelete!: any;
  showDiaLogDelete: boolean = false;
  employeess: any[] = [];
  represenSigning: any[] = [];
  units: any[] = [];
  shiftWorks: any[] = [];
  showCheckIn = false;
  showCheckOut = false;
  displayDialog = false;
  displayDialogEdit = false;
  checkInForm: FormGroup;
  checkInUpdateForm: FormGroup;
  showEmojiPicker = false;
  emojiList = ['😀', '😂', '😍', '😎', '🤔', '😭', '😡', '🥳', '😜', '😇'];
  user: any;
  selected: any;

  allColumns = [
    { field: 'employeeCode', header: 'Mã nhân viên' },
    { field: 'fullName', header: 'Họ và Tên NLĐ' },
    { field: 'timeCheckIn', header: 'Thời gian chấm vào' },
    { field: 'timeCheckOut', header: 'Thời gian chấm ra' },
    { field: 'reason', header: 'Lý do' },
    { field: 'date', header: 'Ngày gửi' },
    { field: 'approver', header: 'Người duyệt' },
    { field: 'status', header: 'Trạng thái' },
  ];
  selectedColumns: any[] = [...this.allColumns];
  showColumnPanel = false;

  contractOption = [
    { name: 'Tất cả hợp đồng', value: null },
    { name: 'Hợp đồng đang có hiệu lực', value: false },
    { name: 'Hợp đồng hết hiệu lực', value: true },
  ];

  constructor(
    private contractService: ContractService,
    private employeeService: EmployeeService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private companyService: CompanyInfoService,
    private shiftWorkService: ShiftWorkService,
    private shiftService: ShiftService,
    private checkinCheckoutService: CheckinCheckoutService,
    private fb: FormBuilder,
  ) {

    this.checkInForm = this.fb.group({
      approverId: [null, Validators.required],
      date: [null, Validators.required],
      time: [null],
      timeCheckIn: [null],
      timeCheckOut: [null],
      checkType: [[]],
      shiftCatalogId: [null, Validators.required],
      reason: [null, Validators.required],
      description: [null],
    });

    this.checkInUpdateForm = this.fb.group({
      approverId: [null, Validators.required],
      date: [null, Validators.required],
      time: [null],
      timeCheckIn: [null],
      timeCheckOut: [null],
      checkType: [[]],
      shiftCatalogId: [null, Validators.required],
      reason: [null, Validators.required],
      description: [null],
    });

    this.authService.userCurrent.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.items = [
      { label: 'Đơn từ', route: '/installation' },
      { label: 'Đơn xin CheckIn/CheckOut' },
    ];

    this.getPaging();
    this.loadEmployees();
    this.getAllShiftWork();
  }

  onEdit(contract: any) {
    console.log('Sửa hợp đồng:', contract);
  }

  onDuplicate(contract: any) {
    console.log('Nhân bản hợp đồng:', contract);
  }

  onSendEmail(contract: any) {
    console.log('Gửi email:', contract);
  }

  onCreateDocument(contract: any) {
    console.log('Tạo văn bản:', contract);
  }

  onPrint(contract: any) {
    console.log('In hợp đồng:', contract);
  }

  onDelete(contract: any) {
    console.log('Xóa hợp đồng:', contract);
  }

  getPaging(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      keyWord: this.keyWord ? this.keyWord.trim() : null
    };

    this.checkinCheckoutService.getPaging(request).subscribe(
      (response: any) => {
        this.checkInCheckOuts = response.data.items;
        this.totalRecords = response.data.totalRecords;
        this.updateCurrentPageReport();
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  // Tìm kiếm theo từ khóa, không cần gợi ý

  showDialog() {
    this.displayDialog = true;
  }

  resetForm() {
    this.checkInForm.reset();
  }
  resetFormEdit() {
    this.checkInUpdateForm.reset();
  }
  showDialogEdit(checkInOutId: number) {
    this.checkinCheckoutService.getById(checkInOutId)
      .subscribe((response: any) => {
        this.selected = response.data;

        const date = new Date(this.selected.date);

        const timeCheckIn = this.convertTimeToDate(this.selected.timeCheckIn, date);
        const timeCheckOut = this.convertTimeToDate(this.selected.timeCheckOut, date);

        let checkTypeArray = [];
        if (this.selected.checkType === 0) {
          checkTypeArray = ['checkIn'];
        } else if (this.selected.checkType === 1) {
          checkTypeArray = ['checkOut'];
        } else if (this.selected.checkType === 2) {
          checkTypeArray = ['checkIn', 'checkOut'];
        }

        this.showCheckIn = checkTypeArray.includes('checkIn');
        this.showCheckOut = checkTypeArray.includes('checkOut');

        this.checkInUpdateForm.patchValue({
          id: this.selected.id,
          approverId: this.selected.approverId,
          date: date,
          timeCheckIn: timeCheckIn,
          timeCheckOut: timeCheckOut,
          checkType: checkTypeArray,
          shiftCatalogId: this.selected.shiftCatalogId,
          description: this.selected.description,
          reason: this.selected.reason,
        });
        this.displayDialogEdit = true;
      },
        (error) => {
          console.error('Error fetching news:', error);
        }
      );
  }

  convertTimeToDate(timeString: string, baseDate: Date): Date | null {
    if (!timeString) return null;

    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const date = new Date(baseDate);  // Copy từ ngày đã có để giữ nguyên ngày tháng
    date.setHours(hours, minutes, seconds || 0, 0);

    return date;
  }


  loadEmployees(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
    };
    this.employeeService.getEmployees(request).subscribe((data) => {
      this.employeess = data.items.map((employee: any) => ({
        id: employee.id,
        name: `${employee.lastName} ${employee.firstName}`,
        employeeCode: employee.employeeCode,
        organizationId: employee.organization.id || '',
        positionName: employee.staffPosition?.positionName,
      }));

      this.units = [
        ...new Set(
          data.items
            .map((employee: any) => ({
              id: employee.organization.id || '',
              name:
                employee.organization.organizationName ||
                'Không xác định',
            }))
            .filter((unit) => unit.id)
        ),
      ];

      this.represenSigning = data.items
        .filter((employee: any) => employee.workingStatus === 0)
        .map((employee: any) => ({
          id: employee.id,
          name: `${employee.lastName} ${employee.firstName}`,
          employeeCode: employee.employeeCode,
          organizationId: employee.organization.id || '',
          positionName: employee.staffPosition?.positionName,
        }));
    });
  }

  getAllShiftWork(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
    };
    this.shiftService.getPaging(request).subscribe(
      (shiftWork: any) => {
        this.shiftWorks = shiftWork.data.items;
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  onCheckTypeChange(event: any, checkValue: string) {
    let selectedTypes = this.checkInForm.get('checkType')?.value || [];

    if (event.checked) {
      // Nếu checkbox được chọn, thêm giá trị vào mảng nếu chưa có
      if (!selectedTypes.includes(checkValue)) {
        selectedTypes.push(checkValue);
      }
    } else {
      // Nếu bỏ chọn, loại bỏ giá trị khỏi mảng
      selectedTypes = selectedTypes.filter((item: string) => item !== checkValue);

      // Reset giá trị khi checkbox bị bỏ chọn
      if (checkValue === 'checkIn') {
        this.checkInForm.patchValue({ timeCheckIn: null });
      } else if (checkValue === 'checkOut') {
        this.checkInForm.patchValue({ timeCheckOut: null });
      }
    }

    // Cập nhật FormControl
    this.checkInForm.get('checkType')?.setValue(selectedTypes);

    // Cập nhật hiển thị của p-calendar
    this.showCheckIn = selectedTypes.includes('checkIn');
    this.showCheckOut = selectedTypes.includes('checkOut');
  }

  onCheckTypeChangeUpdate(event: any, type: string) {
    const isChecked = event.checked;
    let checkTypeArray = this.checkInUpdateForm.value.checkType || [];

    if (isChecked) {
      // Nếu checkbox được tích, thêm vào mảng
      if (!checkTypeArray.includes(type)) {
        checkTypeArray.push(type);
      }
    } else {
      // Nếu checkbox bị bỏ chọn, xóa khỏi mảng
      checkTypeArray = checkTypeArray.filter(t => t !== type);

      // Reset giá trị khi checkbox bị bỏ chọn
      if (type === 'checkIn') {
        this.checkInUpdateForm.patchValue({ timeCheckIn: null });
      } else if (type === 'checkOut') {
        this.checkInUpdateForm.patchValue({ timeCheckOut: null });
      }
    }

    // Cập nhật form control checkType
    this.checkInUpdateForm.patchValue({ checkType: checkTypeArray });

    // Cập nhật trạng thái hiển thị p-calendar
    this.showCheckIn = checkTypeArray.includes('checkIn');
    this.showCheckOut = checkTypeArray.includes('checkOut');
  }


  submitForm() {

    // Xác định giá trị checkType
    let selectedTypes = this.checkInForm.value.checkType;
    let checkTypeValue = 0;
    if (selectedTypes.includes('checkIn') && selectedTypes.includes('checkOut')) {
      checkTypeValue = 2;
    } else if (selectedTypes.includes('checkOut')) {
      checkTypeValue = 1;
    } else {
      checkTypeValue = 0;
    }

    // Chuyển đổi thời gian từ Date sang string HH:mm
    const formatTime = (date: Date | null) => {
      return date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
    };

    const formatDate = (date: Date | null) => {
      // return date ? date.toISOString().split('T')[0] : ''; // Cách 1: Dùng toISOString
      return date ? date.toLocaleDateString('en-CA') : ''; // Cách 2: Dùng toLocaleDateString
    };

    // Chuẩn bị dữ liệu gửi lên API
    const request = {
      employeeId: this.user.employee.id,
      approverId: this.checkInForm.value.approverId,
      date: formatDate(this.checkInForm.value.date),
      timeCheckIn: formatTime(this.checkInForm.value.timeCheckIn),
      timeCheckOut: formatTime(this.checkInForm.value.timeCheckOut),
      checkType: checkTypeValue,
      shiftCatalogId: this.checkInForm.value.shiftCatalogId,
      reason: this.checkInForm.value.reason,
      description: this.checkInForm.value.description
    };

    // Gửi request POST
    this.checkinCheckoutService.create(request).subscribe(
      (response) => {
        console.log('Gửi thành công:', response);
        this.messages = [
          {
            severity: 'success',
            summary: 'Thành công',
            detail: 'Lưu thông tin thành công',
            life: 3000,
          },
        ];
        this.getPaging();
        this.displayDialog = false;
      },
      (error) => {
        console.error('Lỗi khi gửi:', error);
        this.messages = [
          {
            severity: 'error',
            summary: 'Thất bại',
            detail: 'Đã có lỗi xảy ra',
            life: 3000,
          },
        ];
      }
    );
  }
  submitUpdateForm() {
    // Chuyển đổi thời gian từ Date sang string HH:mm
    const formatTime = (date: Date | null) => {
      return date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
    };

    const formatDate = (date: Date | null) => {
      // return date ? date.toISOString().split('T')[0] : ''; // Cách 1: Dùng toISOString
      return date ? date.toLocaleDateString('en-CA') : ''; // Cách 2: Dùng toLocaleDateString
    };

    // Chuẩn bị dữ liệu gửi lên API
    const request = {
      approverId: this.checkInUpdateForm.value.approverId,
      date: formatDate(this.checkInUpdateForm.value.date),
      timeCheckIn: formatTime(this.checkInUpdateForm.value.timeCheckIn),
      timeCheckOut: formatTime(this.checkInUpdateForm.value.timeCheckOut),
      checkType: this.checkInUpdateForm.value.checkType.includes('checkIn') && this.checkInUpdateForm.value.checkType.includes('checkOut') ? 2 :
        this.checkInUpdateForm.value.checkType.includes('checkIn') ? 0 : 1,
      shiftCatalogId: this.checkInUpdateForm.value.shiftCatalogId,
      reason: this.checkInUpdateForm.value.reason,
      description: this.checkInUpdateForm.value.description
    };

    // Gửi request POST
    this.checkinCheckoutService.update(this.selected.id, request).subscribe(
      (response) => {
        console.log('Gửi thành công:', response);
        this.messages = [
          {
            severity: 'success',
            summary: 'Thành công',
            detail: 'Lưu thông tin thành công',
            life: 3000,
          },
        ];
        this.getPaging();
        this.displayDialogEdit = false;
      },
      (error) => {
        console.error('Lỗi khi gửi:', error);
        this.messages = [
          {
            severity: 'error',
            summary: 'Thất bại',
            detail: 'Đã có lỗi xảy ra',
            life: 3000,
          },
        ];
      }
    );
  }
  updateStatus(contract: any, status: number) {
    this.checkinCheckoutService.updateCheckInCheckOutStatus(contract.id, status).subscribe(
      response => {
        if (status === 1) {
          this.messages = [
            {
              severity: 'success',
              summary: '',
              detail: 'Đã chấp thuận',
              life: 3000,
            },
          ];
        } else {
          this.messages = [
            {
              severity: 'success',
              summary: '',
              detail: 'Đã từ chối',
              life: 3000,
            },
          ];
        }
        this.getPaging();
      },
      error => {
        console.error('Lỗi cập nhật', error);
        this.messages = [
          {
            severity: 'error',
            summary: 'Thất bại',
            detail: 'Đã có lỗi xảy ra',
            life: 3000,
          },
        ];
      }
    );
  }
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  insertEmoji(emoji: string) {
    const textarea = document.getElementById("descriptionBox") as HTMLTextAreaElement;
    textarea.value += emoji;
    this.showEmojiPicker = false; // Đóng popup sau khi chọn emoji
  }

  exportExcel(): void {
    const request: any = {
      keyWord: this.keyWord ? this.keyWord.trim() : null
    };
    this.checkinCheckoutService.exportExcel(request).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DonCheckInCheckOut_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error: any) => {
        console.error('Lỗi export excel:', error);
        this.messages = [{ severity: 'error', summary: 'Thất bại', detail: 'Không thể xuất file Excel', life: 3000 }];
      }
    );
  }

  isColVisible(field: string): boolean {
    return this.selectedColumns.some(c => c.field === field);
  }

  onColumnToggle(event: any, col: any): void {
    if (event.checked) {
      if (!this.selectedColumns.some(c => c.field === col.field)) {
        const originalIndex = this.allColumns.findIndex(c => c.field === col.field);
        this.selectedColumns = this.allColumns.filter(c =>
          this.selectedColumns.some(s => s.field === c.field) || c.field === col.field
        );
      }
    } else {
      this.selectedColumns = this.selectedColumns.filter(c => c.field !== col.field);
    }
  }

  toggleColumnPanel(): void {
    this.showColumnPanel = !this.showColumnPanel;
  }

  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.pageIndex = event.page + 1;
    this.getPaging();
  }

  goToPreviousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
    }
  }

  goToNextPage(): void {
    const lastPage = Math.ceil(this.totalRecords / this.pageSize);
    if (this.pageIndex < lastPage) {
      this.pageIndex++;
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

}
