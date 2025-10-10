export interface Log {
  id: number;
  projectId: number;
  memberId: number; // FK to Members.id
  taskId: number; // FK to Tasks.id
  action:
    | 'COMMENT'
    | 'TASK_STATUS_CHANGE'
    | 'TASK_CREATION'
    | 'PROJECT_CREATION'
    | 'ADD_MEMBER_TO_PROJECT'
    | 'ASSIGN_TASK'
    | 'ADD_RESOURCE_TO_TASK'
    | 'RESOURCE_PROVISION'
    | 'TEMPLATE_CREATION'
    | 'TEMPLATE_USAGE';
  timestamp: string; // ISO date-time from BE (was "timestamp" in UI)
}
