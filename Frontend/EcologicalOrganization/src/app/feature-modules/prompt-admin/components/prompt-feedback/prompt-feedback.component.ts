import { Component, Input } from '@angular/core';
import { AnalyticsOut } from '../../models/analytics.model';

@Component({
  selector: 'xp-prompt-feedback',
  templateUrl: './prompt-feedback.component.html',
  styleUrls: ['./prompt-feedback.component.css'],
})
export class PromptFeedbackComponent {
  @Input() data: AnalyticsOut | null = null;
}
