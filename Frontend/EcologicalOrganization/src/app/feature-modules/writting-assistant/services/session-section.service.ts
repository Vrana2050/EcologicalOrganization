import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  CreateSessionSectionIn,
  SessionSectionOut,
} from '../models/session-section.model';

@Injectable({ providedIn: 'root' })
export class SessionSectionService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/session-section';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-user-id': '2' });
  }

  create(payload: CreateSessionSectionIn): Observable<{
    id: number;
    sessionId: number;
    templateSectionId?: number | null;
    name: string;
    position: number;
  }> {
    const body: any = {
      session_id: payload.sessionId,
      name: payload.name,
      position: payload.position,
    };
    if (payload.templateSectionId !== undefined) {
      body.template_section_id = payload.templateSectionId;
    }

    return this.http
      .post<SessionSectionOut>(this.baseUrl, body, { headers: this.headers })
      .pipe(
        map((raw) => ({
          id: raw.id,
          sessionId: raw.sessionId,
          templateSectionId: raw.templateSectionId ?? null,
          name: raw.name,
          position: raw.position,
        }))
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.headers,
    });
  }

  generateIteration(
    sectionId: number,
    payload: { instruction_text: string }
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/${sectionId}/iterations`,
      payload,
      { headers: this.headers }
    );
  }

  updateTitle(sectionId: number, name: string): Observable<SessionSectionOut> {
    return this.http
      .patch<any>(
        `${this.baseUrl}/${sectionId}/title`,
        { name },
        { headers: this.headers }
      )
      .pipe(
        map((raw) => ({
          id: raw.id,
          sessionId: raw.session_id,
          templateSectionId: raw.template_section_id ?? null,
          name: raw.name,
          position: raw.position,
        }))
      );
  }
}
