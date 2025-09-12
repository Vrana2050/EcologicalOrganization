import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PromptVersion } from '../models/prompt-version.model';

@Injectable({
  providedIn: 'root',
})
export class PromptVersionService {
  private readonly versionsUrl = 'http://localhost:8000/api/v1/prompt-versions';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'x-user-id': '2',
      'x-user-role': 'ADMIN',
    });
  }

  listVersions(
    promptId: number,
    page = 1,
    perPage = 50
  ): Observable<PromptVersion[]> {
    return this.http
      .get<any>(this.versionsUrl, {
        params: { prompt_id: promptId, page, per_page: perPage },
        headers: this.headers,
      })
      .pipe(
        map((raw) =>
          (raw.items || raw || []).map(
            (v: any): PromptVersion => ({
              id: v.id,
              promptId: v.prompt_id,
              name: v.name ?? null,
              description: v.description ?? null,
              promptText: v.prompt_text ?? null,
              isActive: !!v.is_active,
              createdAt: v.created_at ?? null,
              updatedAt: v.updated_at ?? null,
            })
          )
        )
      );
  }

  delete(versionId: number): Observable<void> {
    return this.http.delete<void>(`${this.versionsUrl}/${versionId}`, {
      headers: this.headers,
    });
  }
}
