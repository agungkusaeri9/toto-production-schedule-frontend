export interface ProcessComponent {
    id: number;
    partName: string;
    operationNumber: string;
    workCenterName: string;
    workCenterCategory: string;
    baseQuantity: number;
    setup: number;
    cycleTime: number;
    createdAt?: string;
  }
  
  export interface WorkCenter {
    id: number;
    name: string;
    createdAt: string;
    processComponents: ProcessComponent[];
  }
  
  export interface WorkCenterForm {
    name: string;
    processComponents: Omit<ProcessComponent, "id" | "createdAt">[];
  }
