import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { updateSharedState } from "@/store/slices/sharedSlice";

/** Every module component sets the header title on mount. */
export function usePageHeader(title: string, subtitle?: string) {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  useEffect(() => {
    dispatch(
      updateSharedState({ actualState: "header", newState: { route: pathname, title, subtitle } }),
    );
  }, [dispatch, pathname, title, subtitle]);
}
