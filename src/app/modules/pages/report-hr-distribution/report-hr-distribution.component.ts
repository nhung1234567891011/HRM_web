import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/core/services/report.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { TreeNode } from 'primeng/api';

@Component({
    selector: 'app-report-hr-distribution',
    templateUrl: './report-hr-distribution.component.html',
    styleUrls: ['./report-hr-distribution.component.scss'],
})
export class ReportHrDistributionComponent implements OnInit {
    chartTypeOptions = [
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    // Department chart
    deptChartType: string = 'doughnut';
    deptChartData: any;
    deptChartOptions: any;

    // Position chart
    posChartType: string = 'bar';
    posChartData: any;
    posChartOptions: any;

    // Status chart
    statusChartType: string = 'pie';
    statusChartData: any;
    statusChartOptions: any;

    totalEmployees: number = 0;
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
            { label: 'Báo cáo phân bổ nhân sự' },
        ];
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

    loadReport(): void {
        const request: any = {};
        if (this.selectedOrganization) {
            request.organizationId = this.selectedOrganization;
        }

        this.reportService.getHrDistribution(request).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                this.totalEmployees = data.totalEmployees;

                // Department distribution chart
                const deptLabels = data.departmentDistributions?.map((d: any) => d.organizationName) || [];
                const deptValues = data.departmentDistributions?.map((d: any) => d.employeeCount) || [];
                this.deptChartData = {
                    labels: deptLabels,
                    datasets: [{
                        label: 'Số nhân viên',
                        data: deptValues,
                        backgroundColor: this.generateColors(deptLabels.length),
                    }],
                };
                this.deptChartOptions = this.getChartOptions('Phân bổ theo phòng ban');

                // Position distribution chart
                const posLabels = data.positionDistributions?.map((p: any) => p.positionName) || [];
                const posValues = data.positionDistributions?.map((p: any) => p.employeeCount) || [];
                this.posChartData = {
                    labels: posLabels,
                    datasets: [{
                        label: 'Số nhân viên',
                        data: posValues,
                        backgroundColor: this.generateColors(posLabels.length),
                    }],
                };
                this.posChartOptions = this.getChartOptions('Phân bổ theo vị trí');

                // Status distribution chart
                const statusLabels = data.statusDistributions?.map((s: any) => s.status) || [];
                const statusValues = data.statusDistributions?.map((s: any) => s.count) || [];
                this.statusChartData = {
                    labels: statusLabels,
                    datasets: [{
                        label: 'Số nhân viên',
                        data: statusValues,
                        backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'],
                    }],
                };
                this.statusChartOptions = this.getChartOptions('Phân bổ theo trạng thái');
            }
        });
    }

    onChartTypeChange(chart: string, event: any): void {
        const type = event.value;
        const isHorizontal = type === 'horizontalBar';
        const actualType = isHorizontal ? 'bar' : type;

        switch (chart) {
            case 'dept':
                this.deptChartType = actualType;
                this.deptChartOptions = this.getChartOptions('Phân bổ theo phòng ban', isHorizontal);
                break;
            case 'pos':
                this.posChartType = actualType;
                this.posChartOptions = this.getChartOptions('Phân bổ theo vị trí', isHorizontal);
                break;
            case 'status':
                this.statusChartType = actualType;
                this.statusChartOptions = this.getChartOptions('Phân bổ theo trạng thái', isHorizontal);
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
