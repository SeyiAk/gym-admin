import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const EMPTY = "N/A";

const isBlank = (v: unknown) => v === null || v === undefined || v === "";

/** "Mar 29, 2025" — the designs' table date format. Empty dates render as "-". */
export const formatDate = (value?: string | null, format = "MMM D, YYYY") =>
  isBlank(value) || !dayjs(value).isValid() ? "-" : dayjs(value).format(format);

export const formatDateTime = (value?: string | null) => formatDate(value, "MMM D, YYYY, h:mm A");
export const formatTime = (value?: string | null) => formatDate(value, "hh:mm A");

/** API dates are YYYY-MM-DD. */
export const toApiDate = (d: Date | string | dayjs.Dayjs) => dayjs(d).format("YYYY-MM-DD");

const toNumber = (value: unknown): number | null => {
  if (isBlank(value)) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

export const formatNumber = (value: unknown) => {
  const n = toNumber(value);
  return n === null ? EMPTY : n.toLocaleString("en-NG");
};

/** "₦45,000" — revenue values arrive as strings ("2500000.00") or numbers. */
export const formatCurrency = (value: unknown, decimals = 0) => {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

/** "₦8.46M" for KPI tiles. */
export const formatCompactCurrency = (value: unknown) => {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `₦${+(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `₦${+(n / 1_000).toFixed(1)}K`;
  return formatCurrency(n);
};

export const formatPercent = (value: unknown, decimals = 0) => {
  const n = toNumber(value);
  return n === null ? EMPTY : `${Math.abs(n).toFixed(decimals)}%`;
};

export const display = (value: unknown) => (isBlank(value) ? EMPTY : String(value));

export const fullName = (p?: { firstName?: string | null; lastName?: string | null } | null) =>
  [p?.firstName, p?.lastName].filter(Boolean).join(" ") || EMPTY;

export const initials = (name?: string | null) => {
  if (!name || name === EMPTY) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
  ).toUpperCase();
};

export const daysUntil = (value?: string | null) =>
  isBlank(value) ? null : Math.ceil(dayjs(value).diff(dayjs(), "day", true));

export const durationBetween = (start?: string | null, end?: string | null) => {
  if (isBlank(start) || isBlank(end)) return "—";
  const mins = Math.max(0, dayjs(end).diff(dayjs(start), "minute"));
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
};

export const truncateText = (text: string, max = 18) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

export const titleCase = (value?: string | null) =>
  isBlank(value)
    ? EMPTY
    : String(value)
        .toLowerCase()
        .split(/[_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** S/N column value for server-paginated tables. */
export const serialNumber = (page: number, pageSize: number, index: number) =>
  (page - 1) * pageSize + index + 1;
