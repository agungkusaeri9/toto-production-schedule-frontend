import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import api from "@/utils/api";
import { WorkCenter, WorkCenterForm } from "@/types/workCenter";

const get: FetchFunctionWithPagination<WorkCenter> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<WorkCenter>> => {
  const response = await api.get<PaginatedResponse<WorkCenter>>("workcenter", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<WorkCenter[]>> => {
  const response = await api.get<ApiResponse<WorkCenter[]>>("workcenter", {
    params: { keyword },
  });
  return response.data;
};

const create = async (data: WorkCenterForm) => {
  try {
    const response = await api.post("workcenter", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`workcenter/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, data: WorkCenterForm) => {
  try {
    const response = await api.patch(`workcenter/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`workcenter/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const WorkCenterService = { get, getWithoutPagination, create, getById, update, remove };
export default WorkCenterService;
