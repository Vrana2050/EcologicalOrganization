import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ProjectHome } from '../model/implementation/project-impl.model';
import { HttpHeaders } from '@angular/common/http';
import { ProjectBoard } from '../model/implementation/project-impl.model';



@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private userUrl = this.baseUrl + (this.AuthService.isUserEmployee() ? '' : 'manager/');
  private apiUserUrl = this.userUrl + "project";
  private apiUrl = this.baseUrl + "project";
  headers = new HttpHeaders({
      'X-USER-ROLE': 'manager',
      'X-USER-ID': '1'
  });
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private AuthService: AuthService,
  ) {}
   getAllHomeProjects(): Observable<ProjectHome[]> {
     return this.http.get<any[]>(this.apiUrl, { headers: this.headers }).pipe(map(projects => projects.map(p => new ProjectHome(p))));
  }
  getBoardProjectById(id: number): Observable<ProjectBoard> {
    const url = `${this.apiUrl}/board/${id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(map(p => new ProjectBoard(p)));
  }
}
