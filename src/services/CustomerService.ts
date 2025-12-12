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

const get: FetchFunctionWithPagination<Customer> = async (
  page = 1,
  limit = 10,
  keyword = ""
): Promise<PaginatedResponse<Customer>> => {
  const response = await api.get<PaginatedResponse<Customer>>("Customer", {
    params: { limit, keyword, page, paginate: true },
  });
  return response.data;
};

const getWithoutPagination = async (
  keyword?: string,
): Promise<ApiResponse<Customer[]>> => {
  const response = await api.get<ApiResponse<Customer[]>>("Customer", {
    params: { keyword },
  });
  return response.data;
};

const create = async (data: IForm) => {
  try {
    const response = await api.post("Customer", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getById = async (id: number) => {
  try {
    const response = await api.get(`Customer/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const update = async (id: number, data: IForm) => {
  try {
    const response = await api.patch(`Customer/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const remove = async (id: number) => {
  try {
    const response = await api.delete(`Customer/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const CustomerService = { get, getWithoutPagination, create, getById, update, remove };
export default CustomerService;