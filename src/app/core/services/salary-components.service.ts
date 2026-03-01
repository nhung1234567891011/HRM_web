import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpLoadingService } from '../https/http-loading.service';

@Injectable({
    providedIn: 'root',
})
export class SalaryComponentsService {
    constructor(private http: HttpLoadingService) {}

    getAllSalaryComponent(request: any = null): Observable<any> {
        return this.http.get('salary-component/paging', request);
    }

    createSalaryComponent(request: any): Observable<any> {
        return this.http.post('salary-component/create', request);
    }
    getIDSalaryComponent( id: number, request: any = null): Observable<any> {
        return this.http.get(`salary-component/get-by-id?Id=${id}`, request);
    }
    updateSalaryComponent(id:number,request: any = null): Observable<any> {
        return this.http.put(`salary-component/update?id=${id}`, request);
    }
    getformulasuggestions(id: number): Observable<any> {
        return this.http.get(`salary-component/get-formula-suggestions?organizationId=${id}`,{});
    }

    deleteSalaryComponent(id: number): Observable<any> {
        return this.http.delete(`salary-component/delete?Id=${id}`);
    }
}
