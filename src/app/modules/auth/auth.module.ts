import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { UtilityModule } from 'src/app/core/modules/utility/utility.module';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@NgModule({
    declarations: [LoginComponent, RecoverPasswordComponent, SetPasswordComponent],
    imports: [
        CommonModule,
        AuthRoutingModule,
        UtilityModule,
        ToastModule,
        ButtonModule
    ]
})
export class AuthModule { }
