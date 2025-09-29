import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  SessionOverview,
  SessionSectionWithLatest,
} from '../../models/session-section.model';
import {
  DocumentReportService,
  SectionSelection,
} from '../../services/document-report.service';

@Component({
  selector: 'wa-preview-document',
  templateUrl: './preview-document.component.html',
  styleUrls: ['./preview-document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewDocumentComponent {
  @Input() title: string = '';
  @Input() overview!: SessionOverview;
  @Input() sessionId!: number; // ⬅️ NOVO

  @Output() close = new EventEmitter<void>();

  downloading = false; // (opciono) UI state

  constructor(private docReport: DocumentReportService) {}

  get sections(): SessionSectionWithLatest[] {
    const arr = this.overview?.sections ?? [];
    return [...arr].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  getText(s: SessionSectionWithLatest): string {
    const it = s.latestIteration;
    return it?.sectionDraft?.content ?? it?.modelOutput?.generatedText ?? '';
  }

  trackById = (_: number, s: SessionSectionWithLatest) => s.id;

  downloadPdf(): void {
    if (!this.sessionId || !this.overview) return;

    const selections: SectionSelection[] = (this.overview.sections || [])
      .filter((s) => !!s.id)
      .map((s) => ({
        section_id: s.id,
        seq_no: s.latestIteration?.seqNo ?? undefined,
      }));

    const effectiveTitle = this.title || this.overview.title || 'Dokument';
    this.downloading = true;

    this.docReport
      .downloadSessionPreviewPdf(this.sessionId, effectiveTitle, selections)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = (effectiveTitle || 'dokument') + '.pdf';
          a.click();
          window.URL.revokeObjectURL(url);
          this.downloading = false;
        },
        error: (err) => {
          console.error('Greška pri generisanju PDF-a', err);
          alert('Greška pri generisanju PDF-a.');
          this.downloading = false;
        },
      });
  }
}
