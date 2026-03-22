import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { RevenueCommissionRoutingModule } from './revenue-commission-routing.module';
import { RevenueCommissionComponent } from './revenue-commission.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@NgModule({
  declarations: [RevenueCommissionComponent],
  imports: [
    CommonModule,
    RevenueCommissionRoutingModule,
    SharedModule,
    ConfirmPopupModule,
    ConfirmDialogModule,
    OverlayPanelModule,
  ],
})
export class RevenueCommissionModule {}

