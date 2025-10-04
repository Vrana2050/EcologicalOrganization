import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ProjectHome } from '../model/implementation/project-impl.model';
import { HttpHeaders } from '@angular/common/http';
import { ProjectBoard } from '../model/implementation/project-impl.model';
import { DocumentBoard } from '../model/implementation/document-impl.model';
import { Analysis } from '../model/implementation/analysis-impl.model';
import { DocumentDetails } from '../model/implementation/document-impl.model';
import { File } from '../model/implementation/file-impl.model';
import { IDocumentActiveFile } from '../model/interface/document.model';

import { DocumentActiveFile } from '../model/implementation/document-impl.model';
import { IFile } from '../model/interface/file.model';
import { IUserProject } from '../model/interface/user-project.model';
import { UserProject } from '../model/implementation/user-project-impl.model';
import { User } from '../model/implementation/user-impl.model';


@Injectable({
  providedIn: 'root',
})
export class UserProjectService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private apiUrl = this.baseUrl + "userProject";
  headers = new HttpHeaders({
      'X-USER-ROLE': 'manager',
      'X-USER-ID': '1001'
  });
  constructor(
    private http: HttpClient
  ) {}
    getAllAvailableUsersOnProject(projectID: number): Observable<IUserProject[]> {
      const url = `${this.apiUrl}/available/${projectID}`;
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(files => files.map(f => new UserProject(f))));
  }
  getAllUsers() {
    const url = 'http://localhost:8007/auth/users/DP';
    return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(files => files.map(u => new User(u))));
  }
}
