import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { OrganizationUnit } from 'src/app/core/models/organization.model';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganizationService } from 'src/app/core/services/organization.service';


@Component({
  selector: 'app-organi-struct-list',
  templateUrl: './organi-struct-list.component.html',
  styleUrl: './organi-struct-list.component.scss'
})
export class OrganiStructListComponent implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable!: Table;
  @ViewChild('paginator') paginator!: Paginator;
  messages: any[] = [];
  items: MenuItem[] | undefined;
  struct!: any;
  pageSize: number = 30;
  pageIndex: number = 1;
  totalRecords: number = 0;
  currentPageReport: string = '';
  organizationUnits: OrganizationUnit[] = [];
  keyWord: string = '';
  showDiaLogDelete: boolean = false;
  unitDelete!: any;
  DOMElementDelete: any;
  unitRank: number;
  public userCurrent: any;
  permissionConstant = PermissionConstant;

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    public permisionHelper: HasPermissionHelper
  ) {
    this.authService.userCurrent.subscribe((user) => {
      this.userCurrent = user;
    });

  }

  ngOnInit() {
    this.items = [
      { label: 'Hệ thống', route: '/installation' },
      { label: 'Cơ cấu tổ chức' },
    ];
    this.loadOrganizationData();

  }

  loadOrganizationData() {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      keyWord: this.keyWord.trim()
    };
    this.organizationService.getPagingAll(request).subscribe((response: any) => {
      if (response.status) {
        const rootUnits = response.data.items.map((unit: any) => this.mapToOrganizationUnit(unit, 1));
        this.organizationUnits = rootUnits;
        console.log(this.organizationUnits);
        this.totalRecords = response.data.totalRecords;
        this.updateCurrentPageReport();
      }
    });
  }

  mapToOrganizationUnit(unit: any, level: number): OrganizationUnit {
    return {
      id: unit.id,
      organizationCode: unit.organizationCode,
      organizationName: unit.organizationName,
      abbreviation: unit.abbreviation,
      employees: unit.organizationChildren.length,
      organizational: unit.organizationType?.organizationTypeName || '',
      employeeId: unit.organizationLeaders[0]?.employee.id,
      totalEmployees: unit.totalEmployees || 0,
      unithead: unit.organizationLeaders
        .filter((leader: any) => leader.organizationLeaderType === 0)
        .map((leader: any) => `${leader.employee.lastName || ''} ${leader.employee.firstName || ''}`)
        .join(', '),
      status: unit.organizationStatus === true ? '1' : '0',
      // statusLable: unit.organizationStatus === true ? 'Đang theo dõi' : 'Ngừng theo dõi',
      level: level,
      rank: unit.rank,
      children: unit.organizationChildren.map((child: any) => this.mapToOrganizationUnit(child, level + 1)),
      expanded: false
    };
  }

  getWorkStatus(status: any): {
    text: string;
    color: string;
    bgcolor: string;
  } {
    switch (status) {
      case '1':
        return {
          text: 'Đang theo dõi',
          color: '#155724', // Màu xanh lá đậm hơn
          bgcolor: '#d4edda', // Màu xanh lá nhạt hơn
        };
      case '0':
        return {
          text: 'Ngừng theo dõi',
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

  openDiaLogDelete(unit: any): void {
    this.unitDelete = unit;
    this.showDiaLogDelete = true;
  }

  closeDiaLogDelete(): void {
    this.showDiaLogDelete = false;
    this.unitDelete = null;
  }


  ClickDelete(): void {
    if (this.unitDelete) {
      const organizationId = this.unitDelete.id;
      this.organizationService.deleteOrganization(organizationId).subscribe({
        next: () => {
          this.organizationUnits = this.organizationUnits.filter(
            (unit) => unit.id !== organizationId
          );
          this.messages = [
            {
              severity: 'success',
              summary: 'Thành công',
              detail: 'Xóa thành công',
              life: 3000,
            },
          ];
          this.closeDiaLogDelete();
          this.loadOrganizationData();
        },
        error: (err) => {
          console.error(err);
          const detail =
            err?.error?.detail ||
            err?.error?.message ||
            err?.message ||
            'Có lỗi xảy ra';

          this.messages = [
            {
              severity: 'error',
              summary: 'Thất bại',
              detail,
              life: 3000,
            },
          ];
        },
      });
    }
  }


  toggleExpand(unit: OrganizationUnit): void {
    unit.expanded = !unit.expanded; // Toggle the expanded state for the unit
  }

  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.pageIndex = event.page + 1;
    this.loadOrganizationData();
  }

  goToPreviousPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.loadOrganizationData();
    }
  }

  goToNextPage(): void {
    const lastPage = Math.ceil(this.totalRecords / this.pageSize);
    if (this.pageIndex < lastPage) {
      this.pageIndex++;
      this.loadOrganizationData();
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
