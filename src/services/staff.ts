import { createAxiosInstance } from "@/utils/axiosConfig";
import { toQuery } from "@/utils/helper/query";
import type { ApiResponse, InviteStaffPayload, ListParams } from "@/types";

const api = createAxiosInstance();

// Response schema undocumented. Only page and limit are supported (no search or filters).
export const getStaffAPICall = async (params: Pick<ListParams, "page" | "limit">) =>
  (await api.get<ApiResponse<unknown>>(`/v1/dashboard/staff${toQuery(params)}`)).data;

// The body is `#/components/schemas/CreateInvitation`, undefined in the spec. We send the documented
// body of POST /organizations/{id}/invitations: { email, role }.
export const inviteStaffAPICall = async (payload: InviteStaffPayload) =>
  (await api.post<ApiResponse<unknown>>("/v1/dashboard/staff", payload)).data;
