import { Component } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-department-reports',
    templateUrl: './department-reports.component.html',
    styleUrl: './department-reports.component.scss',
})
export class DepartmentReportsComponent {
    listChartJob: any;
    statusJob: any;
    data: any;
    data1: any;

    options: any;
    options1: any;
    sliderValue: number = 50;
    chart: any;
    liststatusJob: any;
    selectedStatus: number | null = null;
    statuschart1: boolean = false;
    statuschart2: boolean = false;
    statuschart3: boolean = false;

    constructor() {}
    ngOnInit() {
        this.listChartJob = [
            {
                titile: '7 ngày gần đây',
            },
            {
                titile: '30 ngày gần đây',
            },
            {
                titile: 'Tuần này',
            },
            {
                titile: 'Tuần trước',
            },
            {
                titile: 'Tháng này',
            },
            {
                titile: 'Tháng trước',
            },
            {
                titile: 'Quý này',
            },
            {
                titile: 'Quý trước',
            },
            {
                titile: 'Năm  nay',
            },
            {
                titile: 'Năm trước',
            },
            {
                titile: 'Tùy chọn',
            },
        ];
        this.statusJob = [
            {
                name: 'Trạng thái công việc',
            },
            {
                name: 'Tiến độ công việc',
            },
        ];
        this.liststatusJob = [
            {
                title: 'Tổng số lượng công việc', status: 1
            },
            {
                title: 'Số lượng công việc hoàn thành',status: 2
            },
            {
                title: 'Số lượng công việc chưa hoàn thành',status: 3
            },
        ];

        //  chart  trạng thái công việc

        new Chart('chart2', {
            type: 'doughnut',
            data: {
                labels: ['Hoàn thành trước hạn', 'Chưa hoàn thành', 'Quá hạn'],
                datasets: [
                    {
                        data: [13, 2, 2],
                        backgroundColor: ['blue', 'red', 'orange'],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                },
            },
        });
        this.createHorizontalBarChart();
        this.HorizontalBarChart1();
        this.HorizontalBarChart2();
        this.onStatusChange
    }

    //
    updateSliderPosition(event: any) {
        console.log('Slider value:', this.sliderValue);
    }
    // biểu đồ tổng số lượng công việc
    createHorizontalBarChart() {
        const ctx = document.getElementById(
            'horizontalBarChart'
        ) as HTMLCanvasElement;
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Phạm Anh Dũng',
                    'Trịnh Văn Khỏe',
                    'Đỗ Đắc Tùng',
                    'Phạm Xuân Mạnh',
                    'Đàm Trọng Thiện',
                    'Nguyễn Văn Thắng',
                    'Nguyễn Văn Khoa',
                ],
                datasets: [
                    {
                        label: 'Công việc đã hoàn thành',
                        data: [50, 75, 100, 125, 150, 100, 100],
                        backgroundColor: 'rgb(108, 213, 94)', // Màu cho dữ liệu đã hoàn thành
                    },
                    {
                        label: 'Công việc chưa hoàn thành',
                        data: [20, 40, 60, 80, 100, 50, 70],
                        backgroundColor: '#CCC', // Màu cho dữ liệu chưa hoàn thành
                    },
                ],
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        stacked: true, // Bật chế độ stacked cho trục X
                        beginAtZero: true,
                    },
                    y: {
                        stacked: true, // Bật chế độ stacked cho trục Y
                    },
                },
                plugins: {
                    tooltip: {
                        enabled: true, // Hiển thị tooltip khi hover
                    },
                },
            },
            // plugins: [
            //   {
            //     id: 'custom-datalabels',
            //     afterDatasetsDraw(chart) {
            //       const ctx = chart.ctx;
            //       chart.data.datasets.forEach((dataset, datasetIndex) => {
            //         const meta = chart.getDatasetMeta(datasetIndex);
            //         meta.data.forEach((bar, index) => {
            //           const value = dataset.data[index] as number;
            //           if (value !== undefined) {
            //             // Lấy các thuộc tính tọa độ của thanh
            //             const { x, y, width, height } = bar.getProps(['x', 'y', 'width', 'height'], true) as { x: number, y: number, width: number, height: number };

            //             // Tính toán vị trí căn giữa
            //             const positionX = x + width / 2;

            //             // Tính toán positionY để căn giữa theo chiều dọc
            //             const stackedHeight = chart.data.datasets.reduce((sum, d, i) => {
            //               const dataValue = d.data[index];
            //               // Kiểm tra xem dataValue có phải là số hay không
            //               if (typeof dataValue === 'number') {
            //                 return sum + dataValue;
            //               }
            //               return sum;
            //             }, 0);

            //             const positionY = y + height / 2 + stackedHeight;

            //             ctx.fillStyle = '#000'; // Màu chữ
            //             ctx.font = '12px Arial';
            //             ctx.textAlign = 'center';
            //             ctx.textBaseline = 'middle'; // Căn giữa theo chiều dọc

            //             // Hiển thị số tại trung tâm của thanh
            //             ctx.fillText(value.toString(), positionX, positionY);
            //           }
            //         });
            //       });
            //     },
            //   },
            // ],
        });
    }

    //  biểu đò số lượng công việc chưa hoàn thành
    HorizontalBarChart1() {
        const ctx = document.getElementById(
            'horizontalBarChart1'
        ) as HTMLCanvasElement;
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Phạm Anh Dũng',
                    'Trịnh Văn Khỏe',
                    'Đỗ Đắc Tùng',
                    'Phạm Xuân Mạnh',
                    'Đàm Trọng Thiện',
                    'Nguyễn Văn Thắng',
                    'Nguyễn Văn Khoa',
                ],
                datasets: [
                    {
                        label: 'Hoàn thành trước hạn',
                        data: [50, 75, 100, 125, 150, 100, 100],
                        backgroundColor: 'rgb(93, 197, 172)',
                    },
                    {
                        label: 'Hoàn thành đúng hạn',
                        data: [20, 40, 60, 80, 100, 50, 70],
                        backgroundColor: 'rgb(85, 189, 64)',
                    },
                    {
                        label: 'Hoàn thành trễ hạn',
                        data: [20, 40, 60, 80, 100, 50, 70],
                        backgroundColor: 'rgb(168, 207, 36)',
                    },
                ],
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        stacked: true, // Bật chế độ stacked cho trục X
                        beginAtZero: true,
                    },
                    y: {
                        stacked: true, // Bật chế độ stacked cho trục Y
                    },
                },
                plugins: {
                    tooltip: {
                        enabled: true, // Hiển thị tooltip khi hover
                    },
                },
            },
        });
    }
      //  biểu đò số lượng công việc chưa hoàn thành
      HorizontalBarChart2() {
        const ctx = document.getElementById(
            'horizontalBarChart2'
        ) as HTMLCanvasElement;
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Phạm Anh Dũng',
                    'Trịnh Văn Khỏe',
                    'Đỗ Đắc Tùng',
                    'Phạm Xuân Mạnh',
                    'Đàm Trọng Thiện',
                    'Nguyễn Văn Thắng',
                    'Nguyễn Văn Khoa',
                ],
                datasets: [
                    {
                        label: 'Chưa hoàn thành còn hạn',
                        data: [50, 75, 100, 125, 150, 100, 100],
                        backgroundColor: 'rgb(144, 163, 167)',
                    },
                    {
                        label: 'Chưa hoàn thành quá hạn',
                        data: [20, 40, 60, 80, 100, 50, 70],
                        backgroundColor: 'rgb(242, 99, 101)',
                    },
                    
                ],
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        stacked: true, // Bật chế độ stacked cho trục X
                        beginAtZero: true,
                    },
                    y: {
                        stacked: true, // Bật chế độ stacked cho trục Y
                    },
                },
                plugins: {
                    tooltip: {
                        enabled: true, // Hiển thị tooltip khi hover
                    },
                },
            },
        });
    }


    //  hàm hiển thị biểu đồ
    onStatusChange(event: any): void {
      const selectedStatus = event.value?.status || null;
    
      this.statuschart1 = false;
      this.statuschart2 = false;
      this.statuschart3 = false;
    
      if (selectedStatus === 1) {
        this.statuschart1 = true;
      } else if (selectedStatus === 2) {
        this.statuschart2 = true;
      } else if (selectedStatus === 3) {
        this.statuschart3 = true;
      }
    
    }
    
}
