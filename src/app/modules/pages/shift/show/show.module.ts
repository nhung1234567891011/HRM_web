import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowComponent } from './show.component';
import { ShowRoutingModule } from './show-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
@NgModule({
    imports: [
        CommonModule,
        ShowRoutingModule,
        SharedModule,
        ConfirmDialogModule,
        OverlayPanelModule,
    ],
    declarations: [ShowComponent],
})
export class ShowModule {}
