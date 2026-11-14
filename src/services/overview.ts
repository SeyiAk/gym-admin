import { createAxiosInstance } from "@/utils/axiosConfig";
import { toQuery } from "@/utils/helper/query";
import type { ApiResponse, Overview, OverviewParams } from "@/types";

const api = createAxiosInstance();

export const getOverviewAPICall = async (params: OverviewParams) =>
  (await api.get<ApiResponse<Overview>>(`/v1/dashboard/overview${toQuery(params)}`)).data;
