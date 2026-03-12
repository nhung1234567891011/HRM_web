import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResult } from '../../models/identity/api-result.interface';
import { PagingResult } from '../../models/common/paging-result.interface';
import {
  RoleDto,
  CreateRoleRequest,
  EditRoleRequest,
} from '../../models/identity/role.interface';

@Injectable({ providedIn: 'root' })
export class RoleService {
  // Dùng đường dẫn tương đối, HttpInterceptor sẽ tự prepend baseApiUrl
  private readonly apiUrl = '/role';

  constructor(private http: HttpClient) {}

  getPaging(params: any) {
    return this.http.get<ApiResult<PagingResult<RoleDto>>>(`${this.apiUrl}/paging`, {
      params,
    });
  }

  // alias để không phải sửa nhiều component cũ
  paging(params: any) {
    return this.getPaging(params);
  }

  getById(id: number) {
    return this.http.get<ApiResult<RoleDto>>(`${this.apiUrl}/get-by-id`, {
      params: { id },
    });
  }

  getRoleByEmployee(request: { employeeId: number }) {
    return this.http.get<ApiResult<RoleDto[]>>(`${this.apiUrl}/get-by-employee`, {
      params: { employeeId: request.employeeId },
    });
  }

  create(body: CreateRoleRequest) {
    return this.http.post<ApiResult<RoleDto>>(`${this.apiUrl}/create`, body);
  }

  edit(body: EditRoleRequest) {
    return this.http.put<ApiResult<RoleDto>>(`${this.apiUrl}/edit`, body);
  }

  delete(id: number) {
    return this.http.put<ApiResult<RoleDto>>(`${this.apiUrl}/delete`, { id });
  }

  deleteMultiple(ids: (number | null)[]) {
    return this.http.put<ApiResult<RoleDto[]>>(`${this.apiUrl}/delete-multiple`, {
      ids,
    });
  }
}
