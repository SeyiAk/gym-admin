import { createAxiosInstance } from "@/utils/axiosConfig";
import type { ApiResponse, CreatePlanPayload, MembershipPlan, UpdatePlanPayload } from "@/types";

const api = createAxiosInstance();

/** Plans are branch-specific; there is no organization-wide list. */
export const getBranchPlansAPICall = async (branchId: string) =>
  (await api.get<ApiResponse<MembershipPlan[]>>(`/v1/membership-plans/branch/${branchId}`)).data;

export const createPlanAPICall = async (payload: CreatePlanPayload) =>
  (await api.post<ApiResponse<MembershipPlan>>("/v1/membership-plans", payload)).data;

export const updatePlanAPICall = async ({ id, ...payload }: UpdatePlanPayload & { id: string }) =>
  (await api.patch<ApiResponse<MembershipPlan>>(`/v1/membership-plans/${id}`, payload)).data;

export const deactivatePlanAPICall = async (id: string) =>
  (await api.patch<ApiResponse<unknown>>(`/v1/membership-plans/${id}/deactivate`)).data;
