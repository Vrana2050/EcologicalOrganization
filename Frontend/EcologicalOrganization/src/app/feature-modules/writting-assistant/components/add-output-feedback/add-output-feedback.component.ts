import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CreateOutputFeedback } from '../../models/output-feedback.model';

@Component({
  selector: 'wa-add-output-feedback',
  templateUrl: './add-output-feedback.component.html',
  styleUrls: [
    './add-output-feedback.component.css',
    '../../writing-assistant.styles.css',
  ],
})
export class AddOutputFeedbackComponent {
  @Input() modelOutputId!: number;
  @Input() sectionName: string = 'Sekcija';
  @Input() seqNo: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateOutputFeedback>();

  ratingValue: number | null = null;
  commentText: string = '';
  saving = false;

  cancel() {
    if (!this.saving) this.close.emit();
  }
  backdropClick() {
    this.cancel();
  }

  submit() {
    if (!this.modelOutputId || !this.ratingValue) return;
    const payload: CreateOutputFeedback = {
      modelOutputId: this.modelOutputId,
      ratingValue: this.ratingValue,
      commentText: this.commentText?.trim() || null,
    };
    this.submitted.emit(payload);
  }

  @HostListener('document:keydown.escape') onEsc() {
    this.cancel();
  }

  autoGrow(evt?: Event): void {
    const el = evt?.target as HTMLTextAreaElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.overflowY = 'hidden';
    el.style.height = el.scrollHeight + 'px';
  }

  hoverRating: number = 0;

  setRating(value: number) {
    this.ratingValue = value;
  }
}
