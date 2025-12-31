export function buildSearchFilter(
  keyword: string | undefined,
  fields: string[],
) {
  if (!keyword) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: keyword,
        mode: 'insensitive',
      },
    })),
  };
}

export function buildFilter(filters: object) {
  if (!filters) return {};

  return {
    AND: Object.entries(filters).map(([key, value]) => ({
      [key]: value,
    })),
  };
}
