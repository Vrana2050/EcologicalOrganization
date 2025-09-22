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



@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private apiUrl = this.baseUrl + "document";
  headers = new HttpHeaders({
      'X-USER-ROLE': 'manager',
      'X-USER-ID': '1'
  });
  constructor(
    private http: HttpClient
  ) {}
    getBoardDocumentsByProjectId(projectId: number): Observable<DocumentBoard[]> {
      const url = `${this.apiUrl}/board/project/${projectId}`;
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(documents => documents.map(d => new DocumentBoard(d))));
  }
}
