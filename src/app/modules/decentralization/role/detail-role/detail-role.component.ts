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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { AccordionModule } from 'primeng/accordion';
import { PermissionService } from 'src/app/core/services/decentralization/permission.service';
import { Section, SectionLabel } from 'src/app/core/enums/section.enum';
import { markAllAsTouched } from 'src/app/core/helpers/validatorHelper';
@Component({
  selector: 'app-detail-role',
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
    AccordionModule
  ],
  providers: [DatePipe],
  templateUrl: './detail-role.component.html',
  styleUrl: './detail-role.component.scss'
})
export class DetailRoleComponent implements OnInit {
  //var
  breadcrumbs: any[];
  user: any;
  permissions: any[] = [];
  selectedPermissions: any = [];
  isSubmitting: boolean = false;
  permissionId:number=0;
  role:any={};
  //constant
  sectionLabel = SectionLabel;
  //enum
  section = Section;
  constructor(private router: Router, private datePipe: DatePipe,
    private organiStructTypeService: OrganiStructTypeService,
    private route: ActivatedRoute,
    private permissionService: PermissionService,
    private authService: AuthService,
    private messageService: MessageService,
    private roleService: RoleService,
    private fb: FormBuilder

  ) {
    this.roleForm = this.fb.group({
      name: [null, Validators.required],
      description: [null]
    });
    this.authService.userCurrent.subscribe(user => {
      this.user = user;
    })
  }


  ngOnInit(): void {
    this.breadcrumbs = [
      { label: 'Quyền hạn' },
      { label: 'Vai trò/Nhóm quyền', routerLink: '/decentralization/role' },
      { label: 'Chi tiết' },
    ];

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isNaN(id)) {
        return;
      }
      this.permissionId = id;
      this.getPermission(id);
    });

    const request = {
      pageIndex: 1,
      pageSize: 10000,
    };
    this.getPermissions(request);
  }
  getPermissions(request: any) {
    this.permissionService.paging(request).subscribe(res => {
      if (res.status === true) {
        this.permissions = res.data.items.map(permission => ({
          ...permission,
          selected: this.selectedPermissions.some(selectedPermission => selectedPermission.id == permission.id),
          childrens: permission.childrens?.map(child => ({
            ...child,
            selected: this.selectedPermissions.some(selectedPermission => selectedPermission.id == child.id),
          }))
        }));
      }
    });
  }

  getPermission(id: number) {
    this.roleService.getById(id).subscribe(res => {
      if (res.status === true) {
        this.role.name=res.data.name;
        this.role.description=res.data.description;
        this.selectedPermissions = this.flattenPermissions(res.data.permissions);
        this.applySelectedPermissionsToTree();
      }
    });
  }

  private applySelectedPermissionsToTree(): void {
    if (!this.permissions?.length) return;
    const selectedIds = new Set<number>((this.selectedPermissions ?? []).map((p: any) => p.id));

    this.permissions = this.permissions.map((permission: any) => ({
      ...permission,
      selected: selectedIds.has(permission.id),
      childrens: permission.childrens?.map((child: any) => ({
        ...child,
        selected: selectedIds.has(child.id),
      })),
    }));
  }



  //handle data
  onPermissionChange(permission: any): void {
    const childrens = permission.childrens ?? [];
    if (childrens?.length > 0) {
      // Khi tick vào nhóm quyền cha => đồng bộ toàn bộ quyền con
      childrens.forEach((child: any) => {
        child.selected = permission.selected;
      });
    } else {
      // Khi tick vào quyền con => cập nhật trạng thái tick của quyền cha
      const parent = this.permissions.find((p: any) => p.id == permission.parentPermissionId);
      if (parent?.childrens?.length) {
        parent.selected = parent.childrens.some((child: any) => child.selected);
      }
    }
    this.updateSelectedPermissions();
  }


  getSelectedChildren(permission: any): any[] {
    if (!permission.childrens) return [];
    return permission.childrens.filter((child: any) => child.selected);
  }

  getTopLevelPermissionsBySection(sectionKey: any): any[] {
    return (this.permissions ?? []).filter(
      (p: any) => p.section == sectionKey && p.parentPermissionId == null
    );
  }

  private normalizeText(value: any): string {
    return (value ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // Map child permission -> action columns (view/create/edit/delete)
  getActionChild(permission: any, action: 'view' | 'create' | 'edit' | 'delete'): any | null {
    const children = permission?.childrens ?? [];
    const actionKeywords: Record<string, string[]> = {
      view: ['xem', 'read'],
      create: ['tao', 'create', 'them', 'add'],
      edit: ['sua', 'edit', 'update', 'capnhat', 'chinh sua', 'chinhsua'],
      delete: ['xoa', 'delete', 'remove'],
    };

    const keywords = actionKeywords[action] ?? [];
    for (const child of children) {
      const haystack = this.normalizeText(child?.displayName ?? child?.name);
      if (!haystack) continue;
      if (keywords.some((k) => haystack.includes(k))) {
        return child;
      }
    }
    return null;
  }

  getBonusChildren(permission: any): any[] {
    const children = permission?.childrens ?? [];
    const usedIds = new Set<number>();

    const viewChild = this.getActionChild(permission, 'view');
    const createChild = this.getActionChild(permission, 'create');
    const editChild = this.getActionChild(permission, 'edit');
    const deleteChild = this.getActionChild(permission, 'delete');

    if (viewChild?.id != null) usedIds.add(viewChild.id);
    if (createChild?.id != null) usedIds.add(createChild.id);
    if (editChild?.id != null) usedIds.add(editChild.id);
    if (deleteChild?.id != null) usedIds.add(deleteChild.id);

    return children.filter((child: any) => child && child.id != null && !usedIds.has(child.id));
  }

  updateSelectedPermissions(): void {
    const selectedMap = new Map<number, any>();

    this.permissions.forEach((permission: any) => {
      if (permission?.selected) {
        selectedMap.set(permission.id, permission);
      }
      permission.childrens?.forEach((child: any) => {
        if (child?.selected) {
          selectedMap.set(child.id, child);
        }
      });
    });

    this.selectedPermissions = Array.from(selectedMap.values());
  }

  flattenPermissions(permissions: any[]): any[] {
    const flatPermissions: any[] = [];

    const flatten = (permissions: any[]) => {
      permissions.forEach(permission => {
        flatPermissions.push(permission);
        if (permission.childrens && permission.childrens.length > 0) {
          flatten(permission.childrens);
        }
      });
    };

    flatten(permissions);
    return flatPermissions;
  }


  //send data
  onSubmit() {
    if (this.isSubmitting) {
      return;
    }
    if (this.selectedPermissions.length <= 0) {
      this.messageService.add({
        severity: 'warning',
        summary: 'Cảnh báo',
        detail: 'Bạn phải chọn ít nhất 1 quyền cho nhóm quyền này',
      });
      return;
    }
    if (this.roleForm.valid) {
      const request = this.roleForm.value;
      request.id=this.permissionId;
      request.permissionIds = this.selectedPermissions.map(res => res.id);
      this.isSubmitting = true;
      this.roleService.edit(request).subscribe(
        (res) => {
          if (res.status == true) {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: res.message,
            });
            this.router.navigate(['/decentralization/role'])
          }
          else {
            this.messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: res.message,
            });
          }
        },
        (exception) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Lỗi hệ thống',
          });
          this.isSubmitting = false;

        },
        () => {
          this.isSubmitting = false;
        })
    }
    else {
      markAllAsTouched(this.roleForm);
      this.messageService.add({
        severity: 'warning',
        summary: 'Cảnh báo',
        detail: 'Cần nhập đủ thông tin',
      });
    }
  }













  // validate
  roleForm: FormGroup;
  validationMessages = {
    name: [
      { type: 'required', message: 'Tên vai trò không được để trống' },
    ],
    employeeName: [
      { type: 'required', message: 'Tên nhân viên không được để trống' },
    ]
  };

}
