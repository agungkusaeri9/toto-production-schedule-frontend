import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import { Area } from "@/types/area";
import api from "@/utils/api";
import { id } from "zod/v4/locales";

interface IForm {
  name: string;
}
interface Part  {
  id: number;
  name: string;
  customerId: number;
}

const get: FetchFunctionWithPagination<Part> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<Part>> => {
  const response = await api.get<PaginatedResponse<Part>>("Part", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<Part[]>> => {
  const response = await api.get<ApiResponse<Part[]>>("Part", {
    params: { keyword },
  });
  return response.data;
};

const create = async (data: IForm) => {
  try {
    const response = await api.post("Part", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`Part/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, data: IForm) => {
  try {
    const response = await api.patch(`Part/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`Part/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const PartService = { get, getWithoutPagination, create, getById, update, remove };
export default PartService;