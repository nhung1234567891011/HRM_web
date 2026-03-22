import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, TreeNode } from 'primeng/api';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { RevenueCommissionPolicyService } from 'src/app/core/services/revenue-commission-policy.service';

@Component({
  selector: 'app-revenue-commission',
  templateUrl: './revenue-commission.component.html',
  styleUrl: './revenue-commission.component.scss',
  providers: [ConfirmationService],
})
export class RevenueCommissionComponent implements OnInit {
  items: any;
  messages: any[] = [];

  pageSize: number = 10;
  pageIndex: number = 1;
  totalRecords: number = 0;
  currentPageReport: string = '';

  policies: any[] = [];

  treeData: TreeNode[] = [];
  filterOrgNode: any;
  dialogOrgNode: any;

  targetTypes = [
    { label: 'SALE', value: 0 },
    { label: 'CTV', value: 1 },
  ];

  statuses = [
    { label: 'Đang áp dụng', value: 0 }, // Tracking
    { label: 'Ngừng áp dụng', value: 1 }, // Untracking
  ];

  selectedTargetType: any = null;
  selectedStatus: any = null;
  allColumns = [
    { field: 'organizationName', header: 'Đơn vị' },
    { field: 'targetType', header: 'Đối tượng' },
    { field: 'effectiveFrom', header: 'Hiệu lực từ' },
    { field: 'effectiveTo', header: 'Hiệu lực đến' },
    { field: 'status', header: 'Trạng thái' },
    { field: 'action', header: 'Thao tác' },
  ];
  selectedColumns: any[] = [...this.allColumns];

  policyDialog: boolean = false;
  isEdit: boolean = false;
  editingId: number | null = null;

  form = this.fb.group({
    organizationId: [null as number | null, Validators.required],
    targetType: [0, Validators.required],
    effectiveFrom: [null as Date | null],
    effectiveTo: [null as Date | null],
    status: [0, Validators.required],
    tiers: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private organizationService: OrganizationService,
    private revenueCommissionPolicyService: RevenueCommissionPolicyService
  ) {}

  ngOnInit(): void {
    this.items = [
      { label: 'Tính lương' },
      { label: 'Hoa hồng doanh thu' },
    ];

    this.getOrganizations();
    this.fetchData();
  }

  get tiers(): FormArray {
    return this.form.get('tiers') as FormArray;
  }

  addTier(tier?: any): void {
    this.tiers.push(
      this.fb.group({
        fromAmount: [tier?.fromAmount ?? 0, [Validators.required, Validators.min(0)]],
        toAmount: [tier?.toAmount ?? null],
        ratePercent: [tier?.ratePercent ?? 0, [Validators.required, Validators.min(0)]],
        sortOrder: [tier?.sortOrder ?? this.tiers.length + 1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeTier(index: number): void {
    this.tiers.removeAt(index);
  }

  confirmRemoveTier(event: Event, index: number): void {
    this.confirmationService.confirm({
      header: 'Xác nhận',
      message: 'Chắc chắn xoá bậc hoa hồng này không?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xoá',
      rejectLabel: 'Huỷ',
      accept: () => this.removeTier(index),
    });
  }

  resetTiers(): void {
    while (this.tiers.length > 0) this.tiers.removeAt(0);
  }

  openCreate(): void {
    this.isEdit = false;
    this.editingId = null;
    this.policyDialog = true;
    this.dialogOrgNode = null;

    this.form.reset({
      organizationId: null,
      targetType: 0,
      effectiveFrom: null,
      effectiveTo: null,
      status: 0,
    });

    this.resetTiers();
    this.addTier();
  }

  openEdit(row: any): void {
    this.isEdit = true;
    this.editingId = row.id;
    this.policyDialog = true;

    this.revenueCommissionPolicyService.getById(row.id).subscribe((res) => {
      const data = res?.data ?? res; // có nơi trả ApiResult, có nơi trả thẳng
      this.form.patchValue({
        organizationId: data.organizationId ?? null,
        targetType: data.targetType ?? 0,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : null,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        status: data.status ?? 0,
      });

      this.resetTiers();
      (data.tiers ?? []).forEach((t: any) => this.addTier(t));

      // set treeSelect selected node if possible
      const orgId = data.organizationId;
      if (orgId && this.treeData?.length) {
        const node = this.findTreeNodeById(this.treeData, orgId);
        if (node) this.dialogOrgNode = node;
      }
    });
  }

  closeDialog(): void {
    this.policyDialog = false;
  }

  save(): void {
    if (this.form.invalid) {
      this.messages = [
        { severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập đủ dữ liệu', life: 3000 },
      ];
      return;
    }

    if (this.tiers.length === 0) {
      this.messages = [
        { severity: 'warn', summary: 'Thiếu bậc', detail: 'Cần ít nhất 1 bậc hoa hồng', life: 3000 },
      ];
      return;
    }

    const payload = {
      organizationId: this.form.value.organizationId,
      targetType: this.form.value.targetType,
      effectiveFrom: this.form.value.effectiveFrom,
      effectiveTo: this.form.value.effectiveTo,
      status: this.form.value.status,
      tiers: this.tiers.value,
    };

    if (!this.isEdit) {
      this.revenueCommissionPolicyService.create(payload).subscribe(
        () => {
          this.messages = [{ severity: 'success', summary: 'Thành công', detail: 'Đã tạo cấu hình', life: 3000 }];
          this.policyDialog = false;
          this.fetchData();
        },
        () => {
          this.messages = [{ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo cấu hình', life: 3000 }];
        }
      );
      return;
    }

    if (this.editingId == null) return;

    this.revenueCommissionPolicyService.update(this.editingId, payload).subscribe(
      () => {
        this.messages = [{ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật cấu hình', life: 3000 }];
        this.policyDialog = false;
        this.fetchData();
      },
      () => {
        this.messages = [{ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật cấu hình', life: 3000 }];
      }
    );
  }

  confirmDeletePolicy(event: Event, row: any): void {
    const policyName = row?.organizationName ? ` của đơn vị "${row.organizationName}"` : '';
    this.confirmationService.confirm({
      header: 'Xác nhận',
      message: `Chắc chắn xoá cấu hình hoa hồng${policyName} không?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xoá',
      rejectLabel: 'Huỷ',
      accept: () => {
        this.revenueCommissionPolicyService.hardDelete(row.id).subscribe({
          next: (res: any) => {
            if (res?.status === false) {
              this.messages = [
                {
                  severity: 'error',
                  summary: 'Lỗi',
                  detail: res?.message || 'Không thể xoá cấu hình',
                  life: 3000,
                },
              ];
              return;
            }

            this.messages = [
              { severity: 'success', summary: 'Thành công', detail: res?.message || 'Đã xoá cấu hình', life: 3000 },
            ];
            this.fetchData();
          },
          error: () => {
            this.messages = [
              { severity: 'error', summary: 'Lỗi', detail: 'Không thể xoá cấu hình', life: 3000 },
            ];
          },
        });
      },
    });
  }

  fetchData(): void {
    const request: any = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      OrganizationId: this.filterOrgNode?.data?.id ?? null,
      TargetType: this.selectedTargetType?.value ?? null,
      Status: this.selectedStatus?.value ?? null,
    };

    this.revenueCommissionPolicyService.paging(request).subscribe((res) => {
      const data = res?.data ?? res;
      this.policies = data?.items ?? [];
      this.totalRecords = data?.totalRecords ?? 0;
      this.updateCurrentPageReport();
    });
  }

  onPageChange(event: any): void {
    this.pageSize = event.rows;
    this.pageIndex = event.page + 1;
    this.fetchData();
  }

  updateCurrentPageReport(): void {
    const startRecord = (this.pageIndex - 1) * this.pageSize + 1;
    const endRecord = Math.min(this.pageIndex * this.pageSize, this.totalRecords);
    if (this.totalRecords === 0) {
      this.currentPageReport = `<strong>0</strong> - <strong>0</strong> trong <strong>0</strong> bản ghi`;
      return;
    }
    this.currentPageReport = `<strong>${startRecord}</strong> - <strong>${endRecord}</strong> trong <strong>${this.totalRecords}</strong> bản ghi`;
  }

  getOrganizations(): void {
    const request: any = { pageSize: 9999, pageIndex: 1 };
    this.organizationService.getPagingAll(request).subscribe((response) => {
      if (response.status) {
        this.treeData = this.transformToTreeNode(response.data.items);
      }
    });
  }

  transformToTreeNode(data: any[]): TreeNode[] {
    return data.map((item) => ({
      label: item.organizationName,
      data: item,
      children: item.organizationChildren ? this.transformToTreeNode(item.organizationChildren) : [],
      expanded: false,
    }));
  }

  findTreeNodeById(treeData: TreeNode[], id: any): TreeNode | null {
    for (const node of treeData) {
      if (node.data?.id === id) return node;
      if (node.children && node.children.length > 0) {
        const foundNode = this.findTreeNodeById(node.children, id);
        if (foundNode) return foundNode;
      }
    }
    return null;
  }

  onOrgFilterChange(): void {
    this.fetchData();
  }

  onDialogOrgSelect(): void {
    const id = this.dialogOrgNode?.data?.id ?? null;
    this.form.patchValue({ organizationId: id });
  }

  isColVisible(field: string): boolean {
    return this.selectedColumns.some(c => c.field === field);
  }

  onColumnToggle(event: any, col: any): void {
    if (event.checked) {
      if (!this.selectedColumns.some(c => c.field === col.field)) {
        this.selectedColumns = this.allColumns.filter(c =>
          this.selectedColumns.some(s => s.field === c.field) || c.field === col.field
        );
      }
    } else {
      this.selectedColumns = this.selectedColumns.filter(c => c.field !== col.field);
    }
  }
}

