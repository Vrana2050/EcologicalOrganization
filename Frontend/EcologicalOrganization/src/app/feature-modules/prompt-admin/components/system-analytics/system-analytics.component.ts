import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { DocumentTypeService } from '../../services/document-type.service';
import { DocumentType } from '../../models/document-type.model';
import { DocumentTypeReportRow } from '../../models/document-type-report-row.model';

type SortKey =
  | 'document_type_name'
  | 'num_executions'
  | 'total_cost_usd'
  | 'avg_cost_usd'
  | 'avg_duration_ms'
  | 'avg_input_tokens'
  | 'avg_output_tokens'
  | 'failed_execs'
  | 'error_rate'
  | 'rating_count'
  | 'rating_avg'
  | 'rating_median';

@Component({
  selector: 'xp-system-analytics',
  templateUrl: './system-analytics.component.html',
  styleUrls: ['./system-analytics.component.css'],
})
export class SystemAnalyticsComponent implements OnInit {
  fromDate!: string;
  toDate!: string;
  docTypes: DocumentType[] = [];
  selectedDocTypeId: number | null = null;
  includeTotal = true;
  loading = false;
  error?: string;
  dateError?: string;
  rows: DocumentTypeReportRow[] = [];
  sortKey: SortKey = 'document_type_name';
  sortDir: 'asc' | 'desc' = 'asc';
  downloading = false;

  constructor(
    private analytics: AnalyticsService,
    private dtService: DocumentTypeService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    this.fromDate = this.toYMD(from);
    this.toDate = this.toYMD(today);
    this.dtService.list().subscribe({
      next: (page) => (this.docTypes = page.items),
      error: () => {},
    });
    this.validateDates();
    this.fetch();
  }

  private toYMD(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  isoStart(): string {
    return `${this.fromDate}T00:00:00${this.tzOffset()}`;
  }

  isoEnd(): string {
    return `${this.toDate}T23:59:59${this.tzOffset()}`;
  }

  onDownload(): void {
    this.validateDates();
    if (this.dateError) return;
    this.downloading = true;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    this.analytics
      .downloadDocTypeReportPdf(
        this.isoStart(),
        this.isoEnd(),
        this.selectedDocTypeId,
        this.includeTotal,
        this.sortKey,
        this.sortDir,
        tz
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          const from = this.fromDate;
          const to = this.toDate;
          a.href = url;
          a.download = `doc-type-report_${from}_to_${to}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          this.downloading = false;
        },
        error: () => {
          this.error = 'Preuzimanje PDF izveštaja nije uspelo.';
          this.downloading = false;
        },
      });
  }

  private tzOffset(): string {
    const m = -new Date().getTimezoneOffset();
    const sign = m >= 0 ? '+' : '-';
    const hh = String(Math.floor(Math.abs(m) / 60)).padStart(2, '0');
    const mm = String(Math.abs(m) % 60).padStart(2, '0');
    return `${sign}${hh}:${mm}`;
  }

  private validateDates(): void {
    if (!this.fromDate || !this.toDate) {
      this.dateError = undefined;
      return;
    }
    const a = new Date(this.fromDate);
    const b = new Date(this.toDate);
    if (a > b) this.dateError = 'Datum od ne sme biti posle datuma do.';
    else this.dateError = undefined;
  }

  onFromDateChange(v: string): void {
    this.fromDate = v;
    this.validateDates();
  }

  onToDateChange(v: string): void {
    this.toDate = v;
    this.validateDates();
  }

  fetch(): void {
    if (this.dateError) return;
    this.loading = true;
    this.error = undefined;
    this.analytics
      .getDocTypeReport(
        this.isoStart(),
        this.isoEnd(),
        this.selectedDocTypeId,
        this.includeTotal
      )
      .subscribe({
        next: (rows) => {
          this.normalizeRows(rows || []);
          this.loading = false;
        },
        error: () => {
          this.error = 'Učitavanje izveštaja nije uspelo.';
          this.rows = [];
          this.loading = false;
        },
      });
  }

  onApply(): void {
    this.validateDates();
    if (this.dateError) return;
    this.fetch();
  }

  onReset(): void {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    this.fromDate = this.toYMD(from);
    this.toDate = this.toYMD(today);
    this.selectedDocTypeId = null;
    this.includeTotal = true;
    this.validateDates();
    this.fetch();
  }

  onSort(k: SortKey): void {
    if (this.sortKey === k) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = k;
      this.sortDir = 'asc';
    }
    const { items, total } = this.splitTotal(this.rows);
    const sorted = this.sortRows(items.slice());
    this.rows = [...sorted, ...(total ? [total] : [])];
  }

  private normalizeRows(raw: DocumentTypeReportRow[]) {
    const { items, total } = this.splitTotal(raw);
    const sorted = this.sortRows(items);
    this.rows = [...sorted, ...(total ? [total] : [])];
  }

  private splitTotal(rows: DocumentTypeReportRow[]) {
    let total: DocumentTypeReportRow | null = null;
    const items: DocumentTypeReportRow[] = [];
    for (const r of rows || []) {
      if (r.document_type_id === null) total = r;
      else items.push(r);
    }
    return { items, total };
  }

  private sortRows(rows: DocumentTypeReportRow[]): DocumentTypeReportRow[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return rows.sort((a, b) => {
      const va = (a as any)[this.sortKey];
      const vb = (b as any)[this.sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb) * dir;
      }
      return (va - vb) * dir;
    });
  }

  onDocTypeChanged(id: number | null): void {
    this.selectedDocTypeId = id;
  }
}
