import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DocumentType } from 'src/app/feature-modules/prompt-admin/models/document-type.model';

@Component({
  selector: 'wa-session-header',
  templateUrl: './session-header.component.html',
  styleUrls: [
    '../../writing-assistant.styles.css',
    './session-header.component.css',
  ],
})
export class SessionHeaderComponent {
  @Output() saveTitle = new EventEmitter<string>();
  @Output() addSection = new EventEmitter<void>();
  @Output() globalInstructionChange = new EventEmitter<string>();
  @Output() documentTypeChange = new EventEmitter<number>();

  @Input() title = '';
  @Input() globalInstruction = '';
  @Input() documentTypes: DocumentType[] = [];
  @Input() documentTypeId: number | null = null;
  @Input() isTestSession = false;

  editingTitle = false;
  titleDraft = '';
  invalidTitle = false;

  startEdit() {
    this.editingTitle = true;
    this.titleDraft = this.title;
    this.invalidTitle = false;
  }

  trySave() {
    const newTitle = (this.titleDraft || '').trim();
    if (!newTitle) {
      this.invalidTitle = true;
      return;
    }
    this.invalidTitle = false;
    this.saveTitle.emit(newTitle);
    this.editingTitle = false;
  }

  get selectedDocType(): DocumentType | null {
    return this.documentTypes.find((d) => d.id === this.documentTypeId) ?? null;
  }

  onDocTypeChanged(val: string | number) {
    const id = +val;
    this.documentTypeChange.emit(id);
  }

  cancelEdit() {
    this.editingTitle = false;
    this.invalidTitle = false;
    this.titleDraft = this.title;
  }

  onGlobalInstructionInput(val: string) {
    this.globalInstructionChange.emit(val);
  }

  get isDefaultDocType(): boolean {
    return this.selectedDocType?.name === 'Default';
  }
}
