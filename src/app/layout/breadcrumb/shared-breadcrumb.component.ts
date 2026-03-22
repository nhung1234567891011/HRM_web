import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    PRIMARY_OUTLET,
    Router,
} from '@angular/router';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';

interface BreadcrumbNode {
    label: string;
    routerLink?: string;
}

interface BreadcrumbMatcher {
    pattern: RegExp;
    nodes: BreadcrumbNode[];
}

@Component({
    selector: 'app-shared-breadcrumb',
    templateUrl: './shared-breadcrumb.component.html',
    styleUrls: ['./shared-breadcrumb.component.scss'],
})
export class SharedBreadcrumbComponent implements OnInit, OnDestroy {
    @Input() model: MenuItem[] | null = null;

    home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };
    items: MenuItem[] = [];

    private navigationSub?: Subscription;

    private readonly labelMap: Record<string, string> = {
        dashboard: 'Trang chủ',
        profile: 'Hồ sơ',
        personnel: 'Nhân sự',
        create: 'Tạo mới',
        edit: 'Chỉnh sửa',
        detail: 'Chi tiết',
        show: 'Danh sách',
        update: 'Cập nhật',
        list: 'Danh sách',
        decentralization: 'Phân quyền',
        department: 'Phòng ban',
        project: 'Dự án',
        role: 'Vai trò',
        permission: 'Quyền',
        assign: 'Gán quyền',
        object: 'Đối tượng',
        contract: 'Hợp đồng',
        salary: 'Lương',
        paysheet: 'Bảng lương',
        paysheets: 'Bảng lương',
        timekeeping: 'Chấm công',
        shift: 'Ca làm việc',
        report: 'Báo cáo',
        regulation: 'Quy định',
        location: 'Địa điểm',
        'staff-position': 'Vị trí',
        'personnel-record': 'Hồ sơ nhân sự',
        'organizational-structure': 'Cơ cấu tổ chức',
        organizationalstructure: 'Cơ cấu tổ chức',
        'company-informations': 'Thông tin công ty',
        'leave-application': 'Đơn xin nghỉ',
        'time-sheet': 'Bảng chấm công',
        'apply-checkin-checkout': 'Đơn Checkin/Checkout',
        'salary-composition': 'Thành phần lương',
        'revenue-commission': 'Hoa hồng doanh thu',
        'statistical-report': 'Thống kê',
    };

    private readonly menuMatchers: BreadcrumbMatcher[] = [
        {
            pattern: /^(\/|\/dashboard)$/,
            nodes: [{ label: 'Trang chủ', routerLink: '/dashboard' }],
        },
        {
            pattern: /^\/company-informations$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Thông tin công ty', routerLink: '/company-informations' },
            ],
        },
        {
            pattern: /^\/organizational-structure\/show$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Cơ cấu tổ chức', routerLink: '/organizational-structure/show' },
            ],
        },
        {
            pattern: /^\/organizational-structure\/create$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Cơ cấu tổ chức', routerLink: '/organizational-structure/show' },
                { label: 'Tạo mới', routerLink: '/organizational-structure/create' },
            ],
        },
        {
            pattern: /^\/organizational-structure\/update\/[^/]+$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Cơ cấu tổ chức', routerLink: '/organizational-structure/show' },
                { label: 'Cập nhật' },
            ],
        },
        {
            pattern: /^\/organizationalstructure-chart$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Sơ đồ cơ cấu tổ chức', routerLink: '/organizationalstructure-chart' },
            ],
        },
        {
            pattern: /^\/object$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Đối tượng', routerLink: '/object' },
            ],
        },
        {
            pattern: /^\/object\/create$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Đối tượng', routerLink: '/object' },
                { label: 'Tạo mới', routerLink: '/object/create' },
            ],
        },
        {
            pattern: /^\/object\/edit(\/[^/]+)?$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Đối tượng', routerLink: '/object' },
                { label: 'Chỉnh sửa' },
            ],
        },
        {
            pattern: /^\/staff-position$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Vị trí', routerLink: '/staff-position' },
            ],
        },
        {
            pattern: /^\/staff-position\/create$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Vị trí', routerLink: '/staff-position' },
                { label: 'Tạo mới', routerLink: '/staff-position/create' },
            ],
        },
        {
            pattern: /^\/staff-position\/edit\/[^/]+$/,
            nodes: [
                { label: 'Hệ thống' },
                { label: 'Vị trí', routerLink: '/staff-position' },
                { label: 'Chỉnh sửa' },
            ],
        },
        {
            pattern: /^\/personnel-record$/,
            nodes: [
                { label: 'Thông tin cá nhân' },
                { label: 'Thêm thông tin', routerLink: '/personnel-record' },
            ],
        },
        {
            pattern: /^\/profile$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hồ sơ', routerLink: '/profile' },
            ],
        },
        {
            pattern: /^\/profile\/create$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hồ sơ', routerLink: '/profile' },
                { label: 'Tạo mới', routerLink: '/profile/create' },
            ],
        },
        {
            pattern: /^\/profile\/detail\/[^/]+$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hồ sơ', routerLink: '/profile' },
                { label: 'Chi tiết' },
            ],
        },
        {
            pattern: /^\/show-record\/[^/]+$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hồ sơ', routerLink: '/profile' },
                { label: 'Chi tiết hồ sơ' },
            ],
        },
        {
            pattern: /^\/update-personal-record\/[^/]+$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hồ sơ', routerLink: '/profile' },
                { label: 'Cập nhật hồ sơ' },
            ],
        },
        {
            pattern: /^\/contract\/show$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hợp đồng', routerLink: '/contract/show' },
            ],
        },
        {
            pattern: /^\/contract\/create$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hợp đồng', routerLink: '/contract/show' },
                { label: 'Tạo mới', routerLink: '/contract/create' },
            ],
        },
        {
            pattern: /^\/contract\/update\/[^/]+$/,
            nodes: [
                { label: 'Thông tin nhân sự' },
                { label: 'Hợp đồng', routerLink: '/contract/show' },
                { label: 'Chỉnh sửa' },
            ],
        },
        {
            pattern: /^\/timekeeping$/,
            nodes: [
                { label: 'Thiết lập' },
                { label: 'Quy định chấm công', routerLink: '/timekeeping' },
            ],
        },
        {
            pattern: /^\/timekeeping-regulations$/,
            nodes: [
                { label: 'Thiết lập' },
                { label: 'Quy định nghỉ', routerLink: '/timekeeping-regulations' },
            ],
        },
        {
            pattern: /^\/leave-application$/,
            nodes: [
                { label: 'Đơn từ' },
                { label: 'Đơn xin nghỉ', routerLink: '/leave-application' },
            ],
        },
        {
            pattern: /^\/leave-application\/create$/,
            nodes: [
                { label: 'Đơn từ' },
                { label: 'Đơn xin nghỉ', routerLink: '/leave-application' },
                { label: 'Tạo mới', routerLink: '/leave-application/create' },
            ],
        },
        {
            pattern: /^\/leave-application\/approve$/,
            nodes: [
                { label: 'Đơn từ' },
                { label: 'Duyệt đơn xin nghỉ', routerLink: '/leave-application/approve' },
            ],
        },
        {
            pattern: /^\/leave-application\/(detail|edit)\/[^/]+$/,
            nodes: [
                { label: 'Đơn từ' },
                { label: 'Đơn xin nghỉ', routerLink: '/leave-application' },
                { label: 'Chi tiết' },
            ],
        },
        {
            pattern: /^\/checkin-checkout$/,
            nodes: [
                { label: 'Đơn từ' },
                { label: 'Đơn xin CheckIn/CheckOut', routerLink: '/checkin-checkout' },
            ],
        },
        {
            pattern: /^\/detailed-attendance$/,
            nodes: [
                { label: 'Chấm công' },
                { label: 'Chấm công chi tiết', routerLink: '/detailed-attendance' },
            ],
        },
        {
            pattern: /^\/timesheet\/[^/]+$/,
            nodes: [
                { label: 'Chấm công' },
                { label: 'Chấm công chi tiết', routerLink: '/detailed-attendance' },
                { label: 'Chi tiết bảng công' },
            ],
        },
        {
            pattern: /^\/general-timekeep$/,
            nodes: [
                { label: 'Chấm công' },
                { label: 'Chấm công tổng hợp', routerLink: '/general-timekeep' },
            ],
        },
        {
            pattern: /^\/summary-timesheet\/[^/]+$/,
            nodes: [
                { label: 'Chấm công' },
                { label: 'Chấm công tổng hợp', routerLink: '/general-timekeep' },
                { label: 'Chi tiết bảng công' },
            ],
        },
        {
            pattern: /^\/shift$/,
            nodes: [
                { label: 'Ca làm việc' },
                { label: 'Danh sách ca', routerLink: '/shift' },
            ],
        },
        {
            pattern: /^\/shift\/(create|edit\/[^/]+)$/,
            nodes: [
                { label: 'Ca làm việc' },
                { label: 'Danh sách ca', routerLink: '/shift' },
                { label: 'Cập nhật ca làm việc' },
            ],
        },
        {
            pattern: /^\/shift-scheduling$/,
            nodes: [
                { label: 'Ca làm việc' },
                { label: 'Phân ca', routerLink: '/shift-scheduling' },
            ],
        },
        {
            pattern: /^\/shift-scheduling\/(create|edit\/[^/]+)$/,
            nodes: [
                { label: 'Ca làm việc' },
                { label: 'Phân ca', routerLink: '/shift-scheduling' },
                { label: 'Cập nhật phân ca' },
            ],
        },
        {
            pattern: /^\/time-sheet$/,
            nodes: [
                { label: 'Bảng công' },
                { label: 'Danh sách bảng công', routerLink: '/time-sheet' },
            ],
        },
        {
            pattern: /^\/time-sheet\/detail\/[^/]+$/,
            nodes: [
                { label: 'Bảng công' },
                { label: 'Danh sách bảng công', routerLink: '/time-sheet' },
                { label: 'Chi tiết bảng công' },
            ],
        },
        {
            pattern: /^\/(payroll\/kpi|kpi)$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Dữ liệu KPI', routerLink: '/payroll/kpi' },
            ],
        },
        {
            pattern: /^\/(payroll\/kpi\/[^/]+|detail-kpi\/[^/]+)$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Dữ liệu KPI', routerLink: '/payroll/kpi' },
                { label: 'Chi tiết KPI' },
            ],
        },
        {
            pattern: /^\/payroll\/salary-composition$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Thành phần lương', routerLink: '/payroll/salary-composition' },
            ],
        },
        {
            pattern: /^\/payroll\/revenue-commission$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Hoa hồng doanh thu', routerLink: '/payroll/revenue-commission' },
            ],
        },
        {
            pattern: /^\/payroll\/salary$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Bảng lương', routerLink: '/payroll/salary' },
            ],
        },
        {
            pattern: /^\/payroll\/salary\/create$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Bảng lương', routerLink: '/payroll/salary' },
                { label: 'Tạo mới', routerLink: '/payroll/salary/create' },
            ],
        },
        {
            pattern: /^\/(payroll\/paysheet-employee|paysheet-employee)$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Bảng lương nhân viên', routerLink: '/payroll/paysheet-employee' },
            ],
        },
        {
            pattern: /^\/(payroll\/paysheet-detail\/[^/]+|paysheet-detail\/[^/]+)$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Bảng lương nhân viên', routerLink: '/payroll/paysheet-employee' },
                { label: 'Chi tiết bảng lương' },
            ],
        },
        {
            pattern: /^\/payroll-employee\/[^/]+\/[^/]+$/,
            nodes: [
                { label: 'Tính lương' },
                { label: 'Bảng lương nhân viên', routerLink: '/payroll/paysheet-employee' },
                { label: 'Chi tiết lương nhân viên' },
            ],
        },
        {
            pattern: /^\/statistical-report$/,
            nodes: [
                { label: 'Báo cáo thống kê' },
                { label: 'Báo cáo thống kê tổng hợp', routerLink: '/statistical-report' },
            ],
        },
        {
            pattern: /^\/report-hr-distribution$/,
            nodes: [
                { label: 'Báo cáo thống kê' },
                { label: 'Báo cáo phân bổ nhân sự', routerLink: '/report-hr-distribution' },
            ],
        },
        {
            pattern: /^\/report-monthly-income$/,
            nodes: [
                { label: 'Báo cáo thống kê' },
                { label: 'Báo cáo tổng hợp thu nhập', routerLink: '/report-monthly-income' },
            ],
        },
        {
            pattern: /^\/report-performance$/,
            nodes: [
                { label: 'Báo cáo thống kê' },
                { label: 'Báo cáo hiệu suất', routerLink: '/report-performance' },
            ],
        },
        {
            pattern: /^\/report-attendance$/,
            nodes: [
                { label: 'Báo cáo thống kê' },
                { label: 'Báo cáo chuyên cần', routerLink: '/report-attendance' },
            ],
        },
        {
            pattern: /^\/decentralization\/role$/,
            nodes: [
                { label: 'Quyền hạn' },
                { label: 'Vai trò/Nhóm quyền', routerLink: '/decentralization/role' },
            ],
        },
        {
            pattern: /^\/decentralization\/role\/(create|detail\/[^/]+|edit\/[^/]+)$/,
            nodes: [
                { label: 'Quyền hạn' },
                { label: 'Vai trò/Nhóm quyền', routerLink: '/decentralization/role' },
                { label: 'Chi tiết vai trò' },
            ],
        },
        {
            pattern: /^\/decentralization\/permission$/,
            nodes: [
                { label: 'Quyền hạn' },
                { label: 'Quyền', routerLink: '/decentralization/permission' },
            ],
        },
        {
            pattern: /^\/decentralization\/assign-permission$/,
            nodes: [
                { label: 'Quyền hạn' },
                { label: 'Gán quyền', routerLink: '/decentralization/assign-permission' },
            ],
        },
    ];

    constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit(): void {
        this.buildItems();

        this.navigationSub = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => this.buildItems());
    }

    ngOnDestroy(): void {
        this.navigationSub?.unsubscribe();
    }

    private buildItems(): void {
        const normalizedUrl = this.normalizeUrl(this.router.url);
        const menuNodes = this.resolveMenuBreadcrumb(normalizedUrl);

        if (menuNodes.length) {
            this.items = menuNodes;
            return;
        }

        this.items = this.buildBreadcrumb(this.activatedRoute.root);
    }

    private normalizeUrl(url: string): string {
        const [path] = url.split(/[?#]/);

        if (!path) {
            return '/';
        }

        return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    }

    private resolveMenuBreadcrumb(path: string): MenuItem[] {
        const matched = this.menuMatchers.find((matcher) => matcher.pattern.test(path));

        if (!matched) {
            return [];
        }

        return matched.nodes.map((node) => {
            if (node.routerLink) {
                return { label: node.label, routerLink: node.routerLink };
            }

            return { label: node.label };
        });
    }

    private buildBreadcrumb(
        route: ActivatedRoute,
        currentUrl = '',
        breadcrumbs: MenuItem[] = []
    ): MenuItem[] {
        const children: ActivatedRoute[] = route.children.filter(
            (child) => child.outlet === PRIMARY_OUTLET
        );

        if (!children.length) {
            return breadcrumbs;
        }

        const child = children[0];
        const currentRouteSegments = child.snapshot.url.map((segment) => segment.path);
        const routePathSegments = (child.routeConfig?.path ?? '')
            .split('/')
            .filter(Boolean);
        const explicitLabel = child.snapshot.data['breadcrumb'];

        if (currentRouteSegments.length) {
            currentRouteSegments.forEach((actualSegment, index) => {
                const routePathSegment = routePathSegments[index] ?? actualSegment;
                const isDynamicSegment = routePathSegment.startsWith(':');

                currentUrl = `${currentUrl}/${actualSegment}`;

                if (isDynamicSegment) {
                    return;
                }

                const isLastSegment = index === currentRouteSegments.length - 1;
                const sourceLabel =
                    isLastSegment && typeof explicitLabel === 'string'
                        ? explicitLabel
                        : routePathSegment;

                this.pushUniqueBreadcrumb(
                    breadcrumbs,
                    this.formatLabel(sourceLabel),
                    currentUrl
                );
            });
        }

        return this.buildBreadcrumb(child, currentUrl, breadcrumbs);
    }

    private pushUniqueBreadcrumb(
        breadcrumbs: MenuItem[],
        label: string,
        routerLink: string
    ): void {
        const existed = breadcrumbs.some((item) => item.routerLink === routerLink);

        if (existed) {
            return;
        }

        breadcrumbs.push({ label, routerLink });
    }

    private formatLabel(rawSegment: string): string {
        const normalized = decodeURIComponent(rawSegment).trim().toLowerCase();

        if (this.labelMap[normalized]) {
            return this.labelMap[normalized];
        }

        return normalized
            .replace(/[-_]+/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
