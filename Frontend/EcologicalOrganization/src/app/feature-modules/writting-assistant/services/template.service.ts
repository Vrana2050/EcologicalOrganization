import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Template, TemplatePage } from '../models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/templates';

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 20): Observable<TemplatePage> {
    const headers = new HttpHeaders({ 'x-user-id': '2' });

    return this.http
      .get<any>(this.baseUrl, {
        params: { page, per_page: perPage },
        headers,
      })
      .pipe(
        map((raw) => ({
          items: raw.items.map(
            (t: any): Template => ({
              id: t.id,
              name: t.name,
              documentTypeId: t.document_type_id,
              updatedAt: t.updated_at,
              documentTypeName: t.document_type_name,
            })
          ),
          meta: {
            page: raw.meta.page,
            perPage: raw.meta.per_page,
            totalCount: raw.meta.total_count,
          },
        }))
      );
  }

  create(formData: FormData): Observable<Template> {
    const headers = new HttpHeaders({ 'x-user-id': '2' });
    return this.http.post<any>(this.baseUrl, formData, { headers }).pipe(
      map(
        (t: any): Template => ({
          id: t.id,
          name: t.name,
          documentTypeId: t.document_type_id,
          updatedAt: t.updated_at,
          documentTypeName: t.document_type_name,
        })
      )
    );
  }
}
