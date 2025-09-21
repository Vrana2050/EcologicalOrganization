type IterationPayload = {
  id: number;
  seqNo: number;
  sessionSectionId: number;
  sectionInstruction?: {
    id: number;
    text: string;
    createdAt?: string | null;
  } | null;
  modelOutput?: { id: number; generatedText?: string | null } | null;
  sectionDraft?: { id: number; content?: string | null } | null;
};

import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { SessionSectionService } from '../../services/session-section.service';
import { SessionSectionWithLatest } from '../../models/session-section.model';

@Component({
  selector: 'wa-session-section',
  templateUrl: './session-section.component.html',
  styleUrls: [
    '../../writing-assistant.styles.css',
    './session-section.component.css',
  ],
})
export class SessionSectionComponent implements OnInit, OnChanges {
  @Input() section!: SessionSectionWithLatest & {
    _isNew?: boolean;
    _key?: string;
  };
  @Input() isNew = false;

  @Output() save = new EventEmitter<{
    section: SessionSectionWithLatest;
    name: string;
  }>();
  @Output() remove = new EventEmitter<SessionSectionWithLatest>();
  @Output() generate = new EventEmitter<{
    section: SessionSectionWithLatest;
    instructionText: string;
  }>();
  @Output() saveEdited = new EventEmitter<{
    sectionId: number;
    seqNo: number;
    text: string;
  }>();
  @Output() iterationChanged = new EventEmitter<{
    sectionId: number;
    iteration: IterationPayload;
  }>();

  @ViewChild('resultArea') resultArea!: ElementRef<HTMLTextAreaElement>;

  instructionText = '';
  editingTitle = false;
  titleDraft = '';
  invalidTitle = false;

  currentSeq = 0;
  maxSeq = 0;
  loadingIter = false;

  resultDraft = '';
  statusMessageResult: string | null = null;
  statusTypeResult: 'unsaved' | 'saved' | null = null;
  private resultTimer: any = null;

  constructor(private sectionSvc: SessionSectionService) {}

  ngOnInit(): void {
    this.hydrateFromSection();
    setTimeout(() => this.autoGrowFromRef(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section']) {
      this.hydrateFromSection();
      setTimeout(() => this.autoGrowFromRef(), 0);
    }
  }

  autoGrow(evt?: Event): void {
    const el =
      (evt?.target as HTMLTextAreaElement) ?? this.resultArea?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.overflowY = 'hidden';
    el.style.height = el.scrollHeight + 'px';
  }

  private autoGrowFromRef(): void {
    if (this.resultArea?.nativeElement) this.autoGrow();
  }

  private getLatestInstruction(): string {
    return this.section?.latestIteration?.sectionInstruction?.text ?? '';
  }

  private getLatestResultText(): string {
    const it = this.section?.latestIteration;
    return it?.sectionDraft?.content ?? it?.modelOutput?.generatedText ?? '';
  }

  private resetStatus(): void {
    this.clearResultTimer();
    this.statusMessageResult = null;
    this.statusTypeResult = null;
  }

  private hydrateFromSection(): void {
    const latest = this.section?.latestIteration;

    this.instructionText = this.getLatestInstruction();
    this.editingTitle = this.isNew || !!(this.section as any)._isNew;
    this.titleDraft = this.section?.name ?? '';

    this.currentSeq = latest?.seqNo ?? 0;
    this.maxSeq = this.section?.maxSeqNo ?? latest?.seqNo ?? 0;

    this.resultDraft = this.getLatestResultText();
    this.resetStatus();
  }

  get showIterationNav(): boolean {
    return !!this.currentSeq && this.maxSeq > 1 && !this.isNew;
  }

  get hasUnsavedResult(): boolean {
    const backendText = this.getLatestResultText();
    return (this.resultDraft || '').trim() !== (backendText || '').trim();
  }

  startEditTitle() {
    this.editingTitle = true;
    this.titleDraft = this.section?.name ?? '';
    this.invalidTitle = false;
  }

  trySaveTitle() {
    const name = (this.titleDraft || '').trim();
    if (!name) {
      this.invalidTitle = true;
      return;
    }
    this.invalidTitle = false;
    this.save.emit({ section: this.section, name });
    this.editingTitle = false;
  }

  cancelEditTitle() {
    if ((this.section as any)._isNew && !this.section.name) {
      this.titleDraft = 'Sekcija';
      this.trySaveTitle();
      return;
    }
    this.editingTitle = false;
    this.invalidTitle = false;
    this.titleDraft = this.section?.name ?? '';
  }

  onRemove() {
    this.remove.emit(this.section);
  }

  onGenerate() {
    this.generate.emit({
      section: this.section,
      instructionText: this.instructionText,
    });
  }

  onResultChange() {
    this.autoGrowFromRef();
    if (this.currentSeq === 0) return;
    if (this.hasUnsavedResult) {
      this.clearResultTimer();
      this.statusMessageResult = 'Promene nisu sačuvane';
      this.statusTypeResult = 'unsaved';
    } else {
      this.statusMessageResult = null;
      this.statusTypeResult = null;
    }
  }

  onSaveResult() {
    if (this.currentSeq === 0 || !this.hasUnsavedResult) return;
    this.saveEdited.emit({
      sectionId: this.section.id,
      seqNo: this.currentSeq,
      text: (this.resultDraft || '').trim(),
    });
  }

  markResultSaved() {
    this.statusMessageResult = 'Promene uspešno sačuvane';
    this.statusTypeResult = 'saved';
    this.startResultHideTimer();
  }

  private startResultHideTimer(): void {
    this.clearResultTimer();
    this.resultTimer = setTimeout(() => {
      if (this.statusTypeResult === 'saved') {
        this.statusMessageResult = null;
        this.statusTypeResult = null;
      }
    }, 2000);
  }

  private clearResultTimer(): void {
    if (this.resultTimer) {
      clearTimeout(this.resultTimer);
      this.resultTimer = null;
    }
  }

  private fetch(seq: number) {
    this.loadingIter = true;
    this.sectionSvc.getIteration(this.section.id, seq).subscribe({
      next: (it) => {
        this.currentSeq = it.seqNo;
        this.section.latestIteration = { ...it };
        this.resultDraft = this.getLatestResultText();
        this.resetStatus();
        this.loadingIter = false;

        setTimeout(() => this.autoGrowFromRef(), 0);

        this.iterationChanged.emit({
          sectionId: this.section.id,
          iteration: {
            id: it.id,
            seqNo: it.seqNo,
            sessionSectionId: it.sessionSectionId,
            sectionInstruction: it.sectionInstruction
              ? { ...it.sectionInstruction }
              : null,
            modelOutput: it.modelOutput ? { ...it.modelOutput } : null,
            sectionDraft: it.sectionDraft ? { ...it.sectionDraft } : null,
          },
        });
      },
      error: () => (this.loadingIter = false),
    });
  }

  goPrev() {
    if (this.currentSeq > 1) this.fetch(this.currentSeq - 1);
  }
  goNext() {
    if (this.currentSeq < this.maxSeq) this.fetch(this.currentSeq + 1);
  }
}
