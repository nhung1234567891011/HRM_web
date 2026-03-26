import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/core/services/report.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { TreeNode } from 'primeng/api';

@Component({
    selector: 'app-report-monthly-income',
    templateUrl: './report-monthly-income.component.html',
    styleUrls: ['./report-monthly-income.component.scss'],
})
export class ReportMonthlyIncomeComponent implements OnInit {
    monthlyChartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    deptChartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    // Monthly trend chart
    monthlyChartType: string = 'bar';
    monthlyChartData: any;
    monthlyChartOptions: any;

    // Department comparison chart
    deptChartType: string = 'bar';
    deptChartData: any;
    deptChartOptions: any;

    selectedYear: number = new Date().getFullYear();
    yearOptions: any[] = [];
    selectedOrganization: any = null;
    selectedOrganizationId: number | null = null;
    chartVisible: Record<'monthly' | 'dept', boolean> = {
        monthly: true,
        dept: true,
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
            { label: 'Báo cáo tổng hợp thu nhập' },
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

    onYearChange(): void {
        this.loadReport();
    }

    loadReport(): void {
        const request: any = { year: this.selectedYear };
        if (this.selectedOrganizationId) {
            request.organizationId = this.selectedOrganizationId;
        }

        this.reportService.getMonthlyIncome(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;

                // Monthly trend - Combo Chart: Stacked Bar + Line
                const monthLabels = data.monthlySummaries?.map((m: any) => `Tháng ${m.month}`) || [];
                this.monthlyChartData = {
                    labels: monthLabels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Lương cơ bản thực nhận',
                            data: data.monthlySummaries?.map((m: any) => m.totalBaseSalary) || [],
                            backgroundColor: 'rgba(59, 130, 246, 0.75)',
                            borderWidth: 0,
                            stack: 'income',
                            order: 2,
                        },
                        {
                            type: 'bar',
                            label: 'KPI thực nhận',
                            data: data.monthlySummaries?.map((m: any) => m.totalBonus) || [],
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderWidth: 0,
                            stack: 'income',
                            order: 2,
                        },
                        {
                            type: 'bar',
                            label: 'Lương tăng ca',
                            data: data.monthlySummaries?.map((m: any) => m.totalOvertimePay) || [],
                            backgroundColor: 'rgba(168, 85, 247, 0.75)',
                            borderWidth: 0,
                            stack: 'income',
                            order: 2,
                        },
                        {
                            type: 'line',
                            label: 'Tổng thực nhận',
                            data: data.monthlySummaries?.map((m: any) => m.totalNetSalary) || [],
                            borderColor: 'rgba(239, 68, 68, 1)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            pointRadius: 5,
                            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            fill: false,
                            tension: 0.4,
                            order: 1,
                        },
                    ],
                };
                this.monthlyChartOptions = this.getComboChartOptions('Xu hướng thu nhập theo tháng');

                // Position comparison - component breakdown
                const positionLabels = data.positionIncomes?.map((d: any) => d.positionName) || [];
                this.deptChartData = {
                    labels: positionLabels,
                    datasets: [
                        {
                            label: 'Lương cơ bản thực nhận',
                            data: data.positionIncomes?.map((d: any) => d.totalBaseSalary) || [],
                            backgroundColor: 'rgba(59, 130, 246, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'KPI thực nhận',
                            data: data.positionIncomes?.map((d: any) => d.totalBonus) || [],
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Lương tăng ca',
                            data: data.positionIncomes?.map((d: any) => d.totalOvertimePay) || [],
                            backgroundColor: 'rgba(168, 85, 247, 0.75)',
                            borderWidth: 0,
                        },
                    ],
                };
                this.deptChartOptions = this.getChartOptions('Chi phí nhân sự theo vị trí');
            }
        });
    }

    onChartTypeChange(chart: string, event: any): void {
        const type = event.value;
        const isHorizontal = type === 'horizontalBar';
        const actualType = isHorizontal ? 'bar' : type;

        const supportedTypes: Record<string, string[]> = {
            monthly: ['bar', 'line'],
            dept: ['bar', 'line'],
        };

        if (!supportedTypes[chart]?.includes(actualType)) {
            return;
        }

        switch (chart) {
            case 'monthly':
                this.monthlyChartType = actualType;
                this.monthlyChartOptions = this.getComboChartOptions('Xu hướng thu nhập theo tháng', isHorizontal);
                this.rebuildChart('monthly');
                break;
            case 'dept':
                this.deptChartType = actualType;
                this.deptChartOptions = this.getChartOptions('Chi phí nhân sự theo vị trí', isHorizontal);
                this.rebuildChart('dept');
                break;
        }
    }

    private rebuildChart(chart: 'monthly' | 'dept'): void {
        this.chartVisible[chart] = false;
        setTimeout(() => {
            this.chartVisible[chart] = true;
        });
    }

    canRenderChart(chart: 'monthly' | 'dept'): boolean {
        const chartTypeMap: Record<string, string> = {
            monthly: this.monthlyChartType,
            dept: this.deptChartType,
        };

        const chartDataMap: Record<string, any> = {
            monthly: this.monthlyChartData,
            dept: this.deptChartData,
        };

        const allowedTypes: Record<string, string[]> = {
            monthly: ['bar', 'line'],
            dept: ['bar', 'line'],
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

    private getComboChartOptions(title: string, horizontal: boolean = false): any {
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
                    callbacks: {
                        label: (context: any) => {
                            const value = context.parsed.y ?? context.parsed.x ?? 0;
                            return `${context.dataset.label}: ${value.toLocaleString('vi-VN')} đ`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: { font: { size: 11 } },
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                    ticks: { font: { size: 11 } },
                },
            },
        };
    }

    private getChartOptions(title: string, horizontal: boolean = false): any {
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
                    ticks: {
                        font: { size: 11 },
                        maxTicksLimit: 10,
                        stepSize: 1,
                    },
                    min: 0,
                    max: 10,
                },
            },
        };
    }
}
