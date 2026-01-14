import { TimelineData } from "@/types/productionTimeline";
import api from "@/utils/api";

const get = async (): Promise<TimelineData> => {
  const response = await api.get<TimelineData>("/ScheduleDetail/models");
  return response.data;
};

const ProductionTimelineService = { get };
export default ProductionTimelineService;
