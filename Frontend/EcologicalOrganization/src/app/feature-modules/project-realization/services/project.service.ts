import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { Log } from '../models/log.model';
import { Member } from '../models/member.model';
import { PageResponse, Project } from '../models/project.model';
import { Resource } from '../models/resource.model';
import { Status } from '../models/status.model';
import { TaskResourceView } from '../models/task-resource-view.model';
import { Task } from '../models/task.model';
import { UnitOfMeasure } from '../models/unit-of-measure.mode';

export type SortParam = string | string[];

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: SortParam;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly BASE_URL =
    'http://localhost:8006/project-realization/api/projects';

  constructor(private http: HttpClient) {}

  createProject(p: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(this.BASE_URL, p);
  }

  assignMemberToProject(m: Omit<Member, 'id'>): Observable<Member> {
    return this.http.post<Member>(
      'http://localhost:8006/project-realization/api/members',
      m
    );
  }

  getAllowedNextStatuses(
    projectId: number,
    taskId: number
  ): Observable<Status[]> {
    return this.http.get<Status[]>(
      `http://localhost:8006/project-realization/api/statuses/project/${projectId}/task/${taskId}/allowed-next`
    );
  }

  getStatusById(id: number): Observable<Status> {
    return this.http.get<Status>(
      `http://localhost:8006/project-realization/api/statuses/${id}`
    );
  }

  changeStatus(status: Status): Observable<Status> {
    return this.http.put<Status>(
      `http://localhost:8006/project-realization/api/statuses/${status.id}`,
      status
    );
  }

  updateTask(t: Task): Observable<Task> {
    return this.http.put<Task>(
      `http://localhost:8006/project-realization/api/tasks/${t.id}`,
      t
    );
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.BASE_URL}/${id}`);
  }

  getStatusesForProject(id: number): Observable<Status[]> {
    return this.http.get<Status[]>(
      `http://localhost:8006/project-realization/api/statuses/project/${id}`
    );
  }

  getAllMembers(size = 1000): Observable<Member[]> {
    return this.getMembersPage({ page: 0, size }).pipe(
      map((res) => res.content ?? [])
    );
  }
  getMembersPage(query: PageQuery = {}): Observable<PageResponse<Member>> {
    const params = this.buildParams(query);
    return this.http.get<PageResponse<Member>>(
      'http://localhost:8006/project-realization/api/members',
      { params }
    );
  }

  createComment(c: Omit<Comment, 'id' | 'createdAt'>): Observable<Comment> {
    return this.http.post<Comment>(
      'http://localhost:8006/project-realization/api/comments',
      c
    );
  }

  updateTaskResource(tr: {
    id: number;
    taskId: number;
    resourceId: number;
    quantity: number;
    provided: boolean;
  }) {
    return this.http.put<TaskResourceView>(
      `http://localhost:8006/project-realization/api/task-resources/${tr.id}`,
      tr
    );
  }

  createTaskResource(dto: {
    taskId: number;
    resourceId: number;
    quantity: number;
    provided: boolean;
  }) {
    return this.http.post<TaskResourceView>(
      'http://localhost:8006/project-realization/api/task-resources',
      dto
    );
  }

  createResource(dto: Omit<Resource, 'id'>) {
    return this.http.post<Resource>(
      'http://localhost:8006/project-realization/api/resources',
      dto
    );
  }

  deleteTaskResource(id: number) {
    return this.http.delete<void>(
      `http://localhost:8006/project-realization/api/task-resources/${id}`
    );
  }

  getProjectMembers(projectId: number) {
    return this.http.get<Member[]>(
      `http://localhost:8006/project-realization/api/members/project/${projectId}`
    );
  }

  getTasksForProject(id: number): Observable<Task[]> {
    return this.http.get<Task[]>(
      `http://localhost:8006/project-realization/api/tasks/project/${id}`
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(
      `http://localhost:8006/project-realization/api/tasks/${id}`
    );
  }

  createTask(t: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(
      `http://localhost:8006/project-realization/api/tasks`,
      t
    );
  }

  createStatus(s: Omit<Status, 'id'>): Observable<Status> {
    return this.http.post<Status>(
      'http://localhost:8006/project-realization/api/statuses',
      s
    );
  }

  createTransition(dto: {
    projectId: number;
    fromStatusId: number;
    toStatusId: number;
  }): Observable<any> {
    return this.http.post(
      'http://localhost:8006/project-realization/api/status-transitions',
      dto
    );
  }

  getCommentsForTask(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `http://localhost:8006/project-realization/api/comments/task/${id}`
    );
  }

  // project.service.ts
  getCommentCounts(taskIds: number[]) {
    return this.http.post<Record<number, number>>(
      `http://localhost:8006/project-realization/api/comments/count`,
      taskIds
    );
  }

  getResourcesForTask(id: number): Observable<TaskResourceView[]> {
    return this.http.get<TaskResourceView[]>(
      `http://localhost:8006/project-realization/api/task-resources/task/${id}`
    );
  }
  getResourcesPage(page = 0, size = 50): Observable<PageResponse<Resource>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Resource>>(
      `http://localhost:8006/project-realization/api/resources`,
      {
        params,
      }
    );
  }

  getAllResources(size = 1000): Observable<Resource[]> {
    return this.getResourcesPage(0, size).pipe(map((res) => res.content ?? []));
  }

  getUnitsPage(page = 0, size = 50): Observable<PageResponse<UnitOfMeasure>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<UnitOfMeasure>>(
      `http://localhost:8006/project-realization/api/units`,
      {
        params,
      }
    );
  }

  getAllUnitsOfMeasure(size = 1000): Observable<UnitOfMeasure[]> {
    return this.getUnitsPage(0, size).pipe(map((res) => res.content ?? []));
  }
  getLogsForProjectId(
    id: number,
    query: PageQuery = {}
  ): Observable<PageResponse<Log>> {
    const params = this.buildParams(query);
    return this.http.get<PageResponse<Log>>(
      `http://localhost:8006/project-realization/api/logs/project/${id}`,
      { params }
    );
  }

  listActive(query: PageQuery = {}): Observable<PageResponse<Project>> {
    const params = this.buildParams(query);
    return this.http.get<PageResponse<Project>>(`${this.BASE_URL}/active`, {
      params,
    });
  }

  listArchived(query: PageQuery = {}): Observable<PageResponse<Project>> {
    const params = this.buildParams(query);
    return this.http.get<PageResponse<Project>>(`${this.BASE_URL}/archived`, {
      params,
    });
  }

  getAnalyticsSnapshot(projectId: number) {
    // Controller: GET /project-realization/api/analytics/{projectId}/snapshot
    return this.http.get<{
      totalTasks: number;
      totalComments: number;
      membersCount: number;
      avgTasksPerMember: number;
      tasksOnTime: number;
      tasksLate: number;
      bottleneckStatus: string;
      bottleneckAvgSeconds: number;
      avgCommentsPerTask: number;
    }>(
      `http://localhost:8006/project-realization/api/analytics/${projectId}/snapshot`
    );
  }
  // project.service.ts
  getStatusDurations(projectId: number, to: Date = new Date()) {
    const toTs = to.toISOString(); // ISO.DATE_TIME, UTC (Instant-friendly)
    return this.http.get<
      Array<{
        statusId: number;
        statusName: string;
        avgSeconds: number;
        samples: number;
      }>
    >(
      `http://localhost:8006/project-realization/api/analytics/${projectId}/durations`,
      { params: { toTs } }
    );
  }

  private buildParams(q: PageQuery): HttpParams {
    let params = new HttpParams();
    if (q.page !== undefined) params = params.set('page', String(q.page));
    if (q.size !== undefined) params = params.set('size', String(q.size));

    if (q.sort) {
      const sorts = Array.isArray(q.sort) ? q.sort : [q.sort];
      sorts.forEach((s) => (params = params.append('sort', s)));
    }
    return params;
    // Spring Data očekuje: ?page=0&size=10&sort=createdAt,desc&sort=name,asc
  }
}
