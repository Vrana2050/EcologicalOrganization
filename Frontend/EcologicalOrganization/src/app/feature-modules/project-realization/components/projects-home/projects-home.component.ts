import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageResponse, Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'xp-projects-home',
  templateUrl: './projects-home.component.html',
  styleUrl: './projects-home.component.css',
})
export class ProjectsHomeComponent {
  status: 'active' | 'archived' = 'active';

  // podaci iz back-a
  projects: Project[] = [];

  // paginacija (UI 1-based; backend 0-based)
  page = 1;
  perPage = 12;
  totalPages = 1;
  totalElements = 0;

  loading = false;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ProjectService
  ) {
    this.route.queryParamMap.subscribe((q) => {
      const s = (q.get('status') as 'active' | 'archived') || 'active';
      const p = Number(q.get('page') || 1);
      this.status = s;
      this.page = isNaN(p) ? 1 : Math.max(1, p);
      this.load();
    });
  }

  private load() {
    this.loading = true;
    this.errorMsg = '';

    const query = {
      page: this.page - 1,
      size: this.perPage,
      sort: 'createdId,desc',
    };
    const call =
      this.status === 'active'
        ? this.svc.listActive(query)
        : this.svc.listArchived(query);

    call.subscribe({
      next: (res: PageResponse<Project>) => {
        this.projects = res.content;
        this.totalPages = Math.max(1, res.totalPages);
        this.totalElements = res.totalElements;
        // ako je trenutna strana “ispala” (npr. promena statusa), vrati se na poslednju
        if (this.page > this.totalPages) this.goToPage(this.totalPages);
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg =
          err?.error?.message || 'Greška pri učitavanju projekata.';
        this.projects = [];
        this.totalPages = 1;
        this.totalElements = 0;
        this.loading = false;
      },
    });
  }

  switchStatus(next: 'active' | 'archived') {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: next, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  openProject(p: Project) {
    this.router.navigate(['../', p.id], { relativeTo: this.route });
  }

  /** Koliko stranica prikazujemo levo/desno od trenutne */
  private readonly window = 2;

  get visiblePages(): (number | '…')[] {
    const pages: (number | '…')[] = [];
    const total = this.totalPages;
    const current = this.page;

    if (total <= 1) return [1];

    pages.push(1);

    const left = Math.max(2, current - this.window);
    if (left > 2) pages.push('…');

    const right = Math.min(total - 1, current + this.window);
    for (let p = left; p <= right; p++) pages.push(p);

    if (right < total - 1) pages.push('…');

    if (total > 1) pages.push(total);

    return pages.filter((v, i, arr) => (i === 0 ? true : v !== arr[i - 1]));
  }

  goToPage(p: number) {
    const target = Math.max(1, Math.min(this.totalPages, Math.trunc(p || 1)));

    if (target === this.page) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: target },
      queryParamsHandling: 'merge',
    });
  }

  // (opciono, zgodno za template)
  prevPage() {
    this.goToPage(this.page - 1);
  }
  nextPage() {
    this.goToPage(this.page + 1);
  }
  firstPage() {
    this.goToPage(1);
  }
  lastPage() {
    this.goToPage(this.totalPages);
  }

  durationDays(p: Project): number {
    const start = new Date(p.startDate);
    const end = p.endDate ? new Date(p.endDate) : new Date();

    const startUTC = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.max(0, Math.round((endUTC - startUTC) / msPerDay));
    return days;
  }
}
