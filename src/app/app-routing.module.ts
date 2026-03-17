import { EditModule } from './modules/pages/staff-position/edit/edit.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AdminGuard } from './core/guards/admin.guard';
import { TreeTableModule } from 'primeng/treetable';
import { NotfoundComponent } from './modules/partials/notfound/notfound.component';
import { DashboardComponent } from './modules/pages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ShowLeaveApplicationComponent } from './modules/pages/leave-application/show-leave-application/show-leave-application.component';
import { CreateLeaveApplicationComponent } from './modules/pages/leave-application/create-leave-application/create-leave-application.component';
import { DetailLeaveApplicationComponent } from './modules/pages/leave-application/detail-leave-application/detail-leave-application.component';
import { ShowTimeSheetComponent } from './modules/pages/time-sheet/show-time-sheet/show-time-sheet.component';
import { DetailTimeSheetComponent } from './modules/pages/time-sheet/detail-time-sheet/detail-time-sheet.component';
import { ApproveLeaveApplicationComponent } from './modules/pages/leave-application/approve-leave-application/approve-leave-application.component';
import { PermissionGuard } from './core/guards/permissions.guard';
import { PermissionConstant } from './core/constants/permission-constant';
import { NotHavePermissionComponent } from './modules/partials/not-have-permission/not-have-permission.component';
import { EditLeaveApplicationComponent } from './modules/pages/leave-application/edit-leave-application/edit-leave-application.component';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    canActivate: [AuthGuard],
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: 'staff-position',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/staff-position/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'popup',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/popup/popup/popup.module'
                                ).then((m) => m.PopupModule),
                        },
                        {
                            path: 'staff-position/create',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/staff-position/create/create.module'
                                ).then((m) => m.CreateModule),
                        },
                        {
                            path: 'kpi',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageKPIView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/kpi/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'detail-kpi/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageKPIEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/kpi/detail-kpi/detail-kpi.module'
                                ).then((m) => m.DetailKpiModule),
                        },
                        {
                            path: 'staff-position/edit/:id',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/staff-position/edit/edit.module'
                                ).then((m) => m.EditModule),
                        },
                        {
                            path: 'profile',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/profile/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'profile/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageProfileCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/profile/create/create.module'
                                ).then((m) => m.CreateModule),
                        },
                        {
                            path: 'profile/detail/:id',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/profile/detail/detail.module'
                                ).then((m) => m.DetailModule),
                        },
                        {
                            path: 'personnel-record',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/personnel-record/personnel-record.module'
                                ).then((m) => m.PersonnelRecordModule),
                        },
                        {
                            path: 'update-personal-record/:id',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/update-personal-record/update-personnal.module'
                                ).then((m) => m.UpdatePersonnalRecordModule),
                        },
                        {
                            path: 'dashboard',
                            component: DashboardComponent,
                        },
                        {
                            path: '',
                            component: DashboardComponent,
                        },
                        {
                            path: 'object/edit/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageObjectEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/object/edit-object/edit.module'
                                ).then((m) => m.EditModule),
                        },
                        {
                            path: 'organizational-structure/show',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageOrganizationalStructureView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/organizational-structure/organi-struct-list/organi-struct-list.module'
                                ).then((m) => m.OrganiStructListModule),
                        },
                        {
                            path: 'organizational-structure/update/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageOrganizationalStructureEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/organizational-structure/organi-struct-update/organi-struct-update.module'
                                ).then((m) => m.OrganiStructUpdateModule),
                        },
                        {
                            path: 'object',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageObjectView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/object/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'organizational-structure/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageOrganizationalStructureCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/organizational-structure/organi-struct-create/organi-struct-create.module'
                                ).then((m) => m.OrganiStructCreateModule),
                        },

                        {
                            path: 'object/edit',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageObjectEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/object/edit-object/edit.module'
                                ).then((m) => m.EditModule),
                        },
                        {
                            path: 'company-informations',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageCompanyInformationView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/company-info/company-info.module'
                                ).then((m) => m.CompanyInfoModule),
                        },
                        {
                            path: 'object',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageObjectView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/object/show/show.module'
                                ).then((m) => m.ShowModule),
                        },

                        {
                            path: 'organizational-structure/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageOrganizationalStructureCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/organizational-structure/organi-struct-create/organi-struct-create.module'
                                ).then((m) => m.OrganiStructCreateModule),
                        },
                        {
                            path: 'object/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageObjectCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/object/create/create.module'
                                ).then((m) => m.CreateModule),
                        },
                        {
                            path: 'contract/show',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageContractView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/contract/contract-list/contract-list.module'
                                ).then((m) => m.ContractListModule),
                        },
                        {
                            path: 'contract/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageContractCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/contract/contract-create/contract-create.module'
                                ).then((m) => m.ContractCreateModule),
                        },
                        {
                            path: 'contract/update/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageContractEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/contract/contract-update/contract-update.module'
                                ).then((m) => m.ContractUpdateModule),
                        },
                        {
                            path: 'object/edit',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageObjectEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/object/edit-object/edit.module'
                                ).then((m) => m.EditModule),
                        },
                        {
                            path: 'organizational-structure/update/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageOrganizationalStructureEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/organizational-structure/organi-struct-update/organi-struct-update.module'
                                ).then((m) => m.OrganiStructUpdateModule),
                        },
                        {
                            path: 'organizationalstructure-chart',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageOrganizationalStructureView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/organizationalstructure-chart/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'show-record/:id',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/personnel-record-show/show-record.module'
                                ).then((m) => m.PersonnelRecordModule),
                        },
                        {
                            path: 'export-pdf',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/contract/export-pdf/export-pdf.module'
                                ).then((m) => m.ExportPdfModule),
                        },
                        {
                            path: 'timekeeping',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageTimekeepingRulesView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/timekeeping/timekeeping.module'
                                ).then((m) => m.TimekeepingModule),
                        },
                        {
                            path: 'timekeeping-regulations',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageLeaveRegulationsView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/timekeeping-regulations/regulation.module'
                                ).then((m) => m.TimekeepingRegulationsModule),
                        },
                        //tny add
                        {
                            path: 'leave-application',
                            component: ShowLeaveApplicationComponent,
                        },
                        {
                            path: 'leave-application/approve',
                            component: ApproveLeaveApplicationComponent,
                        },
                        {
                            path: 'leave-application/create',
                            component: CreateLeaveApplicationComponent,
                        },
                        {
                            path: 'leave-application/detail/:id',
                            component: DetailLeaveApplicationComponent,
                        },
                        {
                            path: 'leave-application/edit/:id',
                            component: EditLeaveApplicationComponent,
                        },
                        {
                            path: 'time-sheet',
                            component: ShowTimeSheetComponent,
                        },
                        {
                            path: 'time-sheet/detail/:id',
                            component: DetailTimeSheetComponent,
                        },
                        {
                            path: 'decentralization',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [PermissionConstant.Admin],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/decentralization/decentralization.module'
                                ).then((m) => m.DecentralizationModule),
                        },
                        {
                            path: 'department',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/department/department.module'
                                ).then((m) => m.DepartmentModule),
                        },
                        //end
                        {
                            path: 'location',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageTimekeepingLocationView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/location/location.module'
                                ).then((m) => m.LocationModule),
                        },
                        {
                            path: 'timekeepingUnit/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageTimekeepingRulesCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/timekeeping-unit/timkeeping-unit-create/unit-create.module'
                                ).then((m) => m.UnitCreateModule),
                        },
                        {
                            path: 'detailed-attendance',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageDetailedTimekeepingView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/detailed-attendance/detailed-attendance/detailed-attendance.module'
                                ).then((m) => m.DetailedAttendanceModule),
                        },
                        {
                            path: 'general-timekeep',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageGeneralTimekeepingView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/general-timekeeping/general-timekeep/general-timekeep.module'
                                ).then((m) => m.GeneralTimekeepModule),
                        },
                        {
                            path: 'timesheet/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageDetailedTimekeepingEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/detailed-attendance/timesheet/timesheet.module'
                                ).then((m) => m.TimesheetModule),
                        },
                        {
                            path: 'summary-timesheet/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageGeneralTimekeepingEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/general-timekeeping/detail-summary-timesheet/detail-summary-timesheet.module'
                                ).then((m) => m.DetailSummaryTimesheetModule),
                        },

                        //tadd
                        {
                            path: 'shift',
                            // canActivate: [PermissionGuard],
                            // data: {
                            //     requiredPermissions: [PermissionConstant.Admin],
                            // },
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageShiftSetupView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/shift/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'shift/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageShiftSetupCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/shift/create/create.module'
                                ).then((m) => m.CreateModule),
                        },
                        {
                            path: 'shift/edit/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageShiftSetupEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/shift/edit/edit.module'
                                ).then((m) => m.EditModule),
                        },

                        {
                            path: 'shift-scheduling',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageShiftAllocationView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/shift-scheduling/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'shift-scheduling/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageShiftAllocationCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/shift-scheduling/create/create.module'
                                ).then((m) => m.CreateModule),
                        },

                        {
                            path: 'shift-scheduling/edit/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageShiftAllocationEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/shift-scheduling/edit/edit.module'
                                ).then((m) => m.EditModule),
                        },

                        //tadd
                        {
                            path: 'location/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageTimekeepingLocationCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/location/location-create/location-create.module'
                                ).then((m) => m.LocationCreateModule),
                        },
                        {
                            path: 'location/update/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageTimekeepingLocationEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/location/location-update/location-update.module'
                                ).then((m) => m.LocationUpdateModule),
                        },
                        {
                            path: 'timekeepingunit/create',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/timekeeping-unit/timkeeping-unit-create/unit-create.module'
                                ).then((m) => m.UnitCreateModule),
                        },
                        {
                            path: 'timekeepingunit/update/:id',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageTimekeepingRulesEdit,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/timekeeping-unit/timkeeping-unit-update/unit-update.module'
                                ).then((m) => m.UnitUpdateModule),
                        },

                        {
                            path: 'timekeepingunit/update/:id',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/timekeeping-unit/timkeeping-unit-update/unit-update.module'
                                ).then((m) => m.UnitUpdateModule),
                        },
                        {
                            path: 'salary-components',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/salary-components/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        //tadd
                        {
                            path: 'paysheet-detail/:id',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/paysheets-detail/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'paysheet-employee',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/paysheet-employee/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'payroll-employee/:id/:employeeid',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/payroll-employeee/detail/detail.module'
                                ).then((m) => m.DetailModule),
                        },
                        {
                            path: 'salary-composition',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageSalaryComponentsView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/salary-composition/salary-composition.module'
                                ).then((m) => m.SalaryCompositionModule),
                        },

                        {
                            path: 'revenue-commission',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageSalaryComponentsView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/revenue-commission/revenue-commission.module'
                                ).then((m) => m.RevenueCommissionModule),
                        },

                        {
                            path: 'salary',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManagePayrollTableView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/salary/show/show.module'
                                ).then((m) => m.ShowModule),
                        },
                        {
                            path: 'salary/create',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManagePayrollTableCreate,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/salary/create/create.module'
                                ).then((m) => m.CreateModule),
                        },
                        {
                            path: 'overview',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/overview/overview.module'
                                ).then((m) => m.OverviewModule),
                        },
                        {
                            path: 'work-calendar',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/work-calendar/work-calendar.module'
                                ).then((m) => m.WorkCalendarModule),
                        },
                        {
                            path: 'work-group-list',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/work-group/work-group-list/work-group-list.module'
                                ).then((m) => m.WorkGroupListModule),
                        },
                        {
                            path: 'popup-approve',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/popup-approve/popup-approve.module'
                                ).then((m) => m.PopupApproveModule),
                        },
                        {
                            path: 'department-reports',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/department-reports/department-reports.module'
                                ).then((m) => m.DepartmentReportsModule),
                        },
                        {
                            path: 'checkin-checkout',
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/apply-checkin-checkout/apply-checkin-checkout.module'
                                ).then((m) => m.ApplyCheckinCheckoutModule),
                        },
                        {
                            path: 'statistical-report',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageStatisticalReportView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/statistical-report/statistical-report.module'
                                ).then((m) => m.StatisticalReportModule),
                        },
                        {
                            path: 'report-hr-distribution',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageStatisticalReportView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/report-hr-distribution/report-hr-distribution.module'
                                ).then((m) => m.ReportHrDistributionModule),
                        },
                        {
                            path: 'report-monthly-income',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageStatisticalReportView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/report-monthly-income/report-monthly-income.module'
                                ).then((m) => m.ReportMonthlyIncomeModule),
                        },
                        {
                            path: 'report-performance',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageStatisticalReportView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/report-performance/report-performance.module'
                                ).then((m) => m.ReportPerformanceModule),
                        },
                        {
                            path: 'report-attendance',
                            canActivate: [PermissionGuard],
                            data: {
                                requiredPermissions: [
                                    PermissionConstant.ManageStatisticalReportView,
                                ],
                            },
                            loadChildren: () =>
                                import(
                                    'src/app/modules/pages/report-attendance/report-attendance.module'
                                ).then((m) => m.ReportAttendanceModule),
                        },
                        //tadd
                    ],
                },
                {
                    path: 'auth',
                    loadChildren: () =>
                        import('src/app/modules/auth/auth.module').then(
                            (m) => m.AuthModule
                        ),
                },
                { path: 'notfound', component: NotfoundComponent },
                {
                    path: 'not-have-permission',
                    component: NotHavePermissionComponent,
                },
                { path: '**', redirectTo: '/notfound' },
            ],
            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
