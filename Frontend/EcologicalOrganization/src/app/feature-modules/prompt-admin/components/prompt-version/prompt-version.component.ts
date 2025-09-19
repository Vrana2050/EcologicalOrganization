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
import { ChatSessionService } from 'src/app/feature-modules/writting-assistant/services/chat-session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-prompt-version',
  templateUrl: './prompt-version.component.html',
  styleUrls: [
    '../../prompt-admin.styles.css',
    './prompt-version.component.css',
  ],
})
export class PromptVersionComponent implements OnChanges, OnDestroy {
  constructor(
    private chatSessionService: ChatSessionService,
    private router: Router
  ) {}

  @Input() version: PromptVersion | null = null;

  @Output() saveBasicInfo = new EventEmitter<{
    versionId: number;
    name: string;
    description: string;
  }>();
  @Output() savePromptText = new EventEmitter<{
    versionId: number;
    promptText: string;
  }>();
  @Output() setActive = new EventEmitter<number>();
  @Output() deletePromptVersion = new EventEmitter<number>();

  @Output() saveNewVersion = new EventEmitter<{
    promptId: number;
    name: string;
    description: string;
    promptText: string;
  }>();

  nameDraft = '';
  descriptionDraft = '';
  promptTextDraft = '';

  statusMessageBasic: string | null = null;
  statusTypeBasic: 'unsaved' | 'saved' | null = null;
  statusMessageText: string | null = null;
  statusTypeText: 'unsaved' | 'saved' | null = null;

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

  get isNew(): boolean {
    return !!(this.version?.isNew || this.version?.id === -1);
  }

  onBasicChange(): void {
    if (!this.version || this.isNew) return;
    const changed =
      this.nameDraft.trim() !== (this.version.name ?? '') ||
      this.descriptionDraft.trim() !== (this.version.description ?? '');
    if (changed) {
      this.clearBasicTimer();
      this.statusMessageBasic = 'Promene nisu sačuvane';
      this.statusTypeBasic = 'unsaved';
    } else {
      this.statusMessageBasic = null;
      this.statusTypeBasic = null;
    }
  }

  onTextChange(): void {
    if (!this.version) return;
    if (this.isNew) return;
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

  onSaveBasicInfo(): void {
    if (!this.version || this.isNew) return;
    this.saveBasicInfo.emit({
      versionId: this.version.id,
      name: (this.nameDraft || '').trim(),
      description: (this.descriptionDraft || '').trim(),
    });
    this.statusMessageBasic = 'Promene uspešno sačuvane';
    this.statusTypeBasic = 'saved';
    this.startBasicHideTimer();
  }

  onSavePromptText(): void {
    if (!this.version || this.isNew) return;
    this.savePromptText.emit({
      versionId: this.version.id,
      promptText: (this.promptTextDraft || '').trim(),
    });
    this.statusMessageText = 'Promene uspešno sačuvane';
    this.statusTypeText = 'saved';
    this.startTextHideTimer();
  }

  onSaveNewVersion(): void {
    if (!this.version) return;

    this.saveNewVersion.emit({
      promptId: this.version.promptId,
      name: (this.nameDraft || '').trim(),
      description: (this.descriptionDraft || '').trim(),
      promptText: (this.promptTextDraft || '').trim(),
    });
  }

  onSetActive(): void {
    if (!this.version || this.isNew) return;
    this.setActive.emit(this.version.id);
  }

  onDeletePromptVersion(): void {
    if (!this.version || this.isNew) return;
    this.deletePromptVersion.emit(this.version.id);
  }

  private startBasicHideTimer(): void {
    this.clearBasicTimer();
    this.basicHideTimer = setTimeout(() => {
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

  @Output() goToTest = new EventEmitter<number>();

  onGoToTestPage(): void {
    if (!this.version || this.isNew) return;

    this.goToTest.emit(this.version.id);
  }
}
