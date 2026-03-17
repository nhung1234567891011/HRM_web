import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportMonthlyIncomeComponent } from './report-monthly-income.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: ReportMonthlyIncomeComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class ReportMonthlyIncomeRoutingModule { }
