import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageModule } from '../validation-message/validation-message.module';
import { LoadingUiModule } from '../loading-ui/loading-ui.module';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SharedBreadcrumbModule } from 'src/app/layout/breadcrumb/shared-breadcrumb.module';



@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    SharedBreadcrumbModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ValidationMessageModule,
    LoadingUiModule,
    BreadcrumbModule,
    SharedBreadcrumbModule,
    ConfirmDialogComponent
  ],
})
export class UtilityModule { }
