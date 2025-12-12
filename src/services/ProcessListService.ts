import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import { Area } from "@/types/area";
import api from "@/utils/api";
import { id } from "zod/v4/locales";

export interface IProcessListPayload {
  customerId: number;
  partId: number;
  order: number;
  processId: number;
}

interface Process  {
  id: number;
  name: string;
  type: string;
}

const get: FetchFunctionWithPagination<any> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<any>> => {
  const response = await api.get<PaginatedResponse<any>>("ProcessList", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<Process[]>> => {
  const response = await api.get<ApiResponse<Process[]>>("ProcessList/All", {
    params: { keyword },
  });

  return response.data;
};

const create = async (data: IProcessListPayload[]) => {
  try {
    const response = await api.post("ProcessList/multiple", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getByPartAndCustomer = async (part_id?: number, customer_id?: number) => {
  const params = {
    ...(part_id !== undefined && { part_id }),
    ...(customer_id !== undefined && { customer_id }),
  };

  
  
  const response  = await api.get("ProcessList", { params });
  return response.data;
};


const update = async (id: number, data: IProcessListPayload[]) => {
  try {
    const response = await api.patch(`Process/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (partId: number, customerId: number) => {
  const payload = {
    partId,
    customerId,
  };
  try {
    const response = await api.delete(`ProcessList`, { data: payload });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ProcessListService = { get, getWithoutPagination, create, getByPartAndCustomer, update, remove };
export default ProcessListService;