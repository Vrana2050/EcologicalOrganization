import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ChatSession, ChatSessionPage } from '../models/chat-session.model';

@Injectable({
  providedIn: 'root',
})
export class ChatSessionService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/chat-session';

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 20): Observable<ChatSessionPage> {
    const headers = new HttpHeaders({
      'x-user-id': '2',
    });

    return this.http
      .get<any>(this.baseUrl, {
        params: { page, per_page: perPage },
        headers,
      })
      .pipe(
        map(
          (raw): ChatSessionPage => ({
            items: raw.items.map(
              (it: any): ChatSession => ({
                id: it.id,
                templateId: it.template_id,
                createdBy: it.created_by,
                title: it.title,
                updatedAt: it.updated_at,
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
}
