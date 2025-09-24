// prompt-evaluation.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Subscription, Observable, EMPTY } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { FeedbackService } from '../../services/feedback.service';
import { AnalyticsOut } from '../../models/analytics.model';
import {
  OutputFeedbackItem,
  OutputFeedbackPage,
} from '../../models/feedback.model';

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

  // zajednički loading/error za karticu koja je aktivna
  loading = false;
  error?: string;

  // ANALYTICS
  data: AnalyticsOut | null = null;
  private lastLoadedKey: string | null = null;

  // FEEDBACK (centralizovan)
  fbItems: OutputFeedbackItem[] = [];
  fbTotal = 0;
  fbPage = 1;
  readonly fbPerPage = 5;
  private fbLastLoadedKey: string | null = null;
  private fbSub?: Subscription;

  constructor(
    private analytics: AnalyticsService,
    private feedback: FeedbackService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['promptId'] || changes['versionId']) {
      this.fetchAnalytics();
      this.fbPage = 1;
      this.fetchFeedback();
    }
  }

  onSectionSwitch(tab: SectionTab): void {
    if (this.sectionTab === tab) return;
    this.sectionTab = tab;
    if (tab === 'analytics') this.fetchAnalytics();
    else this.fetchFeedback();
  }

  onScopeSwitch(mode: ScopeMode): void {
    if (this.scopeMode === mode) return;
    this.scopeMode = mode;
    this.fetchAnalytics();
    this.fbPage = 1;
    this.fetchFeedback();
  }

  // === ANALYTICS ===
  private analyticsKey(): string {
    return `${this.scopeMode}:${this.promptId ?? 'null'}:${
      this.versionId ?? 'null'
    }`;
  }

  private fetchAnalytics(): void {
    const key = this.analyticsKey();
    if (this.lastLoadedKey === key) return;

    if (this.scopeMode === 'prompt') {
      if (!this.promptId) return;
      this.loading = this.sectionTab === 'analytics';
      this.error = undefined;
      this.analytics
        .getPromptAnalytics(this.promptId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            this.data = res;
            this.lastLoadedKey = key;
          },
          error: (err) => {
            console.error('[FE] prompt analytics error', err);
            if (this.sectionTab === 'analytics')
              this.error = 'Učitavanje nije uspelo.';
            this.data = null;
          },
        });
    } else {
      if (!this.versionId) return;
      this.loading = this.sectionTab === 'analytics';
      this.error = undefined;
      this.analytics
        .getVersionAnalytics(this.versionId)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            this.data = res;
            this.lastLoadedKey = key;
          },
          error: (err) => {
            console.error('[FE] version analytics error', err);
            if (this.sectionTab === 'analytics')
              this.error = 'Učitavanje nije uspelo.';
            this.data = null;
          },
        });
    }
  }

  // === FEEDBACK ===
  private feedbackKey(): string {
    return `${this.scopeMode}:${this.promptId ?? 'null'}:${
      this.versionId ?? 'null'
    }:${this.fbPage}`;
  }

  private fetchFeedback(): void {
    if (this.sectionTab !== 'feedback') return;

    const key = this.feedbackKey();
    if (this.fbLastLoadedKey === key) return;

    this.fbSub?.unsubscribe();

    let obs: Observable<OutputFeedbackPage> = EMPTY;
    if (this.scopeMode === 'prompt') {
      if (this.promptId)
        obs = this.feedback.getForPrompt(
          this.promptId,
          this.fbPage,
          this.fbPerPage
        );
    } else {
      if (this.versionId)
        obs = this.feedback.getForVersion(
          this.versionId,
          this.fbPage,
          this.fbPerPage
        );
    }

    if (obs === EMPTY) return;

    this.loading = true;
    this.error = undefined;

    this.fbSub = obs.pipe(finalize(() => (this.loading = false))).subscribe({
      next: (res) => {
        this.fbItems = res.items ?? [];
        this.fbTotal = res.meta?.total_count ?? 0;
        this.fbLastLoadedKey = key;
      },
      error: (err) => {
        console.error('[FE] feedback load error', err);
        this.error = 'Učitavanje ocena nije uspelo.';
        this.fbItems = [];
        this.fbTotal = 0;
      },
    });
  }

  pageCount(): number {
    return Math.max(1, Math.ceil(this.fbTotal / this.fbPerPage));
  }

  goFbPrev(): void {
    if (this.fbPage <= 1) return;
    this.fbPage--;
    this.fetchFeedback();
  }

  goFbNext(): void {
    if (this.fbPage >= this.pageCount()) return;
    this.fbPage++;
    this.fetchFeedback();
  }
}
