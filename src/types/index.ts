export interface FilterOption {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}


export interface PaginatedResult<T> {
    success: boolean;
    data?: T[];
    pagination?: Pagination;
}