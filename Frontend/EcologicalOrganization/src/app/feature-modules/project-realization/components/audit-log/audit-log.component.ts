import { Component, effect, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Log } from '../../models/log.model';
import { Member } from '../../models/member.model';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'xp-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css'],
})
export class AuditLogComponent implements OnDestroy {
  private ctx = inject(ProjectContextService);
  private api = inject(ProjectService);
  project = this.ctx.project; // signal

  // state
  logs: Log[] = [];
  loading = false;
  errorMsg = '';

  page = 1; // UI 1-based
  perPage = 8;
  totalPages = 1;
  totalElements = 0;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private router: Router) {
    // reaguj na promene ?page u URL-u
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((q) => {
      const p = Number(q.get('page') || 1);
      this.page = isNaN(p) ? 1 : Math.max(1, p);
      this.fetch(); // učitaj ponovo za novu stranu
    });

    // kad projekat stigne iz Shell-a – učitaj prvu stranu
    effect(() => {
      if (this.project()) this.fetch();
    });
  }
  members: Member[] = [];
  membersById = new Map<number, Member>();

  private fetch() {
    const p = this.project();
    if (!p) return;

    this.loading = true;
    this.errorMsg = '';

    // request logs page + project members together
    forkJoin({
      page: this.api.getLogsForProjectId(p.id, {
        page: this.page - 1,
        size: this.perPage,
        sort: 'timestamp,desc', // server sorts by timestamp
      }),
      members: this.api.getProjectMembers(p.id),
    }).subscribe({
      next: ({ page, members }) => {
        this.logs = page.content ?? [];
        this.totalElements = page.totalElements ?? 0;
        this.totalPages = Math.max(1, page.totalPages ?? 1);

        this.members = members ?? [];
        this.membersById.clear();
        this.members.forEach((m) => this.membersById.set(m.id, m));

        if (this.page > this.totalPages) this.goToPage(this.totalPages);
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to load logs.';
        this.logs = [];
        this.members = [];
        this.membersById.clear();
        this.totalElements = 0;
        this.totalPages = 1;
        this.loading = false;
      },
    });
  }

  // ── paginacija ─────────────────────────────────────
  private readonly window = 2;
  get visiblePages(): (number | '…')[] {
    const total = this.totalPages,
      current = this.page;
    if (total <= 1) return [1];
    const pages: (number | '…')[] = [1];
    const left = Math.max(2, current - this.window);
    const right = Math.min(total - 1, current + this.window);
    if (left > 2) pages.push('…');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('…');
    pages.push(total);
    return pages.filter((v, i, a) => i === 0 || v !== a[i - 1]);
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private roleToEn(code: string): string {
    switch ((code || '').toUpperCase()) {
      case 'GK':
        return 'Main coordinator';
      case 'PK':
        return 'Assistant coordinator';
      case 'NO':
        return 'Responsible person';
      default:
        return 'Member';
    }
  }
  // audit-log.component.ts (add these methods)

  memberName(m?: Member | null): string {
    if (!m) return 'Unknown member';
    return `Member #${m.userId}`;
  }
  roleLabel(code?: string): string {
    switch ((code || '').toUpperCase()) {
      case 'GK':
        return 'Main coordinator';
      case 'PK':
        return 'Assistant coordinator';
      case 'NO':
        return 'Responsible person';
      default:
        return 'Member';
    }
  }
  formatAction(l: Log): string {
    const m = this.membersById.get(l.memberId);
    const who = this.memberName(m);

    switch (l.action) {
      case 'COMMENT':
        return `${who} commented on Task #${l.taskId}`;
      case 'TASK_STATUS_CHANGE':
        return `${who} changed the status of Task #${l.taskId}`;
      case 'TASK_CREATION':
        return `${who} created Task #${l.taskId}`;
      case 'PROJECT_CREATION':
        return `${who} created the project`;
      case 'ADD_MEMBER_TO_PROJECT':
        return `${who} added a member to the project`;
      case 'ASSIGN_TASK':
        return `${who} assigned Task #${l.taskId}`;
      case 'ADD_RESOURCE_TO_TASK':
        return `${who} added a resource to Task #${l.taskId}`;
      case 'RESOURCE_PROVISION':
        return `${who} provisioned a resource for Task #${l.taskId}`;
      case 'TEMPLATE_CREATION':
        return `${who} created a template`;
      case 'TEMPLATE_USAGE':
        return `${who} used a template`;
      default:
        return `${who} performed ${l.action}`;
    }
  }
}
