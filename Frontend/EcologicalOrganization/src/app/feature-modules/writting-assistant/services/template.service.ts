import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Template, TemplatePage } from '../models/template.model';
import { environment } from 'src/env/environment';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly baseUrl = `${environment.apiHost}writing-assistant/templates`;

  constructor(private http: HttpClient) {}

  list(page = 1, perPage = 20): Observable<TemplatePage> {
    return this.http
      .get<any>(this.baseUrl, {
        params: { page, per_page: perPage },
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
    return this.http.post<any>(this.baseUrl, formData).pipe(
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
