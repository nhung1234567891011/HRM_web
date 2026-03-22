import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationRoutingModule } from './location-routing.module';
import { LocationComponent } from './location.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';


@NgModule({
  declarations: [LocationComponent],
  imports: [
    CommonModule,
    LocationRoutingModule,
    SharedModule,
    OverlayPanelModule,
  ]
})
export class LocationModule { }
