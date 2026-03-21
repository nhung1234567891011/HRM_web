import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PaginatorModule } from 'primeng/paginator';
import { TreeSelectModule } from 'primeng/treeselect';
import { CalendarModule } from 'primeng/calendar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipsModule } from 'primeng/chips';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { SharedBreadcrumbModule } from 'src/app/layout/breadcrumb/shared-breadcrumb.module';

@NgModule({
    declarations: [ 
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        TableModule,
        MenuModule,
        InputMaskModule,
        CalendarModule,
        ChipsModule,
        FileUploadModule,
        AutoCompleteModule,
        InputSwitchModule,
        MenubarModule,
        SplitButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        PaginatorModule,
        InputTextareaModule,
        DropdownModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        BreadcrumbModule,
        SharedBreadcrumbModule,
        TreeSelectModule,
        CheckboxModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        InputMaskModule,
        MenubarModule,
        MenuModule,
        ReactiveFormsModule,
        ChipsModule,
        ButtonModule,
        AutoCompleteModule,
        InputSwitchModule,
        TableModule,
        FileUploadModule,
        PaginatorModule,
        RippleModule,
        CalendarModule,
        ToastModule,
        ToolbarModule,
        SplitButtonModule,
        RatingModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        BreadcrumbModule,
        TreeSelectModule,
        CheckboxModule,
        SharedBreadcrumbModule
    ],
    providers: [
        MessageService, // Cung cấp MessageService
    ],
})
export class SharedModule {}
