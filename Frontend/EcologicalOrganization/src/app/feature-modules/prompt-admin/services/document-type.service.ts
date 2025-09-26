import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DocumentType, DocumentTypePage } from '../models/document-type.model';
import { environment } from 'src/env/environment';

@Injectable({ providedIn: 'root' })
export class DocumentTypeService {
  private readonly url = `${environment.apiHost}writing-assistant/document-types`;

  constructor(private http: HttpClient) {}

  list(
    page = 1,
    perPage = 20,
    ordering = '-updated_at'
  ): Observable<DocumentTypePage> {
    return this.http
      .get<any>(this.url, {
        params: { page, per_page: perPage, ordering },
      })
      .pipe(
        map(
          (raw): DocumentTypePage => ({
            items: (raw.items || []).map(
              (it: any): DocumentType => ({
                id: it.id,
                name: it.name,
                description: it.description ?? null,
                deleted: it.deleted,
                createdAt: it.created_at ?? null,
                updatedAt: it.updated_at ?? null,
              })
            ),
            meta: {
              page: raw.meta.page,
              perPage: raw.meta.per_page,
              totalCount: raw.meta.total_count,
            },
          })
        )
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  update(
    id: number,
    name: string,
    description: string | null
  ): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}`, { name, description });
  }

  create(name: string, description: string | null): Observable<DocumentType> {
    return this.http.post<DocumentType>(this.url, { name, description });
  }
}
