import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Prompt } from '../../models/prompt.model';

@Component({
  selector: 'pa-prompt-header',
  templateUrl: './prompt-header.component.html',
  styleUrls: ['../../prompt-admin.styles.css', './prompt-header.component.css'],
})
export class PromptHeaderComponent implements OnChanges {
  @Input() prompt: Prompt | null = null;
  @Input() documentTypeName: string | null | undefined = null;

  @Output() save = new EventEmitter<{ name: string }>();
  @Output() deletePrompt = new EventEmitter<void>();

  nameDraft = '';

  editingName = false;
  invalidName = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prompt']) {
      this.nameDraft = this.prompt?.title ?? '';
    }
  }

  get docTypeLabel(): string {
    return this.documentTypeName || 'Default';
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

    this.save.emit({ name: newName });
  }

  cancelEditName(): void {
    this.editingName = false;
    this.invalidName = false;
    this.nameDraft = this.prompt?.title ?? '';
  }

  onDeletePrompt(): void {
    this.deletePrompt.emit();
  }
}
