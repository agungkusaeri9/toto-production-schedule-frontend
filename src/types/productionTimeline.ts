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

export interface WorkCenterTimelineItem {
    workCenterName: string;
    scheduleDetails: TimelineScheduleDetail[];
}

export interface WorkCenterTimelineData {
    data: WorkCenterTimelineItem[];
}

export interface ScheduleDetailItem {
    id: number;
    schedule: {
        id: number;
        modelName: string;
        quantity: number;
        createdAt: string;
    };
    modelName: string;
    partName: string;
    workCenterName: string;
    startTime: string;
    finishTime: string;
}

export interface ScheduleDetailResponse {
    status: string;
    data: ScheduleDetailItem[];
    paging: {
        page: number;
        pageSize: number;
        totalCount: number;
    };
}



