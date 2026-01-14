import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import api from "@/utils/api";
import { Model, ModelForm } from "@/types/model";

const get: FetchFunctionWithPagination<Model> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<Model>> => {
  const response = await api.get<PaginatedResponse<Model>>("model", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<Model[]>> => {
  const response = await api.get<ApiResponse<Model[]>>("model", {
    params: { keyword },
  });
  return response.data;
};

const create = async (data: ModelForm) => {
  try {
    const response = await api.post("model", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`model/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, data: ModelForm) => {
  try {
    const response = await api.patch(`model/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`model/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ModelService = { get, getWithoutPagination, create, getById, update, remove };
export default ModelService;
