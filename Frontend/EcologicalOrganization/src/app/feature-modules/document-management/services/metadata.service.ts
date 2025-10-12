import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMetadataDTO, MetadataDTO } from '../models/metadata.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/metadata';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAll(): Observable<MetadataDTO[]> {
    return this.http.get<MetadataDTO[]>(this.baseUrl, {
      headers: this.headers,
    });
  }

  create(newMetadata: CreateMetadataDTO): Observable<MetadataDTO> {
    return this.http.post<MetadataDTO>(this.baseUrl, newMetadata, {
      headers: this.headers,
    });
  }

  update(metadata: MetadataDTO): Observable<MetadataDTO> {
    return this.http.put<MetadataDTO>(this.baseUrl, metadata, {
      headers: this.headers,
    });
  }

  delete(metadataId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${metadataId}`, {
      headers: this.headers,
    });
  }
}
