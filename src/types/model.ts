export interface ProcessDetails {
  modelName: string;
  partName: string;
  operationNumber: string;
  bom: number;
}

export interface Model {
  id: number;
  name: string;
  created: string; 
  processDetails: ProcessDetails[];
}

export interface ModelForm {
  name: string;
  created: string;
  processDetails: ProcessDetails[];
}
