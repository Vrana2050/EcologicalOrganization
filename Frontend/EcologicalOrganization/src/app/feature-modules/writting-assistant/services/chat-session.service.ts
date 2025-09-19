import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { ChatSession, ChatSessionPage } from '../models/chat-session.model';
import {
  SessionOverview,
  SessionSectionWithLatest,
} from '../models/session-section.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChatSessionService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/chat-session';

  constructor(private http: HttpClient, private router: Router) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-user-id': '2' });
  }

  private get adminHeaders(): HttpHeaders {
    return new HttpHeaders({ 'x-user-id': '2', 'x-user-role': 'ADMIN' });
  }

  list(page = 1, perPage = 20): Observable<ChatSessionPage> {
    return this.http
      .get<any>(this.baseUrl, {
        params: { page, per_page: perPage },
        headers: this.headers,
      })
      .pipe(
        map(
          (raw): ChatSessionPage => ({
            items: (raw.items || []).map(
              (it: any): ChatSession => ({
                id: it.id,
                templateId: it.template_id,
                documentTypeId: it.document_type_id ?? null,
                createdBy: it.created_by,
                title: it.title,
                updatedAt: it.updated_at,
                isTestSession: it.is_test_session === 1,
                promptVersionId: it.test_prompt_version_id ?? null,
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

  create(templateId: number, title?: string): Observable<ChatSession> {
    const payload: any = { template_id: templateId };
    if (title && title.trim()) payload.title = title.trim();

    return this.http
      .post<any>(this.baseUrl, payload, { headers: this.headers })
      .pipe(
        map(
          (raw): ChatSession => ({
            id: raw.id,
            templateId: raw.template_id,
            documentTypeId: raw.document_type_id ?? null,
            createdBy: raw.created_by,
            title: raw.title,
            updatedAt: raw.updated_at,
            isTestSession: raw.is_test_session === 1,
            promptVersionId: raw.test_prompt_version_id ?? null,
          })
        )
      );
  }

  delete(sessionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${sessionId}`, {
      headers: this.headers,
    });
  }

  updateTitle(sessionId: number, title: string): Observable<ChatSession> {
    return this.http
      .patch<any>(
        `${this.baseUrl}/${sessionId}/title`,
        { title },
        { headers: this.headers }
      )
      .pipe(
        map(
          (raw): ChatSession => ({
            id: raw.id,
            templateId: raw.template_id,
            documentTypeId: raw.document_type_id ?? null,
            createdBy: raw.created_by,
            title: raw.title,
            updatedAt: raw.updated_at,
            isTestSession: raw.is_test_session === 1,
            promptVersionId: raw.test_prompt_version_id ?? null,
          })
        )
      );
  }

  /** PATCH /chat-session/:id/document-type */
  patchDocumentType(
    sessionId: number,
    documentTypeId: number
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${sessionId}/document-type`,
      {
        document_type_id: documentTypeId,
        updated_at: new Date().toISOString(),
      },
      { headers: this.headers }
    );
  }

  getOverview(sessionId: number): Observable<SessionOverview> {
    return this.http
      .get<any>(`${this.baseUrl}/${sessionId}/overview`, {
        headers: this.headers,
      })
      .pipe(
        map(
          (raw): SessionOverview => ({
            documentTypeId: raw.document_type_id,
            title: raw.title,
            latestGlobalInstructionText:
              raw.latest_global_instruction_text ?? '',
            sections: (raw.sections || []).map(
              (x: any): SessionSectionWithLatest => ({
                id: x.id,
                sessionId: x.session_id,
                name: x.name ?? null,
                position: x.position ?? null,
                latestIteration: x.latest_iteration
                  ? {
                      id: x.latest_iteration.id,
                      seqNo: x.latest_iteration.seq_no,
                      sessionSectionId: x.latest_iteration.session_section_id,
                      sectionInstruction: x.latest_iteration.section_instruction
                        ? {
                            id: x.latest_iteration.section_instruction.id,
                            text: x.latest_iteration.section_instruction
                              .text_ /* ili .text */,
                            createdAt:
                              x.latest_iteration.section_instruction
                                .created_at ?? null,
                          }
                        : null,
                      modelOutput: x.latest_iteration.model_output
                        ? {
                            id: x.latest_iteration.model_output.id,
                            generatedText:
                              x.latest_iteration.model_output.generated_text ??
                              null,
                          }
                        : null,
                    }
                  : null,
              })
            ),
          })
        ),
        catchError((err) => {
          this.router.navigate(['/writing-assistant']);
          return of({
            documentTypeId: 0,
            title: '',
            latestGlobalInstructionText: '',
            sections: [],
          });
        })
      );
  }

  createTestSession(payload: {
    testPromptVersionId: number;
    title: string;
  }): Observable<ChatSession> {
    const body = {
      test_prompt_version_id: payload.testPromptVersionId,
      title: payload.title,
    };

    return this.http
      .post<any>(`${this.baseUrl}/test`, body, {
        headers: new HttpHeaders({ 'x-user-id': '2', 'x-user-role': 'ADMIN' }),
      })
      .pipe(
        map(
          (raw): ChatSession => ({
            id: raw.id,
            templateId: raw.template_id,
            documentTypeId: raw.document_type_id ?? null,
            createdBy: raw.created_by,
            title: raw.title,
            updatedAt: raw.updated_at,
            isTestSession: raw.is_test_session === 1,
            promptVersionId: raw.test_prompt_version_id ?? null,
          })
        )
      );
  }
}
