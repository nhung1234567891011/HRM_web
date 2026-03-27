import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/identity/auth.service';
import { PermissionConstant } from '../constants/permission-constant';

@Injectable({
    providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        console.log('PermissionGuard: canActivate called');

        const requiredPermissions = route.data[
            'requiredPermissions'
        ] as string[];
        const userPermissions =
            this.authService.getUserCurrent()?.permissions || [];
            console.log(userPermissions);

        const hasAllRequiredPermissions = (permissions: string[]): boolean => {
            if (
                userPermissions.includes(PermissionConstant.Admin) ||
                userPermissions.includes(PermissionConstant.Master)
            ) {
                return true;
            }
            return permissions.every((permission) =>
                userPermissions.includes(permission)
            );
        };

        if (!hasAllRequiredPermissions(requiredPermissions)) {
            // localStorage.setItem('redirectUrl', state.url);
            this.router.navigate(['/not-have-permission']);
            return false;
        }

        // localStorage.removeItem('redirectUrl');
        return true;
    }
}

// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '../services/identity/auth.service';
// // import { log } from 'console';

// @Injectable({
//     providedIn: 'root',
// })
// export class PermissionGuard implements CanActivate {
//     constructor(private authService: AuthService, private router: Router) { }

//     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//         const requiredPermissions = route.data['requiredPermissions'] as string[];
//         const userPermissions =
//             this.authService.getUserCurrent()?.permissions || [];

//         // Check if user has all required permissions
//         const hasPermissions = requiredPermissions.some(permission =>
//             userPermissions.includes(permission)
//         );

//         if (!hasPermissions) {
//             // Save the attempted URL to localStorage
//             localStorage.setItem('redirectUrl', state.url);

//             // Redirect to blank page
//             this.router.navigate(['/admin/pages/blank-page']);
//             return false;
//         }

//         // If permissions are granted, clear redirect URL
//         localStorage.removeItem('redirectUrl');
//         return true;
//     }

// }
