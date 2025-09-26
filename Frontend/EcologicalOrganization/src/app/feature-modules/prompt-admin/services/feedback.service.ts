import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OutputFeedbackItem,
  OutputFeedbackPage,
} from '../models/feedback.model';
import { environment } from 'src/env/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly base = `${environment.apiHost}writing-assistant/output-feedback`;

  constructor(private http: HttpClient) {}

  getForPrompt(
    promptId: number,
    page = 1,
    perPage = 5
  ): Observable<OutputFeedbackPage> {
    const params = new HttpParams().set('page', page).set('per_page', perPage);

    return this.http.get<OutputFeedbackPage>(
      `${this.base}/by-prompt/${promptId}`,
      { params }
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
      { params }
    );
  }

  getDetails(feedbackId: number): Observable<OutputFeedbackItem> {
    return this.http.get<OutputFeedbackItem>(`${this.base}/${feedbackId}`);
  }
}
