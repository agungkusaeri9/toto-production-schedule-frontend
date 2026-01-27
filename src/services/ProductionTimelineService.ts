import { TimelineData, WorkCenterTimelineData } from "@/types/productionTimeline";
import api from "@/utils/api";

const get = async (): Promise<TimelineData> => {
  const response = await api.get<TimelineData>("/ScheduleDetail/models");
  return response.data;
};

const getByWorkCenter = async (): Promise<WorkCenterTimelineData> => {
  const response = await api.get<WorkCenterTimelineData>("/ScheduleDetail/work_centers");
  return response.data;
};

const ProductionTimelineService = { get, getByWorkCenter };
export default ProductionTimelineService;

