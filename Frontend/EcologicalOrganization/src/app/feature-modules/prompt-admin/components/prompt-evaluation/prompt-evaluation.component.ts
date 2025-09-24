import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsOut } from '../../models/analytics.model';

type ScopeMode = 'prompt' | 'version';
type SectionTab = 'feedback' | 'analytics';

@Component({
  selector: 'xp-prompt-evaluation',
  templateUrl: './prompt-evaluation.component.html',
  styleUrls: ['./prompt-evaluation.component.css'],
})
export class PromptEvaluationComponent implements OnChanges {
  @Input() promptId: number | null = null;
  @Input() versionId: number | null = null;

  sectionTab: SectionTab = 'analytics';
  scopeMode: ScopeMode = 'prompt';
  loading = false;
  error?: string;

  data: AnalyticsOut | null = null;

  constructor(private analytics: AnalyticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['promptId'] && this.promptId) {
      this.scopeMode = 'prompt';
      if (this.sectionTab === 'analytics') this.fetchPrompt();
    }
    if (
      this.sectionTab === 'analytics' &&
      this.scopeMode === 'version' &&
      changes['versionId'] &&
      this.versionId
    ) {
      this.fetchVersion();
    }
  }

  onSectionSwitch(tab: SectionTab): void {
    if (this.sectionTab === tab) return;
    this.sectionTab = tab;

    if (tab === 'analytics') {
      if (this.scopeMode === 'prompt') this.fetchPrompt();
      else this.fetchVersion();
    }
  }

  onScopeSwitch(mode: ScopeMode): void {
    if (this.scopeMode === mode) return;
    this.scopeMode = mode;

    if (this.sectionTab === 'analytics') {
      if (mode === 'prompt') this.fetchPrompt();
      else this.fetchVersion();
    }
  }

  private fetchPrompt(): void {
    if (!this.promptId) return;
    this.loading = true;
    this.error = undefined;
    this.analytics
      .getPromptAnalytics(this.promptId, 10)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => (this.data = res),
        error: (err) => {
          console.error('[FE] prompt analytics error', err);
          this.error = 'Učitavanje analitike nije uspelo.';
          this.data = null;
        },
      });
  }

  private fetchVersion(): void {
    if (!this.versionId) return;
    this.loading = true;
    this.error = undefined;
    this.analytics
      .getVersionAnalytics(this.versionId, 10)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => (this.data = res),
        error: (err) => {
          console.error('[FE] version analytics error', err);
          this.error = 'Učitavanje analitike nije uspelo.';
          this.data = null;
        },
      });
  }
}
