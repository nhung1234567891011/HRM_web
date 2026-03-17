import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
    selector: 'app-statistical-report',
    templateUrl: './statistical-report.component.html',
    styleUrls: ['./statistical-report.component.scss'],
})
export class StatisticalReportComponent implements OnInit {
    // Chart type options
    chartTypeOptions = [
        { label: 'Biểu đồ tròn', value: 'pie' },
        { label: 'Biểu đồ donut', value: 'doughnut' },
        { label: 'Biểu đồ cột', value: 'bar' },
        { label: 'Biểu đồ đường', value: 'line' },
        { label: 'Biểu đồ radar', value: 'radar' },
        { label: 'Biểu đồ cột ngang', value: 'horizontalBar' },
    ];

    // HR Distribution
    hrChartType: string = 'doughnut';
    hrChartData: any;
    hrChartOptions: any;

    // Monthly Income
    incomeChartType: string = 'bar';
    incomeChartData: any;
    incomeChartOptions: any;

    // Performance
    perfChartType: string = 'bar';
    perfChartData: any;
    perfChartOptions: any;

    // Attendance
    attendanceChartType: string = 'bar';
    attendanceChartData: any;
    attendanceChartOptions: any;

    currentYear: number = new Date().getFullYear();

    constructor(private reportService: ReportService) { }

    ngOnInit(): void {
        this.loadAllReports();
    }

    loadAllReports(): void {
        this.loadHrDistribution();
        this.loadMonthlyIncome();
        this.loadPerformance();
        this.loadAttendance();
    }

    loadHrDistribution(): void {
        this.reportService.getHrDistribution({}).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const labels = data.departmentDistributions?.map((d: any) => d.organizationName) || [];
                const values = data.departmentDistributions?.map((d: any) => d.employeeCount) || [];
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
                this.hrChartOptions = this.getChartOptions('Phân bổ nhân sự theo phòng ban');
            }
        });
    }

    loadMonthlyIncome(): void {
        this.reportService.getMonthlyIncome({ year: this.currentYear }).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const labels = data.monthlySummaries?.map((m: any) => `Tháng ${m.month}`) || [];
                this.incomeChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Lương cứng',
                            data: data.monthlySummaries?.map((m: any) => m.totalBaseSalary) || [],
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            stack: 'income',
                        },
                        {
                            label: 'Phụ cấp',
                            data: data.monthlySummaries?.map((m: any) => m.totalAllowance) || [],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            stack: 'income',
                        },
                        {
                            label: 'Thưởng',
                            data: data.monthlySummaries?.map((m: any) => m.totalBonus) || [],
                            backgroundColor: 'rgba(255, 206, 86, 0.6)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 1,
                            stack: 'income',
                        },
                        {
                            label: 'Tăng ca',
                            data: data.monthlySummaries?.map((m: any) => m.totalOvertimePay) || [],
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                            stack: 'income',
                        },
                        {
                            label: 'Thực nhận',
                            data: data.monthlySummaries?.map((m: any) => m.totalNetSalary) || [],
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 2,
                            fill: false,
                            type: 'line',
                            pointRadius: 4,
                        },
                    ],
                };
                this.incomeChartOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        title: { display: true, text: 'Thu nhập theo tháng', font: { size: 14 } },
                    },
                    scales: {
                        x: { stacked: true, beginAtZero: true },
                        y: { stacked: true, beginAtZero: true },
                    },
                };
            }
        });
    }

    loadPerformance(): void {
        this.reportService.getPerformance({ year: this.currentYear }).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const labels = data.departmentPerformances?.map((d: any) => d.organizationName) || [];
                this.perfChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'KPI trung bình',
                            data: data.departmentPerformances?.map((d: any) => d.averageKpi) || [],
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                        },
                    ],
                };
                this.perfChartOptions = this.getChartOptions('Hiệu suất theo phòng ban');
            }
        });
    }

    loadAttendance(): void {
        this.reportService.getAttendance({ year: this.currentYear }).subscribe((res: any) => {
            if (res.status && res.data) {
                const data = res.data;
                const labels = data.monthlyAttendances?.map((m: any) => `Tháng ${m.month}`) || [];
                this.attendanceChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ngày làm việc',
                            data: data.monthlyAttendances?.map((m: any) => m.totalWorkDays) || [],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Đi muộn',
                            data: data.monthlyAttendances?.map((m: any) => m.totalLateDays) || [],
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Nghỉ phép',
                            data: data.monthlyAttendances?.map((m: any) => m.totalLeaveDays) || [],
                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Giờ tăng ca',
                            data: data.monthlyAttendances?.map((m: any) => m.totalOvertimeHours) || [],
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                            fill: false,
                            type: 'line',
                            pointRadius: 4,
                            yAxisID: 'yOt',
                        },
                    ],
                };
                this.attendanceChartOptions = {
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
            }
        });
    }

    onChartTypeChange(report: string, event: any): void {
        const type = event.value;
        switch (report) {
            case 'hr':
                this.hrChartType = type === 'horizontalBar' ? 'bar' : type;
                this.hrChartOptions = this.getChartOptions('Phân bổ nhân sự theo phòng ban', type === 'horizontalBar');
                break;
            case 'income':
                this.incomeChartType = type === 'horizontalBar' ? 'bar' : type;
                this.incomeChartOptions = this.getChartOptions('Thu nhập theo tháng', type === 'horizontalBar');
                break;
            case 'performance':
                this.perfChartType = type === 'horizontalBar' ? 'bar' : type;
                this.perfChartOptions = this.getChartOptions('Hiệu suất theo phòng ban', type === 'horizontalBar');
                break;
            case 'attendance':
                this.attendanceChartType = type === 'horizontalBar' ? 'bar' : type;
                this.attendanceChartOptions = this.getChartOptions('Chuyên cần theo tháng', type === 'horizontalBar');
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
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(255, 99, 255, 0.7)',
            'rgba(99, 255, 132, 0.7)',
        ];
        const colors: string[] = [];
        for (let i = 0; i < count; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    }
}
