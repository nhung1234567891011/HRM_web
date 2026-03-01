import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevenueCommissionComponent } from './revenue-commission.component';

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild([{ path: '', component: RevenueCommissionComponent }]), CommonModule],
})
export class RevenueCommissionRoutingModule {}

