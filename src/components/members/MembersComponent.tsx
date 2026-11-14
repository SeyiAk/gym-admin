import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SearchInput } from "@/components/shared/SearchInput";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { useGetMembers } from "@/hooks/members/useMembers";
import { useDebounce } from "@/hooks/useDebounce";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import type { MemberStatus } from "@/types";
import { MEMBER_TABS } from "./constants";
import { MembersTable } from "./MembersTable";

export default function MembersComponent() {
  usePageHeader("Members", "Manage your gym members");
  const [params, setParams] = useSearchParams();
  const { scopeParams, branchesLoading, branchesError } = useScope();
  const [tab, setTab] = useState<MemberStatus | "ALL">("ALL");
  const [paging, setPaging] = useState({ page: 1, pageSize: 20 });
  const [search, setSearch] = useState(params.get("search") ?? "");
  const debounced = useDebounce(search.trim());

  // The header search navigates here with ?search=; adopt it, then drop it from the URL.
  useEffect(() => {
    const q = params.get("search");
    if (q !== null) {
      setSearch(q);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  // Search, tab, scope and page-size changes all go back to page 1.
  useEffect(() => setPaging((p) => ({ ...p, page: 1 })), [debounced, tab, scopeParams?.branchId]);

  const query = useGetMembers(
    scopeParams
      ? {
          ...scopeParams,
          status: tab === "ALL" ? undefined : tab,
          search: debounced,
          page: paging.page,
          limit: paging.pageSize,
        }
      : null,
  );

  if (!scopeParams && !branchesLoading) return <ScopeNotice error={branchesError} />;

  const total = query.data?.pagination.total;
  const activeTab = MEMBER_TABS.find((t) => t.value === tab)!;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SegmentedControl options={MEMBER_TABS} value={tab} onChange={setTab} />
        <div className="flex items-center gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Name, email, phone or member no."
            className="h-11 w-[22rem] [&_input]:text-base"
          />
          {typeof total === "number" && (
            <span className="whitespace-nowrap text-sm text-subtle">
              {total.toLocaleString()} member{total === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
      <MembersTable
        members={query.data?.members ?? []}
        loading={query.isLoading || (!scopeParams && branchesLoading)}
        error={query.error as Error | null}
        onRetry={() => query.refetch()}
        showBranch={scopeParams?.scope === "organization"}
        pagination={
          query.data?.pagination ?? {
            page: paging.page,
            limit: paging.pageSize,
            total: 0,
            totalPages: 1,
          }
        }
        onPageChange={(page) => setPaging((p) => ({ ...p, page }))}
        onPageSizeChange={(pageSize) => setPaging({ page: 1, pageSize })}
        emptyState={
          debounced
            ? {
                header: "No members match your search",
                subHeader: `Nothing found for "${debounced}".`,
              }
            : tab === "ALL"
              ? {
                  header: "No members yet",
                  subHeader: "Members appear here once they sign up through the HG FitAccess app.",
                }
              : {
                  header: `No ${activeTab.label.toLowerCase()} members`,
                  subHeader: "Try another tab.",
                }
        }
      />
    </div>
  );
}
