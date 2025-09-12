import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Prompt, PromptPage } from '../models/prompt.model';
import { PromptVersion } from '../models/prompt-version.model';

@Injectable({ providedIn: 'root' })
export class PromptService {
  private readonly promptsUrl = 'http://localhost:8000/api/v1/prompts';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'x-user-id': '2',
      'x-user-role': 'ADMIN',
    });
  }

  list(page = 1, perPage = 20): Observable<PromptPage> {
    return this.http
      .get<any>(this.promptsUrl, {
        params: { page, per_page: perPage },
        headers: this.headers,
      })
      .pipe(
        map(
          (raw): PromptPage => ({
            items: (raw.items || []).map(
              (it: any): Prompt => ({
                id: it.id,
                title: it.title,
                documentTypeId: it.document_type_id,
                isActive: !!it.is_active,
                activeVersion: it.active_version
                  ? {
                      id: it.active_version.id,
                      promptId: it.active_version.prompt_id,
                      name: it.active_version.name ?? null,
                      description: it.active_version.description ?? null,
                      promptText: it.active_version.prompt_text ?? null,
                      isActive: !!it.active_version.is_active,
                      createdAt: it.active_version.created_at ?? null,
                      updatedAt: it.active_version.updated_at ?? null,
                    }
                  : null,
                updatedAt: it.updated_at ?? null,
              })
            ),
            meta: {
              page: raw.meta.page,
              perPage: raw.meta.per_page,
              totalCount: raw.meta.total_count,
            },
          })
        )
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.promptsUrl}/${id}`, {
      headers: this.headers,
    });
  }
}
