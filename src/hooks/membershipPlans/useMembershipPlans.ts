import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import {
  createPlanAPICall,
  deactivatePlanAPICall,
  getBranchPlansAPICall,
  updatePlanAPICall,
} from "@/services/membershipPlans";
import { NotificationType, type CreatePlanPayload, type UpdatePlanPayload } from "@/types";

export function useGetBranchPlans(branchId: string | null) {
  return useQuery({
    queryKey: ["membershipPlans", "branch", branchId],
    queryFn: () => getBranchPlansAPICall(branchId!),
    enabled: !!branchId,
    select: (res) => (Array.isArray(res.data) ? res.data : []),
  });
}

function usePlanMutation<T>(fn: (vars: T) => Promise<{ message?: string }>, fallback: string) {
  const qc = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: fn,
    onSuccess: (res) => {
      notify(res.message || fallback);
      qc.invalidateQueries({ queryKey: ["membershipPlans"] });
    },
    onError: (err) => notify(errorMessage(err), NotificationType.error),
  });
}

export const useCreatePlan = () =>
  usePlanMutation((p: CreatePlanPayload) => createPlanAPICall(p), "Membership plan created.");
export const useUpdatePlan = () =>
  usePlanMutation(
    (p: UpdatePlanPayload & { id: string }) => updatePlanAPICall(p),
    "Membership plan updated.",
  );
export const useDeactivatePlan = () =>
  usePlanMutation((id: string) => deactivatePlanAPICall(id), "Membership plan deactivated.");
