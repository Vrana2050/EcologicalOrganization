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

@Component({
  selector: 'wa-preview-document',
  templateUrl: './preview-document.component.html',
  styleUrls: ['./preview-document.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewDocumentComponent {
  @Input() title: string = '';
  @Input() overview!: SessionOverview;

  @Output() close = new EventEmitter<void>();

  get sections(): SessionSectionWithLatest[] {
    const arr = this.overview?.sections ?? [];
    return [...arr].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  getText(s: SessionSectionWithLatest): string {
    const it = s.latestIteration;
    return it?.sectionDraft?.content ?? it?.modelOutput?.generatedText ?? '';
  }

  trackById = (_: number, s: SessionSectionWithLatest) => s.id;
}
