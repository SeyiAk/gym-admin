import { createAxiosInstance } from "@/utils/axiosConfig";
import { toQuery } from "@/utils/helper/query";
import type { ApiResponse, CreateBranchPayload, ListParams } from "@/types";

const api = createAxiosInstance();

// Response schema undocumented.
export const getBranchesAPICall = async (params: ListParams) =>
  (await api.get<ApiResponse<unknown>>(`/v1/dashboard/branches${toQuery(params)}`)).data;

// The body is `#/components/schemas/CreateBranch`, which the spec never defines. We send the
// documented body of POST /organizations/{id}/branches, which describes the same resource.
export const createBranchAPICall = async (payload: CreateBranchPayload) =>
  (await api.post<ApiResponse<unknown>>("/v1/dashboard/branches", payload)).data;

// Response schema undocumented (image data URL, image URL or raw token); see BranchQrCode.
export const getBranchQrAPICall = async (branchId: string) =>
  (await api.get<ApiResponse<unknown>>(`/v1/dashboard/branches/${branchId}/qr`)).data;
