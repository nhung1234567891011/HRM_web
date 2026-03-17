import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StatisticalReportComponent } from './statistical-report.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: StatisticalReportComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class StatisticalReportRoutingModule { }
