import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DocumentType } from '../../models/document-type.model';

@Component({
  selector: 'pa-prompt-header',
  templateUrl: './prompt-header.component.html',
  styleUrls: ['../../prompt-admin.styles.css', './prompt-header.component.css'],
})
export class PromptHeaderComponent implements OnChanges {
  @Input() title: string | null = null;
  @Input() isNewPrompt = false;
  @Input() documentTypes: DocumentType[] = [];
  @Input() documentTypeId: number | null = null;
  @Input() startInEditMode = false;

  @Output() savePrompt = new EventEmitter<{ name: string }>();
  @Output() deletePrompt = new EventEmitter<void>();
  @Output() docTypeChanged = new EventEmitter<number>();
  @Output() createNewVersion = new EventEmitter<void>();

  nameDraft = '';
  editingName = false;
  invalidName = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title']) {
      this.nameDraft = this.title ?? '';
    }
    if (changes['startInEditMode'] && this.startInEditMode) {
      this.editingName = true;
      this.invalidName = false;
    }
  }

  @Output() saveNewPrompt = new EventEmitter<{
    title: string;
    documentTypeId: number;
  }>();

  onSaveNewPrompt(): void {
    const title = (this.nameDraft || '').trim();
    if (!title) {
      this.invalidName = true;
      return;
    }
    if (this.documentTypeId == null) {
      return;
    }
    this.invalidName = false;
    this.saveNewPrompt.emit({ title, documentTypeId: this.documentTypeId });
  }

  get docTypeLabel(): string {
    const dt = this.documentTypes.find((d) => d.id === this.documentTypeId);
    return dt?.name ?? 'Ovaj tip dokumenta je obrisan';
  }

  startEditName(): void {
    this.editingName = true;
    this.invalidName = false;
  }

  trySaveName(): void {
    const newName = (this.nameDraft || '').trim();
    if (!newName) {
      this.invalidName = true;
      return;
    }
    this.invalidName = false;
    this.editingName = false;
    this.savePrompt.emit({ name: newName });
  }

  cancelEditName(): void {
    this.editingName = false;
    this.invalidName = false;
    this.nameDraft = this.title ?? '';
  }

  onDeletePrompt(): void {
    this.deletePrompt.emit();
  }

  onCreateNewVersion(): void {
    this.createNewVersion.emit();
  }

  onDocTypeChanged(id: number): void {
    this.docTypeChanged.emit(+id);
  }
}
