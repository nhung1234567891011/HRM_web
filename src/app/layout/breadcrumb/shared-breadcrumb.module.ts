import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SharedBreadcrumbComponent } from './shared-breadcrumb.component';

@NgModule({
    declarations: [SharedBreadcrumbComponent],
    imports: [CommonModule, RouterModule, BreadcrumbModule],
    exports: [SharedBreadcrumbComponent],
})
export class SharedBreadcrumbModule {}
