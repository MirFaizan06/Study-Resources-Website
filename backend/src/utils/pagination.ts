export type CursorPagination = {
  cursor?: string;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  nextCursor: string | null;
  total?: number;
};

export function buildPrismaArgs(pagination: CursorPagination): {
  take: number;
  skip?: number;
  cursor?: { id: string };
} {
  const { cursor, limit } = pagination;

  if (cursor) {
    return {
      take: limit + 1, // fetch one extra to determine if there's a next page
      skip: 1,         // skip the cursor item itself
      cursor: { id: cursor },
    };
  }

  return {
    take: limit + 1,
  };
}

export function buildPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
  total?: number
): PaginatedResult<T> {
  const hasNextPage = items.length > limit;
  const data = hasNextPage ? items.slice(0, limit) : items;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  return {
    data,
    nextCursor,
    total,
  };
}
