import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ReportAttendanceComponent } from './report-attendance.component';
import { ReportAttendanceRoutingModule } from './report-attendance-routing.module';
import { ChartModule } from 'primeng/chart';

@NgModule({
    declarations: [ReportAttendanceComponent],
    imports: [
        CommonModule,
        SharedModule,
        ReportAttendanceRoutingModule,
        ChartModule,
    ],
})
export class ReportAttendanceModule { }
