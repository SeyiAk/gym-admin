import { createAxiosInstance } from "@/utils/axiosConfig";
import type { ApiResponse, Organization, UpdateOrganizationPayload } from "@/types";

const api = createAxiosInstance();

export const getOrganizationAPICall = async (id: string) =>
  (await api.get<ApiResponse<Organization>>(`/v1/organizations/${id}`)).data;

export const updateOrganizationAPICall = async ({
  id,
  ...payload
}: UpdateOrganizationPayload & { id: string }) =>
  (await api.patch<ApiResponse<Organization>>(`/v1/organizations/${id}`, payload)).data;
