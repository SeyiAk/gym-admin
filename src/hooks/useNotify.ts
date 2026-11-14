import { useCallback } from "react";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { updateSharedState } from "@/store/slices/sharedSlice";
import { NotificationType } from "@/types";

export function useNotify() {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, type: NotificationType = NotificationType.success) =>
      dispatch(updateSharedState({ actualState: "notification", newState: { message, type } })),
    [dispatch],
  );
}

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "An error occurred";
