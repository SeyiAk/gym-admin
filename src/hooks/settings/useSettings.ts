import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { getOrganizationAPICall, updateOrganizationAPICall } from "@/services/organizations";
import { updateAuthState } from "@/store/slices/authSlice";
import { NotificationType, type UpdateOrganizationPayload } from "@/types";

export function useGetOrganization(id?: string) {
  return useQuery({
    queryKey: ["organization", "detail", id],
    queryFn: () => getOrganizationAPICall(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  const notify = useNotify();
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.auth.activeOrganization);
  return useMutation({
    mutationFn: (payload: UpdateOrganizationPayload & { id: string }) =>
      updateOrganizationAPICall(payload),
    onSuccess: (res) => {
      notify(res.message || "Gym details updated.");
      qc.invalidateQueries({ queryKey: ["organization"] });
      // Keep the sidebar's gym switcher in step without a refetch.
      if (active && res.data) {
        dispatch(
          updateAuthState({
            actualState: "activeOrganization",
            newState: {
              ...active,
              name: res.data.name,
              city: res.data.city,
              state: res.data.state,
              logo: res.data.logo,
            },
          }),
        );
      }
    },
    onError: (err) => notify(errorMessage(err), NotificationType.error),
  });
}
