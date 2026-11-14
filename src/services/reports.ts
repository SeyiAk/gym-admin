import { createAxiosInstance } from "@/utils/axiosConfig";
import { toQuery } from "@/utils/helper/query";
import type { ApiResponse, ReportsParams } from "@/types";

const api = createAxiosInstance();

// Response schema undocumented; sections listed in the endpoint description.
export const getReportsAPICall = async (params: ReportsParams) =>
  (await api.get<ApiResponse<unknown>>(`/v1/dashboard/reports${toQuery(params)}`)).data;
