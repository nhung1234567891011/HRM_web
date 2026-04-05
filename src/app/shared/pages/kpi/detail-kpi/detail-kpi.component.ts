import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { ToastService } from 'src/app/core/services/global/toast.service';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { KpiService } from 'src/app/core/services/kpi.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { RevenueCommissionPolicyService } from 'src/app/core/services/revenue-commission-policy.service';
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
  editingRowIndex3: number | null = null;

  commissionPolicies: Record<number, any | null> = { 0: null, 1: null }; // 0: SALE, 1: CTV
  private commissionPolicyLoadedKey: string | null = null;
  private kpiTableReferenceDate: Date | null = null;
  private readonly commissionPolicyIds: number[] = [1];

  constructor(
    private employeesService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private organizationService: OrganizationService,
    private kpiService: KpiService,
    private staffPositionService: StaffPositionService,
    private authService: AuthService,
    private revenueCommissionPolicyService: RevenueCommissionPolicyService,
  ) {
    this.authService.userCurrent.subscribe(res => {
      this.user = res;
    })
  }

  ngOnInit() {
    this.items = [
      { label: 'Tính lương' },
      { label: 'Doanh thu hoa hồng', routerLink: '/payroll/kpi' },
      { label: 'Chi tiết' },
    ];

    this.getOrganizations();
    this.getStaffPosition();
    this.fetchEmployees();
    this.CallSnaphot();
    this.loadKpiTableReferenceDate();
    this.fetchData();
    this.loadCommissionPolicies();
  }

  CallSnaphot(): void {
    this.detailKpiById = +this.route.snapshot.paramMap.get('id')!;
  }

  private loadKpiTableReferenceDate(): void {
    if (!Number.isFinite(this.detailKpiById)) {
      this.kpiTableReferenceDate = null;
      return;
    }

    this.kpiService.getById({ Id: this.detailKpiById }).subscribe({
      next: (response: any) => {
        const data = response?.data ?? response;
        const toDateRaw = data?.toDate ?? data?.ToDate;
        this.kpiTableReferenceDate = this.parseDateOnly(toDateRaw);
        this.loadCommissionPolicies(true);
      },
      error: () => {
        this.kpiTableReferenceDate = null;
        this.loadCommissionPolicies(true);
      }
    });
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
        const items = response.data?.items ?? [];
        this.detailKpi = items.map((row: any) => ({
          ...row,
          isRevenueEditable: row.isRevenueEditable ?? row.IsRevenueEditable ?? false,
          staffPositionCode: row.staffPositionCode ?? row.StaffPositionCode ?? null,
        }));
        this.totalRecords = response.data.totalRecords;
        this.updateCurrentPageReport();
      }
    });
  }

  onOrgChange(): void {
    this.fetchData();
    this.loadCommissionPolicies(true);
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

  startEditing3(rowIndex: number): void {
    this.editingRowIndex3 = rowIndex;
  }

  stopEditing(): void {
    this.editingRowIndex = null;
  }
  stopEditing2(): void {
    this.editingRowIndex2 = null;
  }
  stopEditing3(): void {
    this.editingRowIndex3 = null;
  }

  stopEditingAndSave(rowData: any) {
    this.saveRow(rowData, 'completionRate');
  }

  stopEditingAndSave2(rowData: any) {
    this.saveRow(rowData, 'bonus');
  }

  stopEditingAndSave3(rowData: any) {
    this.saveRow(rowData, 'revenue');
  }

  /** Gọi khi blur hoặc Enter ở ô doanh thu (input luôn hiển thị) */
  onRevenueBlur(rowData: any) {
    if (rowData?.id != null) this.saveRow(rowData, 'revenue');
  }

  private saveRow(rowData: any, field?: 'completionRate' | 'bonus' | 'revenue') {
    if (field === 'completionRate') this.stopEditing();
    if (field === 'bonus') this.stopEditing2();
    if (field === 'revenue') this.stopEditing3();

    const completionRate = this.toNumberOrZero(rowData.completionRate);
    const bonus = this.toNumberOrZero(rowData.bonus);
    const revenue = this.toNumberOrZero(rowData.revenue);

    if (field === 'revenue') {
      if (revenue < 0) {
        this.messages = [
          {
            severity: 'warn',
            summary: 'Dữ liệu không hợp lệ',
            detail: 'Doanh thu không được âm',
            life: 3000,
          },
        ];
        return;
      }
    }

    const payload = {
      employeeId: rowData.employeeId,
      employeeCode: rowData.employeeCode,
      employeeName: rowData.employeeName,
      completionRate,
      bonus,
      revenue,
    };

    const fieldSaved = field;
    this.kpiService.updateRateKpi(rowData.id, payload).subscribe(
      (response) => {
        this.fetchData();
        this.loadCommissionPolicies(true);

        let detailMsg = 'Cập nhật thành công.';
        if (fieldSaved === 'revenue') {
          const commission = this.getCommissionValue(rowData);
          if (commission !== null && commission >= 0) {
            detailMsg = `Đã lưu doanh thu. Hoa hồng nhận được: ${this.formatMoney(commission)} ₫`;
          } else {
            detailMsg = 'Đã lưu doanh thu. (Hoa hồng tính theo cấu hình cho SALE/CTV)';
          }
        }
        this.messages = [
          {
            severity: 'success',
            summary: 'Thành công',
            detail: detailMsg,
            life: 5000,
          },
        ];
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

  private formatMoney(value: number): string {
    if (value == null || !Number.isFinite(value)) return '0';
    return value.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  private toNumberOrZero(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private getCurrentOrgId(): number | null {
    const selectedOrgId = this.selectedNode?.data?.id;
    if (Number.isFinite(Number(selectedOrgId))) return Number(selectedOrgId);

    const userOrgId =
      this.user?.organizationId ??
      this.user?.OrganizationId ??
      this.user?.organization?.id ??
      this.user?.Organization?.Id ??
      null;

    return Number.isFinite(Number(userOrgId)) ? Number(userOrgId) : null;
  }

  private parseDateOnly(input: any): Date | null {
    if (!input) return null;

    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return null;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getPolicyReferenceDate(): Date {
    return this.kpiTableReferenceDate ?? new Date();
  }

  private pickEffectivePolicy(res: any, referenceDate: Date): any | null {
    const data = res?.data ?? res;
    const items = data?.items ?? data;
    const list: any[] = Array.isArray(items) ? items : [];
    if (list.length === 0) return null;

    const referenceDateOnly = this.parseDateOnly(referenceDate) ?? new Date();
    const isEffectiveNow = (p: any) => {
      const from = this.parseDateOnly(p?.effectiveFrom ?? p?.EffectiveFrom);
      const to = this.parseDateOnly(p?.effectiveTo ?? p?.EffectiveTo);
      if (from && referenceDateOnly < from) return false;
      if (to && referenceDateOnly > to) return false;
      return true;
    };

    const effective = list.filter(isEffectiveNow);
    const candidates = effective.length > 0 ? effective : list;

    candidates.sort((a, b) => {
      const af = a?.effectiveFrom ? new Date(a.effectiveFrom).getTime() : 0;
      const bf = b?.effectiveFrom ? new Date(b.effectiveFrom).getTime() : 0;
      return bf - af;
    });

    return candidates[0] ?? null;
  }

  private loadCommissionPolicies(force: boolean = false): void {
    const orgId = this.getCurrentOrgId();
    if (!orgId) {
      this.commissionPolicies = { 0: null, 1: null };
      this.commissionPolicyLoadedKey = null;
      return;
    }

    const referenceDate = this.getPolicyReferenceDate();
    const referenceDateKey = (this.parseDateOnly(referenceDate) ?? referenceDate).toISOString().slice(0, 10);
    const policyKey = this.commissionPolicyIds.join(',');
    const loadedKey = `${orgId}-${referenceDateKey}-${policyKey}`;

    if (!force && this.commissionPolicyLoadedKey === loadedKey) return;
    this.commissionPolicyLoadedKey = loadedKey;

    const requestById: Record<string, any> = {};
    this.commissionPolicyIds.forEach((id) => {
      requestById[`id_${id}`] = this.revenueCommissionPolicyService
        .getById(id)
        .pipe(catchError(() => of(null)));
    });

    forkJoin(requestById).subscribe((responses) => {
      this.commissionPolicies = { 0: null, 1: null };

      Object.values(responses).forEach((response: any) => {
        const policy = response?.data ?? response;
        if (!policy) return;

        const targetType = Number(policy?.targetType ?? policy?.TargetType);
        const organizationId = Number(policy?.organizationId ?? policy?.OrganizationId);
        const status = Number(policy?.status ?? policy?.Status);

        if (!Number.isFinite(targetType) || (targetType !== 0 && targetType !== 1)) return;
        if (organizationId !== orgId) return;
        if (status !== 0) return;

        const effectivePolicy = this.pickEffectivePolicy([policy], referenceDate);
        if (!effectivePolicy) return;

        const currentPolicy = this.commissionPolicies[targetType];
        if (!currentPolicy) {
          this.commissionPolicies[targetType] = effectivePolicy;
          return;
        }

        const currentEffectiveFrom = new Date(currentPolicy?.effectiveFrom ?? currentPolicy?.EffectiveFrom ?? 0).getTime();
        const nextEffectiveFrom = new Date(effectivePolicy?.effectiveFrom ?? effectivePolicy?.EffectiveFrom ?? 0).getTime();
        if (nextEffectiveFrom >= currentEffectiveFrom) {
          this.commissionPolicies[targetType] = effectivePolicy;
        }
      });
    });
  }

  /** Xác định đối tượng áp dụng hoa hồng: 0 = SALE, 1 = CTV. Dùng mã hoặc tên vị trí. */
  private getTargetTypeFromStaffPositionCode(code: any, positionName?: any): 0 | 1 | null {
    const c = (code ?? '').toString().trim().toUpperCase();
    const name = (positionName ?? '').toString().toUpperCase();
    if (c.startsWith('CTV') || c.includes('CTV') || name.includes('CTV') || name.includes('CONG TAC VIEN') || name.includes('CỘNG TÁC VIÊN')) return 1;
    if (c.startsWith('SALE') || c.includes('SALE') || name.includes('SALE') || name.includes('KINH DOANH')) return 0;
    if (!c && !name) return null;
    return null;
  }

  private getActiveCommissionTiers(tiers: any[]): any[] {
    return tiers
      .filter(t => t && t.isDeleted !== true && t.IsDeleted !== true)
      .sort((a, b) => {
        const fromA = Number(a?.fromAmount ?? a?.FromAmount ?? 0);
        const fromB = Number(b?.fromAmount ?? b?.FromAmount ?? 0);
        if (fromA !== fromB) return fromA - fromB;

        const toA = a?.toAmount ?? a?.ToAmount;
        const toB = b?.toAmount ?? b?.ToAmount;
        const hasToA = toA !== null && toA !== undefined && toA !== '';
        const hasToB = toB !== null && toB !== undefined && toB !== '';
        if (hasToA !== hasToB) return hasToA ? -1 : 1;

        const sortA = Number(a?.sortOrder ?? a?.SortOrder ?? 0);
        const sortB = Number(b?.sortOrder ?? b?.SortOrder ?? 0);
        return sortA - sortB;
      });
  }

  private calculateProgressiveCommission(revenue: number, tiers: any[]): number {
    if (!Array.isArray(tiers) || tiers.length === 0) return 0;

    const sorted = this.getActiveCommissionTiers(tiers);
    if (sorted.length === 0) return 0;

    const matchedTier = sorted.slice().reverse().find((t) => {
      const from = Number(t?.fromAmount ?? t?.FromAmount ?? 0);
      const toRaw = t?.toAmount ?? t?.ToAmount;
      const to = toRaw === null || toRaw === undefined || toRaw === '' ? Number.POSITIVE_INFINITY : Number(toRaw);
      return Number.isFinite(from) && revenue > from && (!Number.isFinite(to) || revenue <= to);
    }) ?? sorted.slice().reverse().find((t) => revenue > Number(t?.fromAmount ?? t?.FromAmount ?? 0));

    if (!matchedTier) return 0;

    const from = Number(matchedTier?.fromAmount ?? matchedTier?.FromAmount ?? 0);
    const toRaw = matchedTier?.toAmount ?? matchedTier?.ToAmount;
    const to = toRaw === null || toRaw === undefined || toRaw === '' ? Number.POSITIVE_INFINITY : Number(toRaw);
    const ratePercent = Number(matchedTier?.ratePercent ?? matchedTier?.RatePercent ?? 0);

    if (!Number.isFinite(from) || !Number.isFinite(ratePercent) || ratePercent <= 0) return 0;

    const upper = Number.isFinite(to) && to > from ? to : revenue;
    const amountInTier = Math.min(revenue, upper) - from;
    if (amountInTier <= 0) return 0;

    return amountInTier * (ratePercent / 100);
  }

  getCommissionUnavailableReason(rowData: any): string {
    const revenue = this.toNumberOrZero(rowData?.revenue);
    if (revenue < 0) return 'Doanh thu không hợp lệ';

    const targetType = this.getTargetTypeFromStaffPositionCode(
      rowData?.staffPositionCode ?? rowData?.StaffPositionCode,
      rowData?.staffPositionName ?? rowData?.StaffPositionName ?? rowData?.positionName
    );
    if (targetType === null) return 'Không áp dụng';

    const policy = this.commissionPolicies[targetType];
    if (!policy) return 'Chưa có cấu hình hiệu lực';

    const tiers = policy?.tiers ?? policy?.Tiers ?? [];
    if (!Array.isArray(tiers) || this.getActiveCommissionTiers(tiers).length === 0) {
      return 'Thiếu bậc hoa hồng';
    }

    return '-';
  }

  /**
   * Tính hoa hồng theo cấu hình bậc luỹ tiến khi có doanh thu và áp dụng được policy (SALE/CTV).
   * Trả về null nếu không áp dụng được (không phải SALE/CTV hoặc chưa có cấu hình).
   */
  getCommissionValue(rowData: any): number | null {
    const revenue = this.toNumberOrZero(rowData?.revenue);
    if (revenue < 0) return null;
    const targetType = this.getTargetTypeFromStaffPositionCode(
      rowData?.staffPositionCode ?? rowData?.StaffPositionCode,
      rowData?.staffPositionName ?? rowData?.StaffPositionName ?? rowData?.positionName
    );
    if (targetType === null) return null;

    const policy = this.commissionPolicies[targetType];
    const tiers = policy?.tiers ?? policy?.Tiers ?? [];
    if (!Array.isArray(tiers) || tiers.length === 0) return null;

    return this.calculateProgressiveCommission(revenue, tiers);
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
