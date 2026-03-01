import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { RevenueCommissionRoutingModule } from './revenue-commission-routing.module';
import { RevenueCommissionComponent } from './revenue-commission.component';

@NgModule({
  declarations: [RevenueCommissionComponent],
  imports: [CommonModule, RevenueCommissionRoutingModule, SharedModule],
})
export class RevenueCommissionModule {}

