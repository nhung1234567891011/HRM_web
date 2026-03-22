import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private activeRequests = 0;
    private _loading = new BehaviorSubject<boolean>(false);
    public readonly loading$ = this._loading.asObservable();

    show() {
        this.activeRequests++;
        if (!this._loading.value) {
            this._loading.next(true);
        }
    }

    hide() {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        if (this.activeRequests === 0 && this._loading.value) {
            this._loading.next(false);
        }
    }
}
