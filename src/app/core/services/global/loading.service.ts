import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { asyncScheduler } from 'rxjs';
import { distinctUntilChanged, observeOn } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    private activeRequests = 0;
    private _loading = new BehaviorSubject<boolean>(false);
    // Tránh ExpressionChangedAfterItHasBeenCheckedError khi BehaviorSubject emit đồng bộ
    // trong quá trình Angular đang check view (AppComponent bind bằng async pipe).
    public readonly loading$ = this._loading.asObservable().pipe(
        observeOn(asyncScheduler),
        distinctUntilChanged()
    );

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
