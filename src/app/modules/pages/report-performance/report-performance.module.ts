import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ReportPerformanceComponent } from './report-performance.component';
import { ReportPerformanceRoutingModule } from './report-performance-routing.module';
import { ChartModule } from 'primeng/chart';

@NgModule({
    declarations: [ReportPerformanceComponent],
    imports: [
        CommonModule,
        SharedModule,
        ReportPerformanceRoutingModule,
        ChartModule,
    ],
})
export class ReportPerformanceModule { }
