import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
// import { LoadingUiService } from '../loading-ui/loading-ui.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpLoadingService {
    // private baseUrl: string = enviroment.baseApiUrl;

    constructor(
        private http: HttpClient // private loadingUi: LoadingUiService
    ) {}

    getToken(): string {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.token || '';
    }

    //
    get(endpoint: string, data: any): Observable<any> {
        const headers = this.createHeaders();
        const queryParams = this.buildQueryParams(data);
        // this.loadingUi.show();
        return this.http
            .get(`/${endpoint}${queryParams ? `?${queryParams}` : ''}`, {
                headers,
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                }),
                finalize(() => {
                    // this.loadingUi.hide();
                })
            );
    }

    getBlob(endpoint: string, data: any): Observable<Blob> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.getToken()}`,
        });
        const queryParams = this.buildQueryParams(data);
        return this.http
            .get(`/${endpoint}${queryParams ? `?${queryParams}` : ''}`, {
                headers,
                responseType: 'blob',
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                }),
                finalize(() => {
                    // this.loadingUi.hide();
                })
            );
    }

    deleteSoft(endpoint: string, data: any): Observable<any> {
        const headers = this.createHeaders();
        const queryParams = this.buildQueryParams(data);
        // this.loadingUi.show();
        return this.http
            .put(`/${endpoint}${queryParams ? `?${queryParams}` : ''}`, null, {
                headers,
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                }),
                finalize(() => {
                    // this.loadingUi.hide();
                })
            );
    }

    getHaveData(endpoint: string, data: any): Observable<any> {
        const headers = this.createHeaders();
        const queryParams = this.buildQueryParams(data);
        // this.loadingUi.show();

        return this.http
            .get(`/${endpoint}${queryParams ? `?${queryParams}` : ''}`, {
                headers,
            })
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                }),
                finalize(() => {
                    // this.loadingUi.hide();
                })
            );
    }

    // buildQueryParams(data: any): string {
    //     if (data) {
    //         const params = new URLSearchParams();
    //         for (const key in data) {
    //             if (data.hasOwnProperty(key)) {
    //                 params.set(key, data[key]);
    //             }
    //         }
    //         return params.toString();
    //     }
    //     return '';
    // }

    buildQueryParams(data: any): string {
        if (data) {
            const params = new URLSearchParams();
            const normalizedData = this.normalizeRequestData(data);
            for (const key in normalizedData) {
                if (
                    normalizedData.hasOwnProperty(key) &&
                    normalizedData[key] != null
                ) {
                    params.set(key, normalizedData[key].toString());
                }
            }
            return params.toString();
        }
        return '';
    }
    post(endpoint: string, data: any): Observable<any> {
        // this.loadingUi.show();
        const headers = this.createHeaders();
        const normalizedData = this.normalizeRequestData(data);
        return this.http.post(`/${endpoint}`, normalizedData, { headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                this.handleErrorResponse(error);
                return throwError(error);
            }),
            finalize(() => {
                // this.loadingUi.hide();
            })
        );
    }

    public postFormData(endpoint: string, formData: FormData): Observable<any> {
        // this.loadingUi.show();
        const headers = this.createHeadersForFormData();
        const normalizedFormData = this.normalizeFormData(formData);
        // const headers = this.createHeaders();

        return this.http.post(`/${endpoint}`, normalizedFormData, { headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                this.handleErrorResponse(error);
                return throwError(error);
            }),
            finalize(() => {
                // this.loadingUi.hide();
            })
        );
    }

    put(endpoint: string, data: any): Observable<any> {
        const headers = this.createHeaders();
        const normalizedData = this.normalizeRequestData(data);
        return this.http.put(`/${endpoint}`, normalizedData, { headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                this.handleErrorResponse(error);
                return throwError(error);
            })
        );
    }

    public putFormData(endpoint: string, formData: FormData): Observable<any> {
        // this.loadingUi.show();
        const headers = this.createHeadersForFormData();
        const normalizedFormData = this.normalizeFormData(formData);
        // const headers = this.createHeaders();

        return this.http.put(`/${endpoint}`, normalizedFormData, { headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                this.handleErrorResponse(error);
                return throwError(error);
            }),
            finalize(() => {
                // this.loadingUi.hide();
            })
        );
    }

    delete(endpoint: string, options?: any): Observable<any> {
        const headers = this.createHeaders(); // Tạo headers nếu cần thiết
        return this.http.delete(`/${endpoint}`, { ...options, headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                this.handleErrorResponse(error); // Xử lý lỗi
                return throwError(error);
            })
        );
    }

    private createHeaders() {
        return new HttpHeaders({
            Authorization: `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json',
        });
    }
    private createHeadersForFormData() {
        return new HttpHeaders({
            Authorization: `Bearer ${this.getToken()}`,
        });
    }

    private normalizeRequestData(data: any): any {
        if (data == null) {
            return data;
        }

        if (typeof data === 'string') {
            return this.normalizeDateString(data);
        }

        if (data instanceof Date) {
            return this.formatDateForApi(data);
        }

        if (
            data instanceof File ||
            data instanceof Blob ||
            data instanceof FormData
        ) {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.normalizeRequestData(item));
        }

        if (typeof data === 'object') {
            const normalized: any = {};
            Object.keys(data).forEach((key) => {
                normalized[key] = this.normalizeRequestData(data[key]);
            });
            return normalized;
        }

        return data;
    }

    private normalizeFormData(formData: FormData): FormData {
        const normalizedFormData = new FormData();
        formData.forEach((value, key) => {
            if (typeof value === 'string') {
                normalizedFormData.append(key, this.normalizeDateString(value));
                return;
            }

            normalizedFormData.append(key, value);
        });

        return normalizedFormData;
    }

    private normalizeDateString(value: string): string {
        if (!this.isUtcIsoDateString(value)) {
            return value;
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return value;
        }

        return this.formatDateForApi(date);
    }

    private isUtcIsoDateString(value: string): boolean {
        return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value);
    }

    private formatDateForApi(date: Date): string {
        if (isNaN(date.getTime())) {
            return '';
        }

        const pad = (value: number) => value.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());

        // Keep local datetime without timezone suffix to avoid UTC date shifting.
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    handleErrorResponse(error: HttpErrorResponse) {
        console.error('HTTP Error:', error);
    }

    putBodyAndQueryParams(
        endpoint: string,
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        const headers = this.createHeaders();
        const queryParams = this.buildQueryParams(dataQueryParams);
        const normalizedDataBody = this.normalizeRequestData(dataBody);
        return this.http
            .put(
                `/${endpoint}${queryParams ? `?${queryParams}` : ''}`,
                normalizedDataBody,
                { headers }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                })
            );
    }

    // putFormDataAndQueryParams(
    //     endpoint: string,
    //     dataQueryParams: any,
    //     dataForm: FormData
    // ): Observable<any> {
    //     const headers = this.createHeaders();
    //     const queryParams = this.buildQueryParams(dataQueryParams);
    //     return this.http
    //         .put(
    //             `/${endpoint}${queryParams ? `?${queryParams}` : ''}`,
    //             dataForm,
    //             { headers }
    //         )
    //         .pipe(
    //             catchError((error: HttpErrorResponse) => {
    //                 this.handleErrorResponse(error);
    //                 return throwError(error);
    //             })
    //         );
    // }

    // public postFormData(endpoint: string, formData: FormData): Observable<any> {
    //     // this.loadingUi.show();
    //     const headers = this.createHeadersForFormData();
    //     // const headers = this.createHeaders();

    //     return this.http.post(`/${endpoint}`, formData, { headers }).pipe(
    //         catchError((error: HttpErrorResponse) => {
    //             this.handleErrorResponse(error);
    //             return throwError(error);
    //         }),
    //         finalize(() => {
    //             // this.loadingUi.hide();
    //         })
    //     );
    // }

    // get(endpoint: string, data: any): Observable<any> {
    //     const headers = this.createHeaders();
    //     const queryParams = this.buildQueryParams(data);
    //     // this.loadingUi.show();
    //     return this.http
    //         .get(`/${endpoint}${queryParams ? `?${queryParams}` : ''}`, {
    //             headers,
    //         })
    //         .pipe(
    //             catchError((error: HttpErrorResponse) => {
    //                 this.handleErrorResponse(error);
    //                 return throwError(error);
    //             }),
    //             finalize(() => {
    //                 // this.loadingUi.hide();
    //             })
    //         );
    // }

    putFormDataAndQueryParams(
        endpoint: string,
        dataQueryParams: any,
        dataForm: FormData
    ): Observable<any> {
        const headers = this.createHeaders();
        const queryParams = this.buildQueryParams(dataQueryParams);
        const normalizedFormData = this.normalizeFormData(dataForm);
        return this.http
            .put(
                `/${endpoint}${queryParams ? `?${queryParams}` : ''}`,
                normalizedFormData,
                { headers }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                })
            );
    }

    postBodyAndQueryParams(
        endpoint: string,
        dataQueryParams: any,
        dataBody: any
    ): Observable<any> {
        const headers = this.createHeaders();
        const queryParams = this.buildQueryParams(dataQueryParams);
        const normalizedDataBody = this.normalizeRequestData(dataBody);
        return this.http
            .post(
                `/${endpoint}${queryParams ? `?${queryParams}` : ''}`,
                normalizedDataBody,
                { headers }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.handleErrorResponse(error);
                    return throwError(error);
                })
            );
    }
}
