import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportAttendanceComponent } from './report-attendance.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: ReportAttendanceComponent },
        ]),
    ],
    exports: [RouterModule],
})
export class ReportAttendanceRoutingModule { }
