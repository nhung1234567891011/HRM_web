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
    fromMonth: number | null = null;
    toMonth: number | null = null;
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
    selectedOrganizationId: number | null = null;

    topScope: 'employee' | 'position' = 'employee';
    topScopeOptions = [
        { label: 'Theo nhân viên', value: 'employee' },
        { label: 'Theo vị trí', value: 'position' },
    ];
    private lastAttendanceData: any = null;

    // Top 7: tỷ lệ đi muộn
    lateTopChartType: string = 'bar';
    lateTopChartData: any;
    lateTopChartOptions: any;

    // Top 7: OT (giờ)
    otTopChartType: string = 'bar';
    otTopChartData: any;
    otTopChartOptions: any;

    chartVisible: Record<'monthly' | 'leave' | 'employee' | 'deptOt' | 'otTrend', boolean> = {
        monthly: true,
        leave: true,
        employee: true,
        deptOt: true,
        otTrend: true,
    };
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
            key: item.id,
            label: item.organizationName,
            data: item,
            children: item.organizationChildren ? this.transformToTreeNode(item.organizationChildren) : [],
            expanded: false,
        }));
    }

    onOrganizationChange(event: any): void {
        this.selectedOrganizationId = event?.node?.data?.id ?? event?.node?.key ?? null;
        this.loadReport();
    }

    onOrganizationClear(): void {
        this.selectedOrganization = null;
        this.selectedOrganizationId = null;
        this.loadReport();
    }

    onFilterChange(): void {
        if (this.fromMonth && this.toMonth && this.fromMonth > this.toMonth) {
            const tmp = this.fromMonth;
            this.fromMonth = this.toMonth;
            this.toMonth = tmp;
        }
        this.loadReport();
    }

    loadReport(): void {
        const request: any = { year: this.selectedYear };
        if (this.fromMonth) request.fromMonth = this.fromMonth;
        if (this.toMonth) request.toMonth = this.toMonth;
        if (this.selectedOrganizationId) request.organizationId = this.selectedOrganizationId;

        this.reportService.getAttendance(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                this.lastAttendanceData = data;

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
                    aspectRatio: 1,
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
                    aspectRatio: 1,
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
                this.leaveChartOptions = this.getChartOptions('Phân bổ loại nghỉ', false, this.leaveChartType);

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
                this.updateTop7LateAndOtCharts();
            }
        });
    }

    onTopScopeChange(): void {
        this.updateTop7LateAndOtCharts();
    }

    private updateTop7LateAndOtCharts(): void {
        if (!this.lastAttendanceData) return;
        const data = this.lastAttendanceData;

        if (this.topScope === 'employee') {
            const emp = (data.employeeAttendances || []).map((e: any) => {
                const workDays = e.workDays ?? 0;
                const lateDays = e.lateDays ?? 0;
                const lateRate = workDays > 0 ? (lateDays / workDays) * 100 : 0;
                return { ...e, lateRate };
            });

            const lateTop = emp
                .slice()
                .sort((a: any, b: any) => (b.lateRate ?? 0) - (a.lateRate ?? 0))
                .slice(0, 7);

            this.lateTopChartData = {
                labels: lateTop.map((e: any) => e.fullName),
                datasets: [
                    {
                        label: 'Tỷ lệ đi muộn (%)',
                        data: lateTop.map((e: any) => Number((e.lateRate ?? 0).toFixed(2))),
                        backgroundColor: 'rgba(251, 146, 60, 0.75)',
                        borderWidth: 0,
                    },
                ],
            };

            this.lateTopChartOptions = this.getChartOptions('Tỷ lệ đi muộn (Top 7)');
            if (this.lateTopChartOptions?.scales?.y?.title) {
                this.lateTopChartOptions.scales.y.title.text = 'Tỷ lệ (%)';
            }

            const otTop = emp
                .slice()
                .sort((a: any, b: any) => (b.overtimeHours ?? 0) - (a.overtimeHours ?? 0))
                .slice(0, 7);

            this.otTopChartData = {
                labels: otTop.map((e: any) => e.fullName),
                datasets: [
                    {
                        label: 'Giờ OT',
                        data: otTop.map((e: any) => e.overtimeHours ?? 0),
                        backgroundColor: 'rgba(168, 85, 247, 0.75)',
                        borderWidth: 0,
                    },
                ],
            };

            this.otTopChartOptions = this.getChartOptions('Giờ OT (Top 7)');
            if (this.otTopChartOptions?.scales?.y?.title) {
                this.otTopChartOptions.scales.y.title.text = 'Giờ OT';
            }
        } else {
            const pos = (data.positionAttendances || []).map((p: any) => {
                const workDays = p.totalWorkDays ?? 0;
                const lateDays = p.totalLateDays ?? 0;
                const lateRate = workDays > 0 ? (lateDays / workDays) * 100 : 0;
                return { ...p, lateRate };
            });

            const lateTop = pos
                .slice()
                .sort((a: any, b: any) => (b.lateRate ?? 0) - (a.lateRate ?? 0))
                .slice(0, 7);

            this.lateTopChartData = {
                labels: lateTop.map((p: any) => p.positionName),
                datasets: [
                    {
                        label: 'Tỷ lệ đi muộn (%)',
                        data: lateTop.map((p: any) => Number((p.lateRate ?? 0).toFixed(2))),
                        backgroundColor: 'rgba(251, 146, 60, 0.75)',
                        borderWidth: 0,
                    },
                ],
            };

            this.lateTopChartOptions = this.getChartOptions('Tỷ lệ đi muộn (Top 7)');
            if (this.lateTopChartOptions?.scales?.y?.title) {
                this.lateTopChartOptions.scales.y.title.text = 'Tỷ lệ (%)';
            }

            const otTop = pos
                .slice()
                .sort((a: any, b: any) => (b.totalOvertimeHours ?? 0) - (a.totalOvertimeHours ?? 0))
                .slice(0, 7);

            this.otTopChartData = {
                labels: otTop.map((p: any) => p.positionName),
                datasets: [
                    {
                        label: 'Giờ OT',
                        data: otTop.map((p: any) => p.totalOvertimeHours ?? 0),
                        backgroundColor: 'rgba(168, 85, 247, 0.75)',
                        borderWidth: 0,
                    },
                ],
            };

            this.otTopChartOptions = this.getChartOptions('Giờ OT (Top 7)');
            if (this.otTopChartOptions?.scales?.y?.title) {
                this.otTopChartOptions.scales.y.title.text = 'Giờ OT';
            }
        }
    }

    onChartTypeChange(chart: string, event: any): void {
        const type = event.value;
        const isHorizontal = type === 'horizontalBar';
        const actualType = isHorizontal ? 'bar' : type;

        const supportedTypes: Record<string, string[]> = {
            monthly: ['bar', 'line'],
            leave: ['bar', 'line', 'pie', 'doughnut'],
            employee: ['bar', 'line'],
            deptOt: ['bar', 'line'],
            otTrend: ['bar', 'line'],
        };

        if (!supportedTypes[chart]?.includes(actualType)) {
            return;
        }

        switch (chart) {
            case 'monthly':
                this.monthlyChartType = actualType;
                this.monthlyChartOptions = this.getChartOptions('Chuyên cần theo tháng', isHorizontal, actualType);
                this.rebuildChart('monthly');
                break;
            case 'leave':
                this.leaveChartType = actualType;
                this.leaveChartOptions = this.getChartOptions('Phân bổ loại nghỉ', isHorizontal, actualType);
                this.rebuildChart('leave');
                break;
            case 'employee':
                this.empChartType = actualType;
                this.empChartOptions = this.getChartOptions('Chuyên cần theo nhân viên', isHorizontal, actualType);
                this.rebuildChart('employee');
                break;
            case 'deptOt':
                this.deptOtChartType = actualType;
                this.deptOtChartOptions = this.getChartOptions('Chuyên cần & Tăng ca theo vị trí', isHorizontal, actualType);
                this.rebuildChart('deptOt');
                break;
            case 'otTrend':
                this.otTrendChartType = actualType;
                this.rebuildChart('otTrend');
                break;
        }
    }

    private rebuildChart(chart: 'monthly' | 'leave' | 'employee' | 'deptOt' | 'otTrend'): void {
        this.chartVisible[chart] = false;
        setTimeout(() => {
            this.chartVisible[chart] = true;
        });
    }

    canRenderChart(chart: 'monthly' | 'leave' | 'employee' | 'deptOt' | 'otTrend'): boolean {
        const chartTypeMap: Record<string, string> = {
            monthly: this.monthlyChartType,
            leave: this.leaveChartType,
            employee: this.empChartType,
            deptOt: this.deptOtChartType,
            otTrend: this.otTrendChartType,
        };

        const chartDataMap: Record<string, any> = {
            monthly: this.monthlyChartData,
            leave: this.leaveChartData,
            employee: this.empChartData,
            deptOt: this.deptOtChartData,
            otTrend: this.otTrendChartData,
        };

        const allowedTypes: Record<string, string[]> = {
            monthly: ['bar', 'line'],
            leave: ['bar', 'line', 'pie', 'doughnut'],
            employee: ['bar', 'line'],
            deptOt: ['bar', 'line'],
            otTrend: ['bar', 'line'],
        };

        const type = chartTypeMap[chart];
        const data = chartDataMap[chart];

        return allowedTypes[chart].includes(type) && this.hasValidChartData(data);
    }

    private hasValidChartData(data: any): boolean {
        if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
            return false;
        }

        if (data.labels.length === 0 || data.datasets.length === 0) {
            return false;
        }

        return data.datasets.some((dataset: any) =>
            Array.isArray(dataset?.data) && dataset.data.some((value: any) => Number.isFinite(Number(value)))
        );
    }

    private getChartOptions(title: string, horizontal: boolean = false, chartType: string = 'bar'): any {
        const isCircular = chartType === 'pie' || chartType === 'doughnut';
        const options: any = {
            responsive: true,
            aspectRatio: 1,
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
        };

        if (!isCircular) {
            options.indexAxis = horizontal ? 'y' : 'x';
            options.scales = {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: { font: { size: 11 } },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: {
                        font: { size: 11 },
                    },
                },
            };
        }

        return options;
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
