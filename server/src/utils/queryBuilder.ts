import { QueryFilters } from '../types';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const parsePagination = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const buildWhereClause = (
  filters: Record<string, any>,
  baseCondition: string = 'is_deleted = FALSE'
): { clause: string; params: any[] } => {
  const conditions: string[] = [baseCondition];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

export const buildOrderClause = (sortBy?: string, sortOrder?: string): string => {
  if (!sortBy) return 'ORDER BY id DESC';

  const order = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const allowedColumns = [
    'id',
    'name',
    'created_at',
    'updated_at',
    'card_number',
    'object_name',
    'construction_start_date',
    'construction_end_date',
  ];

  if (allowedColumns.includes(sortBy)) {
    return `ORDER BY ${sortBy} ${order}`;
  }

  return 'ORDER BY id DESC';
};

export const buildSearchClause = (
  searchFields: string[],
  searchTerm?: string
): { clause: string; params: any[] } => {
  if (!searchTerm || searchFields.length === 0) {
    return { clause: '', params: [] };
  }

  const conditions = searchFields.map(
    (field, index) => `LOWER(${field}::text) LIKE $${index + 1}`
  );

  const searchPattern = `%${searchTerm.toLowerCase()}%`;
  const params = searchFields.map(() => searchPattern);

  return {
    clause: `(${conditions.join(' OR ')})`,
    params,
  };
};

export const calculateMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
