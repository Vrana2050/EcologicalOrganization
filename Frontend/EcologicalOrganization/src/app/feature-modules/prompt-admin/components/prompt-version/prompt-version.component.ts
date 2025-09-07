import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { PromptVersion } from '../../models/prompt-version.model';

@Component({
  selector: 'xp-prompt-version',
  templateUrl: './prompt-version.component.html',
  styleUrls: [
    '../../prompt-admin.styles.css',
    './prompt-version.component.css',
  ],
})
export class PromptVersionComponent implements OnChanges {
  @Input() version: PromptVersion | null = null;

  /** Eventi koje propagira roditelju */
  @Output() save = new EventEmitter<{
    versionId: number;
    name: string;
    description: string;
    promptText: string;
  }>();

  @Output() saveAsNew = new EventEmitter<{
    name: string;
    description: string;
    promptText: string;
  }>();

  @Output() setActive = new EventEmitter<number>();
  @Output() deletePrompt = new EventEmitter<void>();

  /** Draftovi input polja */
  nameDraft = '';
  descriptionDraft = '';
  promptTextDraft = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['version']) {
      this.nameDraft = this.version?.name ?? '';
      this.descriptionDraft = this.version?.description ?? '';
      this.promptTextDraft = this.version?.promptText ?? '';
    }
  }

  get isDisabled(): boolean {
    return !this.version;
  }

  get isActive(): boolean {
    return !!this.version?.isActive;
  }

  onSave(): void {
    if (!this.version) return;
    this.save.emit({
      versionId: this.version.id,
      name: (this.nameDraft || '').trim(),
      description: (this.descriptionDraft || '').trim(),
      promptText: (this.promptTextDraft || '').trim(),
    });
  }

  onSetActive(): void {
    if (!this.version) return;
    this.setActive.emit(this.version.id);
  }

  onDeletePrompt(): void {
    this.deletePrompt.emit();
  }
}
