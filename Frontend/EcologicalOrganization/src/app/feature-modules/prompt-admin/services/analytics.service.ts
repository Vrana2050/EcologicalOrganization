import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsOut } from '../models/analytics.model';
import { DocumentTypeReportRow } from '../models/document-type-report-row.model';
import { environment } from 'src/env/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly baseUrl = `${environment.apiHost}writing-assistant/analytics`;

  constructor(private http: HttpClient) {}

  getPromptAnalytics(promptId: number): Observable<AnalyticsOut> {
    return this.http.get<AnalyticsOut>(`${this.baseUrl}/prompts/${promptId}`);
  }

  getVersionAnalytics(versionId: number): Observable<AnalyticsOut> {
    return this.http.get<AnalyticsOut>(
      `${this.baseUrl}/prompt-versions/${versionId}`
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
      { params }
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
      params,
      responseType: 'blob',
    });
  }
}
