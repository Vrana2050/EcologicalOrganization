import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  OutputFeedback,
  CreateOutputFeedback,
} from '../models/output-feedback.model';
import { environment } from 'src/env/environment';

@Injectable({ providedIn: 'root' })
export class OutputFeedbackService {
  private readonly baseUrl = `${environment.apiHost}writing-assistant/output-feedback`;

  constructor(private http: HttpClient) {}

  create(payload: CreateOutputFeedback): Observable<OutputFeedback> {
    const body: any = {
      model_output_id: payload.modelOutputId,
      rating_value: payload.ratingValue,
    };
    if (payload.commentText && payload.commentText.trim()) {
      body.comment_text = payload.commentText.trim();
    }

    return this.http.post<any>(this.baseUrl, body).pipe(
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
