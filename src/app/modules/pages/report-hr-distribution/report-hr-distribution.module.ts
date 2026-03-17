import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ReportHrDistributionComponent } from './report-hr-distribution.component';
import { ReportHrDistributionRoutingModule } from './report-hr-distribution-routing.module';
import { ChartModule } from 'primeng/chart';

@NgModule({
    declarations: [ReportHrDistributionComponent],
    imports: [
        CommonModule,
        SharedModule,
        ReportHrDistributionRoutingModule,
        ChartModule,
    ],
})
export class ReportHrDistributionModule { }
