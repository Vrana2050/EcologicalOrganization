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
    return this.http.get<AnalyticsOut>(`${this.baseUrl}/prompts/${promptId}`, {
      headers: this.headers,
    });
  }

  getVersionAnalytics(versionId: number): Observable<AnalyticsOut> {
    return this.http.get<AnalyticsOut>(
      `${this.baseUrl}/prompt-versions/${versionId}`,
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
      `${this.baseUrl}/doc-type-report`,
      { headers: this.headers, params }
    );
  }

  downloadDocTypeReportPdf(
    fromIso: string,
    toIso: string,
    documentTypeId: number | null,
    includeTotal: boolean,
    sortKey: string,
    sortDir: 'asc' | 'desc',
    tz?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('from_ts', fromIso)
      .set('to_ts', toIso)
      .set('include_total', String(includeTotal))
      .set('sort_key', sortKey)
      .set('sort_dir', sortDir);
    if (tz) params = params.set('tz', tz);
    if (documentTypeId !== null && documentTypeId !== undefined) {
      params = params.set('document_type_id', String(documentTypeId));
    }
    return this.http.get(`${this.baseUrl}/doc-type-report.pdf`, {
      headers: this.headers,
      params,
      responseType: 'blob',
    });
  }
}
