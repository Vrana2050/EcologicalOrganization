import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { OutputFeedbackItem } from '../../models/feedback.model';

@Component({
  selector: 'xp-prompt-feedback',
  templateUrl: './prompt-feedback.component.html',
  styleUrls: ['./prompt-feedback.component.css'],
})
export class PromptFeedbackComponent {
  @Input() items: OutputFeedbackItem[] = [];
  @Input() page = 1;
  @Input() perPage = 5;
  @Input() total = 0;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  loadingDetailsId?: number;

  pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.perPage));
  }

  goPrev(): void {
    this.prev.emit();
  }

  goNext(): void {
    this.next.emit();
  }

  constructor(private feedback: FeedbackService) {}

  toggleDetails(it: OutputFeedbackItem): void {
    it._expanded = !it._expanded;
    if (it._expanded && !it.details) {
      this.loadingDetailsId = it.id;
      this.feedback.getDetails(it.id).subscribe({
        next: (full) => {
          it.details = full.details ?? null;
          this.loadingDetailsId = undefined;
        },
        error: (err) => {
          console.error('[FE] feedback details', err);
          this.loadingDetailsId = undefined;
        },
      });
    }
  }
}
