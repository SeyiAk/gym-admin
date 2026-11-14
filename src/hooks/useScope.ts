import { useEffect, useMemo } from "react";
import { useBranchOptions } from "@/hooks/branches/useBranches";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { setBranch } from "@/store/slices/scopeSlice";
import type { ScopeParams } from "@/types";
import { canViewOrganizationScope } from "@/utils/roleAccess";

/**
 * Resolves the { scope, branchId } pair every /dashboard endpoint needs.
 * - OWNER / GENERAL_MANAGER: "All branches" (organization scope) by default, or a chosen branch.
 * - MANAGER / RECEPTIONIST: always branch scope. The spec has no endpoint that returns a staff
 *   member's assigned branch, so we fall back to the first branch /dashboard/branches returns.
 */
export function useScope() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.activeOrganization?.role);
  const branchId = useAppSelector((s) => s.scope.branchId);
  const canOrg = canViewOrganizationScope(role);
  const branches = useBranchOptions(!!role);
  const options = useMemo(() => branches.data?.items ?? [], [branches.data]);

  // Drop a persisted branch that doesn't belong to this organization; force a branch for
  // branch-only roles.
  useEffect(() => {
    if (!branches.isSuccess) return;
    if (branchId && !options.some((b) => b.id === branchId)) {
      dispatch(setBranch(canOrg ? null : (options[0]?.id ?? null)));
    } else if (!branchId && !canOrg && options[0]) {
      dispatch(setBranch(options[0].id));
    }
  }, [branches.isSuccess, branchId, options, canOrg, dispatch]);

  const scopeParams: ScopeParams | null = useMemo(() => {
    if (branchId) return { scope: "branch", branchId };
    return canOrg ? { scope: "organization" } : null;
  }, [branchId, canOrg]);

  return {
    role,
    canOrg,
    branchId,
    branches: options,
    branchesLoading: branches.isLoading,
    branchesError: branches.error as Error | null,
    /** null while a branch-only role is still waiting for a branch. */
    scopeParams,
    selectedBranch: options.find((b) => b.id === branchId) ?? null,
    setBranch: (id: string | null) => dispatch(setBranch(id)),
  };
}
