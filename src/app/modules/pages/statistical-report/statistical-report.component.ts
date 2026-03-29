import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
    selector: 'app-statistical-report',
    standalone: true,
    imports: [CommonModule, RouterModule, SharedModule, ChartModule],
    templateUrl: './statistical-report.component.html',
    styleUrls: ['./statistical-report.component.scss'],
})
export class StatisticalReportComponent implements OnInit {
    // Period filter (dashboard)
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

    hrChartTypeOptions = [
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    incomeChartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    perfChartTypeOptions = [
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ radar', value: 'radar' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    attendanceChartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    // HR Distribution
    hrChartType: string = 'doughnut';
    hrChartData: any;
    hrChartOptions: any;
    hrChartPlugins: any[] = [];
    hrTotalEmployees: number = 0;

    // Monthly Income
    incomeChartType: string = 'bar';
    incomeChartData: any;
    incomeChartOptions: any;
    incomeChartContainerHeight: number = 360;
    incomeIsHorizontal: boolean = false;

    // Performance
    perfChartType: string = 'pie';
    perfChartData: any;
    perfChartOptions: any;
    perfChartPlugins: any[] = [];

    // Attendance
    attendanceChartType: string = 'bar';
    attendanceChartData: any;
    attendanceChartOptions: any;
    attendanceChartContainerHeight: number = 380;
    attendanceIsHorizontal: boolean = false;

    // Attendance overtime chart
    overtimeChartType: string = 'line';
    overtimeChartData: any;
    overtimeChartOptions: any;
    overtimeChartContainerHeight: number = 380;

    currentYear: number = new Date().getFullYear();

    constructor(private reportService: ReportService) { }

    ngOnInit(): void {
        this.hrChartPlugins = [this.createHrPieCalloutPlugin()];
        this.perfChartPlugins = [this.createPerformancePieCalloutPlugin()];
        for (let y = this.selectedYear - 5; y <= this.selectedYear; y++) {
            this.yearOptions.push({ label: `Năm ${y}`, value: y });
        }
        this.loadAllReports();
    }

    loadAllReports(): void {
        this.loadHrDistribution();
        this.loadMonthlyIncome();
        this.loadPerformance();
        this.loadAttendance();
    }

    onPeriodChange(): void {
        if (this.fromMonth && this.toMonth && this.fromMonth > this.toMonth) {
            const tmp = this.fromMonth;
            this.fromMonth = this.toMonth;
            this.toMonth = tmp;
        }
        this.loadAllReports();
    }

    private getMonthRange(): { start: number; end: number } {
        const start = this.fromMonth ?? 1;
        const end = this.toMonth ?? 12;
        return start <= end ? { start, end } : { start: end, end: start };
    }

    loadHrDistribution(): void {
        this.reportService.getHrDistribution({}).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const labels = data.positionDistributions?.map((p: any) => p.positionName) || [];
                const values = data.positionDistributions?.map((p: any) => p.employeeCount) || [];
                const datasetTotal = values.reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
                const totalEmployees = Number(data.totalEmployees);
                this.hrTotalEmployees = Number.isFinite(totalEmployees) ? totalEmployees : datasetTotal;
                this.hrChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Số nhân viên',
                            data: values,
                            backgroundColor: this.generateColors(labels.length),
                        },
                    ],
                };
                this.hrChartOptions = this.getHrChartOptions(false, this.hrChartType);
            }
        });
    }

    loadMonthlyIncome(): void {
        this.reportService.getMonthlyIncome({ year: this.selectedYear }).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const summaries = data.monthlySummaries || [];
                const range = this.getMonthRange();
                const byMonth = new Map<number, any>(
                    summaries.map((m: any) => [Number(m.month), m])
                );

                const filledSummaries = Array.from({ length: range.end - range.start + 1 }, (_, i) => {
                    const month = range.start + i;
                    const existing = byMonth.get(month);
                    return existing ?? {
                        month,
                        year: this.selectedYear,
                        totalBaseSalary: 0,
                        totalAllowance: 0,
                        totalBonus: 0,
                        totalOvertimePay: 0,
                        totalDeductions: 0,
                        totalNetSalary: 0,
                        employeeCount: 0,
                    };
                });

                const labels = filledSummaries.map((m: any) => `Tháng ${m.month}`);
                this.incomeChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Lương cứng',
                            data: filledSummaries.map((m: any) => m.totalBaseSalary ?? 0),
                            backgroundColor: 'rgba(59, 130, 246, 0.75)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 0,
                            stack: 'income',
                        },
                        {
                            label: 'Phụ cấp',
                            data: filledSummaries.map((m: any) => m.totalAllowance ?? 0),
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 0,
                            stack: 'income',
                        },
                        {
                            label: 'Thưởng',
                            data: filledSummaries.map((m: any) => m.totalBonus ?? 0),
                            backgroundColor: 'rgba(245, 158, 11, 0.75)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 0,
                            stack: 'income',
                        },
                        {
                            label: 'Tăng ca',
                            data: filledSummaries.map((m: any) => m.totalOvertimePay ?? 0),
                            backgroundColor: 'rgba(168, 85, 247, 0.75)',
                            borderColor: 'rgba(168, 85, 247, 1)',
                            borderWidth: 0,
                            stack: 'income',
                        },
                        {
                            label: 'Thực nhận',
                            data: filledSummaries.map((m: any) => m.totalNetSalary ?? 0),
                            borderColor: 'rgba(239, 68, 68, 1)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            type: 'line',
                            pointRadius: 5,
                            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            tension: 0.4,
                        },
                    ],
                };
                this.incomeChartOptions = this.getIncomeChartOptions(this.incomeIsHorizontal);
                this.updateChartContainerHeight('income');
            }
        });
    }

    loadPerformance(): void {
        const request: any = { year: this.selectedYear };
        if (this.fromMonth) request.fromMonth = this.fromMonth;
        if (this.toMonth) request.toMonth = this.toMonth;
        this.reportService.getPerformance(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const topEmployees = (data.employeePerformances || [])
                    .map((d: any) => {
                        const commissionRevenue = Number(d.kpiScore ?? 0);
                        return {
                            fullName: d.fullName || 'Chưa có tên',
                            commissionRevenue: Number.isFinite(commissionRevenue) ? commissionRevenue : 0,
                        };
                    })
                    .sort((a: any, b: any) => b.commissionRevenue - a.commissionRevenue)
                    .slice(0, 10);

                const labels = topEmployees.map((d: any) => d.fullName);
                this.perfChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Doanh thu hoa hồng',
                            data: topEmployees.map((d: any) => d.commissionRevenue),
                            backgroundColor: this.generateColors(labels.length),
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                        },
                    ],
                };
                this.perfChartOptions = this.getPerformanceChartOptions(false, this.perfChartType);
            }
        });
    }

    loadAttendance(): void {
        const request: any = { year: this.selectedYear };
        if (this.fromMonth) request.fromMonth = this.fromMonth;
        if (this.toMonth) request.toMonth = this.toMonth;
        this.reportService.getAttendance(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const monthItems = data.monthlyAttendances || [];
                const range = this.getMonthRange();
                const byMonth = new Map<number, any>(monthItems.map((m: any) => [Number(m.month), m]));
                const filled = Array.from({ length: range.end - range.start + 1 }, (_, i) => {
                    const month = range.start + i;
                    const existing = byMonth.get(month);
                    return existing ?? {
                        month,
                        year: this.selectedYear,
                        totalWorkDays: 0,
                        totalLateDays: 0,
                        totalLeaveDays: 0,
                        totalOvertimeHours: 0,
                    };
                });

                const labels = filled.map((m: any) => `Tháng ${m.month}`);
                this.attendanceChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ngày làm việc',
                            data: filled.map((m: any) => m.totalWorkDays ?? 0),
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Đi muộn',
                            data: filled.map((m: any) => m.totalLateDays ?? 0),
                            backgroundColor: 'rgba(251, 146, 60, 0.75)',
                            borderColor: 'rgba(251, 146, 60, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Nghỉ phép',
                            data: filled.map((m: any) => m.totalLeaveDays ?? 0),
                            backgroundColor: 'rgba(239, 68, 68, 0.75)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 0,
                        },
                    ],
                };

                this.overtimeChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Giờ tăng ca',
                            data: filled.map((m: any) => m.totalOvertimeHours ?? 0),
                            borderColor: 'rgba(168, 85, 247, 1)',
                            backgroundColor: 'rgba(168, 85, 247, 0.16)',
                            borderWidth: 3,
                            fill: true,
                            pointRadius: 4,
                            pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            tension: 0.35,
                        },
                    ],
                };

                this.attendanceChartOptions = this.getAttendanceChartOptions(this.attendanceIsHorizontal);
                this.overtimeChartOptions = this.getOvertimeChartOptions();
                this.updateChartContainerHeight('attendance');
                this.updateChartContainerHeight('overtime');
            }
        });
    }

    onChartTypeChange(report: string, event: any): void {
        const type = event.value;
        const isHorizontal = type === 'horizontalBar';
        const actualType = isHorizontal ? 'bar' : type;

        const supportedTypes: Record<string, string[]> = {
            hr: ['bar', 'pie', 'doughnut'],
            income: ['bar', 'line'],
            performance: ['bar', 'line', 'radar', 'pie', 'doughnut'],
            attendance: ['bar', 'line'],
        };

        if (!supportedTypes[report]?.includes(actualType)) {
            return;
        }

        switch (report) {
            case 'hr':
                this.hrChartType = actualType;
                this.hrChartOptions = this.getHrChartOptions(isHorizontal, actualType);
                break;
            case 'income':
                this.incomeIsHorizontal = isHorizontal;
                this.incomeChartType = actualType;
                this.incomeChartOptions = this.getIncomeChartOptions(this.incomeIsHorizontal);
                this.updateChartContainerHeight('income');
                break;
            case 'performance':
                this.perfChartType = actualType;
                this.perfChartOptions = this.getPerformanceChartOptions(isHorizontal, actualType);
                break;
            case 'attendance':
                this.attendanceIsHorizontal = isHorizontal;
                this.attendanceChartType = actualType;
                this.attendanceChartOptions = this.getAttendanceChartOptions(this.attendanceIsHorizontal);
                this.updateChartContainerHeight('attendance');
                break;
        }
    }

    private updateChartContainerHeight(report: 'income' | 'attendance' | 'overtime'): void {
        if (report === 'overtime') {
            const labelCount = this.overtimeChartData?.labels?.length ?? 0;
            const dynamicHeight = this.calculateChartContainerHeight(labelCount, false);
            this.overtimeChartContainerHeight = Math.max(dynamicHeight, 380);
            return;
        }

        const chartData = report === 'income' ? this.incomeChartData : this.attendanceChartData;
        const chartOptions = report === 'income' ? this.incomeChartOptions : this.attendanceChartOptions;
        const labelCount = chartData?.labels?.length ?? 0;
        const isHorizontal = chartOptions?.indexAxis === 'y';
        const containerHeight = this.calculateChartContainerHeight(labelCount, isHorizontal);

        if (report === 'income') {
            this.incomeChartContainerHeight = containerHeight;
            return;
        }

        this.attendanceChartContainerHeight = Math.max(containerHeight, 380);
    }

    private calculateChartContainerHeight(labelCount: number, isHorizontal: boolean, compact: boolean = false): number {
        const safeLabelCount = Math.max(labelCount, 1);

        if (isHorizontal) {
            const dynamicHeight = (compact ? 140 : 180) + safeLabelCount * (compact ? 28 : 42);
            return Math.min(Math.max(dynamicHeight, compact ? 220 : 320), compact ? 420 : 680);
        }

        const dynamicHeight = (compact ? 190 : 300) + Math.ceil(safeLabelCount / 6) * (compact ? 14 : 20);
        return Math.min(Math.max(dynamicHeight, compact ? 200 : 300), compact ? 300 : 440);
    }

    private getHrChartOptions(horizontal: boolean = false, chartType: string = 'bar'): any {
        const options = this.getChartOptions('Phân bổ nhân sự theo vị trí', horizontal, chartType);
        const isCircular = chartType === 'pie' || chartType === 'doughnut';

        if (!isCircular) {
            return options;
        }

        options.layout = {
            padding: {
                top: 20,
                right: 90,
                bottom: 20,
                left: 90,
            },
        };

        options.plugins = {
            ...options.plugins,
            legend: {
                ...options.plugins.legend,
                display: false,
            },
            tooltip: {
                ...options.plugins.tooltip,
                callbacks: {
                    label: (context: any) => {
                        const value = this.getTooltipNumericValue(context);
                        const data = context.dataset?.data || [];
                        const total = data.reduce((sum: number, item: any) => sum + (Number(item) || 0), 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${context.label}: ${value.toLocaleString('vi-VN')} (${percentage}%)`;
                    },
                },
            },
        };

        return options;
    }

    private getPerformanceChartOptions(horizontal: boolean = false, chartType: string = 'bar'): any {
        const options = this.getChartOptions('Top 10 doanh thu hoa hồng theo nhân viên', horizontal, chartType);
        const isCircular = chartType === 'pie' || chartType === 'doughnut';

        if (!isCircular) {
            const valueAxis = horizontal ? 'x' : 'y';

            options.scales = {
                ...options.scales,
                [valueAxis]: {
                    ...(options.scales?.[valueAxis] || {}),
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Doanh thu hoa hồng (đ)',
                        font: { size: 12, weight: '600' },
                    },
                    ticks: {
                        ...(options.scales?.[valueAxis]?.ticks || {}),
                        callback: (value: any) => this.formatCurrencyAxisValue(Number(value)),
                    },
                },
            };

            options.plugins = {
                ...options.plugins,
                tooltip: {
                    ...options.plugins.tooltip,
                    callbacks: {
                        label: (context: any) => {
                            const value = this.getTooltipNumericValue(context);
                            return `${context.label}: ${value.toLocaleString('vi-VN')} đ`;
                        },
                    },
                },
            };

            return options;
        }

        options.layout = {
            padding: {
                top: 20,
                right: 90,
                bottom: 20,
                left: 90,
            },
        };

        options.plugins = {
            ...options.plugins,
            legend: {
                ...options.plugins.legend,
                display: false,
            },
            tooltip: {
                ...options.plugins.tooltip,
                callbacks: {
                    label: (context: any) => {
                        const value = this.getTooltipNumericValue(context);
                        const data = context.dataset?.data || [];
                        const total = data.reduce((sum: number, item: any) => sum + (Number(item) || 0), 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${context.label}: ${value.toLocaleString('vi-VN')} đ (${percentage}%)`;
                    },
                },
            },
        };

        return options;
    }

    private createHrPieCalloutPlugin(): any {
        return {
            id: 'hrPieCalloutPlugin',
            afterDatasetsDraw: (chart: any) => {
                const chartType = chart?.config?.type;
                if (chartType !== 'pie' && chartType !== 'doughnut') {
                    return;
                }

                const dataset = chart?.data?.datasets?.[0];
                const labels = chart?.data?.labels || [];
                const values = dataset?.data || [];
                const total = values.reduce((sum: number, item: any) => sum + (Number(item) || 0), 0);

                const meta = chart.getDatasetMeta(0);
                if (!meta?.data?.length) {
                    return;
                }

                const ctx = chart.ctx;
                ctx.save();
                ctx.strokeStyle = '#64748b';
                ctx.fillStyle = '#334155';
                ctx.lineWidth = 1.5;
                ctx.font = '500 11px "Segoe UI", sans-serif';
                ctx.textBaseline = 'middle';

                meta.data.forEach((arc: any, index: number) => {
                    const value = Number(values[index] ?? 0);
                    if (!Number.isFinite(value) || value <= 0) {
                        return;
                    }

                    const angle = (arc.startAngle + arc.endAngle) / 2;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);

                    const startX = arc.x + cos * (arc.outerRadius * 0.9);
                    const startY = arc.y + sin * (arc.outerRadius * 0.9);
                    const bendX = arc.x + cos * (arc.outerRadius + 16);
                    const bendY = arc.y + sin * (arc.outerRadius + 16);
                    const endX = bendX + (cos >= 0 ? 30 : -30);
                    const endY = bendY;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(bendX, bendY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    const arrowAngle = Math.atan2(arc.y - startY, arc.x - startX);
                    const arrowSize = 6;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(
                        startX + Math.cos(arrowAngle + Math.PI / 7) * arrowSize,
                        startY + Math.sin(arrowAngle + Math.PI / 7) * arrowSize
                    );
                    ctx.lineTo(
                        startX + Math.cos(arrowAngle - Math.PI / 7) * arrowSize,
                        startY + Math.sin(arrowAngle - Math.PI / 7) * arrowSize
                    );
                    ctx.closePath();
                    ctx.fillStyle = '#64748b';
                    ctx.fill();

                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    const label = `${labels[index] ?? `Nhóm ${index + 1}`}: ${percentage}%`;

                    ctx.fillStyle = '#334155';
                    ctx.textAlign = cos >= 0 ? 'left' : 'right';
                    ctx.fillText(label, endX + (cos >= 0 ? 5 : -5), endY);
                });

                if (chartType === 'doughnut') {
                    const centerX = meta.data[0].x;
                    const centerY = meta.data[0].y;
                    const centerTotal = Number.isFinite(this.hrTotalEmployees) ? this.hrTotalEmployees : total;

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#64748b';
                    ctx.font = '600 12px "Segoe UI", sans-serif';
                    ctx.fillText('Tổng nhân sự', centerX, centerY - 11);

                    ctx.fillStyle = '#0f172a';
                    ctx.font = '700 22px "Segoe UI", sans-serif';
                    ctx.fillText(centerTotal.toLocaleString('vi-VN'), centerX, centerY + 12);
                }

                ctx.restore();
            },
        };
    }

    private createPerformancePieCalloutPlugin(): any {
        return {
            id: 'performancePieCalloutPlugin',
            afterDatasetsDraw: (chart: any) => {
                const chartType = chart?.config?.type;
                if (chartType !== 'pie' && chartType !== 'doughnut') {
                    return;
                }

                const dataset = chart?.data?.datasets?.[0];
                const labels = chart?.data?.labels || [];
                const values = dataset?.data || [];
                const total = values.reduce((sum: number, item: any) => sum + (Number(item) || 0), 0);

                const meta = chart.getDatasetMeta(0);
                if (!meta?.data?.length) {
                    return;
                }

                const ctx = chart.ctx;
                ctx.save();
                ctx.strokeStyle = '#64748b';
                ctx.fillStyle = '#334155';
                ctx.lineWidth = 1.5;
                ctx.font = '500 11px "Segoe UI", sans-serif';
                ctx.textBaseline = 'middle';

                meta.data.forEach((arc: any, index: number) => {
                    const value = Number(values[index] ?? 0);
                    if (!Number.isFinite(value) || value <= 0) {
                        return;
                    }

                    const angle = (arc.startAngle + arc.endAngle) / 2;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);

                    const startX = arc.x + cos * (arc.outerRadius * 0.9);
                    const startY = arc.y + sin * (arc.outerRadius * 0.9);
                    const bendX = arc.x + cos * (arc.outerRadius + 16);
                    const bendY = arc.y + sin * (arc.outerRadius + 16);
                    const endX = bendX + (cos >= 0 ? 30 : -30);
                    const endY = bendY;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(bendX, bendY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    const arrowAngle = Math.atan2(arc.y - startY, arc.x - startX);
                    const arrowSize = 6;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(
                        startX + Math.cos(arrowAngle + Math.PI / 7) * arrowSize,
                        startY + Math.sin(arrowAngle + Math.PI / 7) * arrowSize
                    );
                    ctx.lineTo(
                        startX + Math.cos(arrowAngle - Math.PI / 7) * arrowSize,
                        startY + Math.sin(arrowAngle - Math.PI / 7) * arrowSize
                    );
                    ctx.closePath();
                    ctx.fillStyle = '#64748b';
                    ctx.fill();

                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    const label = `${labels[index] ?? `Nhân viên ${index + 1}`}: ${percentage}%`;

                    ctx.fillStyle = '#334155';
                    ctx.textAlign = cos >= 0 ? 'left' : 'right';
                    ctx.fillText(label, endX + (cos >= 0 ? 5 : -5), endY);
                });

                ctx.restore();
            },
        };
    }

    private getIncomeChartOptions(horizontal: boolean = false): any {
        const categoryAxis = horizontal ? 'y' : 'x';
        const valueAxis = horizontal ? 'x' : 'y';

        return {
            responsive: true,
            aspectRatio: 1,
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
                    text: 'Thu nhập theo tháng',
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
                        label: (context: any) => {
                            const value = this.getTooltipNumericValue(context);
                            return `${context.dataset.label}: ${value.toLocaleString('vi-VN')} đ`;
                        },
                    },
                },
            },
            scales: {
                [categoryAxis]: {
                    stacked: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: { font: { size: 11 } },
                },
                [valueAxis]: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'Tiền (đ)', font: { size: 12, weight: '600' } },
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: {
                        font: { size: 11 },
                        callback: (value: any) => this.formatCurrencyAxisValue(Number(value)),
                    },
                },
            },
        };
    }

    private getAttendanceChartOptions(horizontal: boolean = false): any {
        const categoryAxis = horizontal ? 'y' : 'x';
        const dayAxis = horizontal ? 'x' : 'y';

        return {
            responsive: true,
            aspectRatio: 1,
            maintainAspectRatio: false,
            indexAxis: horizontal ? 'y' : 'x',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: { size: 11, weight: '500' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                title: {
                    display: true,
                    text: 'Chuyên cần theo tháng',
                    font: { size: 14, weight: '600' },
                    padding: { top: 8, bottom: 12 },
                    color: '#1e293b',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: (context: any) => {
                            const value = this.getTooltipNumericValue(context);
                            return `${context.dataset.label}: ${value.toLocaleString('vi-VN')} ngày`;
                        },
                    },
                },
            },
            scales: {
                [categoryAxis]: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: {
                        font: { size: 10 },
                        autoSkip: true,
                        maxTicksLimit: 6,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                },
                [dayAxis]: {
                    beginAtZero: true,
                    position: horizontal ? 'bottom' : 'left',
                    title: { display: true, text: 'Ngày', font: { size: 11, weight: '600' } },
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: {
                        font: { size: 10 },
                        maxTicksLimit: 5,
                    },
                },
            },
        };
    }

    private getOvertimeChartOptions(): any {
        return {
            responsive: true,
            aspectRatio: 1,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: { size: 11, weight: '500' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                title: {
                    display: true,
                    text: 'Thời gian OT theo tháng',
                    font: { size: 14, weight: '600' },
                    padding: { top: 8, bottom: 16 },
                    color: '#1e293b',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 13, weight: '600' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: (context: any) => {
                            const value = this.getTooltipNumericValue(context);
                            return `${context.dataset.label}: ${value.toLocaleString('vi-VN')} giờ`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: {
                        font: { size: 10 },
                        autoSkip: true,
                        maxTicksLimit: 6,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Giờ OT', font: { size: 11, weight: '600' } },
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: {
                        font: { size: 10 },
                        maxTicksLimit: 5,
                    },
                },
            },
        };
    }

    private getTooltipNumericValue(context: any): number {
        const parsedValue = context?.parsed?.y ?? context?.parsed?.x;
        const rawValue = parsedValue ?? context?.raw ?? 0;
        const numeric = Number(rawValue);
        return Number.isFinite(numeric) ? numeric : 0;
    }

    private formatCurrencyAxisValue(value: number): string {
        if (!Number.isFinite(value)) {
            return '0';
        }

        const absValue = Math.abs(value);

        if (absValue >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
        }

        if (absValue >= 1_000_000) {
            return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
        }

        if (absValue >= 1_000) {
            return `${(value / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} nghìn`;
        }

        return value.toLocaleString('vi-VN');
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
        const colors: string[] = [];
        for (let i = 0; i < count; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }
}
