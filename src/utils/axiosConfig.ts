import axios, { AxiosError, type AxiosInstance } from "axios";
import { checkToken, dispatchLogout, getAccessToken, tokenExpired } from "./token";

type ErrorBody = {
  message?: string;
  error_description?: string;
  validationMessages?: string[] | string;
  // Undocumented, but common for 422s from this style of API.
  errors?: { message?: string; msg?: string }[] | Record<string, string | string[]>;
};

function messageFrom(body: ErrorBody | undefined, status?: number): string {
  if (!body) {
    return status
      ? `Request failed (${status})`
      : "Unable to reach the server. Check your connection.";
  }
  const { validationMessages, errors } = body;
  if (validationMessages) {
    return Array.isArray(validationMessages) ? validationMessages.join(", ") : validationMessages;
  }
  if (Array.isArray(errors) && errors.length) {
    const joined = errors
      .map((e) => e.message ?? e.msg)
      .filter(Boolean)
      .join(", ");
    if (joined) return joined;
  } else if (errors && typeof errors === "object") {
    const joined = Object.values(errors).flat().join(", ");
    if (joined) return joined;
  }
  return body.error_description || body.message || "An error occurred";
}

async function parseBlobError(data: unknown): Promise<ErrorBody | undefined> {
  if (!(data instanceof Blob)) return data as ErrorBody | undefined;
  try {
    return JSON.parse(await data.text()) as ErrorBody;
  } catch {
    return undefined;
  }
}

/**
 * One instance per service file. Callers only ever read `error.message`: every failure is normalised
 * into a plain Error here.
 */
export function createAxiosInstance(skipAuth = false): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    // Render's free tier cold-starts in 30-50s; a short timeout would look like an outage.
    timeout: 60_000,
    headers: { "Content-Type": "application/json" },
  });

  if (!skipAuth) {
    instance.interceptors.request.use(async (config) => {
      let token = getAccessToken();
      if (tokenExpired(token)) {
        try {
          token = await checkToken();
        } catch (err) {
          dispatchLogout();
          throw err;
        }
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (axios.isCancel(error)) throw error;
      const body = await parseBlobError(error.response?.data);
      const status = error.response?.status;
      // A 401 on an authenticated call means the server rejected our token even after refresh.
      if (status === 401 && !skipAuth) dispatchLogout();
      if (error.code === "ECONNABORTED") {
        throw new Error("The server took too long to respond. Please try again.");
      }
      throw new Error(messageFrom(body, status));
    },
  );

  return instance;
}
