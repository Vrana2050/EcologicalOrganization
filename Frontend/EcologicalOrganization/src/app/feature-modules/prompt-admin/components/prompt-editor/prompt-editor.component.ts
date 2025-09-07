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

  /** Eventi prema parent komponenti */
  @Output() savePrompt = new EventEmitter<{ name: string }>();
  @Output() saveVersion = new EventEmitter<{
    versionId: number;
    name: string;
    description: string;
    promptText: string;
  }>();
  @Output() setActiveVersion = new EventEmitter<number>();
  @Output() deletePrompt = new EventEmitter<number>();

  promptTextDraft = '';

  loading = false;
  error?: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedVersion']) {
      this.promptTextDraft = this.selectedVersion?.promptText ?? '';
    }
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

  /** --- Version handlers --- */
  onVersionSave(ev: { name: string; description: string }): void {
    if (!this.selectedVersion) return;
    this.saveVersion.emit({
      versionId: this.selectedVersion.id,
      name: (ev.name || '').trim(),
      description: (ev.description || '').trim(),
      promptText: (this.promptTextDraft || '').trim(),
    });
  }

  onVersionSetActive(): void {
    if (!this.selectedVersion) return;
    this.setActiveVersion.emit(this.selectedVersion.id);
  }

  onHeaderDeletePromptVersion(): void {
    this.onHeaderDeletePrompt();
  }

  /** --- Tekst verzije --- */
  onTextInput(val: string): void {
    this.promptTextDraft = val;
  }
}
