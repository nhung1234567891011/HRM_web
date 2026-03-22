import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { RegulationsCommonComponent } from './regulations-common/regulations-common.component';
import { AllComponent } from './all/all.component';
import { HolidayComponent } from './holiday/holiday.component';
import { TypeOfVacationComponent } from './type-of-vacation/type-of-vacation.component';
import { regulationsRouting } from './regulation-routing.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';
@NgModule({
    declarations: [RegulationsCommonComponent, AllComponent, HolidayComponent, TypeOfVacationComponent ],
    imports: [
        regulationsRouting,
        CommonModule,
        UtilityModule,
        ToolbarModule,
        ButtonModule,
        DropdownModule,
        CheckboxModule,
        TableModule,
        DialogModule,
        CalendarModule,
        InputTextareaModule,
        InputTextModule,
        SharedModule,
        BreadcrumbModule,
        RadioButtonModule,
        OverlayPanelModule
    ],
})
export class TimekeepingRegulationsModule {}
