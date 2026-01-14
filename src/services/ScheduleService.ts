import { ApiResponse } from "@/types/api";
import { FetchFunctionWithPagination, PaginatedResponse } from "@/types/fetch";
import api from "@/utils/api";
import { Schedule, ScheduleForm } from "@/types/schedule";

const get: FetchFunctionWithPagination<Schedule> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<Schedule>> => {
  const response = await api.get<PaginatedResponse<Schedule>>("schedule", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<Schedule[]>> => {
  const response = await api.get<ApiResponse<Schedule[]>>("schedule", {
    params: { keyword },
  });
  return response.data;
};

const create = async (data: ScheduleForm) => {
  try {
    const response = await api.post("schedule", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`schedule/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`schedule/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ScheduleService = { get, getWithoutPagination, create, getById, remove };
export default ScheduleService;