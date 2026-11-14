import { createAxiosInstance } from "@/utils/axiosConfig";
import { toQuery } from "@/utils/helper/query";
import type { ApiResponse, MembershipsParams } from "@/types";

const api = createAxiosInstance();

// Response schema undocumented: "summary metrics + paginated membership records".
export const getMembershipsAPICall = async (params: MembershipsParams) =>
  (await api.get<ApiResponse<unknown>>(`/v1/dashboard/memberships${toQuery(params)}`)).data;
