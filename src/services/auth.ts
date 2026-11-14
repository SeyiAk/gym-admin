import { createAxiosInstance } from "@/utils/axiosConfig";
import type {
  ApiResponse,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  User,
  UserOrganization,
} from "@/types";

const publicApi = createAxiosInstance(true);
const api = createAxiosInstance();

export const loginAPICall = async (payload: LoginPayload) =>
  (await publicApi.post<ApiResponse<LoginResponse>>("/v1/auth/login", payload)).data;

export const forgotPasswordAPICall = async (email: string) =>
  (await publicApi.post<ApiResponse<{ sent: boolean }>>("/v1/auth/forgot-password", { email }))
    .data;

export const resetPasswordAPICall = async (payload: ResetPasswordPayload) =>
  (await publicApi.post<ApiResponse<unknown>>("/v1/auth/reset-password", payload)).data;

export const getProfileAPICall = async () => (await api.get<ApiResponse<User>>("/v1/auth/me")).data;

export const logoutAPICall = async () =>
  (await api.post<ApiResponse<unknown>>("/v1/auth/logout")).data;

/*
 * The two calls below live under /mobile but are the only endpoints that return the signed-in user's
 * organizations with their role, and let them switch the active organization the /dashboard/*
 * endpoints read from. See docs/API_NOTES.md.
 */
export const getMyOrganizationsAPICall = async () =>
  (await api.get<ApiResponse<UserOrganization[]>>("/v1/mobile/organizations")).data;

export const selectOrganizationAPICall = async (organizationId: string) =>
  (await api.patch<ApiResponse<unknown>>(`/v1/mobile/organizations/${organizationId}/select`)).data;

/** Also /mobile-namespaced; it's the only change-password endpoint in the spec. */
export const changePasswordAPICall = async (payload: ChangePasswordPayload) =>
  (await api.patch<ApiResponse<unknown>>("/v1/mobile/profile/change-password", payload)).data;
