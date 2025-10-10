export interface TaskResourceView {
  id: number;
  resourceId: number;
  resourceName: string;
  resourceDescription: string;
  quantity: number;
  provided: boolean;
  unitId: number;
  unitCode: string;
}
