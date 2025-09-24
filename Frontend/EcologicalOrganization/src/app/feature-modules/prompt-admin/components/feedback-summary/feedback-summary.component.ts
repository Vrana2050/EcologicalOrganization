import { Component, Input } from '@angular/core';
import { AnalyticsOut } from '../../models/analytics.model';

@Component({
  selector: 'xp-feedback-summary',
  templateUrl: './feedback-summary.component.html',
  styleUrls: ['./feedback-summary.component.css'],
})
export class FeedbackSummaryComponent {
  @Input() data: AnalyticsOut | null = null;

  starPct(val: number | null | undefined): number {
    const v = typeof val === 'number' ? Math.max(0, Math.min(5, val)) : 0;
    return (v / 5) * 100;
  }

  // histogram podaci 5..1
  get rows() {
    const d = this.data;
    const items = [
      { rating: 5, count: d?.ratingC5 ?? 0 },
      { rating: 4, count: d?.ratingC4 ?? 0 },
      { rating: 3, count: d?.ratingC3 ?? 0 },
      { rating: 2, count: d?.ratingC2 ?? 0 },
      { rating: 1, count: d?.ratingC1 ?? 0 },
    ];
    const max = Math.max(1, ...items.map((i) => i.count));
    return items.map((i) => ({
      ...i,
      pct: (i.count / max) * 100,
    }));
  }
}
