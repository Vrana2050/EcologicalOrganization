import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OutputFeedbackItem,
  OutputFeedbackPage,
} from '../models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly base = 'http://localhost:8000/api/v1/output-feedback';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'x-user-id': '2',
      'x-user-role': 'ADMIN',
      'x-user-email': 'admin@example.com',
    });
  }

  getForPrompt(
    promptId: number,
    page = 1,
    perPage = 5
  ): Observable<OutputFeedbackPage> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<OutputFeedbackPage>(
      `${this.base}/by-prompt/${promptId}`,
      {
        params,
        headers: this.headers,
      }
    );
  }

  getForVersion(
    versionId: number,
    page = 1,
    perPage = 5
  ): Observable<OutputFeedbackPage> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);
    return this.http.get<OutputFeedbackPage>(
      `${this.base}/by-version/${versionId}`,
      {
        params,
        headers: this.headers,
      }
    );
  }

  getDetails(feedbackId: number): Observable<OutputFeedbackItem> {
    return this.http.get<OutputFeedbackItem>(`${this.base}/${feedbackId}`, {
      headers: this.headers,
    });
  }
}
