import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticalReportComponent } from './statistical-report.component';
import { StatisticalReportRoutingModule } from './statistical-report-routing.module';

@NgModule({
    imports: [
        CommonModule,
        StatisticalReportRoutingModule,
        StatisticalReportComponent,
    ],
})
export class StatisticalReportModule { }
