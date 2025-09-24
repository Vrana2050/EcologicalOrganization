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

  getPromptAnalytics(promptId: number) {
    return this.http.get<AnalyticsOut>(
      `http://localhost:8000/api/v1/analytics/prompts/${promptId}`,
      { headers: this.headers }
    );
  }

  getVersionAnalytics(versionId: number) {
    return this.http.get<AnalyticsOut>(
      `http://localhost:8000/api/v1/analytics/prompt-versions/${versionId}`,
      { headers: this.headers }
    );
  }
}
