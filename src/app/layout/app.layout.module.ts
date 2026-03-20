import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {
    HttpClientModule,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { RouterModule } from '@angular/router';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppConfigModule } from './config/config.module';
import { AppSidebarComponent } from './app.sidebar.component';
import { AppLayoutComponent } from './app.layout.component';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../shared/modules/shared.module';
import { LoadingComponent } from '../core/partials/loading/loading.component';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { ValidationMessageModule } from '../core/modules/validation-message/validation-message.module';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CreateDepartmentComponent } from '../modules/pages/department/create-department/create-department.component';
import { CreateProjectComponent } from '../modules/pages/project/create-project/create-project.component';
import { DropdownModule } from 'primeng/dropdown';
import { DelegacyDialogComponent } from '../modules/pages/dialog/delegacy-dialog/delegacy-dialog.component';
import { CreateWorkComponent } from '../modules/pages/work/create-work/create-work.component';
import { EstablishComponent } from '../modules/pages/department/establish/establish.component';
import { ListProjectByEmployeeComponent } from '../modules/pages/project/list-project-by-employee/list-project-by-employee.component';
import { OnlineUsersComponent } from './online-users/online-users.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SharedBreadcrumbComponent } from './breadcrumb/shared-breadcrumb.component';

@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
        LoadingComponent,
        OnlineUsersComponent,
        ChatBoxComponent,
        SharedBreadcrumbComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        ConfirmDialogModule,
        InputSwitchModule,
        RippleModule,
        RouterModule,
        SharedModule,
        ButtonModule,
        FormsModule,
        InputGroupModule,
        ValidationMessageModule,
        ToastModule,
        DropdownModule,
        CreateDepartmentComponent,
        CreateProjectComponent,
        CreateProjectComponent,
        DelegacyDialogComponent,
        CreateWorkComponent,
        EstablishComponent,
        ListProjectByEmployeeComponent,
        BreadcrumbModule,
    ],
    exports: [AppLayoutComponent],
    providers: [MessageService, provideHttpClient(withInterceptorsFromDi())],
})
export class AppLayoutModule {}
