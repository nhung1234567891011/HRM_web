import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/core/services/report.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { TreeNode } from 'primeng/api';

@Component({
    selector: 'app-report-attendance',
    templateUrl: './report-attendance.component.html',
    styleUrls: ['./report-attendance.component.scss'],
})
export class ReportAttendanceComponent implements OnInit {
    chartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    // Monthly attendance chart
    monthlyChartType: string = 'bar';
    monthlyChartData: any;
    monthlyChartOptions: any;

    // Leave type distribution chart
    leaveChartType: string = 'doughnut';
    leaveChartData: any;
    leaveChartOptions: any;

    // Employee attendance chart
    empChartType: string = 'bar';
    empChartData: any;
    empChartOptions: any;

    // Department OT chart
    deptOtChartType: string = 'bar';
    deptOtChartData: any;
    deptOtChartOptions: any;

    // OT Monthly trend chart
    otTrendChartType: string = 'bar';
    otTrendChartData: any;
    otTrendChartOptions: any;

    selectedYear: number = new Date().getFullYear();
    selectedMonth: number | null = null;
    yearOptions: any[] = [];
    monthOptions: any[] = [
        { label: 'Tất cả', value: null },
        { label: 'Tháng 1', value: 1 }, { label: 'Tháng 2', value: 2 },
        { label: 'Tháng 3', value: 3 }, { label: 'Tháng 4', value: 4 },
        { label: 'Tháng 5', value: 5 }, { label: 'Tháng 6', value: 6 },
        { label: 'Tháng 7', value: 7 }, { label: 'Tháng 8', value: 8 },
        { label: 'Tháng 9', value: 9 }, { label: 'Tháng 10', value: 10 },
        { label: 'Tháng 11', value: 11 }, { label: 'Tháng 12', value: 12 },
    ];
    selectedOrganization: any = null;
    treeData: TreeNode[] = [];
    items: any[] = [];

    constructor(
        private reportService: ReportService,
        private organizationService: OrganizationService
    ) { }

    ngOnInit(): void {
        this.items = [
            { label: 'Báo cáo thống kê', routerLink: '/statistical-report' },
            { label: 'Báo cáo chuyên cần' },
        ];
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 5; y <= currentYear; y++) {
            this.yearOptions.push({ label: `Năm ${y}`, value: y });
        }
        this.getOrganizations();
        this.loadReport();
    }

    getOrganizations(): void {
        this.organizationService.getPagingAll({ pageSize: 1000, pageIndex: 1 }).subscribe((res: any) => {
            if (res.status) {
                this.treeData = this.transformToTreeNode(res.data?.items || []);
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

    onOrganizationChange(event: any): void {
        this.selectedOrganization = event?.node?.data?.id ?? null;
        this.loadReport();
    }

    onFilterChange(): void {
        this.loadReport();
    }

    loadReport(): void {
        const request: any = { year: this.selectedYear };
        if (this.selectedMonth) request.month = this.selectedMonth;
        if (this.selectedOrganization) request.organizationId = this.selectedOrganization;

        this.reportService.getAttendance(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;

                // Monthly attendance
                const monthLabels = data.monthlyAttendances?.map((m: any) => `Tháng ${m.month}`) || [];
                this.monthlyChartData = {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Ngày làm việc',
                            data: data.monthlyAttendances?.map((m: any) => m.totalWorkDays) || [],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: 'Đi muộn',
                            data: data.monthlyAttendances?.map((m: any) => m.totalLateDays) || [],
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: 'Về sớm',
                            data: data.monthlyAttendances?.map((m: any) => m.totalEarlyLeaveDays) || [],
                            backgroundColor: 'rgba(255, 206, 86, 0.6)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: 'Nghỉ phép',
                            data: data.monthlyAttendances?.map((m: any) => m.totalLeaveDays) || [],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: 'Vắng mặt',
                            data: data.monthlyAttendances?.map((m: any) => m.totalAbsentDays) || [],
                            backgroundColor: 'rgba(201, 203, 207, 0.6)',
                            borderColor: 'rgba(201, 203, 207, 1)',
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: data.monthlyAttendances?.map((m: any) => m.totalOvertimeHours) || [],
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                            fill: false,
                            type: 'line',
                            yAxisID: 'yOt',
                        },
                    ],
                };
                this.monthlyChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: true, text: 'Chuyên cần theo tháng', font: { size: 14 } },
                    },
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Ngày' } },
                        yOt: { beginAtZero: true, position: 'right', title: { display: true, text: 'Giờ tăng ca' }, grid: { drawOnChartArea: false } },
                    },
                };

                // Department attendance + OT
                const deptData = data.departmentAttendances || [];
                const deptLabels = deptData.map((d: any) => d.organizationName);
                this.deptOtChartData = {
                    labels: deptLabels,
                    datasets: [
                        {
                            label: 'Ngày làm việc',
                            data: deptData.map((d: any) => d.totalWorkDays),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                        {
                            label: 'Đi muộn',
                            data: deptData.map((d: any) => d.totalLateDays),
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        },
                        {
                            label: 'Vắng mặt',
                            data: deptData.map((d: any) => d.totalAbsentDays),
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: deptData.map((d: any) => d.totalOvertimeHours),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            type: 'bar',
                        },
                    ],
                };
                this.deptOtChartOptions = this.getChartOptions('Chuyên cần & Tăng ca theo phòng ban');

                // OT trend (monthly OT hours + pay)
                const otData = data.overtimeSummaries || [];
                const otLabels = otData.map((o: any) => `Tháng ${o.month}`);
                this.otTrendChartData = {
                    labels: otLabels,
                    datasets: [
                        {
                            label: 'Giờ tăng ca',
                            data: otData.map((o: any) => o.totalOvertimeHours),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                        },
                        {
                            label: 'Tiền tăng ca (triệu)',
                            data: otData.map((o: any) => (o.totalOvertimePay || 0) / 1000000),
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 2,
                            type: 'line',
                            yAxisID: 'yPay',
                        },
                    ],
                };
                this.otTrendChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: true, text: 'Xu hướng tăng ca theo tháng', font: { size: 14 } },
                        tooltip: {
                            callbacks: {
                                label: (ctx: any) => {
                                    if (ctx.dataset.yAxisID === 'yPay') {
                                        return `${ctx.dataset.label}: ${(ctx.raw * 1000000).toLocaleString('vi-VN')} đ`;
                                    }
                                    return `${ctx.dataset.label}: ${ctx.raw} giờ`;
                                },
                            },
                        },
                    },
                    scales: {
                        x: { beginAtZero: true },
                        y: { beginAtZero: true, position: 'left', title: { display: true, text: 'Giờ' } },
                        yPay: { beginAtZero: true, position: 'right', title: { display: true, text: 'Tiền (triệu đ)' }, grid: { drawOnChartArea: false } },
                    },
                };

                // Leave type distribution
                const leaveLabels = data.leaveTypeDistributions?.map((l: any) => l.leaveType) || [];
                const leaveValues = data.leaveTypeDistributions?.map((l: any) => l.count) || [];
                this.leaveChartData = {
                    labels: leaveLabels,
                    datasets: [{
                        label: 'Số lần nghỉ',
                        data: leaveValues,
                        backgroundColor: this.generateColors(leaveLabels.length),
                    }],
                };
                this.leaveChartOptions = this.getChartOptions('Phân bổ loại nghỉ');

                // Employee attendance (top 20)
                const topEmployees = (data.employeeAttendances || []).slice(0, 20);
                const empLabels = topEmployees.map((e: any) => e.fullName);
                this.empChartData = {
                    labels: empLabels,
                    datasets: [
                        {
                            label: 'Ngày làm việc',
                            data: topEmployees.map((e: any) => e.workDays),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                        {
                            label: 'Đi muộn',
                            data: topEmployees.map((e: any) => e.lateDays),
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        },
                        {
                            label: 'Nghỉ phép',
                            data: topEmployees.map((e: any) => e.leaveDays),
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: topEmployees.map((e: any) => e.overtimeHours),
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        },
                    ],
                };
                this.empChartOptions = this.getChartOptions('Chuyên cần theo nhân viên');
            }
        });
    }

    onChartTypeChange(chart: string, event: any): void {
        const type = event.value;
        const isHorizontal = type === 'horizontalBar';
        const actualType = isHorizontal ? 'bar' : type;

        switch (chart) {
            case 'monthly':
                this.monthlyChartType = actualType;
                this.monthlyChartOptions = this.getChartOptions('Chuyên cần theo tháng', isHorizontal);
                break;
            case 'leave':
                this.leaveChartType = actualType;
                this.leaveChartOptions = this.getChartOptions('Phân bổ loại nghỉ', isHorizontal);
                break;
            case 'employee':
                this.empChartType = actualType;
                this.empChartOptions = this.getChartOptions('Chuyên cần theo nhân viên', isHorizontal);
                break;
            case 'deptOt':
                this.deptOtChartType = actualType;
                this.deptOtChartOptions = this.getChartOptions('Chuyên cần & Tăng ca theo phòng ban', isHorizontal);
                break;
            case 'otTrend':
                this.otTrendChartType = actualType;
                break;
        }
    }

    private getChartOptions(title: string, horizontal: boolean = false): any {
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: horizontal ? 'y' : 'x',
            plugins: {
                legend: { display: true, position: 'bottom' },
                title: { display: true, text: title, font: { size: 14 } },
            },
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true },
            },
        };
    }

    private generateColors(count: number): string[] {
        const palette = [
            'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(255, 99, 255, 0.7)',
            'rgba(99, 255, 132, 0.7)',
        ];
        return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
    }
}
