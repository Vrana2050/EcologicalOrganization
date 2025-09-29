import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';

export interface SectionSelection {
  section_id: number;
  seq_no?: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentReportService {
  private readonly url = `${environment.apiHost}writing-assistant/analytics/doc-report.pdf`;

  constructor(private http: HttpClient) {}

  downloadSessionPreviewPdf(
    sessionId: number,
    title: string | null,
    selections: SectionSelection[]
  ): Observable<Blob> {
    const body = {
      title: title && title.trim() ? title.trim() : null,
      selections: selections || [],
    };
    const params = { session_id: String(sessionId) };

    return this.http.post(this.url, body, { params, responseType: 'blob' });
  }
}
