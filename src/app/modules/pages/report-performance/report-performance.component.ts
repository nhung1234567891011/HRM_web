import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/core/services/report.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { TreeNode } from 'primeng/api';

@Component({
    selector: 'app-report-performance',
    templateUrl: './report-performance.component.html',
    styleUrls: ['./report-performance.component.scss'],
})
export class ReportPerformanceComponent implements OnInit {
    chartTypeOptions = [
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ radar', value: 'radar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
    ];

    // Department KPI chart
    deptKpiChartType: string = 'bar';
    deptKpiChartData: any;
    deptKpiChartOptions: any;

    // Employee KPI chart
    empKpiChartType: string = 'bar';
    empKpiChartData: any;
    empKpiChartOptions: any;

    // KPI Distribution histogram
    histogramChartType: string = 'bar';
    histogramChartData: any;
    histogramChartOptions: any;

    // Work efficiency chart
    efficiencyChartType: string = 'bar';
    efficiencyChartData: any;
    efficiencyChartOptions: any;

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
    selectedOrganizationId: number | null = null;
    chartVisible: Record<'deptKpi' | 'histogram' | 'empKpi' | 'efficiency', boolean> = {
        deptKpi: true,
        histogram: true,
        empKpi: true,
        efficiency: true,
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
            { label: 'Báo cáo hiệu suất' },
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
        this.loadReport();
    }

    loadReport(): void {
        const request: any = { year: this.selectedYear };
        if (this.selectedMonth) request.month = this.selectedMonth;
        if (this.selectedOrganizationId) request.organizationId = this.selectedOrganizationId;

        this.reportService.getPerformance(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;

                // Position KPI with HighPerformers vs LowPerformers
                const positionLabels = data.positionPerformances?.map((d: any) => d.positionName) || [];
                this.deptKpiChartData = {
                    labels: positionLabels,
                    datasets: [
                        {
                            label: 'KPI trung bình',
                            data: data.positionPerformances?.map((d: any) => d.averageKpi) || [],
                            backgroundColor: 'rgba(99, 102, 241, 0.75)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Xuất sắc (≥80%)',
                            data: data.positionPerformances?.map((d: any) => d.highPerformers) || [],
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 0,
                        },
                        {
                            label: 'Cần cải thiện (<50%)',
                            data: data.positionPerformances?.map((d: any) => d.lowPerformers) || [],
                            backgroundColor: 'rgba(239, 68, 68, 0.75)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 0,
                        },
                    ],
                };
                this.deptKpiChartOptions = this.getChartOptions('KPI trung bình theo vị trí');

                // KPI Distribution Histogram
                const histLabels = data.kpiDistributions?.map((d: any) => d.rangeLabel) || [];
                const histValues = data.kpiDistributions?.map((d: any) => d.count) || [];
                this.histogramChartData = {
                    labels: histLabels,
                    datasets: [
                        {
                            label: 'Số nhân viên',
                            data: histValues,
                            backgroundColor: [
                                'rgba(239, 68, 68, 0.75)',
                                'rgba(251, 146, 60, 0.75)',
                                'rgba(245, 158, 11, 0.75)',
                                'rgba(59, 130, 246, 0.75)',
                                'rgba(16, 185, 129, 0.75)',
                            ],
                            borderColor: [
                                'rgba(239, 68, 68, 1)',
                                'rgba(251, 146, 60, 1)',
                                'rgba(245, 158, 11, 1)',
                                'rgba(59, 130, 246, 1)',
                                'rgba(16, 185, 129, 1)',
                            ],
                            borderWidth: 0,
                        },
                    ],
                };
                this.histogramChartOptions = this.getChartOptions('Phân phối KPI nhân viên');

                // Employee KPI (top 20)
                const topEmployees = (data.employeePerformances || []).slice(0, 20);
                const empLabels = topEmployees.map((e: any) => e.fullName);
                this.empKpiChartData = {
                    labels: empLabels,
                    datasets: [
                        {
                            label: 'KPI',
                            data: topEmployees.map((e: any) => e.kpiScore),
                            backgroundColor: this.generateColors(empLabels.length),
                        },
                    ],
                };
                this.empKpiChartOptions = this.getChartOptions('Top nhân viên theo KPI');

                // Work efficiency (top 20)
                this.efficiencyChartData = {
                    labels: empLabels,
                    datasets: [
                        {
                            label: 'Hiệu suất (%)',
                            data: topEmployees.map((e: any) => e.workEfficiency),
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 0,
                        },
                    ],
                };
                this.efficiencyChartOptions = this.getChartOptions('Hiệu suất làm việc (%)');
            }
        });
    }

    onChartTypeChange(chart: string, event: any): void {
        const type = event.value;
        const isHorizontal = type === 'horizontalBar';
        const actualType = isHorizontal ? 'bar' : type;

        const supportedTypes: Record<string, string[]> = {
            deptKpi: ['bar', 'line', 'radar'],
            histogram: ['bar', 'line'],
            empKpi: ['bar', 'line', 'radar', 'pie', 'doughnut'],
            efficiency: ['bar', 'line', 'radar', 'pie', 'doughnut'],
        };

        if (!supportedTypes[chart]?.includes(actualType)) {
            return;
        }

        switch (chart) {
            case 'deptKpi':
                this.deptKpiChartType = actualType;
                this.deptKpiChartOptions = this.getChartOptions('KPI trung bình theo vị trí', isHorizontal, actualType);
                this.rebuildChart('deptKpi');
                break;
            case 'histogram':
                this.histogramChartType = actualType;
                this.histogramChartOptions = this.getChartOptions('Phân phối KPI nhân viên', isHorizontal, actualType);
                this.rebuildChart('histogram');
                break;
            case 'empKpi':
                this.empKpiChartType = actualType;
                this.empKpiChartOptions = this.getChartOptions('Top nhân viên theo KPI', isHorizontal, actualType);
                this.rebuildChart('empKpi');
                break;
            case 'efficiency':
                this.efficiencyChartType = actualType;
                this.efficiencyChartOptions = this.getChartOptions('Hiệu suất làm việc (%)', isHorizontal, actualType);
                this.rebuildChart('efficiency');
                break;
        }
    }

    private rebuildChart(chart: 'deptKpi' | 'histogram' | 'empKpi' | 'efficiency'): void {
        this.chartVisible[chart] = false;
        setTimeout(() => {
            this.chartVisible[chart] = true;
        });
    }

    canRenderChart(chart: 'deptKpi' | 'histogram' | 'empKpi' | 'efficiency'): boolean {
        const chartTypeMap: Record<string, string> = {
            deptKpi: this.deptKpiChartType,
            histogram: this.histogramChartType,
            empKpi: this.empKpiChartType,
            efficiency: this.efficiencyChartType,
        };

        const chartDataMap: Record<string, any> = {
            deptKpi: this.deptKpiChartData,
            histogram: this.histogramChartData,
            empKpi: this.empKpiChartData,
            efficiency: this.efficiencyChartData,
        };

        const allowedTypes: Record<string, string[]> = {
            deptKpi: ['bar', 'line', 'radar'],
            histogram: ['bar', 'line'],
            empKpi: ['bar', 'line', 'radar', 'pie', 'doughnut'],
            efficiency: ['bar', 'line', 'radar', 'pie', 'doughnut'],
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
                    ticks: { font: { size: 11 } },
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
