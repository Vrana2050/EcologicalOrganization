import { Component, Input } from '@angular/core';
import { AnalyticsOut } from '../../models/analytics.model';

@Component({
  selector: 'xp-prompt-analytics',
  templateUrl: './prompt-analytics.component.html',
  styleUrls: ['./prompt-analytics.component.css'],
})
export class PromptAnalyticsComponent {
  @Input() data: AnalyticsOut | null = null;

  msToSeconds(ms: number | null | undefined): number | null {
    if (ms == null) return null;
    return Math.round((ms / 1000) * 100) / 100;
  }
}
