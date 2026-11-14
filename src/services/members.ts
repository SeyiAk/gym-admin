import { createAxiosInstance } from "@/utils/axiosConfig";
import { toQuery } from "@/utils/helper/query";
import type { ApiResponse, MembersParams, MembersResponse, ScopeParams } from "@/types";

const api = createAxiosInstance();

export const getMembersAPICall = async (params: MembersParams) =>
  (await api.get<ApiResponse<MembersResponse>>(`/v1/dashboard/members${toQuery(params)}`)).data;

// Response schema is undocumented beyond its section list; read through utils/normalize.
export const getMemberDetailsAPICall = async (memberId: string, params: ScopeParams) =>
  (await api.get<ApiResponse<unknown>>(`/v1/dashboard/members/${memberId}${toQuery(params)}`)).data;
