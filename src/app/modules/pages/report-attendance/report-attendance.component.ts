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
            { label: 'Báo cáo thống kê' },
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
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Đi muộn',
                            data: data.monthlyAttendances?.map((m: any) => m.totalLateDays) || [],
                            backgroundColor: 'rgba(251, 146, 60, 0.75)',
                            borderColor: 'rgba(251, 146, 60, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Về sớm',
                            data: data.monthlyAttendances?.map((m: any) => m.totalEarlyLeaveDays) || [],
                            backgroundColor: 'rgba(245, 158, 11, 0.75)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Nghỉ phép',
                            data: data.monthlyAttendances?.map((m: any) => m.totalLeaveDays) || [],
                            backgroundColor: 'rgba(99, 102, 241, 0.75)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Vắng mặt',
                            data: data.monthlyAttendances?.map((m: any) => m.totalAbsentDays) || [],
                            backgroundColor: 'rgba(156, 163, 175, 0.75)',
                            borderColor: 'rgba(156, 163, 175, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: data.monthlyAttendances?.map((m: any) => m.totalOvertimeHours) || [],
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            borderColor: 'rgba(168, 85, 247, 1)',
                            borderWidth: 3,
                            fill: false,
                            type: 'line',
                            pointRadius: 5,
                            pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            yAxisID: 'yOt',
                            tension: 0.4,
                        },
                    ],
                };
                this.monthlyChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12, weight: '500' },
                                usePointStyle: true,
                                pointStyle: 'circle',
                            },
                        },
                        title: {
                            display: true,
                            text: 'Chuyên cần theo tháng',
                            font: { size: 16, weight: '600' },
                            padding: { top: 10, bottom: 20 },
                            color: '#1e293b',
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            cornerRadius: 8,
                            titleFont: { size: 13, weight: '600' },
                            bodyFont: { size: 12 },
                        },
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                            ticks: { font: { size: 11 } },
                        },
                        y: {
                            beginAtZero: true,
                            position: 'left',
                            title: { display: true, text: 'Ngày', font: { size: 12, weight: '600' } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                            ticks: { font: { size: 11 } },
                        },
                        yOt: {
                            beginAtZero: true,
                            position: 'right',
                            title: { display: true, text: 'Giờ tăng ca', font: { size: 12, weight: '600' } },
                            grid: { drawOnChartArea: false },
                            ticks: { font: { size: 11 } },
                        },
                    },
                };

                // Position attendance + OT
                const positionData = data.positionAttendances || [];
                const positionLabels = positionData.map((d: any) => d.positionName);
                this.deptOtChartData = {
                    labels: positionLabels,
                    datasets: [
                        {
                            label: 'Ngày làm việc',
                            data: positionData.map((d: any) => d.totalWorkDays),
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Đi muộn',
                            data: positionData.map((d: any) => d.totalLateDays),
                            backgroundColor: 'rgba(251, 146, 60, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Vắng mặt',
                            data: positionData.map((d: any) => d.totalAbsentDays),
                            backgroundColor: 'rgba(239, 68, 68, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: positionData.map((d: any) => d.totalOvertimeHours),
                            backgroundColor: 'rgba(168, 85, 247, 0.75)',
                            borderWidth: 0,
                        },
                    ],
                };
                this.deptOtChartOptions = this.getChartOptions('Chuyên cần & Tăng ca theo vị trí');

                // OT trend (monthly OT hours + pay)
                const otData = data.overtimeSummaries || [];
                const otLabels = otData.map((o: any) => `Tháng ${o.month}`);
                this.otTrendChartData = {
                    labels: otLabels,
                    datasets: [
                        {
                            label: 'Giờ tăng ca',
                            data: otData.map((o: any) => o.totalOvertimeHours),
                            backgroundColor: 'rgba(168, 85, 247, 0.75)',
                            borderColor: 'rgba(168, 85, 247, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Tiền tăng ca (triệu)',
                            data: otData.map((o: any) => (o.totalOvertimePay || 0) / 1000000),
                            backgroundColor: 'rgba(251, 146, 60, 0.1)',
                            borderColor: 'rgba(251, 146, 60, 1)',
                            borderWidth: 3,
                            type: 'line',
                            pointRadius: 5,
                            pointBackgroundColor: 'rgba(251, 146, 60, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            yAxisID: 'yPay',
                            tension: 0.4,
                            fill: false,
                        },
                    ],
                };
                this.otTrendChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12, weight: '500' },
                                usePointStyle: true,
                                pointStyle: 'circle',
                            },
                        },
                        title: {
                            display: true,
                            text: 'Xu hướng tăng ca theo tháng',
                            font: { size: 16, weight: '600' },
                            padding: { top: 10, bottom: 20 },
                            color: '#1e293b',
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            cornerRadius: 8,
                            titleFont: { size: 13, weight: '600' },
                            bodyFont: { size: 12 },
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
                        x: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                            ticks: { font: { size: 11 } },
                        },
                        y: {
                            beginAtZero: true,
                            position: 'left',
                            title: { display: true, text: 'Giờ', font: { size: 12, weight: '600' } },
                            grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                            ticks: { font: { size: 11 } },
                        },
                        yPay: {
                            beginAtZero: true,
                            position: 'right',
                            title: { display: true, text: 'Tiền (triệu đ)', font: { size: 12, weight: '600' } },
                            grid: { drawOnChartArea: false },
                            ticks: { font: { size: 11 } },
                        },
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
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Đi muộn',
                            data: topEmployees.map((e: any) => e.lateDays),
                            backgroundColor: 'rgba(251, 146, 60, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Nghỉ phép',
                            data: topEmployees.map((e: any) => e.leaveDays),
                            backgroundColor: 'rgba(99, 102, 241, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: topEmployees.map((e: any) => e.overtimeHours),
                            backgroundColor: 'rgba(168, 85, 247, 0.75)',
                            borderWidth: 0,
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
                this.deptOtChartOptions = this.getChartOptions('Chuyên cần & Tăng ca theo vị trí', isHorizontal);
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
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: '500' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                title: {
                    display: true,
                    text: title,
                    font: { size: 16, weight: '600' },
                    padding: { top: 10, bottom: 20 },
                    color: '#1e293b',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: { font: { size: 11 } },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: { font: { size: 11 } },
                },
            },
        };
    }

    private generateColors(count: number): string[] {
        const palette = [
            'rgba(99, 102, 241, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
        ];
        return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
    }
}
