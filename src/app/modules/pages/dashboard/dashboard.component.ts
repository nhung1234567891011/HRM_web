import { Component } from '@angular/core';
import { StatisticalReportComponent } from '../statistical-report/statistical-report.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatisticalReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {


}
