import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Prompt } from '../../models/prompt.model';
import { PromptVersion } from '../../models/prompt-version.model';
import { DocumentType } from '../../models/document-type.model';
import { DocumentTypeService } from '../../services/document-type.service';

@Component({
  selector: 'pa-prompt-editor',
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['../../prompt-admin.styles.css', './prompt-editor.component.css'],
})
export class PromptEditorComponent implements OnChanges {
  @Input() prompt: Prompt | null = null;
  @Input() selectedVersion: PromptVersion | null = null;

  @Output() savePrompt = new EventEmitter<{ name: string }>();
  @Output() saveVersionBasicInfo = new EventEmitter<{
    versionId: number;
    name: string;
    description: string;
  }>();
  @Output() saveVersionPromptText = new EventEmitter<{
    versionId: number;
    promptText: string;
  }>();
  @Output() setActiveVersion = new EventEmitter<number>();
  @Output() deletePrompt = new EventEmitter<number>();
  @Output() deletePromptVersion = new EventEmitter<number>();
  @Output() createNewVersion = new EventEmitter<void>();

  @Output() saveNewVersion = new EventEmitter<{
    promptId: number;
    name: string;
    description: string;
    promptText: string;
  }>();

  onHeaderCreateNewVersion(): void {
    this.createNewVersion.emit();
  }

  @Output() saveNewPrompt = new EventEmitter<{
    title: string;
    documentTypeId: number;
  }>();

  onHeaderSaveNewPrompt(ev: { title: string; documentTypeId: number }): void {
    this.saveNewPrompt.emit(ev);
  }

  onSaveNewVersion(ev: {
    promptId: number;
    name: string;
    description: string;
    promptText: string;
  }): void {
    console.log('[editor] got saveNewVersion', ev);
    this.saveNewVersion.emit(ev);
  }

  documentTypes: DocumentType[] = [];
  loading = false;
  error?: string;

  constructor(private documentTypeService: DocumentTypeService) {}

  ngOnInit(): void {
    this.loadDocumentTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  onHeaderDocTypeChanged(newId: number): void {
    if (!this.prompt) return;
    this.prompt = { ...this.prompt, documentTypeId: newId };
    if (this.prompt.id === -1) return;
  }

  loadDocumentTypes(): void {
    this.documentTypeService.list().subscribe({
      next: (page) => {
        this.documentTypes = page.items;
      },
      error: (err) => {
        console.error('Error loading document types:', err);
      },
    });
  }

  get documentTypeName(): string {
    if (!this.prompt?.documentTypeId) return 'Default';
    const dt = this.documentTypes.find(
      (d) => d.id === this.prompt!.documentTypeId
    );
    return dt ? dt.name : 'Default';
  }

  onHeaderSavePrompt(ev: { name: string }): void {
    if (!this.prompt) return;
    this.savePrompt.emit({
      name: (ev.name || '').trim(),
    });
  }

  onHeaderDeletePrompt(): void {
    if (!this.prompt) return;
    this.deletePrompt.emit(this.prompt.id);
  }

  onSaveVersionBasicInfo(ev: {
    versionId: number;
    name: string;
    description: string;
  }): void {
    this.saveVersionBasicInfo.emit({
      versionId: ev.versionId,
      name: (ev.name || '').trim(),
      description: (ev.description || '').trim(),
    });
  }

  onSaveVersionPromptText(ev: { versionId: number; promptText: string }): void {
    this.saveVersionPromptText.emit({
      versionId: ev.versionId,
      promptText: (ev.promptText || '').trim(),
    });
  }

  onSetActiveVersion(versionId: number): void {
    this.setActiveVersion.emit(versionId);
  }

  onDeletePromptVersion(versionId: number): void {
    this.deletePromptVersion.emit(versionId);
  }
}
