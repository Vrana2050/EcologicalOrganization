import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentDTO, UpdateDocumentDTO } from '../models/document.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private readonly apiUrl = 'http://127.0.0.1:8000/api/document';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  uploadDocument(parentDirectoryId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('parent_directory_id', parentDirectoryId.toString());
    formData.append('uploaded_file', file);

    return this.http.post<any>(`${this.apiUrl}/`, formData, {
      headers: this.headers,
      reportProgress: true,
      observe: 'events',
    });
  }

  uploadNewVersion(documentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document_id', documentId.toString());
    formData.append('uploaded_file', file);

    return this.http.post<any>(`${this.apiUrl}/new-version`, formData, {
      headers: this.headers,
      reportProgress: true,
      observe: 'events',
    });
  }

  getDocument(documentId: number): Observable<DocumentDTO> {
    return this.http.get<DocumentDTO>(`${this.apiUrl}/${documentId}`, {
      headers: this.headers,
    });
  }

  getFile(filePath: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/file/${encodeURIComponent(filePath)}`,
      {
        headers: this.headers,
        responseType: 'blob',
      }
    );
  }

  restoreVersion(documentId: number, version: number): Observable<any> {
    const formData = new FormData();
    formData.append('document_id', documentId.toString());
    formData.append('version', version.toString());

    return this.http.put<any>(`${this.apiUrl}/restore-version`, formData, {
      headers: this.headers,
      reportProgress: true,
      observe: 'events',
    });
  }

  updateDocument(updated_document: UpdateDocumentDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/`, updated_document, {
      headers: this.headers,
    });
  }

  addSummary(documentId: number, summary: string): Observable<any> {
    const formData = new FormData();
    formData.append('document_id', documentId.toString());
    formData.append('summary', summary);
    return this.http.put<any>(`${this.apiUrl}/add-summary`, formData, {
      headers: this.headers,
    });
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${documentId}`, {
      headers: this.headers,
    });
  }

  generateReport(year_month: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/generate-report/${year_month}`, {
      headers: this.headers,
    });
  }

  generateSummary(document_id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summarize/${document_id}`, {
      headers: this.headers,
    });
  }
}
