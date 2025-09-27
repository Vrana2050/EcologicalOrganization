import { Component, OnInit } from '@angular/core';
import { RepoFolder } from '../../models/repo-folder.model';
import { StorageObject } from '../../models/storage-object.model';
import { RepoFolderService } from '../../services/repo-folder.service';
import { StorageObjectService } from '../../services/storage-object.service';
import { finalize } from 'rxjs/operators';
import { DocumentType } from '../../models/document-type.model';
import { DocumentTypeService } from '../../services/document-type.service';

type Crumb = { id: number | null; name: string };

@Component({
  selector: 'xp-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css'],
})
export class DocumentManagementComponent implements OnInit {
  loading = false;
  creating = false;
  uploading = false;
  error: string | null = null;

  deletingFolderIds = new Set<number>();
  deletingFileIds = new Set<number>();

  breadcrumbs: Crumb[] = [{ id: null, name: 'Root' }];
  currentFolderId: number | null = null;

  folders: RepoFolder[] = [];
  files: StorageObject[] = [];

  docTypes: DocumentType[] = [];
  docTypesLoading = false;
  selectedDocumentTypeId: number | null = null;

  newFolderName = '';
  selectedFile: File | null = null;

  constructor(
    private foldersSvc: RepoFolderService,
    private filesSvc: StorageObjectService,
    private docTypeSvc: DocumentTypeService
  ) {}

  ngOnInit(): void {
    this.loadDocTypes();
    this.loadCurrent();
  }

  private loadDocTypes(): void {
    this.docTypesLoading = true;
    this.docTypeSvc
      .list(1, 500, 'name')
      .pipe(finalize(() => (this.docTypesLoading = false)))
      .subscribe({
        next: (res) => (this.docTypes = res.items || []),
        error: (e) => (this.error = this.humanizeError(e)),
      });
  }

  loadCurrent(): void {
    this.loading = true;
    this.error = null;

    this.foldersSvc
      .list(this.currentFolderId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.folders =
            this.currentFolderId === null
              ? res.items.filter((f) => f.parentId == null)
              : res.items;
        },
        error: (e) => (this.error = this.humanizeError(e)),
      });

    this.filesSvc.list(this.currentFolderId).subscribe({
      next: (res) => {
        this.files =
          this.currentFolderId === null
            ? res.items.filter((o) => o.repoFolderId == null)
            : res.items;
      },
      error: (e) => (this.error = this.humanizeError(e)),
    });
  }

  openFolder(f: RepoFolder): void {
    this.currentFolderId = f.id;
    this.breadcrumbs.push({ id: f.id, name: f.name });
    this.loadCurrent();
  }

  goToCrumb(idx: number): void {
    this.breadcrumbs = this.breadcrumbs.slice(0, idx + 1);
    this.currentFolderId = this.breadcrumbs[idx].id;
    this.loadCurrent();
  }

  createFolder(): void {
    const name = (this.newFolderName || '').trim();
    if (!name) return;

    this.creating = true;
    this.error = null;

    this.foldersSvc
      .create(name, this.currentFolderId)
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          this.newFolderName = '';
          this.loadCurrent();
        },
        error: (e) => (this.error = this.humanizeError(e)),
      });
  }

  onFilePicked(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile || this.selectedDocumentTypeId == null) return;
    this.uploading = true;
    this.error = null;

    this.filesSvc
      .upload(
        this.selectedFile,
        this.currentFolderId,
        this.selectedDocumentTypeId
      )
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: () => {
          this.selectedFile = null;
          const el = document.getElementById(
            'dm-file-input'
          ) as HTMLInputElement | null;
          if (el) el.value = '';
          this.loadCurrent();
        },
        error: (e) => (this.error = this.humanizeError(e)),
      });
  }

  deleteFolder(f: RepoFolder, ev?: Event): void {
    ev?.stopPropagation();
    if (
      !confirm(
        `Obrisati folder "${f.name}" i sve njegove podfoldere i fajlove?`
      )
    )
      return;

    this.deletingFolderIds.add(f.id);
    this.error = null;

    this.foldersSvc
      .delete(f.id)
      .pipe(finalize(() => this.deletingFolderIds.delete(f.id)))
      .subscribe({
        next: () => this.loadCurrent(),
        error: (e) => (this.error = this.humanizeError(e)),
      });
  }

  deleteFile(file: StorageObject): void {
    if (!confirm(`Obrisati fajl "${file.originalName}"?`)) return;

    this.deletingFileIds.add(file.id);
    this.error = null;

    this.filesSvc
      .delete(file.id)
      .pipe(finalize(() => this.deletingFileIds.delete(file.id)))
      .subscribe({
        next: () => this.loadCurrent(),
        error: (e) => (this.error = this.humanizeError(e)),
      });
  }

  refresh(): void {
    this.loadCurrent();
  }

  prettyBytes(n: number): string {
    if (!n && n !== 0) return '';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < units.length - 1) {
      v = v / 1024;
      i++;
    }
    return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  }

  private humanizeError(e: any): string {
    try {
      if (e?.error?.detail) return e.error.detail;
      if (typeof e?.error === 'string') return e.error;
      if (e?.message) return e.message;
    } catch {}
    return 'Došlo je do greške.';
  }
}
