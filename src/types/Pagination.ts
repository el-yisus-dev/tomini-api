export type QueryParam = string | undefined

export interface PaginationQuery {
    page?: string
    limit?: string
}

export interface Pagination {
  page: number
  limit: number
  skip: number
}
