import {
  CustomMetadataValue,
  Tag,
  UpdateDocumentDTO,
} from './../../models/document.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DocumentDTO, DocumentFile } from '../../models/document.model';
import { HttpEventType } from '@angular/common/http';
import { TagDTO } from '../../models/tag.model';
import { TagService } from '../../services/tag.service';
import { MetadataDTO } from '../../models/metadata.model';
import { MetadataService } from '../../services/metadata.service';
import { GroupDTO } from '../../models/group.model';
import { UserGroupService } from '../../services/user-group.service';
import { PermissionCreateDTO } from '../../models/permission.model';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'xp-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.css'],
})
export class DocumentViewComponent implements OnInit {
  document: DocumentDTO | null = null;
  newDirectoryName: string;
  isModalOpen: boolean = false;
  errorMessage = '';
  isUploadOpen = false;
  isUploading = false;
  uploads: { file: File; progress: number; status: string }[] = [];
  activeVersion: DocumentFile;
  allItems: any[] = [];
  isPreviewOpen = false;
  fileContent: string = '';
  fileUrl: string | null = null;
  isUpdating: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private tagService: TagService,
    private metadataService: MetadataService,
    private groupService: UserGroupService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const documentId = Number(params.get('documentId'));
      if (documentId) {
        this.loadDocument(documentId);

        this.isUploadOpen = false;
        this.isUploading = false;
      }
    });
  }

  private loadDocument(documentId: number): void {
    this.documentService.getDocument(documentId).subscribe({
      next: (data) => {
        this.document = data;
        this.activeVersion = this.document?.document_files?.find(
          (f) => f.version === this.document?.active_version
        )!;
      },
      error: (err) => {
        console.error('Error loading directory:', err);
      },
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.errorMessage = '';
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
    const upload = { file, progress: 0, status: 'Uploading...' };
    this.uploads.push(upload);

    this.documentService.uploadNewVersion(this.document!.id, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          upload.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          upload.status = 'Done';
          this.loadDocument(this.document!.id); // osveži listu dokumenata
          this.isUploadOpen = false;
          this.isUploading = false;
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

  fileText: string;
  openPreview() {
    if (!this.activeVersion?.file_path) return;

    this.documentService.getFile(this.activeVersion.file_path).subscribe({
      next: (blob) => {
        const ext = this.activeVersion.file_type.toLowerCase();

        let mimeType: string;
        switch (ext) {
          case '.txt':
            mimeType = 'text/plain';
            break;
          case '.csv':
            mimeType = 'text/csv';
            break;
          case '.pdf':
            mimeType = 'application/pdf';
            break;
          case '.doc':
            mimeType = 'application/msword';
            break;
          case '.docx':
            mimeType =
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case '.xls':
            mimeType = 'application/vnd.ms-excel';
            break;
          case '.xlsx':
            mimeType =
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          case '.ppt':
            mimeType = 'application/vnd.ms-powerpoint';
            break;
          case '.pptx':
            mimeType =
              'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            break;
          case '.jpg':
          case '.jpeg':
            mimeType = 'image/jpeg';
            break;
          case '.png':
            mimeType = 'image/png';
            break;
          default:
            mimeType = 'application/octet-stream';
        }
        const file = new Blob([blob], { type: mimeType });

        switch (ext) {
          case '.txt':
          case '.csv':
            const reader = new FileReader();

            reader.onload = () => {
              this.fileText = reader.result as string;
              const lines = this.fileText.split('\n');
              this.fileText = lines.slice(0, 100).join('\n');
            };

            reader.readAsText(file);
            this.isPreviewOpen = true;
            break;

          case '.jpg':
          case '.jpeg':
          case '.png':
            this.fileUrl = URL.createObjectURL(file);
            this.isPreviewOpen = true;
            break;
          default:
            // PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
        }
      },
    });
  }

  closePreview() {
    this.isPreviewOpen = false;
  }

  openInNewTab() {
    if (!this.fileUrl) return;
    window.open(this.fileUrl, '_blank');
  }

  formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return bytes + ' B';
    }
  }

  restoreVersion(version: number) {
    this.documentService.restoreVersion(this.document!.id, version).subscribe({
      next: () => {
        this.loadDocument(this.document!.id);
        this.isUploadOpen = false;
        this.isUploading = false;
      },
      error: (err) => {
        console.error('Versioning error:', err);
      },
    });
  }

  allTags: TagDTO[] = [];
  allMetadata: MetadataDTO[] = [];
  updateTags: Tag[] = [];
  updateName: string = '';
  updateMetadata: CustomMetadataValue[] = [];
  startUpdate() {
    this.tagService.getAll().subscribe({
      next: (data) => (this.allTags = data),
      error: (err) => console.error('Error fetching tags', err),
    });
    this.metadataService.getAll().subscribe({
      next: (data) => (this.allMetadata = data),
      error: (err) => console.error('Error fetching metadata', err),
    });
    this.isUpdating = true;
    this.updateTags = this.document!.tags;
    this.updateName = this.document!.name.split('.')[0];
    this.updateMetadata = this.document!.custom_metadata_values;
  }

  filteredTags: TagDTO[] = [];
  tagInput: string = '';
  addTagFromInput(event: Event) {
    event.preventDefault();
    const value = this.tagInput.trim().toLowerCase();
    if (!value) return;

    // da li već postoji u allTags
    const found = this.allTags.find((tag) => tag.name.toLowerCase() === value);
    if (found && !this.updateTags.some((t) => t.name === found.name)) {
      this.updateTags.push(found);

      this.tagInput = '';
      this.filteredTags = [];
    } else if (
      !found &&
      !this.updateTags.some((t) => t.name.toLowerCase() === value)
    ) {
      // ako ne postoji u allTags, možeš ili da napraviš novi tag objekat
      this.updateTags.push({ id: 0, name: value, description: '' } as Tag);

      this.tagInput = '';
      this.filteredTags = [];
    }
  }

  removeTag(index: number) {
    this.updateTags.splice(index, 1);
  }

  handleBackspace(event: any) {
    if (!this.tagInput && this.updateTags.length > 0) {
      this.updateTags.pop();
    }
  }

  filterTags() {
    const search = this.tagInput.toLowerCase();
    this.filteredTags = this.allTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(search) &&
        !this.updateTags.some((t) => t.id === tag.id)
    );
  }

  selectSuggestion(suggestion: TagDTO) {
    if (!this.updateTags.some((t) => t.id === suggestion.id)) {
      this.updateTags.push(suggestion);
    }
    this.tagInput = '';
    this.filteredTags = [];
  }

  selectedMetadataId: number | null = null;

  addMetadata() {
    if (this.selectedMetadataId) {
      const metaToAdd = this.allMetadata.find(
        (m) => m.id === this.selectedMetadataId
      );
      if (metaToAdd) {
        let defaultValue: any = null;

        switch (metaToAdd.metadata_type) {
          case 'String':
            defaultValue = '';
            break;
          case 'Boolean':
            defaultValue = false;
            break;
          default:
            defaultValue = null;
        }
        this.updateMetadata.push({
          id: 0, // novi, backend će dodeliti
          value: defaultValue,
          is_missing_value: false,
          custom_metadata: {
            id: metaToAdd.id,
            name: metaToAdd.name,
            metadata_type: metaToAdd.metadata_type,
            description: metaToAdd.description ?? null,
          },
        });
      }
      this.selectedMetadataId = null;
    }
  }

  removeMetadata(index: number) {
    this.updateMetadata.splice(index, 1);
  }

  isMetadataDisabled(metaId: number): boolean {
    return (
      this.updateMetadata?.some((m) => m.custom_metadata.id === metaId) ?? false
    );
  }

  onBooleanChange(event: Event, meta: CustomMetadataValue) {
    const input = event.target as HTMLInputElement;
    meta.value = input.checked ? 'true' : 'false';
  }

  cancelUpdate() {
    this.isUpdating = false;
    this.updateError = '';
    this.loadDocument(this.document!.id);
  }

  updatedDocument: UpdateDocumentDTO;
  updateError: string = '';
  saveUpdate() {
    this.updatedDocument = {
      document_id: this.document!.id,
      document_name: this.updateName,
      tags: this.updateTags.map((tag) => tag.name),
      metadata: this.updateMetadata.map((meta) => ({
        metadata_id: meta.custom_metadata.id,
        value: meta.value,
      })),
    };
    this.documentService.updateDocument(this.updatedDocument).subscribe({
      next: (response) => {
        console.log('✅ Dokument uspešno ažuriran:', response);
        this.loadDocument(this.document!.id);
        this.isUpdating = false;
        this.updateError = '';
      },
      error: (error) => {
        this.updateError = error.error.detail;
        console.log(error);
      },
    });
  }

  showSummaryModal = false;
  summaryText = '';
  charCount = 0;

  addSummary(): void {
    this.showSummaryModal = true;
    this.summaryText = this.activeVersion.summary
      ? this.activeVersion.summary
      : '';
    this.charCount = this.activeVersion.summary
      ? this.activeVersion.summary.length
      : 0;
  }

  closeSummaryModal(): void {
    this.showSummaryModal = false;
  }

  updateCharCount(): void {
    this.charCount = this.summaryText.length;
  }

  isLoading = false;
  generateSummary(): void {
    // this.isLoading = true;
    // this.documentService.generateSummary(this.document!.id).subscribe({
    //   next: (res) => {
    //     this.isLoading = false;
    //     this.summaryText = res.summary;
    //     this.updateCharCount();
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     console.error('Error generating summary:', err);
    //     this.summaryText = 'Error generating summary.';
    //   },
    // });
  }

  saveSummary(): void {
    if (!this.summaryText.trim()) return; // zaštita od praznog summary-a

    // pozivamo servis
    this.documentService
      .addSummary(this.document!.id, this.summaryText)
      .subscribe({
        next: (response) => {
          this.loadDocument(this.document!.id);
          this.closeSummaryModal();
        },
        error: (err) => {
          console.error('Error saving summary:', err);
        },
      });
  }

  showShareModal = false;
  principalType: 'user' | 'group' = 'user';
  email = '';
  selectedGroup = '';
  accessType = 'VIEWER';
  hasExpiration = false;
  expiresAt: string | null = null;
  groups: GroupDTO[] = [];

  openShareModal() {
    this.showShareModal = true;
    this.groupService.getAll().subscribe({
      next: (data) => (this.groups = data),
      error: (err) => console.error('Error fetching groups', err),
    });
  }

  closeShareModal() {
    this.showShareModal = false;
  }

  onPrincipalChange() {
    this.email = '';
    this.selectedGroup = '';
  }

  toggleExpiration(perm: any) {
    if (!perm.hasExpiration) perm.permission_value.expires_at = null;
  }

  canShare(): boolean {
    return (
      (this.principalType === 'user' && this.email.trim() !== '') ||
      (this.principalType === 'group' && this.selectedGroup.trim() !== '')
    );
  }

  sharePermission() {
    const payload: PermissionCreateDTO = {
      ...(this.email !== ''
        ? { email: this.email }
        : { group_name: this.selectedGroup }),
      expires_at: this.expiresAt,
      access_type: this.accessType,
      document_id: this.document!.id,
    };

    this.permissionService.givePermission(payload).subscribe({
      next: (response) => {
        this.loadDocument(this.document!.id);
        this.email = '';
        this.selectedGroup = '';
        this.accessType = 'VIEWER';
        this.hasExpiration = false;
        this.expiresAt = null;
      },
      error: (err) => {
        console.error('Error sharing permission', err);
        // ovde možeš pokazati poruku greške korisniku
      },
    });
  }

  deleteDocument() {
    this.documentService.deleteDocument(this.document!.id).subscribe({
      next: (response) => {
        this.router.navigate([
          '/document-management/directory',
          this.document!.parent_directory_id,
        ]);
      },
      error: (err) => {
        console.error('Error deleting document', err);
      },
    });
  }
}
