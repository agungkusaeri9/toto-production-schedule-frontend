import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import { Area } from "@/types/area";
import api from "@/utils/api";
import { id } from "zod/v4/locales";

interface IForm {
  name: string;
  type: string;
}
interface Process  {
  id: number;
  name: string;
  type: string;
}

const get: FetchFunctionWithPagination<Process> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<Process>> => {
  const response = await api.get<PaginatedResponse<Process>>("Process", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<Process[]>> => {
  const response = await api.get<ApiResponse<Process[]>>("Process", {
    params: { keyword },
  });
  return response.data;
};

const create = async (data: IForm) => {
  try {
    const response = await api.post("Process", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`Process/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, data: IForm) => {
  try {
    const response = await api.patch(`Process/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`Process/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ProcessService = { get, getWithoutPagination, create, getById, update, remove };
export default ProcessService;