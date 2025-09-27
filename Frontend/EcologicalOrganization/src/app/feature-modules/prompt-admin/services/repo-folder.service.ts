import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { RepoFolder, RepoFolderPage } from '../models/repo-folder.model';

@Injectable({ providedIn: 'root' })
export class RepoFolderService {
  private readonly foldersUrl = `${environment.apiHost}writing-assistant/repo-folders`;

  constructor(private http: HttpClient) {}

  list(
    parentId: number | null = null,
    page = 1,
    perPage = 100
  ): Observable<RepoFolderPage> {
    const params: any = { page, per_page: perPage };
    if (parentId !== null) params.parent_id = parentId;

    return this.http.get<any>(this.foldersUrl, { params }).pipe(
      map(
        (raw): RepoFolderPage => ({
          items: (raw.items || []).map(
            (f: any): RepoFolder => ({
              id: f.id,
              name: f.name,
              parentId: f.parent_id ?? null,
              createdBy: f.created_by ?? null,
              createdAt: f.created_at ?? null,
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

  get(id: number): Observable<RepoFolder> {
    return this.http.get<any>(`${this.foldersUrl}/${id}`).pipe(
      map(
        (f): RepoFolder => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id ?? null,
          createdBy: f.created_by ?? null,
          createdAt: f.created_at ?? null,
        })
      )
    );
  }

  create(name: string, parentId: number | null = null): Observable<RepoFolder> {
    const payload: any = { name };
    if (parentId !== null) payload.parent_id = parentId;

    return this.http.post<any>(this.foldersUrl, payload).pipe(
      map(
        (f): RepoFolder => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id ?? null,
          createdBy: f.created_by ?? null,
          createdAt: f.created_at ?? null,
        })
      )
    );
  }

  rename(id: number, name: string): Observable<RepoFolder> {
    return this.http.patch<any>(`${this.foldersUrl}/${id}`, { name }).pipe(
      map(
        (f): RepoFolder => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id ?? null,
          createdBy: f.created_by ?? null,
          createdAt: f.created_at ?? null,
        })
      )
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.foldersUrl}/${id}`);
  }
}
