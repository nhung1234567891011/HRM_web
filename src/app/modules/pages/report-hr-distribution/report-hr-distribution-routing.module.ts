import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportHrDistributionComponent } from './report-hr-distribution.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: ReportHrDistributionComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class ReportHrDistributionRoutingModule { }
