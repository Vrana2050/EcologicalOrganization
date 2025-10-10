import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

type AnalyticsSnapshot = {
  totalTasks: number;
  totalComments: number;
  membersCount: number;
  avgTasksPerMember: number;
  tasksOnTime: number;
  tasksLate: number;
  bottleneckStatus: string;
  bottleneckAvgSeconds: number;
  avgCommentsPerTask: number;
};

type StatusDurationDto = {
  statusId: number;
  statusName: string;
  avgSeconds: number; // seconds
  samples: number;
};

const SEC_PER_DAY = 86400;

@Component({
  selector: 'xp-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent {
  private ctx = inject(ProjectContextService);
  private api = inject(ProjectService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('analyticsRoot', { static: false })
  analyticsRoot!: ElementRef<HTMLElement>;

  loading = true;
  error: string | null = null;

  snapshot: AnalyticsSnapshot | null = null;
  statusDurations: StatusDurationDto[] = [];

  async exportPdf() {
    const rootEl = this.analyticsRoot?.nativeElement;
    if (!rootEl) return;

    // 1) Sačekaj da se podaci učitaju i DOM stabilizuje
    await this.waitUntilReady();
    // pričekaj web-fontove (ako ih ima)
    try {
      await (document as any).fonts?.ready;
    } catch {}
    // forsiraj CD pa sačekaj još jedan frame
    this.cdr.detectChanges();
    await new Promise((r) => requestAnimationFrame(r));

    // 2) Privremeno zameni pie <div> “fallback” canvasom koji html2canvas sigurno vidi
    const restorePie = this.swapPieForExport(rootEl);

    // 3) Daj DOM-u 1 mali “luft” da registruje promenu pre snimanja
    await new Promise((r) => setTimeout(r, 30));

    try {
      // 4) Uhvatimo stran­icu nakon pie-swap-a (SADA je pravi trenutak)
      const canvas = await html2canvas(rootEl, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        removeContainer: true,
        windowWidth: document.documentElement.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');

      // 5) jsPDF paginacija
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      } else {
        let positionY = 0;
        let remainingHeight = imgHeight;

        pdf.addImage(
          imgData,
          'PNG',
          0,
          positionY,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        remainingHeight -= pageHeight;

        while (remainingHeight > 0) {
          pdf.addPage();
          positionY -= pageHeight;
          pdf.addImage(
            imgData,
            'PNG',
            0,
            positionY,
            imgWidth,
            imgHeight,
            '',
            'FAST'
          );
          remainingHeight -= pageHeight;
        }
      }

      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl, '_blank', 'noopener');
    } finally {
      // 6) Vrati originalni pie nazad (UI ostaje netaknut)
      restorePie();
    }
  }
  private async until(cond: () => boolean, timeout = 1200) {
    const end = Date.now() + timeout;
    while (!cond() && Date.now() < end) {
      await new Promise((r) => requestAnimationFrame(r));
    }
  }

  private async waitUntilReady() {
    // sačekaj da postoji snapshot + durations (i bottleneck, ako ga ima)
    const deadline = Date.now() + 2000; // max 2s (obično je par frejmova)
    while (
      (!this.snapshot || !this.statusDurations?.length) &&
      Date.now() < deadline
    ) {
      await new Promise((r) => requestAnimationFrame(r));
    }
    // još par frejmova zbog fontova/grafike
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
  }

  /** pie helpers */
  get pieTotal(): number {
    const s = this.snapshot;
    return (s?.tasksOnTime || 0) + (s?.tasksLate || 0);
  }
  get onTimePct(): number {
    const t = this.pieTotal || 1;
    return Math.round(((this.snapshot?.tasksOnTime || 0) / t) * 100);
  }
  get overduePct(): number {
    const t = this.pieTotal || 1;
    return Math.round(((this.snapshot?.tasksLate || 0) / t) * 100);
  }

  ngOnInit() {
    const p = this.ctx.project();
    if (!p) {
      this.error = 'Project not loaded.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.api.getAnalyticsSnapshot(p.id).subscribe({
      next: (s) => {
        this.snapshot = s;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load analytics snapshot.';
        this.loading = false;
      },
    });

    // pass toTs explicitly
    this.api.getStatusDurations(p.id, new Date()).subscribe({
      next: (rows) => (this.statusDurations = rows ?? []),
      error: () => (this.statusDurations = []),
    });
  }

  // === Helpers (sekunde -> dani) ===
  secsToDays(secs: number | null | undefined): number {
    if (!secs && secs !== 0) return 0;
    return secs / 86400; // 60*60*24
  }

  // Najveća prosečna vrednost u danima (za normalizaciju visine)
  get maxAvgDays(): number {
    return (this.statusDurations || []).reduce((m, r) => {
      const d = this.secsToDays(r.avgSeconds);
      return d > m ? d : m;
    }, 0);
  }

  // Visina stubića u % prema maxAvgDays
  barHeight(days: number): string {
    const max = this.maxAvgDays || 1;
    return `${Math.max(0, Math.min(100, (days / max) * 100))}%`;
  }

  // Y tickovi (0, ¼, ½, ¾, 1× max)
  get yTicks(): number[] {
    const m = this.maxAvgDays;
    if (!m) return [0];
    return [0, 0.25 * m, 0.5 * m, 0.75 * m, m].map((v) => +v.toFixed(1));
  }

  // Donji offset tick-a u %
  yPct(val: number): number {
    const m = this.maxAvgDays || 1;
    return (val / m) * 100;
  }

  // Bottleneck za header (najveći avg)
  get bottleneck(): StatusDurationDto | null {
    if (!this.statusDurations?.length) return null;
    return this.statusDurations.reduce((a, b) =>
      this.secsToDays(a.avgSeconds) >= this.secsToDays(b.avgSeconds) ? a : b
    );
  }

  private makePieCanvas(onTimePct: number, size = 220): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = c.height = size * 2; // retina
    const r = size;
    const ctx = c.getContext('2d')!;
    ctx.scale(2, 2);

    const start = -Math.PI / 2;
    const onFrac = Math.max(0, Math.min(1, onTimePct / 100));

    // pozadina (overdue)
    ctx.beginPath();
    ctx.moveTo(r, r);
    ctx.arc(r, r, r, start, start + Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue(
        '--overdue'
      ) || '#ef4444';
    ctx.fill();

    // on-time “slice”
    if (onFrac > 0) {
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r, start, start + Math.PI * 2 * onFrac);
      ctx.closePath();
      ctx.fillStyle =
        getComputedStyle(document.documentElement).getPropertyValue(
          '--ontime'
        ) || '#22c55e';
      ctx.fill();
    }

    // unutrašnji prsten (isto kao tvoj blagi inset shadow)
    ctx.beginPath();
    ctx.arc(r, r, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    return c;
  }

  /** Nacrtaj FULL pie (disk) u offscreen canvas i vrati dataURL */
  private makePieDataUrl(onTimePct: number, size = 220): string {
    const c = document.createElement('canvas');
    c.width = c.height = size * 2; // retina
    const ctx = c.getContext('2d')!;
    ctx.scale(2, 2);

    const r = size / 2;
    const cx = r,
      cy = r;
    const start = -Math.PI / 2;
    const onFrac = Math.max(0, Math.min(1, onTimePct / 100));

    const css = getComputedStyle(document.documentElement);
    const colOverdue = (css.getPropertyValue('--overdue') || '#ef4444').trim();
    const colOnTime = (css.getPropertyValue('--ontime') || '#22c55e').trim();

    // OVERDUE (celi disk)
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = colOverdue;
    ctx.fill();

    // ON-TIME “slice”
    if (onFrac > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + Math.PI * 2 * onFrac);
      ctx.closePath();
      ctx.fillStyle = colOnTime;
      ctx.fill();
    }

    // suptilan unutrašnji prsten (isti vizuelni hint kao u CSS-u)
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    return c.toDataURL('image/png');
  }

  /** Umesto ubacivanja <canvas>, privremeno zamenimo conic-gradient rasterizovanom pozadinom */
  private swapPieForExport(rootEl: HTMLElement): () => void {
    const pieEl =
      (rootEl.querySelector('.pie') as HTMLElement | null) ||
      (rootEl.querySelector('[data-pie]') as HTMLElement | null);
    if (!pieEl) return () => {};

    const onTimePct = this.onTimePct || 0;

    // zapamti originalne stilove
    const prevBg = pieEl.style.background;
    const prevBgImage = pieEl.style.backgroundImage;
    const prevBgSize = pieEl.style.backgroundSize;
    const prevBgRepeat = pieEl.style.backgroundRepeat;
    const prevBgPos = pieEl.style.backgroundPosition;

    // dimenzije
    const rect = pieEl.getBoundingClientRect();
    const size = Math.round(Math.min(rect.width, rect.height) || 220);

    // rasterizuj pie i zalepi kao background-image
    const dataUrl = this.makePieDataUrl(onTimePct, size);
    pieEl.style.background = 'none';
    pieEl.style.backgroundImage = `url(${dataUrl})`;
    pieEl.style.backgroundSize = 'cover';
    pieEl.style.backgroundRepeat = 'no-repeat';
    pieEl.style.backgroundPosition = 'center';

    // funkcija za vraćanje
    return () => {
      pieEl.style.background = prevBg;
      pieEl.style.backgroundImage = prevBgImage;
      pieEl.style.backgroundSize = prevBgSize;
      pieEl.style.backgroundRepeat = prevBgRepeat;
      pieEl.style.backgroundPosition = prevBgPos;
    };
  }
}
