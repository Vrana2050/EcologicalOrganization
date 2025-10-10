import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

import { Member } from '../../models/member.model';
import { Project } from '../../models/project.model';
import { Status } from '../../models/status.model';

type Step = 1 | 2 | 3;
type Selection = 'blank' | 'template';

@Component({
  selector: 'xp-project-create-wizard',
  templateUrl: './project-create-wizard.component.html',
  styleUrls: ['./project-create-wizard.component.css'],
  providers: [ProjectContextService],
})
export class ProjectCreateWizardComponent {
  private api = inject(ProjectService);
  private router = inject(Router);
  private ctx = inject(ProjectContextService);

  // ───────────────────── Wizard state ─────────────────────
  step: Step = 1;
  selection: Selection | null = null;

  // Step 2 – basic info (keep keys exactly as the HTML binds)
  form = {
    name: '',
    description: '',
    location: '',
    startDate: '' as string | null, // yyyy-MM-dd
    endDate: '' as string | null, // yyyy-MM-dd
  };

  // Members (multi-select combobox)
  allMembers: Member[] = [];
  memberById = new Map<number, Member>();
  private chosenMemberIds: number[] = []; // selected members by member.id

  memberDropdownOpen = false;
  memberSearch = '';

  // Step 3 – statuses & transitions matrix
  // NOTE: Template expects Map<number, Map<number, boolean>>
  statuses: Status[] = [];
  transitions = new Map<number, Map<number, boolean>>();

  // Runtime
  loading = false;
  errorMsg = '';
  private createdProject: Project | null = null;
  private nextTempId = -1;

  // ───────────────────── Lifecycle ─────────────────────
  ngOnInit() {
    this.loadAllMembers();
    this.ensureDefaultStatuses();
  }

  // ───────────────────── Step 1 ─────────────────────
  choose(sel: Selection) {
    this.selection = sel;
  }
  cancel() {
    this.router.navigate(['/project-realization']);
  }

  // Single canonical "next" (no duplicates)
  next() {
    if (this.step === 1) {
      if (!this.selection) return;
      // For now you only support "blank"; UI stays unchanged.
      this.step = 2;
      return;
    }

    if (this.step === 2) {
      if (!this.canContinueDetails) return;
      // Create the project shell first, then go to step 3
      this.createProjectShellAndContinue();
      return;
    }

    if (this.step === 3) {
      if (!this.canFinishWorkflow) return;
      this.finishCreateEverything();
    }
  }

  back() {
    if (this.step > 1) this.step = (this.step - 1) as Step;
  }

  // ───────────────────── Step 2: Members combobox & helpers ─────────────────────
  openMembers(ev?: Event) {
    ev?.stopPropagation();
    this.memberDropdownOpen = true;
  }

  @HostListener('document:click')
  closeMembers() {
    this.memberDropdownOpen = false;
  }

  get chosenMembers(): Member[] {
    return this.chosenMemberIds
      .map((id) => this.memberById.get(id))
      .filter((m): m is Member => !!m);
  }
  get selectedMembers(): Member[] {
    return this.chosenMembers;
  }

  get filteredMembers(): Member[] {
    const q = (this.memberSearch || '').trim().toLowerCase();
    if (!q) return this.allMembers;
    return this.allMembers.filter((m) => {
      const name = this.displayName(m).toLowerCase();
      const role = this.roleToEn(m.roleInProject).toLowerCase();
      return name.includes(q) || role.includes(q);
    });
  }

  isSelected(m: Member): boolean {
    return this.chosenMemberIds.includes(m.id);
  }

  toggleMember(m: Member) {
    if (this.isSelected(m)) {
      this.chosenMemberIds = this.chosenMemberIds.filter((id) => id !== m.id);
    } else {
      this.chosenMemberIds = [...this.chosenMemberIds, m.id];
    }
  }

  removeSelected(id: number) {
    this.chosenMemberIds = this.chosenMemberIds.filter((x) => x !== id);
  }

  initials(m: Member): string {
    // No real names yet → neutral initial by userId
    return 'U';
  }
  displayName(m: Member): string {
    return `Member #${m.userId}`;
  }
  roleToEn(code: string): string {
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

  get canContinueDetails(): boolean {
    return !!this.form.name?.trim();
  }

  private loadAllMembers() {
    // Uses your existing service (pool of pickable members)
    this.api.getAllMembers().subscribe({
      next: (list) => {
        this.allMembers = list ?? [];
        this.memberById.clear();
        this.allMembers.forEach((m) => this.memberById.set(m.id, m));
      },
      error: () => {
        this.allMembers = [];
        this.memberById.clear();
      },
    });
  }

  // ───────────────────── Step 3: statuses & transitions ─────────────────────
  private newTempId(): number {
    return this.nextTempId--;
  }

  private ensureDefaultStatuses() {
    if (this.statuses.length) return;

    const a: Status = {
      id: this.newTempId(),
      projectId: 0,
      name: 'Planned',
      orderNum: 0,
      terminal: false,
    };
    const b: Status = {
      id: this.newTempId(),
      projectId: 0,
      name: 'Done',
      orderNum: 1,
      terminal: true,
    };
    this.statuses = [a, b];

    this.transitions.clear();
    for (const s of this.statuses)
      this.transitions.set(s.id!, new Map<number, boolean>());
  }

  addStatus() {
    const orderNum = this.statuses.length
      ? Math.max(...this.statuses.map((s) => s.orderNum)) + 1
      : 0;
    const s: Status = {
      id: this.newTempId(),
      projectId: 0,
      name: 'New status',
      orderNum,
      terminal: false,
    };
    this.statuses = [...this.statuses, s];
    this.transitions.set(s.id!, new Map<number, boolean>());
  }

  removeStatus(s: Status) {
    if (this.statuses.length <= 1) return;
    const id = s.id!;
    this.statuses = this.statuses.filter((x) => x.id !== id);
    this.transitions.delete(id);
    for (const row of this.transitions.values()) row.delete(id);
  }

  get terminalStatusId(): number | null {
    const t = this.statuses.find((s) => !!s.terminal);
    return t?.id ?? null;
  }

  setTerminal(id?: number) {
    if (id == null) return;
    this.statuses = this.statuses.map((s) => ({ ...s, terminal: s.id === id }));
  }

  toggleTransition(fromId?: number, toId?: number) {
    if (fromId == null || toId == null) return;
    if (fromId === toId) return; // disable diagonal
    if (fromId === this.terminalStatusId) return; // no outgoing from terminal

    const row = this.transitions.get(fromId) ?? new Map<number, boolean>();
    row.set(toId, !row.get(toId));
    this.transitions.set(fromId, row);
  }

  // Helper so the template doesn’t complain about r.id / c.id being possibly undefined
  isTransitionChecked(from: Status, to: Status): boolean {
    const fid = from.id;
    const tid = to.id;
    if (fid == null || tid == null) return false;
    return !!this.transitions.get(fid)?.get(tid);
  }

  get canFinishWorkflow(): boolean {
    if (!this.statuses.length) return false;
    if (this.statuses.some((s) => !s.name?.trim())) return false;
    const terminals = this.statuses.filter((s) => s.terminal).length;
    return terminals === 1;
  }

  // ───────────────────── Server calls ─────────────────────
  toLocalDateTime(dateStr?: string | null, endOfDay = false): string | null {
    if (!dateStr) return null;
    const time = endOfDay ? '23:59:59' : '00:00:00';
    return `${dateStr}T${time}`;
  }
  private createProjectShellAndContinue() {
    const payload: Omit<Project, 'id'> = {
      name: (this.form.name || '').trim(),
      description: (this.form.description || '').trim(),
      archived: false,
      startDate: this.toLocalDateTime(this.form.startDate, false) ?? '', // → e.g. "2025-10-04T00:00:00"
      endDate: this.toLocalDateTime(this.form.endDate, true),
      // If your backend accepts location, keep it; if not, it will be ignored.
      // @ts-expect-error – tolerated if model lacks this field
      location: this.form.location || undefined,
      //createdId: this.selectedMembers[0]?.userId || 0, // IMPORTANT: backend expects userId here
      //templateId: null,
    };

    this.loading = true;
    this.errorMsg = '';

    this.api.createProject(payload).subscribe({
      next: (proj) => {
        this.createdProject = proj;
        this.ctx.setProject(proj);
        this.loading = false;
        this.step = 3;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to create project.';
      },
    });
  }

  private finishCreateEverything() {
    if (!this.createdProject) return;
    const projectId = this.createdProject.id;

    // 1) create statuses (respect terminal flag)
    const statusCreates$ = this.statuses.map((s, i) =>
      this.api.createStatus({
        projectId,
        name: (s.name || '').trim(),
        orderNum: s.orderNum ?? i,
        terminal: !!s.terminal,
      } as Omit<Status, 'id'>)
    );

    this.loading = true;
    this.errorMsg = '';

    forkJoin(statusCreates$)
      .pipe(
        // 2) tempId → realId map
        map((created) => {
          const idMap = new Map<number, number>();
          for (let i = 0; i < this.statuses.length; i++) {
            idMap.set(this.statuses[i].id!, created[i].id!);
          }
          return idMap;
        }),
        // 3) transitions (remap with idMap)
        switchMap((idMap) => {
          const calls: any[] = [];
          for (const [fromTemp, row] of this.transitions) {
            const fromReal = idMap.get(fromTemp);
            if (!fromReal) continue;
            for (const [toTemp, val] of row) {
              if (!val) continue;
              const toReal = idMap.get(toTemp);
              if (!toReal) continue;
              calls.push(
                this.api.createTransition({
                  projectId,
                  fromStatusId: fromReal,
                  toStatusId: toReal,
                })
              );
            }
          }
          return calls.length ? forkJoin(calls) : of(null);
        }),
        // 4) assign selected members (if any)
        switchMap(() => {
          if (!this.selectedMembers.length) return of(null);
          const nowIso = new Date().toISOString();
          const calls = this.selectedMembers.map((m) =>
            this.api.assignMemberToProject({
              projectId,
              userId: m.userId, // IMPORTANT: backend expects userId here
              roleInProject: m.roleInProject || 'NO',
              joinedAt: nowIso,
              leftAt: null,
              active: true,
            } as Omit<Member, 'id'>)
          );
          return forkJoin(calls).pipe(catchError(() => of(null)));
        })
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/project-realization', projectId, 'overview']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg =
            err?.error?.message || 'Failed to finalize the project.';
        },
      });
  }
}
