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

@Component({
  selector: 'pa-prompt-editor',
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['../../prompt-admin.styles.css', './prompt-editor.component.css'],
})
export class PromptEditorComponent implements OnChanges {
  /** Aktivni prompt */
  @Input() prompt: Prompt | null = null;

  /** Selektovana verzija */
  @Input() selectedVersion: PromptVersion | null = null;

  /** (opciono) naziv tipa dokumenta za pilulu u headeru */
  @Input() documentTypeName: string | null | undefined = null;

  /** Eventi prema parent komponenti (AdminPage) */
  @Output() savePrompt = new EventEmitter<{ name: string }>();

  // Razdvojeni eventovi za verziju:
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

  loading = false;
  error?: string;

  ngOnChanges(changes: SimpleChanges): void {
    // nothing to derive right now
  }

  /** --- Header handlers --- */
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

  /** --- Version handlers (prosleđuju xp-prompt-version emitove parentu) --- */
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
