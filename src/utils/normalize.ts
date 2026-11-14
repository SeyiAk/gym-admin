/**
 * Several endpoints document a 200 response without a schema (member details, memberships list,
 * branches, staff, reports, QR). These helpers read those payloads defensively so the UI degrades to
 * "N/A" instead of crashing if a key differs. Every place they're used is a backend question in
 * docs/API_NOTES.md; replace with real types once the contracts are published.
 */

export type Loose = Record<string, unknown>;

export const asObject = (v: unknown): Loose => (v && typeof v === "object" ? (v as Loose) : {});

/** First non-empty value among candidate dotted paths: pick(obj, "member.firstName", "firstName"). */
export function pick<T = unknown>(obj: unknown, ...paths: string[]): T | undefined {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const key of path.split(".")) {
      if (cur === null || cur === undefined) break;
      cur = (cur as Loose)[key];
    }
    if (cur !== undefined && cur !== null && cur !== "") return cur as T;
  }
  return undefined;
}

/** Accepts an array directly or under any of the given keys. */
export function extractItems<T = Loose>(data: unknown, ...keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  for (const key of [...keys, "items", "data", "results", "records"]) {
    const value = pick(data, key);
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

export type PageInfo = { page: number; limit: number; total: number; totalPages: number };

export function extractPagination(data: unknown, fallbackLimit: number, count: number): PageInfo {
  const p = asObject(pick(data, "pagination", "meta", "data.pagination"));
  const limit = Number(p.limit ?? fallbackLimit) || fallbackLimit;
  const total = Number(p.total ?? p.totalItems ?? count) || 0;
  return {
    page: Number(p.page ?? 1) || 1,
    limit,
    total,
    totalPages: Number(p.totalPages ?? Math.max(1, Math.ceil(total / limit))) || 1,
  };
}

export const personName = (obj: unknown, ...prefixes: string[]) => {
  for (const prefix of ["", ...prefixes]) {
    const p = prefix ? `${prefix}.` : "";
    const first = pick<string>(obj, `${p}firstName`);
    const last = pick<string>(obj, `${p}lastName`);
    if (first || last) return [first, last].filter(Boolean).join(" ");
    const name = pick<string>(obj, `${p}fullName`, `${p}name`, `${p}displayName`);
    if (name) return name;
  }
  return undefined;
};
