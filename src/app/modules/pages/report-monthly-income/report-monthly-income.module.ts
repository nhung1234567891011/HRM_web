import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ReportMonthlyIncomeComponent } from './report-monthly-income.component';
import { ReportMonthlyIncomeRoutingModule } from './report-monthly-income-routing.module';
import { ChartModule } from 'primeng/chart';

@NgModule({
    declarations: [ReportMonthlyIncomeComponent],
    imports: [
        CommonModule,
        SharedModule,
        ReportMonthlyIncomeRoutingModule,
        ChartModule,
    ],
})
export class ReportMonthlyIncomeModule { }
