import { BarChart3, MapPin, Plus, Users, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { PageActions } from "@/components/shared/PageActions";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBranches, type BranchRow } from "@/hooks/branches/useBranches";
import { useGetOverview } from "@/hooks/overview/useOverview";
import { useGetStaff } from "@/hooks/staff/useStaff";
import { useDebounce } from "@/hooks/useDebounce";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useAppSelector } from "@/hooks/useTypedSelector";
import { formatCompactCurrency, formatNumber } from "@/utils/helper";
import { canCreateBranch } from "@/utils/roleAccess";
import { BranchCard } from "./BranchCard";
import { BranchDetailsDrawer } from "./modal/BranchDetailsDrawer";
import { BranchFormModal } from "./modal/BranchFormModal";

const PAGE_SIZE = 10;

export default function BranchesComponent() {
  usePageHeader("Branches", "Manage your gym locations");
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const canCreate = canCreateBranch(role);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search.trim());
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<BranchRow | null>(null);

  useEffect(() => setPage(1), [debounced]);

  const branches = useGetBranches({ page, limit: PAGE_SIZE, search: debounced });
  // Organization-wide totals for the KPI row. This page is OWNER / GENERAL_MANAGER only, who can
  // always read organization scope.
  const overview = useGetOverview({ scope: "organization", growthPeriod: "7d" });
  const staff = useGetStaff({ page: 1, limit: 1 });

  const list = branches.data?.items ?? [];
  const pg = branches.data?.pagination;

  return (
    <div className="flex flex-col gap-8">
      {canCreate && (
        <PageActions>
          <Button size="lg" onClick={() => setCreating(true)}>
            <Plus /> Add Branch
          </Button>
        </PageActions>
      )}

      <div className="flex gap-4">
        <StatCard
          icon={MapPin}
          label="Total Branches"
          loading={branches.isLoading && !debounced}
          value={debounced ? "—" : formatNumber(pg?.total)}
        />
        <StatCard
          icon={Users}
          label="Total Members"
          loading={overview.isLoading}
          value={formatNumber(overview.data?.metrics.totalMembers.value)}
          change={overview.data?.metrics.totalMembers.percentageChange}
          changeLabel="vs last month"
        />
        <StatCard
          icon={UsersRound}
          label="Total Staff"
          loading={staff.isLoading}
          value={formatNumber(staff.data?.pagination.total)}
        />
        <StatCard
          icon={BarChart3}
          label="Combined Revenue"
          loading={overview.isLoading}
          value={formatCompactCurrency(overview.data?.metrics.monthlyRevenue.value)}
          change={overview.data?.metrics.monthlyRevenue.percentageChange}
          changeLabel="vs last month"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, code, city or state"
          className="h-11 w-[24rem] [&_input]:text-base"
        />
        {pg && (
          <span className="text-sm text-subtle">
            {pg.total.toLocaleString()} branch{pg.total === 1 ? "" : "es"}
          </span>
        )}
      </div>

      {branches.isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-60 rounded-2xl" />
          ))}
        </div>
      ) : branches.error ? (
        <div className="card">
          <ErrorState
            message={(branches.error as Error).message}
            onRetry={() => branches.refetch()}
          />
        </div>
      ) : list.length === 0 && debounced ? (
        <div className="card">
          <EmptyState
            header="No branches match your search"
            subHeader={`Nothing found for "${debounced}".`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {list.map((b) => (
            <BranchCard key={b.id} branch={b} onView={() => setViewing(b)} />
          ))}
          {canCreate && (
            <button
              onClick={() => setCreating(true)}
              className="card flex min-h-60 cursor-pointer flex-col items-center justify-center gap-4 border-dashed p-8 transition-colors hover:border-appPrimary/50"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-appPrimarySoft text-appPrimary">
                <Plus className="size-6" />
              </span>
              <span className="text-lg font-semibold text-muted">Add New Branch</span>
            </button>
          )}
        </div>
      )}

      {pg && pg.totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={pg.totalPages}
          total={pg.total}
          onPageChange={setPage}
        />
      )}

      <BranchFormModal open={creating} onOpenChange={setCreating} />
      <BranchDetailsDrawer branch={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
