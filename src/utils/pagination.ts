import type { Pagination, PaginationQuery, QueryParam } from "../types/Pagination.js"

const getLimit = (limit: QueryParam = "10"): number => {
  const value = Number(limit)

  return value === -1 ? 999999 : value || 10
}

const getPage = (page: QueryParam = "1"): number => {
  const value = Number(page)

  return value > 0 ? value : 1
}

const getSkip = (page: number, limit: number): number => {
  return Math.abs((page - 1) * limit)
}

export const getPagination = (query: PaginationQuery): Pagination => {
  const page = getPage(query.page)
  const limit = getLimit(query.limit)
  const skip = getSkip(page, limit)

  return { page, limit, skip }
}

export const getTotalPages = (limit: number, total: number): number => {
  return Math.ceil(total / limit)
}
