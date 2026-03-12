export interface PagingResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  [key: string]: any;
}

