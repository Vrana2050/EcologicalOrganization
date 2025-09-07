import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatSession } from '../../models/chat-session.model';
import {
  SessionOverview,
  SessionSectionWithLatest,
} from '../../models/session-section.model';
import { ChatSessionService } from '../../services/chat-session.service';
import { SessionSectionService } from '../../services/session-section.service';

@Component({
  selector: 'wa-session-editor',
  templateUrl: './session-editor.component.html',
  styleUrls: [
    '../../writing-assistant.styles.css',
    './session-editor.component.css',
  ],
})
export class SessionEditorComponent implements OnChanges {
  @Input() session?: ChatSession;

  loading = false;
  error?: string;
  overview?: SessionOverview;

  trackBySection = (_: number, s: any) => s._key || s.id;

  isNewSection(s: any): boolean {
    return !!s._isNew;
  }

  constructor(
    private chatSessionService: ChatSessionService,
    private sectionService: SessionSectionService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session'] && this.session?.id) {
      this.fetchOverview(this.session.id);
    }
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

  // Header events
  onGlobalInstructionChange(text: string) {
    if (!this.overview) return;
    this.overview = { ...this.overview, latestGlobalInstructionText: text };
  }
  onGenerateAll() {
    if (!this.session) return;
    console.log(
      'Generate ALL for session',
      this.session.id,
      this.overview?.latestGlobalInstructionText
    );
  }

  // --- NEW: Add section flow ---
  onAddSection() {
    if (!this.overview || !this.session) return;

    const current = this.overview.sections ?? [];
    const maxPos = current.reduce(
      (max, s) => Math.max(max, s.position ?? 0),
      0
    );
    const newPos = maxPos + 1;

    const tmp: SessionSectionWithLatest & { _isNew: boolean; _key: string } = {
      id: 0, // još nije sačuvano
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

  onGenerateSection(section: SessionSectionWithLatest) {
    console.log('Generate SECTION', section.id);
    // this.sectionService.generateIteration(section.id, { instruction_text: '...' }).subscribe(...)
  }

  onSaveSection(ev: { section: SessionSectionWithLatest & any; name: string }) {
    if (!this.session || !this.overview) return;

    const { section, name } = ev;
    const position = section.position ?? 1;

    // ako je nova (nema id ili ima _isNew flag)
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
}
