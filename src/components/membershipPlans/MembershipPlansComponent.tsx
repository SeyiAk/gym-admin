import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Pencil, Plus, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { ActionModal } from "@/components/shared/modalForm/ActionModal";
import { PageActions } from "@/components/shared/PageActions";
import { ScopeNotice } from "@/components/shared/ScopeNotice";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeactivatePlan, useGetBranchPlans } from "@/hooks/membershipPlans/useMembershipPlans";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useScope } from "@/hooks/useScope";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/types";
import { formatCurrency, formatNumber } from "@/utils/helper";
import { canManagePlans } from "@/utils/roleAccess";
import { mostPopularId, perLabel, PLAN_ACCENTS } from "./constants";
import { PlanFormModal } from "./modal/PlanFormModal";
import { PlanCard } from "./PlanCard";

export default function MembershipPlansComponent() {
  usePageHeader("Membership Plans", "Configure your gym's pricing tiers");
  const { role, branchId: scopeBranchId, branches, branchesLoading, branchesError } = useScope();
  const canEdit = canManagePlans(role);

  // Plans are branch-specific. With "All branches" selected in the header, pick a branch here.
  const [localBranch, setLocalBranch] = useState<string | null>(null);
  useEffect(() => {
    if (!localBranch && branches[0]) setLocalBranch(branches[0].id);
  }, [branches, localBranch]);
  const branchId = scopeBranchId ?? localBranch;
  const branch = branches.find((b) => b.id === branchId);

  const plans = useGetBranchPlans(branchId);
  const deactivate = useDeactivatePlan();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MembershipPlan | null>(null);
  const [toDeactivate, setToDeactivate] = useState<MembershipPlan | null>(null);

  if (!branchId && !branchesLoading) return <ScopeNotice error={branchesError} />;

  const list = plans.data ?? [];
  const popular = mostPopularId(list);
  const openEdit = (p: MembershipPlan) => {
    setEditing(p);
    setFormOpen(true);
  };

  const columns: ColumnDef<MembershipPlan, unknown>[] = [
    {
      header: "Plan",
      accessorKey: "name",
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-sm font-semibold",
            PLAN_ACCENTS[row.index % PLAN_ACCENTS.length].badge,
          )}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      header: "Price",
      id: "price",
      cell: ({ row }) => (
        <span className="text-appPrimary">
          {formatCurrency(row.original.price)}{" "}
          <span className="text-subtle">
            {perLabel(row.original.duration, row.original.durationUnit)}
          </span>
        </span>
      ),
    },
    {
      header: "Grace Period",
      accessorKey: "gracePeriod",
      cell: ({ getValue }) => (
        <span className="text-muted">
          {getValue<number>() ? `${getValue<number>()} days` : "None"}
        </span>
      ),
    },
    {
      header: "Active Members",
      accessorKey: "activeMembers",
      cell: ({ getValue }) => <span className="text-white">{formatNumber(getValue())}</span>,
    },
    {
      header: "Revenue",
      accessorKey: "revenue",
      cell: ({ getValue }) => <span className="text-appPrimary">{formatCurrency(getValue())}</span>,
    },
    ...(canEdit
      ? [
          {
            header: "Actions",
            id: "actions",
            cell: ({ row }) => (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label={`Edit ${row.original.name}`}
                  onClick={() => openEdit(row.original)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger"
                  aria-label={`Deactivate ${row.original.name}`}
                  onClick={() => setToDeactivate(row.original)}
                >
                  <Ban />
                </Button>
              </div>
            ),
          } as ColumnDef<MembershipPlan, unknown>,
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      {canEdit && branchId && (
        <PageActions>
          <Button
            size="lg"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add Plan
          </Button>
        </PageActions>
      )}

      {!scopeBranchId && branches.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-base text-muted">Showing plans for</span>
          <Select
            value={branchId ?? undefined}
            onValueChange={setLocalBranch}
            options={branches.map((b) => ({ label: b.name, value: b.id }))}
            triggerClassName="h-11 w-64"
          />
        </div>
      )}

      {plans.isLoading || (!branchId && branchesLoading) ? (
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[25rem] rounded-2xl" />
          ))}
        </div>
      ) : plans.error ? (
        <div className="card">
          <ErrorState message={(plans.error as Error).message} onRetry={() => plans.refetch()} />
        </div>
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Tags}
            header="No membership plans yet"
            subHeader={
              canEdit
                ? `Create the first plan for ${branch?.name ?? "this branch"}.`
                : "No plans have been set up for this branch."
            }
            action={
              canEdit && (
                <Button
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus /> Add Plan
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 pt-3">
            {list.map((p, i) => (
              <PlanCard
                key={p.id}
                plan={p}
                index={i}
                popular={p.id === popular}
                canEdit={canEdit}
                onEdit={() => openEdit(p)}
              />
            ))}
          </div>
          <SectionCard
            title="Plan Summary"
            className="p-0 [&>div:first-child]:px-6 [&>div:first-child]:pt-6"
          >
            <DataTable
              columns={columns}
              data={list}
              emptyState={{ header: "No plans" }}
              className="rounded-none border-0 border-t"
            />
          </SectionCard>
        </>
      )}

      {branchId && (
        <PlanFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          branchId={branchId}
          branchName={branch?.name}
          plan={editing}
        />
      )}
      <ActionModal
        open={!!toDeactivate}
        onOpenChange={(o) => !o && setToDeactivate(null)}
        icon={<Ban className="size-5" />}
        title={`Deactivate ${toDeactivate?.name ?? "plan"}?`}
        description="New members won't be able to join this plan. Existing memberships stay active until they end."
        submitLabel="Deactivate"
        destructive
        loading={deactivate.isPending}
        onSubmit={() =>
          toDeactivate &&
          deactivate.mutate(toDeactivate.id, { onSuccess: () => setToDeactivate(null) })
        }
      />
    </div>
  );
}
