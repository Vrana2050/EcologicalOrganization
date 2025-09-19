import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ChatSession } from '../../models/chat-session.model';
import {
  SessionOverview,
  SessionSectionWithLatest,
} from '../../models/session-section.model';
import { ChatSessionService } from '../../services/chat-session.service';
import { SessionSectionService } from '../../services/session-section.service';
import { DocumentType } from 'src/app/feature-modules/prompt-admin/models/document-type.model';

@Component({
  selector: 'wa-session-editor',
  templateUrl: './session-editor.component.html',
  styleUrls: [
    '../../writing-assistant.styles.css',
    './session-editor.component.css',
  ],
})
export class SessionEditorComponent {
  @Input() session?: ChatSession;
  @Input() documentTypes: DocumentType[] = [];
  @Input() overview!: SessionOverview;

  @Output() sessionTitleChanged = new EventEmitter<{
    id: number;
    title: string;
  }>();

  @Output() documentTypeChanged = new EventEmitter<{
    id: number;
    documentTypeId: number;
  }>();

  loading = false;
  error?: string;

  constructor(
    private chatSessionService: ChatSessionService,
    private sectionService: SessionSectionService
  ) {}

  get isTestSession(): boolean {
    return !!this.session?.isTestSession;
  }

  onHeaderDocTypeChange(documentTypeId: number) {
    if (!this.session) return;
    this.documentTypeChanged.emit({ id: this.session.id, documentTypeId });
  }

  trackBySection = (_: number, s: any) => s._key || s.id;

  isNewSection(s: any): boolean {
    return !!s._isNew;
  }

  private fetchOverview(sessionId: number): void {
    this.loading = true;
    this.error = undefined;

    this.chatSessionService.getOverview(sessionId).subscribe({
      next: (ov) => {
        this.overview = ov;
        this.loading = false;
      },
      error: () => {
        this.error = 'Neuspešno učitavanje sesije.';
        this.loading = false;
      },
    });
  }

  onGlobalInstructionChange(newText: string) {
    if (!this.overview) return;

    this.overview = {
      ...this.overview,
      latestGlobalInstructionText: newText,
    };
  }

  onAddSection() {
    if (!this.overview || !this.session) return;

    const current = this.overview.sections ?? [];
    const maxPos = current.reduce(
      (max, s) => Math.max(max, s.position ?? 0),
      0
    );
    const newPos = maxPos + 1;

    const tmp: SessionSectionWithLatest & { _isNew: boolean; _key: string } = {
      id: 0,
      sessionId: this.session.id,
      name: '',
      position: newPos,
      latestIteration: null,
      _isNew: true,
      _key: 'tmp-' + Math.random().toString(36).slice(2),
    };

    this.overview = { ...this.overview, sections: [...current, tmp] };
  }

  onRemoveSection(section: SessionSectionWithLatest & any) {
    if (!this.overview) return;

    if (section._isNew || !section.id) {
      this.overview = {
        ...this.overview,
        sections: this.overview.sections.filter((s) => s !== section),
      };
      return;
    }

    this.sectionService.delete(section.id).subscribe({
      next: () => {
        this.overview = {
          ...this.overview!,
          sections: this.overview!.sections.filter((s) => s.id !== section.id),
        };
      },
      error: (err) => console.error('Greška pri brisanju sekcije', err),
    });
  }

  onGenerateSection(ev: {
    section: SessionSectionWithLatest;
    instructionText: string;
  }) {
    if (!this.overview) return;

    this.sectionService
      .generateIteration(ev.section.id, {
        sectionInstruction: ev.instructionText,
        globalInstruction: this.overview.latestGlobalInstructionText,
      })
      .subscribe({
        next: (iteration) => {
          const updatedSection: SessionSectionWithLatest = {
            ...ev.section,
            latestIteration: {
              id: iteration.id,
              seqNo: iteration.seq_no,
              sessionSectionId: iteration.session_section_id,
              sectionInstruction: iteration.section_instruction
                ? {
                    id: iteration.section_instruction.id,
                    text: iteration.section_instruction.text_,
                    createdAt: iteration.section_instruction.created_at ?? null,
                  }
                : null,
              modelOutput: iteration.model_output
                ? {
                    id: iteration.model_output.id,
                    generatedText:
                      iteration.model_output.generated_text ?? null,
                  }
                : null,
            },
            // ⬇ ključna linija: uvećaj max lokalno
            maxSeqNo: Math.max(ev.section.maxSeqNo ?? 0, iteration.seq_no),
          };

          this.overview = {
            ...this.overview!,
            sections: this.overview!.sections.map((s) =>
              s.id === ev.section.id ? updatedSection : s
            ),
          };
        },
        error: (err) => {
          console.error('Greška pri generisanju sadržaja', err);
        },
      });
  }

  onSaveSection(ev: { section: SessionSectionWithLatest & any; name: string }) {
    if (!this.session || !this.overview) return;

    const { section, name } = ev;
    const position = section.position ?? 1;

    if (!section.id || section._isNew) {
      this.sectionService
        .create({
          sessionId: this.session.id,
          name,
          position,
        })
        .subscribe({
          next: (created) => {
            section.id = created.id;
            section.sessionId = created.sessionId;
            section.name = created.name;
            section.position = created.position;
            delete section._isNew;
            delete section._key;
          },
          error: (err) => {
            console.error('Greška pri kreiranju sekcije', err);
          },
        });
    } else {
      this.sectionService.updateTitle(section.id, name).subscribe({
        next: (updated) => {
          section.name = updated.name;
        },
        error: (err) => {
          console.error('Greška pri ažuriranju naslova sekcije', err);
        },
      });
    }
  }

  onSaveSessionTitle(newTitle: string) {
    if (!this.session) return;

    this.chatSessionService
      .updateTitle(this.session.id, newTitle)
      .subscribe((updated) => {
        this.session!.title = updated.title ?? '';

        if (this.overview) {
          this.overview = { ...this.overview, title: updated.title ?? '' };
        }

        this.sessionTitleChanged.emit({
          id: this.session!.id,
          title: updated.title ?? '',
        });
      });
  }

  onSaveEdited(ev: { sectionId: number; seqNo: number; text: string }) {
    if (!this.overview) return;

    this.sectionService.saveDraft(ev.sectionId, ev.seqNo, ev.text).subscribe({
      next: (iter) => {
        // imutabilno ažuriraj overview
        this.overview = {
          ...this.overview!,
          sections: this.overview!.sections.map((s) => {
            if (s.id !== ev.sectionId) return s;

            const updatedLatest = {
              id: iter.id,
              seqNo: iter.seqNo,
              sessionSectionId: iter.sessionSectionId,
              sectionInstruction: iter.sectionInstruction
                ? {
                    id: iter.sectionInstruction.id,
                    text: iter.sectionInstruction.text,
                    createdAt: iter.sectionInstruction.createdAt ?? null,
                  }
                : null,
              modelOutput: iter.modelOutput
                ? {
                    id: iter.modelOutput.id,
                    generatedText: iter.modelOutput.generatedText ?? null,
                  }
                : null,
              sectionDraft: iter.sectionDraft
                ? {
                    id: iter.sectionDraft.id,
                    content: iter.sectionDraft.content ?? null,
                  }
                : null,
            };

            return { ...s, latestIteration: updatedLatest };
          }),
        };
        // Child dobija novi Input i sam resetuje status kroz ngOnChanges/hydrateFromSection
      },
      error: (err) => {
        console.error('Greška pri čuvanju drafta', err);
      },
    });
  }
}
