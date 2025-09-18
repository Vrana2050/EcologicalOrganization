import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DocumentTypeService } from '../../services/document-type.service';
import { DocumentType } from '../../models/document-type.model';

@Component({
  selector: 'xp-document-type-management',
  templateUrl: './document-type-management.component.html',
  styleUrls: [
    './document-type-management.component.css',
    '../../prompt-admin.styles.css',
  ],
})
export class DocumentTypeManagementComponent implements OnInit {
  items: DocumentType[] = [];
  totalCount = 0;
  page = 1;
  perPage = 20;
  ordering = '-updated_at';
  loading = false;

  editingId: number | null = null;
  nameDraft = '';
  descDraft = '';
  isNew = false;

  constructor(private docTypeService: DocumentTypeService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.docTypeService.list(this.page, this.perPage, this.ordering).subscribe({
      next: (res) => {
        this.items = res.items;
        this.totalCount = res.meta.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  sortBy(field: string): void {
    if (this.ordering === field) {
      this.ordering = `-${field}`;
    } else {
      this.ordering = field;
    }
    this.fetch();
  }

  cancelEdit(): void {
    if (this.isNew) {
      this.items = this.items.filter((x) => x.id !== this.editingId);
      this.isNew = false;
    }
    this.editingId = null;
    this.nameDraft = '';
    this.descDraft = '';
  }

  saveEdit(id: number): void {
    const newName = this.nameDraft.trim();
    if (!newName) return;

    if (this.isNew) {
      this.docTypeService.create(newName, this.descDraft).subscribe({
        next: () => {
          this.isNew = false;
          this.cancelEdit();
          this.fetch();
        },
        error: (err) => {
          const msg =
            err?.error?.detail || 'Došlo je do greške prilikom dodavanja.';
          alert(msg);
        },
      });
    } else {
      // UPDATE
      this.docTypeService.update(id, newName, this.descDraft).subscribe({
        next: () => {
          this.cancelEdit();
          this.fetch();
        },
        error: (err) => {
          const msg =
            err?.error?.detail || 'Došlo je do greške prilikom izmene.';
          alert(msg);
        },
      });
    }
  }

  delete(id: number): void {
    if (!confirm('Da li si siguran da želiš da obrišeš ovaj Document Type?'))
      return;
    this.docTypeService.delete(id).subscribe(() => this.fetch());
  }

  @ViewChild('descArea') descArea!: ElementRef<HTMLTextAreaElement>;

  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  startEdit(item: DocumentType): void {
    this.editingId = item.id;
    this.nameDraft = item.name;
    this.descDraft = item.description || '';
    this.isNew = false;

    setTimeout(() => {
      if (this.descArea) {
        const textarea = this.descArea.nativeElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    });
  }

  isDefault(dt: DocumentType): boolean {
    return dt.name?.toLowerCase() === 'default';
  }

  addNew(): void {
    const tempId = -Date.now();
    const newItem: DocumentType = {
      id: tempId,
      name: '',
      description: '',
      deleted: 0,
      createdAt: undefined,
      updatedAt: undefined,
    };

    this.items = [newItem, ...this.items];
    this.editingId = tempId;
    this.nameDraft = '';
    this.descDraft = '';
    this.isNew = true;
  }
}
