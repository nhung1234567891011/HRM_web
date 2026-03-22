import { Component } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { PermissionConstant } from 'src/app/core/constants/permission-constant';
import { HasPermissionHelper } from 'src/app/core/helpers/has-permission.helper';
import { OrganizationUnit } from 'src/app/core/models/organization.model';
import { AuthService } from 'src/app/core/services/identity/auth.service';
import { OrganizationService } from 'src/app/core/services/organization.service';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.scss'],
})
export class ShowComponent {
    messages: any[] = [];
    items: any[] = [];
    struct!: any;
    pageSize: number = 30;
    pageIndex: number = 1;
    totalRecords: number = 0;
    currentPageReport: string = '';
    organizationUnits: OrganizationUnit[] = [];
    keyWord: string = '';
    showDiaLogDelete: boolean = false;
    unitDelete!: any;
    public userCurrent: any;
    permissionConstant = PermissionConstant;
    data: TreeNode[] = [];
    value: number = 1;
    selectedIcon: string = 'sitemap';
    
    
    offsetX: number = 0;
    offsetY: number = 0;
    dragging: boolean = false;
    startX: number = 0;
    startY: number = 0;
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
            { label: 'Hệ thống' },
            { label: 'Sơ đồ cơ cấu tổ chức' },
        ];

        this.loadOrganizationData();
        // this.loadOrganizationData1()
        this.data = this.convertToTreeNode(this.organizationUnits);
        console.log(this.data);
    }

    startDragging(event: MouseEvent): void {
        this.dragging = true;
        this.startX = event.clientX - this.offsetX;
        this.startY = event.clientY - this.offsetY;
    }

    onDragging(event: MouseEvent): void {
        if (!this.dragging) return;
        this.offsetX = event.clientX - this.startX;
        this.offsetY = event.clientY - this.startY;
    }

    stopDragging(): void {
        this.dragging = false;
    }

    loadOrganizationData() {
        const request: any = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex,
            keyWord: this.keyWord.trim(),
        };
        this.organizationService
            .getPagingAll(request)
            .subscribe((response: any) => {
                if (response.status) {
                    const rootUnits = response.data.items.map((unit: any) =>
                        this.mapToOrganizationUnit(unit, 1)
                    );
                    this.organizationUnits = rootUnits;
                    this.data = this.convertToTreeNode(response.data.items);
                    this.totalRecords = response.data.totalRecords;
                    this.updateCurrentPageReport();
                }
            });
    }

    convertToTreeNode = (data: any, level: number = 1): TreeNode[] => {
        const sortedData = data.sort((a: any, b: any) => a.rank - b.rank);

        return sortedData.map((org: any) => {
            const managerName =
                org.organizationLeaders
                    ?.map(
                        (leader) =>
                            `${leader.employee.lastName} ${leader.employee.firstName}`
                    )
                    .join(', ') || '';
            const childCount = org.organizationChildren?.length || 0;

            const node: TreeNode = {
                label: org.organizationName,
                expanded: level === 1,
                data: {
                    ...org,
                    level,
                    manager: managerName,
                    childCount: childCount,
                },
                children: org.organizationChildren?.length
                    ? this.convertToTreeNode(
                          org.organizationChildren,
                          level + 1
                      )
                    : undefined,
            };

            return node;
        });
    };

    mapToOrganizationUnit(unit: any, level: number): OrganizationUnit {
        return {
            id: unit.id,
            organizationCode: unit.organizationCode,
            organizationName: unit.organizationName,
            abbreviation: unit.abbreviation,
            employees: unit.organizationChildren.length,
            organizational: unit.organizationType.organizationTypeName,
            employeeId: unit.organizationLeaders[0]?.employee.id,
            unithead: unit.organizationLeaders
                .filter((leader: any) => leader.organizationLeaderType === 0)
                .map(
                    (leader: any) =>
                        `${leader.employee.lastName || ''} ${
                            leader.employee.firstName || ''
                        }`
                )
                .join(', '),
            status: unit.organizationStatus === true ? '1' : '0',
            level: level,
            rank: unit.rank,
            children: unit.organizationChildren.map((child: any) =>
                this.mapToOrganizationUnit(child, level + 1)
            ),
            expanded: false,
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
                    color: '#155724',
                    bgcolor: '#d4edda',
                };
            case '0':
                return {
                    text: 'Ngừng theo dõi',
                    color: '#494949',
                    bgcolor: '#ececec',
                };
            default:
                return {
                    text: 'Không rõ',
                    color: 'black',
                    bgcolor: 'white',
                };
        }
    }

    toggleExpand(unit: OrganizationUnit): void {
        unit.expanded = !unit.expanded;
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
                    this.messages = [
                        {
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: 'Có lỗi xảy ra',
                            life: 3000,
                        },
                    ];
                },
            });
        }
    }

    toggleNode(node: any): void {
        node.expanded = !node.expanded;
        const childNodes = document.querySelectorAll(
            `[data-node-id="${node.id}"] > ul`
        );
        childNodes.forEach((ul: any) => {
            if (node.expanded) {
                ul.classList.remove('hidden');
            } else {
                ul.classList.add('hidden');
            }
        });
    }

    handleClick(icon: string) {
        this.selectedIcon = icon;
    }

    onPageChange(event: any): void {
        this.pageSize = event.rows;
        this.pageIndex = event.page + 1;
        this.loadOrganizationData();
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

    decreaseValue(): void {
        if (this.value > 0) {
            this.value = parseFloat((this.value - 0.1).toFixed(1));
        }
    }

    increaseValue(): void {
        if (this.value < 2) {
            this.value = parseFloat((this.value + 0.1).toFixed(1));
        }
    }
}
