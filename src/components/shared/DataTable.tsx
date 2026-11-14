import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "./EmptyState";
import { Pagination } from "./Pagination";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

type Props<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyState: { header: string; subHeader?: string };
  onRowClick?: (row: T) => void;
  /** Server pagination. Omit for unpaginated tables. */
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    total?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  className?: string;
  /** "card": standalone bordered table (Members). "plain": inside an existing card (Overview). */
  variant?: "card" | "plain";
};

export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  onRetry,
  emptyState,
  onRowClick,
  pagination,
  className,
  variant = "card",
}: Props<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  const colCount = columns.length;
  const plain = variant === "plain";

  return (
    <div className={cn(!plain && "card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-left", !plain && "min-w-[56rem]")}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className={cn(plain ? "bg-line" : "border-b border-line")}>
                {hg.headers.map((h, i) => (
                  <th
                    key={h.id}
                    className={cn(
                      "whitespace-nowrap font-semibold",
                      plain
                        ? "h-[3.25rem] px-3 text-base text-muted first:rounded-l-md last:rounded-r-md"
                        : "h-[3.5rem] px-5 text-sm text-subtle",
                      i === 0 && !plain && "pl-5",
                      h.column.columnDef.meta?.className,
                    )}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={r} className="border-b border-line last:border-0">
                  {Array.from({ length: colCount }).map((__, c) => (
                    <td key={c} className={cn(plain ? "px-3 py-3" : "px-5 py-5")}>
                      <Skeleton className="h-5 w-full max-w-[9rem]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={colCount}>
                  <ErrorState message={error.message} onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colCount}>
                  <EmptyState header={emptyState.header} subHeader={emptyState.subHeader} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    "border-b border-line transition-colors last:border-0",
                    plain && "last:border-b",
                    onRowClick && "cursor-pointer hover:bg-white/[0.02]",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "whitespace-nowrap text-base",
                        plain ? "px-3 py-3" : "h-[4.6875rem] px-5",
                        cell.column.columnDef.meta?.className,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && !error && data.length > 0 && (
        <Pagination
          {...pagination}
          className={cn(plain ? "pt-4" : "border-t border-line px-5 py-4")}
        />
      )}
    </div>
  );
}
