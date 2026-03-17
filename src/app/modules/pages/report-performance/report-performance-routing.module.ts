import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportPerformanceComponent } from './report-performance.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: ReportPerformanceComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class ReportPerformanceRoutingModule { }
