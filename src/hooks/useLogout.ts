import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { logoutAPICall } from "@/services/auth";
import { resetApp } from "@/store/resetAction";
import { clearTokens, getAccessToken, tokenExpired } from "@/utils/token";

export function clearSession() {
  clearTokens();
  Object.keys(localStorage)
    .filter((k) => k.startsWith("persist:"))
    .forEach((k) => localStorage.removeItem(k));
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(
    async ({ callApi = true }: { callApi?: boolean } = {}) => {
      // Best effort: invalidates the refresh token server-side. Never blocks the local logout.
      if (callApi && !tokenExpired(getAccessToken())) {
        await logoutAPICall().catch(() => undefined);
      }
      dispatch(resetApp());
      queryClient.clear();
      clearSession();
      navigate("/", { replace: true });
    },
    [dispatch, navigate, queryClient],
  );
}
