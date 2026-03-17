import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { StatisticalReportComponent } from './statistical-report.component';
import { StatisticalReportRoutingModule } from './statistical-report-routing.module';
import { ChartModule } from 'primeng/chart';

@NgModule({
    declarations: [StatisticalReportComponent],
    imports: [
        CommonModule,
        SharedModule,
        StatisticalReportRoutingModule,
        ChartModule,
    ],
})
export class StatisticalReportModule { }
