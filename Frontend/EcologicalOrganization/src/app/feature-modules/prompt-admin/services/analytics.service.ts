import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AnalyticsOut } from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/analytics';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-user-id': '2', 'x-user-role': 'ADMIN' });
  }

  getPromptAnalytics(promptId: number, c = 10): Observable<AnalyticsOut> {
    return this.http
      .get<AnalyticsOut>(`${this.baseUrl}/prompts/${promptId}`, {
        params: { c },
        headers: this.headers,
      })
      .pipe(map((x) => ({ ...x })));
  }

  getVersionAnalytics(versionId: number, c = 10): Observable<AnalyticsOut> {
    return this.http
      .get<AnalyticsOut>(`${this.baseUrl}/prompt-versions/${versionId}`, {
        params: { c },
        headers: this.headers,
      })
      .pipe(map((x) => ({ ...x })));
  }
}
