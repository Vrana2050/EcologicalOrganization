import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTagDTO, TagDTO } from '../models/tag.model';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/tag';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAll(): Observable<TagDTO[]> {
    return this.http.get<TagDTO[]>(this.baseUrl, {
      headers: this.headers,
    });
  }

  create(newTag: CreateTagDTO): Observable<TagDTO> {
    return this.http.post<TagDTO>(this.baseUrl, newTag, {
      headers: this.headers,
    });
  }

  update(tag: TagDTO): Observable<TagDTO> {
    return this.http.put<TagDTO>(this.baseUrl, tag, {
      headers: this.headers,
    });
  }

  delete(tagId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tagId}`, {
      headers: this.headers,
    });
  }
}
