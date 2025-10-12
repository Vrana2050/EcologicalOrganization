import { PagedResults } from './../../../../shared/model/paged-results.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateDirectoryDTO,
  DirectoryOpenResponse,
} from '../../models/directory.model';
import { DirectoryService } from '../../services/directory.service';
import { DocumentService } from '../../services/document.service';
import { HttpEventType } from '@angular/common/http';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'xp-directory-view',
  templateUrl: './directory-view.component.html',
  styleUrls: ['./directory-view.component.css'],
})
export class DirectoryViewComponent implements OnInit {
  directoryData: DirectoryOpenResponse | null = null;
  newDirectoryName: string;
  isModalOpen: boolean = false;
  errorMessage = '';
  isUploadOpen = false;
  isUploading = false;
  uploads: { file: File; progress: number; status: string }[] = [];
  allItems: any[] = [];
  filteredItems: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private directoryService: DirectoryService,
    private documentService: DocumentService,
    private router: Router,
    private refreshService: RefreshService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const directoryId = Number(params.get('directoryId'));
      if (directoryId) {
        this.loadDirectory(directoryId);

        this.isUploadOpen = false;
        this.isUploading = false;
      }
    });
  }

  private loadDirectory(directoryId: number): void {
    this.directoryService.openDirectory(directoryId).subscribe({
      next: (data) => {
        this.directoryData = data;
        this.allItems = [
          ...(this.directoryData.subdirectories || []),
          ...(this.directoryData.subdocuments || []),
        ];
        this.filteredItems = [
          ...(this.directoryData.subdirectories || []),
          ...(this.directoryData.subdocuments || []),
        ];
      },
      error: (err) => {
        console.error('Error loading directory:', err);
      },
    });
  }

  onSearch(value: string): void {
    const search = value.trim().toLowerCase();

    if (!search) {
      // ako je polje prazno, vrati sve
      this.filteredItems = [...this.allItems];
      return;
    }

    this.filteredItems = this.allItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(search);

      const tagsMatch =
        Array.isArray(item.tags) &&
        item.tags.some((tag: string) => tag.toLowerCase().includes(search));

      const createdMatch = item.created_at
        ? new Date(item.created_at)
            .toLocaleString()
            .toLowerCase()
            .includes(search)
        : false;

      const modifiedMatch = item.last_modified
        ? new Date(item.last_modified)
            .toLocaleString()
            .toLowerCase()
            .includes(search)
        : false;

      return nameMatch || tagsMatch || createdMatch || modifiedMatch;
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage = '';
  }

  createDirectory() {
    const currentDirId = this.directoryData?.current_permission?.directory_id;

    if (!currentDirId) {
      console.error('No current directory id');
      return;
    }

    const newSection: CreateDirectoryDTO = {
      name: this.newDirectoryName,
      parent_directory_id: currentDirId,
    };

    this.directoryService.createDirectory(newSection).subscribe({
      next: () => {
        this.loadDirectory(currentDirId);
        this.isModalOpen = false;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.detail;
      },
    });
  }

  toggleUpload() {
    this.isUploadOpen = !this.isUploadOpen;
    this.isUploading = false;
    this.uploads = [];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isUploading = true;
      const file = input.files[0];
      this.uploadFile(file);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.isUploading = true;
      const file = files[0];
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  uploadFile(file: File) {
    const currentDirId = this.directoryData?.current_permission?.directory_id;
    if (!currentDirId) {
      console.error('No current directory id');
      return;
    }
    const upload = { file, progress: 0, status: 'Uploading...' };
    this.uploads.push(upload);

    this.documentService.uploadDocument(currentDirId, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          upload.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          upload.status = 'Done';
          this.loadDirectory(currentDirId); // osveži listu dokumenata
        }
      },
      error: (err) => {
        console.error('Upload error:', err);

        if (err.error && err.error.detail) {
          upload.status = err.error.detail;
        } else {
          upload.status = 'Unexpected error occurred';
        }
      },
    });
  }

  deleteDirectory() {
    this.directoryService
      .deleteDirectory(this.directoryData!.current_permission!.directory_id)
      .subscribe({
        next: (response) => {
          if (this.directoryData!.path.length > 1) {
            const previousDirId =
              this.directoryData!.path[this.directoryData!.path.length - 2].id;

            this.router.navigate([
              '/document-management/directory',
              previousDirId,
            ]);
          } else {
            this.refreshService.triggerRefresh();
            this.router.navigate(['/document-management/welcome']);
          }
        },
        error: (err) => {
          console.error('Error deleting document', err);
        },
      });
  }
}
