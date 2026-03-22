import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowComponent } from './show.component';
import { ShowRoutingModule } from './show-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SharedBreadcrumbModule } from 'src/app/layout/breadcrumb/shared-breadcrumb.module';

@NgModule({
    imports: [
        CommonModule,
        ShowRoutingModule,
        SharedModule,
        ConfirmPopupModule,
        SharedBreadcrumbModule,
    ],
    declarations: [ShowComponent],
})
export class ShowModule {}
