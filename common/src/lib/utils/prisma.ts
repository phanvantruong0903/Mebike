export function buildFilter(filters: object) {
  if (!filters) return {};

  return {
    AND: Object.entries(filters).map(([key, value]) => ({
      [key]: value,
    })),
  };
}

export function buildSearchFilter(
  keyword: string | undefined,
  fields: string[],
) {
  if (!keyword || !fields.length) return {};

  return {
    OR: fields.map((field) => ({
      [field]: { contains: keyword, mode: 'insensitive' },
    })),
  };
}
