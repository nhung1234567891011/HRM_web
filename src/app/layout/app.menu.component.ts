import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { RefreshTokenService } from '../core/signlrs/refresh-token.service';
import { AuthService } from '../core/services/identity/auth.service';
import { MessageService } from 'primeng/api';
import { HasPermissionHelper } from '../core/helpers/has-permission.helper';
import { PermissionConstant } from '../core/constants/permission-constant';
import { RemindWorkNotificationService } from '../core/signlrs/remind-work-notification.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    authToken: any = null;
    userCurrent: any;
    private isRefreshing: boolean = false;

    constructor(
        public layoutService: LayoutService,
        private refreshTokenService: RefreshTokenService,
        private authService: AuthService,
        private messageService: MessageService,
        private hasPermissionHelper: HasPermissionHelper
    ) {
        this.authService.userCurrent.subscribe((user) => {
            this.userCurrent = user;
            // Rebuild menu khi user/permissions đã được load (tránh build lúc userCurrent=null)
            if (this.userCurrent) {
                this.buildMenuModel();
            }
        });
    }
    ngOnInit() {
        // console.log(this.userCurrent.roleNames);
        this.refreshTokenService.startConnection();
        this.refreshTokenService.addActivityListener((activity) => {
            if (!this.userCurrent) return;
            if (activity != null && activity.id == this.userCurrent.id) {
                // console.log('đổi nhóm quyền');
                this.authToken = this.authService.getAuthTokenLocalStorage();
                this.authService
                    .refreshToken({ refreshToken: this.authToken.refreshToken })
                    .subscribe((res) => {
                        if (res.status == true) {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Cảnh báo',
                                detail: 'Bạn đã bị thay đổi quyền',
                            });

                            this.authService.setAuthTokenLocalStorage(res.data);
                            this.authService
                                .fetchUserCurrent()
                                .subscribe((res) => {
                                    this.authService.setUserCurrent(res.data);
                                });
                            window.location.reload(); //load lại trang tny
                        }
                    });
            }
        });
        this.refreshTokenService.addActivityChangeRoleListener((activity) => {
            // console.log('đổi quyền');
            if (
                !this.isRefreshing &&
                activity != null &&
                this.userCurrent &&
                this.userCurrent.roleNames.includes(activity.normalizedName)
            ) {
                // console.log(this.authToken);
                this.isRefreshing = true;
                this.authToken = this.authService.getAuthTokenLocalStorage();
                this.authService
                    .refreshToken({ refreshToken: this.authToken.refreshToken })
                    .subscribe(
                        (res) => {
                            this.isRefreshing = false;
                            if (res.status == true) {
                                // console.log("đổi quyền đúng");
                                this.messageService.add({
                                    severity: 'warn',
                                    summary: 'Cảnh báo',
                                    detail: 'Bạn đã bị thay đổi quyền',
                                    life: 2500,
                                });

                                this.authService.setAuthTokenLocalStorage(
                                    res.data
                                );
                                this.authService
                                    .fetchUserCurrent()
                                    .subscribe((res) => {
                                        this.authService.setUserCurrent(
                                            res.data
                                        );
                                    });
                                window.location.reload(); //load lại trang tny
                            } else {
                                // console.log("đổi quyền sai");
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Cảnh báo',
                                    detail: 'Bạn cần đăng xuất để cập nhập quyền',
                                    life: 3000,
                                });
                            }
                        },
                        (error) => {
                            this.isRefreshing = false;
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Lỗi',
                                detail: 'Bạn cần đăng xuất để cập nhập quyền',
                                life: 3000,
                            });
                        }
                    );
            }
        });

        //#region tny ignore
        // const hasPermissions = (permissions: string[]) => {
        //     const userPermissions =
        //         this.authService.getUserCurrent()?.permissions || [];

        //     return permissions.every(
        //         (permission) =>
        //             userPermissions.includes(permission) ||
        //             (permission.endsWith('.View') &&
        //                 userPermissions.includes(permission.split('.View')[0]))
        //     );
        // };

        // const hasPermissionMain = (permission: string) => {
        //     const userPermissions =
        //         this.authService.getUserCurrent()?.permissions || [];
        //     return userPermissions.includes(permission);
        // };
        //#endregion

        this.buildMenuModel();
    }

    private buildMenuModel() {
        // front end
        this.model = [
            {
                label: '',
                items: [
                    {
                        label: 'Hệ thống',
                        icon: 'pi pi-spin pi-cog',
                        items: [
                            {
                                label: 'Thông tin công ty',
                                icon: 'pi pi-building',
                                routerLink: ['/company-informations'],
                            },
                            ...(this.hasPermissionHelper.hasPermissions([
                                PermissionConstant.ManageOrganizationalStructure,
                                PermissionConstant.ManageOrganizationalStructureView,
                            ])
                                ? [
                                    {
                                        label: 'Cơ cấu tổ chức',
                                        icon: 'pi pi-th-large',
                                        routerLink: [
                                            '/organizational-structure/show',
                                        ],
                                    },
                                    {
                                        label: 'Sơ đồ cơ cấu tổ chức',
                                        icon: 'pi pi-sitemap',
                                        routerLink: [
                                            '/organizationalstructure-chart',
                                        ],
                                    },
                                ]
                                : []),
                            ...(this.hasPermissionHelper.hasPermissions([
                                PermissionConstant.ManageObject,
                                PermissionConstant.ManageObjectView,
                            ])
                                ? [
                                    {
                                        label: 'Đối tượng',
                                        icon: 'pi pi-user',
                                        routerLink: ['/object'],
                                    },
                                ]
                                : []),
                            ...(this.hasPermissionHelper.hasPermissions([
                                PermissionConstant.ManagePosition,
                                PermissionConstant.ManagePositionView,
                            ])
                                ? [
                                    {
                                        label: 'Vị trí',
                                        icon: 'pi pi-map-marker',
                                        routerLink: ['/staff-position'],
                                    },
                                ]
                                : []),
                        ],
                    },
                ],
            },

            {
                label: '',
                items: this.hasPermissionHelper.hasPermissions([
                    PermissionConstant.ManagePro,
                    PermissionConstant.ManagePro,
                ]) ? [
                    {
                        label: 'Thông tin cá nhân',
                        icon: 'pi pi-user',
                        items: [
                            {
                                label: 'Thêm thông tin',
                                icon: 'pi pi-user-plus',
                                routerLink: ['/personnel-record'],
                            },
                        ],
                    },
                ] : [],
            },

            {
                label: '',
                items: [
                    {
                        label: 'Thông tin nhân sự',
                        icon: 'pi pi-id-card',
                        items: [
                            ...(this.hasPermissionHelper.hasPermissions([
                                PermissionConstant.ManageProfile,
                                PermissionConstant.ManageProfileView,
                            ])
                                ? [
                                    {
                                        label: 'Hồ sơ',
                                        icon: 'pi pi-file-o',
                                        routerLink: ['/profile'],
                                    },
                                ]
                                : []),
                            ...(this.hasPermissionHelper.hasPermissions([
                                PermissionConstant.ManageContract,
                                PermissionConstant.ManageContractView,
                            ])
                                ? [
                                    {
                                        label: 'Hợp đồng',
                                        icon: 'pi pi-file-o',
                                        routerLink: ['/contract/show'],
                                    },
                                ]
                                : []),
                            // ...(this.hasPermissionHelper.hasPermissions([
                            //     PermissionConstant.ManageContract,
                            //     PermissionConstant.ManageContractExport,
                            // ])
                            //     ? [
                            //           {
                            //               label: 'Xuất file Pdf',
                            //               icon: 'pi pi-file-o',
                            //               routerLink: ['/export-pdf'],
                            //           },
                            //       ]
                            //     : []),
                            // {
                            //     label: 'Nghỉ việc',
                            //     icon: 'pi pi-user-minus',
                            //     routerLink: ['/7'],
                            // },
                            // {
                            //     label: 'Khen thưởng',
                            //     icon: 'pi pi-star',
                            //     routerLink: ['/8'],
                            // },
                        ],
                    },
                ],
            },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.ManageTimekeepingRules
                    ) ||
                        this.hasPermissionHelper.hasPermissionMain(
                            PermissionConstant.ManageLeaveRegulations
                        )
                        ? [
                            {
                                label: 'Thiết lập',
                                icon: 'pi pi-user',
                                items: [
                                    ...(this.hasPermissionHelper.hasPermissions(
                                        [
                                            PermissionConstant.ManageTimekeepingRules,
                                            PermissionConstant.ManageTimekeepingRulesView,
                                        ]
                                    )
                                        ? [
                                            {
                                                label: 'Quy định chấm công',
                                                icon: 'pi pi-user-plus',
                                                routerLink: [
                                                    '/timekeeping',
                                                ],
                                            },
                                        ]
                                        : []),
                                    ...(this.hasPermissionHelper.hasPermissions(
                                        [
                                            PermissionConstant.ManageLeaveRegulations,
                                            PermissionConstant.ManageLeaveRegulationsView,
                                        ]
                                    )
                                        ? [
                                            {
                                                label: 'Quy định nghỉ',
                                                icon: 'pi pi-bell',
                                                routerLink: [
                                                    '/timekeeping-regulations',
                                                ],
                                            },
                                        ]
                                        : []),
                                ],
                            },
                        ]
                        : []),
                ],
            },
            {
                label: '',
                items: [
                    {
                        label: 'Đơn từ',
                        icon: 'pi pi-file',
                        items: [
                            {
                                label: 'Đơn xin nghỉ',
                                icon: 'pi pi-book',
                                routerLink: ['/leave-application'],
                            },
                            {
                                label: 'Duyệt đơn xin nghỉ',
                                icon: 'pi pi-book',
                                routerLink: ['/leave-application/approve'],
                            },
                            {
                                label: 'Đơn xin CheckIn/CheckOut',
                                icon: 'pi pi-book',
                                routerLink: ['/checkin-checkout'],
                            },
                        ],
                    },
                ],
            },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.ManageDetailedTimekeeping
                    ) ||
                        this.hasPermissionHelper.hasPermissionMain(
                            PermissionConstant.ManageGeneralTimekeeping
                        )
                        ? [
                            {
                                label: 'Chấm công',
                                icon: 'pi pi-map-marker',
                                items: [
                                    ...(this.hasPermissionHelper.hasPermissions(
                                        [
                                            PermissionConstant.ManageDetailedTimekeeping,
                                            PermissionConstant.ManageDetailedTimekeepingView,
                                        ]
                                    )
                                        ? [
                                            {
                                                label: 'Chấm công chi tiết',
                                                icon: 'pi pi-circle',
                                                routerLink: [
                                                    '/detailed-attendance',
                                                ],
                                            },
                                        ]
                                        : []),
                                    ...(this.hasPermissionHelper.hasPermissions(
                                        [
                                            PermissionConstant.ManageGeneralTimekeeping,
                                            PermissionConstant.ManageGeneralTimekeepingView,
                                        ]
                                    )
                                        ? [
                                            {
                                                label: 'Chấm công tổng hợp',
                                                icon: 'pi pi-circle',
                                                routerLink: [
                                                    '/general-timekeep',
                                                ],
                                            },
                                        ]
                                        : []),
                                ],
                            },
                        ]
                        : []),
                ],
            },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.ManageShiftSetup
                    ) ||
                        this.hasPermissionHelper.hasPermissionMain(
                            PermissionConstant.ManageShiftAllocation
                        )
                        ? [
                            {
                                label: 'Ca làm việc',
                                icon: 'pi pi-user',
                                items: [
                                    ...(this.hasPermissionHelper.hasPermissions(
                                        [
                                            PermissionConstant.ManageShiftSetup,
                                            PermissionConstant.ManageShiftSetupView,
                                        ]
                                    )
                                        ? [
                                            {
                                                label: 'Danh sách ca',
                                                icon: 'pi pi-user-plus',
                                                routerLink: ['/shift'],
                                            },
                                        ]
                                        : []),
                                    ...(this.hasPermissionHelper.hasPermissions(
                                        [
                                            PermissionConstant.ManageShiftAllocation,
                                            PermissionConstant.ManageShiftAllocationView,
                                        ]
                                    )
                                        ? [
                                            {
                                                label: 'Phân ca',
                                                icon: 'pi pi-user-plus',
                                                routerLink: [
                                                    '/shift-scheduling',
                                                ],
                                            },
                                        ]
                                        : []),
                                ],
                            },
                        ]
                        : []),
                ],
            },
            // {
            //     label: '',
            //     items: [
            //         {
            //             label: 'Bảng công',
            //             icon: 'pi pi-calendar-plus',
            //             items: [
            //                 {
            //                     label: 'Danh sách bảng công',
            //                     icon: 'pi pi-calendar-minus',
            //                     routerLink: ['/time-sheet'],
            //                 },
            //             ],
            //         },
            //     ],
            // },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissions([PermissionConstant.ManageTimeSheep]) ? [
                        {
                            label: 'Bảng công',
                            icon: 'pi pi-calendar-plus',
                            items: [
                                {
                                    label: 'Danh sách bảng công',
                                    icon: 'pi pi-calendar-minus',
                                    routerLink: ['/time-sheet'],
                                },
                            ],
                        },
                    ] : []),
                ],
            },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.ManagePayrollTable
                    ) ||
                    this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.ManageKPI
                    ) ||
                    this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.ManageSalaryComponents
                    )
                        ? [
                              {
                                  label: 'Tính lương',
                                  icon: 'pi pi-calendar-plus',
                                  items: [
                                      ...(this.hasPermissionHelper.hasPermissions([
                                          PermissionConstant.ManageKPI,
                                          PermissionConstant.ManageKPIView,
                                      ])
                                          ? [
                                                {
                                                    label: 'Doanh thu hoa hồng',
                                                    icon: 'pi pi-calendar-minus',
                                                    routerLink: ['/payroll/kpi'],
                                                },
                                            ]
                                          : []),
                                      ...(this.hasPermissionHelper.hasPermissions([
                                          PermissionConstant.ManageSalaryComponents,
                                          PermissionConstant.ManageSalaryComponentsView,
                                      ])
                                          ? [
                                                {
                                                    label: 'Thành phần lương',
                                                    icon: 'pi pi-calendar-minus',
                                                    routerLink: [
                                                        '/payroll/salary-composition',
                                                    ],
                                                },
                                                {
                                                    label: 'Cấu hình hoa hồng doanh thu',
                                                    icon: 'pi pi-calendar-minus',
                                                    routerLink: [
                                                        '/payroll/revenue-commission',
                                                    ],
                                                },
                                            ]
                                          : []),
                                      ...(this.hasPermissionHelper.hasPermissions([
                                          PermissionConstant.ManagePayrollTable,
                                          PermissionConstant.ManagePayrollTableView,
                                      ])
                                          ? [
                                                {
                                                    label: 'Bảng lương',
                                                    icon: 'pi pi-calendar-minus',
                                                    routerLink: ['/payroll/salary'],
                                                },
                                                {
                                                    label: 'Bảng lương nhân viên',
                                                    icon: 'pi pi-calendar-minus',
                                                    routerLink: [
                                                        '/payroll/paysheet-employee',
                                                    ],
                                                },
                                            ]
                                          : []),
                                  ],
                              },
                          ]
                        : []),
                ],
            },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissions([
                        PermissionConstant.ManageStatisticalReport,
                        PermissionConstant.ManageStatisticalReportView,
                    ]) ? [
                        {
                            label: 'Báo cáo thống kê',
                            icon: 'pi pi-chart-bar',
                            items: [
                                {
                                    label: 'Báo cáo thống kê tổng hợp',
                                    icon: 'pi pi-chart-pie',
                                    routerLink: ['/statistical-report'],
                                },
                            ],
                        },
                    ] : []),
                ],
            },
            {
                label: '',
                items: [
                    ...(this.hasPermissionHelper.hasPermissionMain(
                        PermissionConstant.Admin
                    ) ||
                        this.hasPermissionHelper.hasPermissionMain(
                            PermissionConstant.Master
                        )
                        ? [
                            {
                                label: 'Quyền hạn',
                                icon: 'pi pi-sitemap',
                                items: [
                                    {
                                        label: 'Vai trò/Nhóm quyền',
                                        icon: 'pi pi-users',
                                        routerLink: [
                                            '/decentralization/role',
                                        ],
                                    },
                                    {
                                        label: 'Quyền',
                                        icon: 'pi pi-android',
                                        routerLink: [
                                            '/decentralization/permission',
                                        ],
                                    },
                                    {
                                        label: 'Gán quyền',
                                        icon: 'pi pi-id-card',
                                        routerLink: [
                                            '/decentralization/assign-permission',
                                        ],
                                    },
                                ],
                            },
                        ]
                        : []),
                ],
            },
            // {
            //     label: '',
            //     items: [
            //         ...(this.hasPermissionHelper.hasPermissionMain(
            //             PermissionConstant.Admin
            //         ) ||
            //             this.hasPermissionHelper.hasPermissionMain(
            //                 PermissionConstant.Master
            //             )
            //             ? [
            //                 {
            //                     label: 'Công việc',
            //                     icon: 'pi pi-briefcase',
            //                     items: [
            //                         {
            //                             label: 'Tổng quan',
            //                             icon: 'pi pi-users',
            //                             routerLink: ['/overview'],
            //                         },
            //                         {
            //                             label: 'Quản lý công việc theo lịch',
            //                             icon: 'pi pi-users',
            //                             routerLink: ['/work-calendar'],
            //                         },
            //                     ],
            //                 },
            //             ]
            //             : []),
            //     ],
            // },
        ];
    }
}
