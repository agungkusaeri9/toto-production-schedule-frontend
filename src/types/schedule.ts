export interface Schedule {
    id: number;
    modelName: string;
    quantity: number;
    createdAt: string;
}

export interface ScheduleForm {
    modelId: number;
    quantity: number;
}
