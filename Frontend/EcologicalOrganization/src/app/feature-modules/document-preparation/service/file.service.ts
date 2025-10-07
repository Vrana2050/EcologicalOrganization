import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ProjectHome } from '../model/implementation/project-impl.model';
import { HttpHeaders } from '@angular/common/http';
import { ProjectBoard } from '../model/implementation/project-impl.model';
import { DocumentActiveFileUpdate, DocumentBoard } from '../model/implementation/document-impl.model';
import { Analysis } from '../model/implementation/analysis-impl.model';
import { DocumentDetails } from '../model/implementation/document-impl.model';
import { File } from '../model/implementation/file-impl.model';
import { IDocumentActiveFile } from '../model/interface/document.model';

import { DocumentActiveFile } from '../model/implementation/document-impl.model';
import { IFile } from '../model/interface/file.model';


@Injectable({
  providedIn: 'root',
})
export class FileService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private apiUrl = this.baseUrl + "file";
  headers = new HttpHeaders({
      'X-USER-ROLE': this.authService.user$.value.role,
      'X-USER-ID': this.authService.user$.value.id.toString()
  });
  constructor( private authService: AuthService,
    private http: HttpClient
  ) {}
    getActiveFilesByDocumentId(documentId: number): Observable<IDocumentActiveFile[]> {
      const url = `${this.apiUrl}/active/${documentId}`;
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(files => files.map(f => new DocumentActiveFile(f))));
  }
    getAllVersions(activeFileId: number): Observable<IFile[]> {
      const page = 0;
      const pageSize = 10;
      const url = `${this.apiUrl}/versions/${activeFileId}?page=${page}&pageSize=${pageSize}`;
      return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(files => files.map(f => new File(f))));
    }
    uploadFile(formData: FormData) {
    const url = `${this.apiUrl}/upload`;
    return this.http.post(url, formData, { headers: this.headers });
  }
  getActiveFileByDocumentAndFile(documentId: number, activeFileId: number): Observable<IDocumentActiveFile> {
    const url = `${this.apiUrl}/active/file/${documentId}/${activeFileId}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(map(f => new DocumentActiveFile(f)));
  }
  restoreFile(fileId:number, documentActiveFileId:number): Observable<any> {
    const url = `${this.apiUrl}/restore/${documentActiveFileId}`;
    return this.http.put(url,{id:fileId}, { headers: this.headers });
  }
}
