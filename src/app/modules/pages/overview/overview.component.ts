import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  tasks = [
    { title: 'Xây dựng kế hoạch bán sản phẩm mới', time: '1/3/2025 13:00 PM', status: 'overdue', statusText: 'Quá hạn' },
    { title: 'Xây dựng kế hoạch bán sản phẩm mới', time: '1/3/2025 13:00 PM', status: 'overdue', statusText: 'Quá hạn' },
    { title: 'Xây dựng kế hoạch bán sản phẩm mới', time: '1/3/2025 13:00 PM', status: 'overdue', statusText: 'Quá hạn' },
    { title: 'Xây dựng kế hoạch bán sản phẩm mới', time: '1/3/2025 13:00 PM', status: 'overdue', statusText: 'Quá hạn' },
    { title: 'Xây dựng kế hoạch bán sản phẩm mới', time: '1/3/2025 13:00 PM', status: 'incomplete', statusText: 'Chưa hoàn thành' },
    { title: 'Xây dựng kế hoạch bán sản phẩm mới', time: '1/3/2025 13:00 PM', status: 'completed', statusText: 'Hoàn thành trước hạn' }
  ];

  ngOnInit() {
    new Chart('chart1', {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành trước hạn', 'Hoàn thành đúng hạn', 'Hoàn thành trễ hạn', 'Chờ duyệt', 'Chưa hoàn thành', 'Quá hạn'],
        datasets: [{
          data: [13, 0, 10, 2, 2, 2],
          backgroundColor: ['blue', 'green', 'yellow', 'gray', 'red', 'orange']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '80%', // Giảm độ dày (tăng giá trị để vòng nhỏ hơn)
        plugins: {
          legend: { display: false }
        }
      }
    });
    new Chart('chart3', {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành trước hạn', 'Hoàn thành đúng hạn', 'Hoàn thành trễ hạn', 'Chờ duyệt', 'Chưa hoàn thành', 'Quá hạn'],
        datasets: [{
          data: [13, 0, 10, 2, 2, 2],
          backgroundColor: ['blue', 'green', 'yellow', 'gray', 'red', 'orange']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '80%', // Giảm độ dày (tăng giá trị để vòng nhỏ hơn)
        plugins: {
          legend: { display: false }
        }
      }
    });
    
    new Chart('chart2', {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành trước hạn', 'Chưa hoàn thành', 'Quá hạn'],
        datasets: [{
          data: [13, 2, 2],
          backgroundColor: ['blue', 'red', 'orange']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '80%', // Giảm độ dày
        plugins: {
          legend: { display: false }
        }
      }
    });

    new Chart('chart4', {
      type: 'doughnut',
      data: {
        labels: ['Hoàn thành trước hạn', 'Chưa hoàn thành', 'Quá hạn'],
        datasets: [{
          data: [13, 2, 2],
          backgroundColor: ['blue', 'red', 'orange']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '80%', // Giảm độ dày
        plugins: {
          legend: { display: false }
        }
      }
    });
    
  }
}
