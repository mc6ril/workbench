const DEFAULT_COLUMN_KEY = "column";

export const normalizeColumnKey = (key: string): string => {
  return key.trim().toLowerCase();
};

const toColumnKeySlug = (value: string): string => {
  return value
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const generateColumnKey = (
  name: string,
  occupiedKeys: Set<string>,
  fallbackBase = DEFAULT_COLUMN_KEY
): string => {
  const normalizedBase =
    toColumnKeySlug(name) ||
    toColumnKeySlug(fallbackBase) ||
    DEFAULT_COLUMN_KEY;

  if (!occupiedKeys.has(normalizedBase)) {
    return normalizedBase;
  }

  let suffix = 2;
  while (occupiedKeys.has(`${normalizedBase}-${suffix}`)) {
    suffix += 1;
  }

  const nextKey = `${normalizedBase}-${suffix}`;
  return nextKey;
};
