import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DetailKpiRoutingModule } from './detail-kpi-routing.module';
import { DetailKpiComponent } from './detail-kpi.component';

@NgModule({
  imports: [
    CommonModule,
    DetailKpiRoutingModule,
    SharedModule,
    ConfirmPopupModule,
    MultiSelectModule,
    OverlayPanelModule
  ],
  declarations: [DetailKpiComponent],
})
export class DetailKpiModule { }
