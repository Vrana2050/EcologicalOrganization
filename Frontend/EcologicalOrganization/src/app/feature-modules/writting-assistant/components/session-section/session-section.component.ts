import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
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
export class SessionSectionComponent implements OnChanges {
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

  instructionText = '';
  editingTitle = false;
  titleDraft = '';
  invalidTitle = false;

  currentSeq = 0;
  maxSeq = 0;
  currentText = '';
  loadingIter = false;

  constructor(private sectionSvc: SessionSectionService) {}

  ngOnInit(): void {
    this.hydrateFromSection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section']) {
      this.hydrateFromSection();
    }
  }

  private hydrateFromSection(): void {
    const latestInstr =
      this.section?.latestIteration?.sectionInstruction?.text ?? '';
    this.instructionText = latestInstr;

    this.editingTitle = this.isNew || !!(this.section as any)._isNew;
    this.titleDraft = this.section?.name ?? '';

    const latest = this.section?.latestIteration;
    this.currentSeq = latest?.seqNo ?? 0;
    // max uzimamo iz overview-a (derivirano), fallback na latest seq
    this.maxSeq = (this.section?.maxSeqNo ?? 0) || (latest?.seqNo ?? 0);
    this.currentText = latest?.modelOutput?.generatedText ?? '';
  }

  get showIterationNav(): boolean {
    // ne prikazuj kad nema iteracija ili je 1/1
    return !!this.currentSeq && this.maxSeq > 1 && !this.isNew;
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
    if (this.section._isNew && !this.section.name) {
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

  setAfterGenerate(newIter: {
    id: number;
    seqNo: number;
    sessionSectionId: number;
    sectionInstruction?: {
      id: number;
      text: string;
      createdAt?: string | null;
    } | null;
    modelOutput?: { id: number; generatedText?: string | null } | null;
  }) {
    this.currentSeq = newIter.seqNo;
    this.maxSeq = Math.max(this.maxSeq || 0, newIter.seqNo);
    this.currentText = newIter.modelOutput?.generatedText ?? '';
    this.section.latestIteration = { ...newIter };
    this.section.maxSeqNo = this.maxSeq;
  }

  private fetch(seq: number) {
    this.loadingIter = true;
    this.sectionSvc.getIteration(this.section.id, seq).subscribe({
      next: (it) => {
        this.currentSeq = it.seqNo;
        this.currentText = it.modelOutput?.generatedText ?? '';
        this.section.latestIteration = { ...it };
        // maxSeq ostaje kakav je (dolazi iz overview-a ili se uveća posle generate-a)
        this.loadingIter = false;
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
