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
    chartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
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

    onYearChange(): void {
        this.loadReport();
    }

    loadReport(): void {
        const request: any = { year: this.selectedYear };
        if (this.selectedOrganization) {
            request.organizationId = this.selectedOrganization;
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
                            label: 'Lương cứng',
                            data: data.monthlySummaries?.map((m: any) => m.totalBaseSalary) || [],
                            backgroundColor: 'rgba(59, 130, 246, 0.75)',
                            borderWidth: 0,
                            stack: 'income',
                            order: 2,
                        },
                        {
                            type: 'bar',
                            label: 'Phụ cấp',
                            data: data.monthlySummaries?.map((m: any) => m.totalAllowance) || [],
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderWidth: 0,
                            stack: 'income',
                            order: 2,
                        },
                        {
                            type: 'bar',
                            label: 'Thưởng',
                            data: data.monthlySummaries?.map((m: any) => m.totalBonus) || [],
                            backgroundColor: 'rgba(245, 158, 11, 0.75)',
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
                            label: 'Lương cứng',
                            data: data.positionIncomes?.map((d: any) => d.totalBaseSalary) || [],
                            backgroundColor: 'rgba(59, 130, 246, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Phụ cấp',
                            data: data.positionIncomes?.map((d: any) => d.totalAllowance) || [],
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Thưởng',
                            data: data.positionIncomes?.map((d: any) => d.totalBonus) || [],
                            backgroundColor: 'rgba(245, 158, 11, 0.75)',
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

        switch (chart) {
            case 'monthly':
                this.monthlyChartType = actualType;
                this.monthlyChartOptions = this.getComboChartOptions('Xu hướng thu nhập theo tháng', isHorizontal);
                break;
            case 'dept':
                this.deptChartType = actualType;
                this.deptChartOptions = this.getChartOptions('Chi phí nhân sự theo vị trí', isHorizontal);
                break;
        }
    }

    private getComboChartOptions(title: string, horizontal: boolean = false): any {
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
}
