import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { errorMessage, useNotify } from "@/hooks/useNotify";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import {
  changePasswordAPICall,
  forgotPasswordAPICall,
  getMyOrganizationsAPICall,
  getProfileAPICall,
  loginAPICall,
  resetPasswordAPICall,
  selectOrganizationAPICall,
} from "@/services/auth";
import { updateAuthState } from "@/store/slices/authSlice";
import { setBranch } from "@/store/slices/scopeSlice";
import {
  NotificationType,
  type ChangePasswordPayload,
  type LoginPayload,
  type ResetPasswordPayload,
  type UserOrganization,
} from "@/types";
import { isDashboardRole } from "@/utils/roleAccess";
import { setTokens } from "@/utils/token";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginAPICall(payload),
    onSuccess: (res) => setTokens(res.data),
  });
}

export const useForgotPassword = () =>
  useMutation({ mutationFn: (email: string) => forgotPasswordAPICall(email) });

export const useResetPassword = () =>
  useMutation({ mutationFn: (payload: ResetPasswordPayload) => resetPasswordAPICall(payload) });

export function useChangePassword() {
  const notify = useNotify();
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePasswordAPICall(payload),
    onSuccess: (res) => notify(res.message || "Password changed successfully."),
    onError: (err) => notify(errorMessage(err), NotificationType.error),
  });
}

/** The org the dashboard should act on: the backend's active one if the user staffs it, else the first they staff. */
export const pickDashboardOrg = (orgs: UserOrganization[]) =>
  orgs.find((o) => o.isActive && isDashboardRole(o.role)) ??
  orgs.find((o) => isDashboardRole(o.role)) ??
  null;

/**
 * Loads the profile and role before the dashboard renders. Throws when the user staffs no gym
 * (e.g. a member signing in with the mobile app's credentials).
 */
export function useBootstrapSession() {
  const dispatch = useAppDispatch();
  return useCallback(async () => {
    const [me, orgs] = await Promise.all([getProfileAPICall(), getMyOrganizationsAPICall()]);
    const organizations = orgs.data ?? [];
    let active = pickDashboardOrg(organizations);
    if (!active) {
      throw new Error(
        "This account doesn't manage any gym. Use the HG FitAccess mobile app instead.",
      );
    }
    // /dashboard/* endpoints read the server-side active organization, so keep it in step.
    if (!active.isActive) {
      await selectOrganizationAPICall(active.id);
      active = { ...active, isActive: true };
    }
    dispatch(updateAuthState({ actualState: "user", newState: me.data }));
    dispatch(
      updateAuthState({
        actualState: "organizations",
        newState: organizations.map((o) => ({ ...o, isActive: o.id === active!.id })),
      }),
    );
    dispatch(updateAuthState({ actualState: "activeOrganization", newState: active }));
  }, [dispatch]);
}

export function useSwitchOrganization() {
  const qc = useQueryClient();
  const notify = useNotify();
  const bootstrap = useBootstrapSession();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async (orgId: string) => {
      await selectOrganizationAPICall(orgId);
      dispatch(setBranch(null));
      await bootstrap();
    },
    onSuccess: () => {
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "session" });
      notify("Switched gym.");
    },
    onError: (err) => notify(errorMessage(err), NotificationType.error),
  });
}
