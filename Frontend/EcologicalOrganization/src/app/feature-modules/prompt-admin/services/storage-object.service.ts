import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import {
  StorageObject,
  StorageObjectPage,
} from '../models/storage-object.model';

@Injectable({ providedIn: 'root' })
export class StorageObjectService {
  private readonly objectsUrl = `${environment.apiHost}writing-assistant/storage-objects`;

  constructor(private http: HttpClient) {}

  list(
    repoFolderId: number | null = null,
    page = 1,
    perPage = 100
  ): Observable<StorageObjectPage> {
    const params: any = { page, per_page: perPage };
    if (repoFolderId !== null) params.repo_folder_id = repoFolderId;

    return this.http.get<any>(this.objectsUrl, { params }).pipe(
      map(
        (raw): StorageObjectPage => ({
          items: (raw.items || []).map(
            (o: any): StorageObject => ({
              id: o.id,
              originalName: o.original_name,
              mimeType: o.mime_type ?? null,
              sizeBytes: o.size_bytes ?? 0,
              repoFolderId: o.repo_folder_id ?? null,
              path: o.path ?? null,
              createdBy: o.created_by ?? null,
              createdAt: o.created_at ?? null,
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

  upload(
    file: File,
    repoFolderId: number | null = null,
    documentTypeId: number | null = null
  ): Observable<StorageObject> {
    const form = new FormData();
    form.append('file', file);
    if (repoFolderId !== null)
      form.append('repo_folder_id', String(repoFolderId));
    if (documentTypeId !== null)
      form.append('document_type_id', String(documentTypeId));

    return this.http.post<any>(this.objectsUrl, form).pipe(
      map(
        (o): StorageObject => ({
          id: o.id,
          originalName: o.original_name,
          mimeType: o.mime_type ?? null,
          sizeBytes: o.size_bytes ?? 0,
          repoFolderId: o.repo_folder_id ?? null,
          path: o.path ?? null,
          createdBy: o.created_by ?? null,
          createdAt: o.created_at ?? null,
        })
      )
    );
  }

  rename(id: number, newName: string): Observable<StorageObject> {
    return this.http
      .patch<any>(`${this.objectsUrl}/${id}`, { original_name: newName })
      .pipe(
        map(
          (o): StorageObject => ({
            id: o.id,
            originalName: o.original_name,
            mimeType: o.mime_type ?? null,
            sizeBytes: o.size_bytes ?? 0,
            repoFolderId: o.repo_folder_id ?? null,
            path: o.path ?? null,
            createdBy: o.created_by ?? null,
            createdAt: o.created_at ?? null,
          })
        )
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.objectsUrl}/${id}`);
  }
}
