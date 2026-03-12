import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {
    HashLocationStrategy,
    LocationStrategy,
    PathLocationStrategy,
} from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { SharedModule } from './shared/modules/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptor } from './core/interceptors/token.interceptor';
import { NotfoundComponent } from './modules/partials/notfound/notfound.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NotHavePermissionComponent } from './modules/partials/not-have-permission/not-have-permission.component';
import { TimeAgoPipe } from './core/pipes/timeAgo.pipe';
// import { NotfoundComponent } from './demo/components/notfound/notfound.component';

@NgModule({
    declarations: [AppComponent, NotfoundComponent, NotHavePermissionComponent],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        SharedModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-top-right',
            preventDuplicates: true,
        }),
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpInterceptor,
            multi: true,
        },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
})
export class AppModule {}
