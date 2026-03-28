import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TimesheetComponent } from './timesheet.component';
import { TimesheetRoutingModule } from './timesheet-routing.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeSelectModule } from 'primeng/treeselect';
import { MessagesModule } from 'primeng/messages';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedBreadcrumbModule } from 'src/app/layout/breadcrumb/shared-breadcrumb.module';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
  imports: [
    CommonModule,
    OverlayPanelModule,
    TimesheetRoutingModule,
    ChartModule,
    MultiSelectModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    TreeSelectModule,
    MessagesModule,
    DialogModule,
    AutoCompleteModule,
    ReactiveFormsModule,
    FormsModule,
    SharedBreadcrumbModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    PaginatorModule
  ],
  declarations: [TimesheetComponent],
})
export class TimesheetModule { }
