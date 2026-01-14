export interface TimelineScheduleDetail {
    id: number;
    scheduleId: number;
    partName: string;
    workCenterName: string;
    startTime: string;
    finishTime: string;
    quantity?: number;
}

export interface ProductionTimelineItem {
    modelName: string;
    scheduleDetails: TimelineScheduleDetail[];
}

export interface TimelineData {
    data: ProductionTimelineItem[];
}
