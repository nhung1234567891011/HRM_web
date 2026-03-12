export interface RoleDto {
  id: number;
  name: string;
  description?: string | null;
  normalizedName?: string | null;
  permissions?: any[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
  permissionIds?: number[];
}

export interface EditRoleRequest {
  id: number;
  name: string;
  description?: string | null;
  permissionIds?: number[];
}


