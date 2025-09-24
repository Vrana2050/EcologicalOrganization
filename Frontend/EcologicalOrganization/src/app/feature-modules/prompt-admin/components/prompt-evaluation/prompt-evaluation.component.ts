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

  /** sprečava duple fetch pozive */
  private lastLoadedKey: string | null = null;

  constructor(private analytics: AnalyticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Kad god se promeni prompt ili verzija -> refetch po trenutnom scope-u
    if (changes['promptId'] || changes['versionId']) {
      this.fetchCurrent();
    }
  }

  onSectionSwitch(tab: SectionTab): void {
    if (this.sectionTab === tab) return;
    this.sectionTab = tab;
    // I na promeni taba uvek osveži podatke (analitika i feedback koriste isti payload)
    this.fetchCurrent();
  }

  onScopeSwitch(mode: ScopeMode): void {
    if (this.scopeMode === mode) return;
    this.scopeMode = mode;
    this.fetchCurrent();
  }

  /** Uvek vuče podatke za aktuelni scope (prompt / version) bez obzira na tab */
  private fetchCurrent(): void {
    const key = `${this.scopeMode}:${this.promptId ?? 'null'}:${
      this.versionId ?? 'null'
    }`;
    if (this.lastLoadedKey === key) return; // nema promene, nema poziva

    if (this.scopeMode === 'prompt') {
      if (!this.promptId) return;
      this.loading = true;
      this.error = undefined;
      this.analytics
        .getPromptAnalytics(this.promptId, 10)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            this.data = res;
            this.lastLoadedKey = key;
          },
          error: (err) => {
            console.error('[FE] prompt analytics error', err);
            this.error = 'Učitavanje nije uspelo.';
            this.data = null;
          },
        });
    } else {
      if (!this.versionId) return;
      this.loading = true;
      this.error = undefined;
      this.analytics
        .getVersionAnalytics(this.versionId, 10)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            this.data = res;
            this.lastLoadedKey = key;
          },
          error: (err) => {
            console.error('[FE] version analytics error', err);
            this.error = 'Učitavanje nije uspelo.';
            this.data = null;
          },
        });
    }
  }
}
