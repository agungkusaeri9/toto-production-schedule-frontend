import api from "@/utils/api";
import { ScheduleDetailItem, ScheduleDetailResponse } from "@/types/productionTimeline";

const get = async (
    page = 1,
    limit = 10,
    modelId = 0
): Promise<ScheduleDetailResponse> => {
    const response = await api.get<ScheduleDetailResponse>("/ScheduleDetail", {
        params: { 
            modelId, 
            page, 
            pageSize: limit 
        },
    });
    return response.data;
};

const ScheduleDetailService = { get };
export default ScheduleDetailService;

