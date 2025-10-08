import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ProjectHome } from '../model/implementation/project-impl.model';
import { HttpHeaders } from '@angular/common/http';
import { ProjectBoard } from '../model/implementation/project-impl.model';
import { DocumentBase, DocumentBoard, DocumentCreate, DocumentDependencyUpdate, DocumentMainFileUpdate, DocumentStatusUpdate, DocumentWorkflowCreate } from '../model/implementation/document-impl.model';
import { Analysis } from '../model/implementation/analysis-impl.model';
import { DocumentDetails } from '../model/implementation/document-impl.model';
import { IDocumentBase, IDocumentDetails } from '../model/interface/document.model';
import { RevisionUpdate } from '../model/implementation/revision-impl.model';






@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private apiUrl = this.baseUrl + "document";
  headers = new HttpHeaders({
      'X-USER-ROLE': this.authService.user$.value.role,
      'X-USER-ID': this.authService.user$.value.id.toString()
  });
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}
    getBoardDocumentsByProjectId(projectId: number): Observable<DocumentBoard[]> {
      const url = `${this.apiUrl}/board/project/${projectId}`;
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(documents => documents.map(d => new DocumentBoard(d))));
  }
  getDocumentAnalysis(documentId: number): Observable<Analysis> {
    const url = `${this.apiUrl}/analysis/${documentId}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(map(analysis => new Analysis(analysis)));
  }
  getDocumentById(dokumentId: number) {
    const url = `${this.apiUrl}/${dokumentId}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(map(document => new DocumentDetails(document)));
  }
   getBoardDocumentsByParentDocumentId(parentDocumentId: number): Observable<DocumentBoard[]> {
      const url = `${this.apiUrl}/board/document/${parentDocumentId}`;
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(documents => documents.map(d => new DocumentBoard(d))));
  }
  getPotentialDependencies(projectId: number | undefined, parentDocumentId: number | undefined): Observable<IDocumentBase[]> {
    let url = '';
    if(projectId){
      url = `${this.apiUrl}/project/${projectId}`;
     }
     if(parentDocumentId){
       url = `${this.apiUrl}/parentDocument/${parentDocumentId}`;
     }
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(documents => documents.map(d => new DocumentBase(d))));
  }
  createDocument(document: DocumentCreate): Observable<any> {
    const url = `${this.apiUrl}`;
    return this.http.post<any>(url, document, { headers: this.headers });
  }
  updateDocument( document: DocumentCreate): Observable<any> {
    const url = `${this.apiUrl}`;
    return this.http.put<any>(url, document, { headers: this.headers });
  }
  updateDocumentWorkflow(createWorkflow: DocumentWorkflowCreate) {
    const url = `${this.apiUrl}/workflow`;
    return this.http.patch<any>(url, createWorkflow, { headers: this.headers });
  }
  updateDocumentStatus(statusUpdate: DocumentStatusUpdate) {
    const url = `${this.apiUrl}/status`;
    return this.http.patch<any>(url, statusUpdate, { headers: this.headers });
  }
  updateMainFile(updateMainFile: DocumentMainFileUpdate) {
    const url = `${this.apiUrl}/mainFile`;
    return this.http.patch<any>(url, updateMainFile, { headers: this.headers });
  }
  updateDocumentDependencies(document: DocumentDependencyUpdate) {
    const url = `${this.apiUrl}/dependencies`;
    return this.http.patch<any>(url, document, { headers: this.headers });
  }
  getDocumentsWithSameParent(documentId: number): Observable<IDocumentBase[]> {
    const url = `${this.apiUrl}/${documentId}/parentDocuments`;
    return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(documents => documents.map(d => new DocumentBase(d))));
  }
}
