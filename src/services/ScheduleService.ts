import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import { Area } from "@/types/area";
import api from "@/utils/api";
import { id } from "zod/v4/locales";

interface IForm {
  name: string;
}
interface Customer  {
  id: number;
  name: string;
}

const get: FetchFunctionWithPagination<any> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<any>> => {
  const response = await api.get<PaginatedResponse<any>>("Schedule", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>("Schedule/All", {
    params: { keyword },
  });
  return response.data;
};

const getByProcessId = async (
  processId?: number,
): Promise<ApiResponse<any>> => {
  const response = await api.get<ApiResponse<any>>(`Schedule/ByProcess/${processId}`);
  return response.data;
};


const getByProcess = async (
): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`Schedule/ByProcess`);
  return response.data;
};


const create = async (data: {
  partId: number;
  year: number;
  month : number;
  qty: number;
}) => {
  console.log(data);
  try {
    const response = await api.post("Schedule", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`Schedule/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, data: IForm) => {
  try {
    const response = await api.patch(`Schedule/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`Schedule/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ScheduleService = { get, getWithoutPagination, create, getById, update, remove, getByProcessId, getByProcess };
export default ScheduleService;