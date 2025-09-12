import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
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
export class PromptVersionComponent implements OnChanges, OnDestroy {
  @Input() version: PromptVersion | null = null;

  /** Emit za PATCH basic-info (name + description) */
  @Output() saveBasicInfo = new EventEmitter<{
    versionId: number;
    name: string;
    description: string;
  }>();

  /** Emit za PATCH prompt-text (prompt_text) */
  @Output() savePromptText = new EventEmitter<{
    versionId: number;
    promptText: string;
  }>();

  @Output() setActive = new EventEmitter<number>();
  @Output() deletePromptVersion = new EventEmitter<number>();

  /** Draftovi input polja */
  nameDraft = '';
  descriptionDraft = '';
  promptTextDraft = '';

  /** Status indikatori */
  statusMessageBasic: string | null = null;
  statusTypeBasic: 'unsaved' | 'saved' | null = null;

  statusMessageText: string | null = null;
  statusTypeText: 'unsaved' | 'saved' | null = null;

  /** Tajmeri za auto-hide poruka o uspehu */
  private basicHideTimer: any = null;
  private textHideTimer: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['version']) {
      const prevId = changes['version'].previousValue?.id;
      const currId = changes['version'].currentValue?.id;

      if (prevId !== currId) {
        this.nameDraft = this.version?.name ?? '';
        this.descriptionDraft = this.version?.description ?? '';
        this.promptTextDraft = this.version?.promptText ?? '';

        // reset statusa
        this.clearBasicTimer();
        this.clearTextTimer();
        this.statusMessageBasic = null;
        this.statusTypeBasic = null;
        this.statusMessageText = null;
        this.statusTypeText = null;
      }
    }
  }

  ngOnDestroy(): void {
    this.clearBasicTimer();
    this.clearTextTimer();
  }

  get isDisabled(): boolean {
    return !this.version;
  }

  get isActive(): boolean {
    return !!this.version?.isActive;
  }

  /** Promene u basic info poljima */
  onBasicChange(): void {
    if (!this.version) return;

    const changed =
      this.nameDraft.trim() !== (this.version.name ?? '') ||
      this.descriptionDraft.trim() !== (this.version.description ?? '');

    if (changed) {
      this.clearBasicTimer(); // ako je bio tajmer za "saved", ne diraj novu poruku
      this.statusMessageBasic = 'Promene nisu sačuvane';
      this.statusTypeBasic = 'unsaved';
    } else {
      this.statusMessageBasic = null;
      this.statusTypeBasic = null;
    }
  }

  /** Promene u prompt text polju */
  onTextChange(): void {
    if (!this.version) return;

    const changed =
      this.promptTextDraft.trim() !== (this.version.promptText ?? '');

    if (changed) {
      this.clearTextTimer();
      this.statusMessageText = 'Promene nisu sačuvane';
      this.statusTypeText = 'unsaved';
    } else {
      this.statusMessageText = null;
      this.statusTypeText = null;
    }
  }

  /** Snimi basic info (optimistički) */
  onSaveBasicInfo(): void {
    if (!this.version) return;

    this.saveBasicInfo.emit({
      versionId: this.version.id,
      name: (this.nameDraft || '').trim(),
      description: (this.descriptionDraft || '').trim(),
    });

    this.statusMessageBasic = 'Promene uspešno sačuvane';
    this.statusTypeBasic = 'saved';
    this.startBasicHideTimer();
  }

  /** Snimi prompt text (optimistički) */
  onSavePromptText(): void {
    if (!this.version) return;

    this.savePromptText.emit({
      versionId: this.version.id,
      promptText: (this.promptTextDraft || '').trim(),
    });

    this.statusMessageText = 'Promene uspešno sačuvane';
    this.statusTypeText = 'saved';
    this.startTextHideTimer();
  }

  onSetActive(): void {
    if (!this.version) return;
    this.setActive.emit(this.version.id);
  }

  onDeletePromptVersion(): void {
    if (!this.version) return;
    this.deletePromptVersion.emit(this.version.id);
  }

  /** Helpers za auto-hide */
  private startBasicHideTimer(): void {
    this.clearBasicTimer();
    this.basicHideTimer = setTimeout(() => {
      // ukloni poruku samo ako je još uvek "saved"
      if (this.statusTypeBasic === 'saved') {
        this.statusMessageBasic = null;
        this.statusTypeBasic = null;
      }
    }, 2000);
  }

  private startTextHideTimer(): void {
    this.clearTextTimer();
    this.textHideTimer = setTimeout(() => {
      if (this.statusTypeText === 'saved') {
        this.statusMessageText = null;
        this.statusTypeText = null;
      }
    }, 2000);
  }

  private clearBasicTimer(): void {
    if (this.basicHideTimer) {
      clearTimeout(this.basicHideTimer);
      this.basicHideTimer = null;
    }
  }

  private clearTextTimer(): void {
    if (this.textHideTimer) {
      clearTimeout(this.textHideTimer);
      this.textHideTimer = null;
    }
  }
}
