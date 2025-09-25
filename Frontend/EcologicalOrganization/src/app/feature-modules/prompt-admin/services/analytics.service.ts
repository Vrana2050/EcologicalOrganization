import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsOut } from '../models/analytics.model';
import { DocumentTypeReportRow } from '../models/document-type-report-row.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/analytics';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-user-id': '2', 'x-user-role': 'ADMIN' });
  }

  getPromptAnalytics(promptId: number): Observable<AnalyticsOut> {
    return this.http.get<AnalyticsOut>(
      `http://localhost:8000/api/v1/analytics/prompts/${promptId}`,
      { headers: this.headers }
    );
  }

  getVersionAnalytics(versionId: number): Observable<AnalyticsOut> {
    return this.http.get<AnalyticsOut>(
      `http://localhost:8000/api/v1/analytics/prompt-versions/${versionId}`,
      { headers: this.headers }
    );
  }

  getDocTypeReport(
    fromIso: string,
    toIso: string,
    documentTypeId: number | null = null,
    includeTotal = true
  ): Observable<DocumentTypeReportRow[]> {
    let params = new HttpParams()
      .set('from_ts', fromIso)
      .set('to_ts', toIso)
      .set('include_total', String(includeTotal));
    if (documentTypeId !== null && documentTypeId !== undefined) {
      params = params.set('document_type_id', String(documentTypeId));
    }

    return this.http.get<DocumentTypeReportRow[]>(
      `http://localhost:8000/api/v1/analytics/doc-type-report`,
      { headers: this.headers, params }
    );
  }
}
