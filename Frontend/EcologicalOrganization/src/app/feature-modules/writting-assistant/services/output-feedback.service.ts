import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  OutputFeedback,
  CreateOutputFeedback,
} from '../models/output-feedback.model';

@Injectable({ providedIn: 'root' })
export class OutputFeedbackService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/output-feedback';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-user-id': '2' });
  }

  create(payload: CreateOutputFeedback): Observable<OutputFeedback> {
    const body: any = {
      model_output_id: payload.modelOutputId,
      rating_value: payload.ratingValue,
    };
    if (payload.commentText && payload.commentText.trim()) {
      body.comment_text = payload.commentText.trim();
    }

    return this.http
      .post<any>(this.baseUrl, body, { headers: this.headers })
      .pipe(
        map(
          (raw): OutputFeedback => ({
            id: raw.id,
            modelOutputId: raw.model_output_id,
            ratingValue: raw.rating_value,
            commentText: raw.comment_text ?? null,
            createdBy: raw.created_by,
            createdAt: raw.created_at,
          })
        )
      );
  }
}
