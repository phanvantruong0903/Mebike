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
