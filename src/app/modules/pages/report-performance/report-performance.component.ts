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
    treeData: TreeNode[] = [];
    items: any[] = [];

    constructor(
        private reportService: ReportService,
        private organizationService: OrganizationService
    ) { }

    ngOnInit(): void {
        this.items = [
            { label: 'Báo cáo thống kê', routerLink: '/statistical-report' },
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

        this.reportService.getPerformance(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;

                // Department KPI with HighPerformers vs LowPerformers
                const deptLabels = data.departmentPerformances?.map((d: any) => d.organizationName) || [];
                this.deptKpiChartData = {
                    labels: deptLabels,
                    datasets: [
                        {
                            label: 'KPI trung bình',
                            data: data.departmentPerformances?.map((d: any) => d.averageKpi) || [],
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                        },
                        {
                            label: 'Xuất sắc (≥80%)',
                            data: data.departmentPerformances?.map((d: any) => d.highPerformers) || [],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Cần cải thiện (<50%)',
                            data: data.departmentPerformances?.map((d: any) => d.lowPerformers) || [],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                        },
                    ],
                };
                this.deptKpiChartOptions = this.getChartOptions('KPI trung bình theo phòng ban');

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
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)',
                            ],
                            borderWidth: 2,
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
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
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

        switch (chart) {
            case 'deptKpi':
                this.deptKpiChartType = actualType;
                this.deptKpiChartOptions = this.getChartOptions('KPI trung bình theo phòng ban', isHorizontal);
                break;
            case 'histogram':
                this.histogramChartType = actualType;
                this.histogramChartOptions = this.getChartOptions('Phân phối KPI nhân viên', isHorizontal);
                break;
            case 'empKpi':
                this.empKpiChartType = actualType;
                this.empKpiChartOptions = this.getChartOptions('Top nhân viên theo KPI', isHorizontal);
                break;
            case 'efficiency':
                this.efficiencyChartType = actualType;
                this.efficiencyChartOptions = this.getChartOptions('Hiệu suất làm việc (%)', isHorizontal);
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
