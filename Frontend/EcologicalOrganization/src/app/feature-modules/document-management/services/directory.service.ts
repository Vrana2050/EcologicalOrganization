import { PagedResults } from './../../../shared/model/paged-results.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SectionReadDTO, SectionsReadDTO } from '../models/section.model';
import {
  CreateDirectoryDTO,
  DirectoryOpenResponse,
  DirectoryReadDTO,
  UpdateDirectoryDTO,
} from '../models/directory.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DirectoryService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private readonly apiUrl = 'http://127.0.0.1:8000/api/directory';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  getUserSections(): Observable<SectionsReadDTO> {
    return this.http.get<SectionsReadDTO>(`${this.apiUrl}/sections`, {
      headers: this.headers,
    });
  }

  createDirectory(dto: CreateDirectoryDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, dto, {
      headers: this.headers,
    });
  }

  openDirectory(directory_id: number): Observable<DirectoryOpenResponse> {
    return this.http.get<DirectoryOpenResponse>(
      `${this.apiUrl}/${directory_id}`,
      { headers: this.headers }
    );
  }

  getDirectoryForUpdate(directoryId: number): Observable<DirectoryReadDTO> {
    return this.http.get<DirectoryReadDTO>(
      `${this.apiUrl}/info/${directoryId}`,
      { headers: this.headers }
    );
  }

  updateDirectory(dto: UpdateDirectoryDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, dto, { headers: this.headers });
  }

  deleteDirectory(directoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${directoryId}`, {
      headers: this.headers,
    });
  }

  getActivityReportSectionId(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/section/activity-report`, {
      headers: this.headers,
    });
  }
}
