import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PromptVersion } from '../models/prompt-version.model';
import { environment } from 'src/env/environment';

@Injectable({
  providedIn: 'root',
})
export class PromptVersionService {
  private readonly versionsUrl = `${environment.apiHost}writing-assistant/prompt-versions`;

  constructor(private http: HttpClient) {}

  listVersions(
    promptId: number,
    page = 1,
    perPage = 50
  ): Observable<PromptVersion[]> {
    return this.http
      .get<any>(this.versionsUrl, {
        params: { prompt_id: promptId, page, per_page: perPage },
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
    return this.http.delete<void>(`${this.versionsUrl}/${versionId}`);
  }

  updateBasicInfo(
    versionId: number,
    name: string,
    description: string
  ): Observable<PromptVersion> {
    return this.http
      .patch<any>(`${this.versionsUrl}/${versionId}/basic-info`, {
        name,
        description,
      })
      .pipe(
        map(
          (v): PromptVersion => ({
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
      );
  }

  updatePromptText(
    versionId: number,
    promptText: string
  ): Observable<PromptVersion> {
    return this.http
      .patch<any>(`${this.versionsUrl}/${versionId}/prompt-text`, {
        prompt_text: promptText,
      })
      .pipe(
        map(
          (v): PromptVersion => ({
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
      );
  }

  createVersion(payload: {
    promptId: number;
    name: string;
    description: string;
    promptText: string;
  }): Observable<PromptVersion> {
    const body = {
      prompt_id: payload.promptId,
      name: payload.name,
      description: payload.description,
      prompt_text: payload.promptText,
    };

    return this.http.post<any>(this.versionsUrl, body).pipe(
      map(
        (v): PromptVersion => ({
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
    );
  }

  activateVersion(versionId: number): Observable<PromptVersion> {
    return this.http
      .post<any>(`${this.versionsUrl}/activate/${versionId}`, {})
      .pipe(
        map(
          (v): PromptVersion => ({
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
      );
  }
}
