import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { KpiService } from 'src/app/core/services/kpi.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { StaffPositionService } from 'src/app/core/services/staff-position.service';

@Component({
  selector: 'app-detail-kpi',
  templateUrl: './detail-kpi.component.html',
  styleUrl: './detail-kpi.component.scss'
})
export class DetailKpiComponent implements OnInit {
  items: any;
  pageSize: number = 30;
  pageIndex: number = 1;
  selectedEmployee: any;
  filteredName: any[] = [];
  filteredEmployees: any[] = [];
  employeesName: any[] = [];
  treeData: TreeNode[] = [];
  selectedNode: any;
  selectedStaffPosition: any;
  staffPosition: any[] = [];
  totalRecords: number = 0;
  currentPageReport: string = '';
  messages: any[] = [];
  detailKpi: any;
  detailKpiById: number;
  user: any;
  editingRowIndex: number | null = null;
  editingRowIndex2: number | null = null;

  constructor(
    private employeesService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private organizationService: OrganizationService,
    private kpiService: KpiService,
    private staffPositionService: StaffPositionService,
    private authService: AuthService,
  ) {
    this.authService.userCurrent.subscribe(res => {
      this.user = res;
    })
  }

  ngOnInit() {
    this.items = [
      { label: 'Tính lương', route: '/installation' },
      { label: 'Bảng chi tiết KPI' },
    ];

    this.getOrganizations();
    this.getStaffPosition();
    this.fetchEmployees();
    this.CallSnaphot();
    this.fetchData();
  }

  CallSnaphot(): void {
    this.detailKpiById = +this.route.snapshot.paramMap.get('id')!;
  }

  fetchData(): void {
    const request: any = {
      KpiTableId: this.detailKpiById,
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      EmployeeName: this.selectedEmployee ? this.selectedEmployee.displayName.replace(/\+/g, ' ') : '',
      OrganizationId: this.selectedNode?.data?.id,
      StaffPositionId: this.selectedStaffPosition?.id || null
    };

    this.kpiService.getPagingDetailKpi(request).subscribe(response => {
      if (response.status) {
        this.detailKpi = response.data.items;
        this.totalRecords = response.data.totalRecords;
        this.updateCurrentPageReport();
      }
    });
  }


  fetchEmployees() {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    };
    this.employeesService.getEmployees(request).subscribe((data: any) => {
      this.employeesName = data.items.map(employeesName => ({
        ...employeesName,
        displayName: `${employeesName.firstName} ${employeesName.lastName}`
      }));
    });
  }

  searchEmployee(event: any) {
    const query = event.query.toLowerCase();
    this.filteredEmployees = this.employeesName.filter(employeesName =>
      employeesName.displayName.toLowerCase().includes(query)
    );
  }

  getOrganizations(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex
    };
    this.organizationService.getPagingAll(request).subscribe((response) => {
      if (response.status) {
        this.treeData = this.transformToTreeNode(response.data.items);
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

  findTreeNodeById(treeData: TreeNode[], id: any): TreeNode | null {
    for (const node of treeData) {
      if (node.data.id === id) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const foundNode = this.findTreeNodeById(node.children, id);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return null;
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

  startEditing(rowIndex: number): void {
    this.editingRowIndex = rowIndex;
  }

  startEditing2(rowIndex: number): void {
    this.editingRowIndex2 = rowIndex;
  }

  stopEditing(): void {
    this.editingRowIndex = null;
  }
  stopEditing2(): void {
    this.editingRowIndex2 = null;
  }
  stopEditingAndSave(rowData: any) {
    this.saveRow(rowData, 'completionRate');
  }

  stopEditingAndSave2(rowData: any) {
    this.saveRow(rowData, 'bonus');
  }

  private saveRow(rowData: any, field?: 'completionRate' | 'bonus') {
    if (field === 'completionRate') this.stopEditing();
    if (field === 'bonus') this.stopEditing2();

    const completionRate = this.toNumberOrZero(rowData.completionRate);
    const bonus = this.toNumberOrZero(rowData.bonus);

    const payload = {
      employeeId: rowData.employeeId,
      employeeCode: rowData.employeeCode,
      employeeName: rowData.employeeName,
      completionRate,
      bonus,
    };

    this.kpiService.updateRateKpi(rowData.id, payload).subscribe(
      (response) => {
        console.log('Cập nhật thành công:', response);
        this.messages = [
          {
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cập nhật thành công',
            life: 3000,
          },
        ];
        this.fetchData();
      },
      (error) => {
        console.error('Lỗi khi cập nhật:', error);
        this.messages = [
          {
            severity: 'error',
            summary: 'Không thể lưu vì:',
            detail: 'Đang có lỗi cần được chỉnh sửa',
            life: 3000,
          },
        ];
      }
    );
  }

  private toNumberOrZero(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.pageIndex = event.page + 1;
    this.fetchData();
  }

  goToPreviousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.fetchData();
    }
  }

  goToNextPage(): void {
    const lastPage = Math.ceil(this.totalRecords / this.pageSize);
    if (this.pageIndex < lastPage) {
      this.pageIndex++;
      this.fetchData();
    }
  }
  updateCurrentPageReport(): void {
    const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
    const endRecord = Math.min(this.pageIndex * this.pageSize, this.totalRecords);
    if (this.totalRecords === 0) {
      this.currentPageReport = `<strong>0</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
    }
    if (this.totalRecords > 0) {
      this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
    }
  }
}
