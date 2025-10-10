import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ProjectCreate, ProjectHome } from '../model/implementation/project-impl.model';
import { HttpHeaders } from '@angular/common/http';
import { ProjectBoard } from '../model/implementation/project-impl.model';
import { Analysis } from '../model/implementation/analysis-impl.model';
import { IProject } from '../model/interface/project.model';
import { Project } from '../model/implementation/project-impl.model';



@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private userUrl = this.baseUrl + (this.authService.isUserEmployee() ? '' : 'manager/');
  private apiUserUrl = this.userUrl + "project";
  private apiUrl = this.baseUrl + "project";
  headers = new HttpHeaders({
      'X-USER-ROLE': this.authService.user$.value.role,
      'X-USER-ID': this.authService.user$.value.id.toString()
  });
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private authService: AuthService,
  ) {}
   getAllHomeProjects(): Observable<ProjectHome[]> {
     return this.http.get<any[]>(this.apiUrl, { headers: this.headers }).pipe(map(projects => projects.map(p => new ProjectHome(p))));
  }
  getBoardProjectById(id: number): Observable<ProjectBoard> {
    const url = `${this.apiUrl}/board/${id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(map(p => new ProjectBoard(p)));
  }
  getProjectAnalysis( projectId: number): Observable<Analysis> {
      const url = `${this.apiUrl}/analysis/${projectId}`;
      return this.http.get<any>(url, { headers: this.headers }).pipe(map(analysis => new Analysis(analysis)));
  }
  getProjectById(id: number): Observable<IProject> {
    const url = `${this.apiUrl}/eager/${id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(map(p => new Project(p)));
  }
  createProject(project: ProjectCreate): Observable<any> {
    return this.http.post<any>(this.apiUserUrl, project, { headers: this.headers });
  }
  abandonProject(projectId: number): Observable<void> {
    const url = `${this.apiUrl}/abandon/${projectId}`;
    return this.http.patch<void>(url, {}, { headers: this.headers });
  }
}
