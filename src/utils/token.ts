import axios from "axios";
import { isExpired } from "react-jwt";
import type { ApiResponse, AuthTokens } from "@/types";

const ACCESS_KEY = "token";
const REFRESH_KEY = "refreshToken";

// Access token lives in sessionStorage (dies with the tab); refresh token in localStorage so a new
// tab can silently mint a fresh access token instead of forcing a login.
export const getAccessToken = () => sessionStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = ({ accessToken, refreshToken }: AuthTokens) => {
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  sessionStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

/** A token we can't decode counts as expired. */
export const tokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    return isExpired(token);
  } catch {
    return true;
  }
};

let inFlight: Promise<string> | null = null;

/**
 * Refreshes the access token. The backend rotates refresh tokens, so concurrent requests must share
 * one refresh call; otherwise the second caller spends an already-invalidated refresh token.
 */
export function checkToken(): Promise<string> {
  const current = getAccessToken();
  if (current && !tokenExpired(current)) return Promise.resolve(current);
  if (inFlight) return inFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken || tokenExpired(refreshToken)) {
    return Promise.reject(new Error("Your session has expired. Please log in again."));
  }

  inFlight = axios
    .post<ApiResponse<AuthTokens>>(
      `${import.meta.env.VITE_APP_BASE_URL}/v1/auth/refresh-token`,
      { refreshToken },
      { timeout: 60_000 },
    )
    .then(({ data }) => {
      setTokens(data.data);
      return data.data.accessToken;
    })
    .catch(() => {
      throw new Error("Your session has expired. Please log in again.");
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export const dispatchLogout = () => window.dispatchEvent(new Event("auth:logout"));
