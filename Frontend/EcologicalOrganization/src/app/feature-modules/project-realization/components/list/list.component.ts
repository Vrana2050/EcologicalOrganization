import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';

import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { Member } from '../../models/member.model';
import { Status } from '../../models/status.model';
import { Task } from '../../models/task.model';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

type MemberVM = { id: number; name: string; role: string; initials: string };

@Component({
  selector: 'xp-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  private ctx = inject(ProjectContextService);
  private api = inject(ProjectService);

  get isArchived(): boolean {
    return !!this.ctx.project()?.archived;
  }

  private openTaskMenuRef: { statusId: number; taskId: number } | null = null;

  addingStatus = false;
  draftStatusName = '';

  @ViewChild('listsRef') listsRef!: ElementRef<HTMLDivElement>;
  @ViewChild('newStatusInput') newStatusInput!: ElementRef<HTMLInputElement>;

  /** Privremeni korisnici za editor (dok ne povežemo bek za članove) */
  membersVm: MemberVM[] = [];
  memberMap = new Map<number, MemberVM>();
  members: Member[] = [];

  commentCounts = new Map<number, number>();

  /** Podaci sa bekenda */
  statuses: Status[] = []; // stižu već sortirani po orderNum
  tasksByStatus = new Map<number, Task[]>(); // statusId -> Task[]

  /** UI stanje po statusu (ne diramo tvoje modele) */
  ui = new Map<
    number,
    {
      adding: boolean;
      assigneeOpen: boolean;
      dateOpen: boolean;
      draftName: string;
      draftAssignee: MemberVM | null;
      draftDue: string | null;
    }
  >();

  /** Osiguraj UI state za dati status */
  private ensureUi(statusId: number) {
    let st = this.ui.get(statusId);
    if (!st) {
      st = {
        adding: false,
        assigneeOpen: false,
        dateOpen: false,
        draftName: '',
        draftAssignee: null,
        draftDue: null,
      };
      this.ui.set(statusId, st);
    }
    return st;
  }
  /* ========================= UČITAVANJE ========================= */

  ngOnInit() {
    const proj = this.ctx.project();
    if (proj) {
      this.loadAll(proj.id);
    } else {
      const int = setInterval(() => {
        const p = this.ctx.project();
        if (p) {
          clearInterval(int);
          this.loadAll(p.id);
        }
      }, 50);
      setTimeout(() => clearInterval(int), 3000);
    }
  }
  private loadAll(projectId: number) {
    this.api
      .getStatusesForProject(projectId)
      .pipe(
        switchMap((sts) => {
          this.statuses = sts ?? [];
          this.statuses.forEach((s) => this.ensureUi(s.id!));
          return forkJoin({
            tasks: this.api.getTasksForProject(projectId),
            members: this.api.getProjectMembers(projectId),
          });
        }),
        switchMap(({ tasks, members }) => {
          // tasks -> mapiranje
          const mapByStatus = new Map<number, Task[]>();
          (tasks ?? []).forEach((t) => {
            if (!mapByStatus.has(t.statusId)) mapByStatus.set(t.statusId, []);
            mapByStatus.get(t.statusId)!.push(t);
          });
          this.tasksByStatus = mapByStatus;

          // members
          this.members = members ?? [];
          const vms = this.members.map(this.toVm);
          this.membersVm = vms;
          this.memberMap = new Map(vms.map((m) => [m.id, m]));

          const ids = (tasks ?? []).map((t) => Number(t.id)).filter(Boolean);
          return ids.length ? this.api.getCommentCounts(ids) : of({});
        }),
        catchError(() => of({}))
      )
      .subscribe((rec) => {
        this.commentCounts = new Map<number, number>(
          Object.entries(rec).map(([k, v]) => [Number(k), Number(v as number)])
        );
      });
  }

  private toVm = (m: Member): MemberVM => {
    const role = this.roleToEn(m.roleInProject);
    const name = `Member #${m.userId}`;
    const initials = name.charAt(0).toUpperCase();
    return { id: m.id, name, role, initials }; // <— m.id je ključ za assignedMemberId
  };

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

  get lists() {
    return this.statuses.map((s) => ({
      status: s,
      tasks: (this.tasksByStatus.get(s.id!) || []).slice(),
      ui: this.ensureUi(s.id!),
    }));
  }

  /* ========================= UI / EDITOR ========================= */

  /** Klik na "+ Add task" – otvori editor samo za taj status */
  onAddTaskClick(statusId: number, ev: MouseEvent) {
    if (this.isArchived) return;
    ev.stopPropagation(); // da ne “upuca” document:click
    // dozvoli jedan editor globalno
    this.statuses.forEach(
      (s) => (this.ensureUi(s.id!).adding = s.id === statusId)
    );
    const ui = this.ensureUi(statusId);
    ui.assigneeOpen = false;
    ui.dateOpen = false;
    ui.draftName = '';
    ui.draftAssignee = null;
    ui.draftDue = null;
  }

  /** Zatvori editor za status */
  private cancelAddTask(statusId: number) {
    const ui = this.ensureUi(statusId);
    ui.adding = false;
    ui.assigneeOpen = false;
    ui.dateOpen = false;
  }

  /** Da li su sva polja spremna za auto-save */
  private shouldAutoSave(statusId: number): boolean {
    const ui = this.ensureUi(statusId);
    return !!ui.draftName?.trim() && !!ui.draftAssignee && !!ui.draftDue;
  }

  /** Ako su sva polja tu → save */

  /** Umetni novi Task u lokalni prikaz (POST ka beku dodaćemo kasnije) */
  private saveTask(statusId: number) {
    if (this.isArchived) return;
    const u = this.ensureUi(statusId);
    const name = (u.draftName || '').trim();
    if (!name) return;

    const toLocalDateTime = (d?: string | null) =>
      d ? `${d}T00:00:00` : undefined; // "2025-10-15T00:00:00"

    const projectId = this.ctx.project()?.id || 0;
    const newTask: Partial<Task> = {
      projectId,
      statusId,
      assignedMemberId: u.draftAssignee ? u.draftAssignee.id : undefined,
      name,
      description: '',
      deadline: toLocalDateTime(u.draftDue), // yyyy-MM-dd
    };

    this.api.createTask(newTask).subscribe({
      next: (created) => {
        const list = this.tasksByStatus.get(statusId) ?? [];
        this.tasksByStatus.set(statusId, [...list, created]);
      },
      error: (err) => {
        console.error('Create task failed', err);
      },
    });

    this.cancelAddTask(statusId);
    u.adding = false;
    u.assigneeOpen = false;
    u.dateOpen = false;
  }

  /* ========================= ASSIGNEE DROPDOWN ========================= */

  toggleAssignee(statusId: number, ev: MouseEvent) {
    if (this.isArchived) return;
    ev.stopPropagation();
    this.ui.forEach(
      (x, id) => (x.assigneeOpen = id === statusId ? !x.assigneeOpen : false)
    );
  }
  pickAssignee(statusId: number, m: MemberVM) {
    const u = this.ensureUi(statusId);
    u.draftAssignee = m;
    u.assigneeOpen = false;
    this.autoSaveIfReady(statusId);
  }

  /* ========================= DUE DATE ========================= */

  openDate(statusId: number, inputEl: HTMLInputElement) {
    const u = this.ensureUi(statusId);
    u.dateOpen = true;
    inputEl.showPicker?.();
  }
  onDueChange(statusId: number, value: string) {
    if (this.isArchived) return;
    const u = this.ensureUi(statusId);
    u.draftDue = value || null;
    this.autoSaveIfReady(statusId);
  }

  private autoSaveIfReady(statusId: number) {
    if (this.isArchived) return;
    const u = this.ensureUi(statusId);
    const ready = !!u.draftName?.trim() && !!u.draftAssignee && !!u.draftDue;
    if (ready) this.saveTask(statusId);
  }

  /* ========================= GLOBAL LISTENER-I ========================= */

  /* ========================= trackBy (opciono) ========================= */
  trackByStatusId = (_: number, v: { status: Status }) => v.status.id;
  trackByTaskId = (_: number, t: Task) => t.id;

  isMenuOpen(statusId: number, taskId: number): boolean {
    return (
      !!this.openTaskMenuRef &&
      this.openTaskMenuRef.statusId === statusId &&
      this.openTaskMenuRef.taskId === taskId
    );
  }

  openTaskMenu(statusId: number, taskId: number, ev: MouseEvent) {
    ev.stopPropagation();
    const isOpen = this.isMenuOpen(statusId, taskId);
    this.openTaskMenuRef = isOpen ? null : { statusId, taskId };
  }

  closeTaskMenu() {
    this.openTaskMenuRef = null;
  }

  /** Placeholder za edit (naknadno ćemo otvoriti editor za postojeći task) */
  editTask(_statusId: number, _taskId: number) {
    // TODO: implementiraćemo kad dodamo "edit" UX
    this.closeTaskMenu();
  }
  onDeleteTask(statusId: number, t: Task) {
    if (this.isArchived) return;
    this.closeTaskMenu();

    this.api.deleteTask(t.id).subscribe({
      next: () => {
        const arr = this.tasksByStatus.get(statusId) || [];
        const idx = arr.findIndex((x) => x.id === t.id);
        if (idx >= 0) {
          arr.splice(idx, 1);
          this.tasksByStatus.set(statusId, arr);
        }
      },
      error: () => {
        alert('Brisanje nije uspelo. Pokušaj ponovo.');
      },
    });
  }

  drawerOpen = false;
  selectedTask: Task | null = null;
  selectedStatusId: number | null = null;

  openDrawer(statusId: number, task: Task) {
    this.selectedStatusId = statusId;
    this.selectedTask = task;
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.selectedTask = null;
    this.selectedStatusId = null;
  }

  // ako Task može biti izmenjen/obrisan iz drawera:
  onDrawerUpdated(_updated: Task) {
    const projectId = this.ctx.project()?.id;
    if (!projectId) return;

    // Re-load tasks and rebuild the status map so moves are reflected
    this.api.getTasksForProject(projectId).subscribe({
      next: (tasks) => {
        const map = new Map<number, Task[]>();
        (tasks ?? []).forEach((t) => {
          if (!map.has(t.statusId)) map.set(t.statusId, []);
          map.get(t.statusId)!.push(t);
        });
        this.tasksByStatus = map;
      },
      error: () => {
        // keep previous state if reload fails (or clear, your choice)
      },
    });

    // (Optional) if you show comment counts in the list, refresh them too:
    // const ids = (tasks ?? []).map(t => t.id);  // you'd need tasks here—if you want this,
    // move the comment counts call into the 'next' block above after you set 'map'.
  }

  onDrawerDeleted(taskId: number) {
    if (!this.selectedStatusId) return;
    const arr = this.tasksByStatus.get(this.selectedStatusId) || [];
    const idx = arr.findIndex((t) => t.id === taskId);
    if (idx >= 0) {
      arr.splice(idx, 1);
      this.tasksByStatus.set(this.selectedStatusId, arr);
    }
    this.closeDrawer();
  }

  memberById(id?: number | null): MemberVM | null {
    if (!id && id !== 0) return null;
    return this.memberMap.get(id as number) ?? null;
  }

  private shouldSaveStatus(): boolean {
    return !!this.draftStatusName.trim();
  }

  commitAddStatus() {
    if (this.isArchived) return;
    if (!this.shouldSaveStatus()) return this.cancelAddStatus();

    const name = this.draftStatusName.trim();
    const proj = this.ctx.project();
    if (!proj) return;

    // orderNum = max + 1
    const maxOrder = this.statuses.reduce(
      (m, s) => Math.max(m, s.orderNum),
      -1
    );
    const orderNum = maxOrder + 1;

    // zatvori editor odmah (optimistic)
    this.addingStatus = false;
    this.draftStatusName = '';

    this.api
      .createStatus({ projectId: proj.id, name, orderNum, terminal: false })
      .subscribe({
        next: (created) => {
          // dodaj na kraj i pripremi stubove za UI
          this.statuses = [...this.statuses, created];
          this.tasksByStatus.set(created.id!, []);
          this.ensureUi(created.id!);

          // skrol do novog reda
          setTimeout(() => {
            const el = this.listsRef?.nativeElement;
            el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
          });
        },
        error: () => {
          // po želji: toast; ništa ne dodajemo lokalno
        },
      });
  }
  startAddStatus(ev?: MouseEvent) {
    if (this.isArchived) return;
    ev?.stopPropagation();
    this.addingStatus = true;
    this.draftStatusName = '';

    // skrol na kraj i fokus na input
    setTimeout(() => {
      const el = this.listsRef?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      this.newStatusInput?.nativeElement?.focus();
    });
  }

  cancelAddStatus() {
    this.addingStatus = false;
    this.draftStatusName = '';
  }
  @HostListener('document:keydown.escape')
  onEsc() {
    const active = this.statuses.find((s) => this.ensureUi(s.id!).adding);
    if (active) this.cancelAddTask(active.id!);
    if (this.addingStatus) this.cancelAddStatus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(_: MouseEvent) {
    this.statuses.forEach((s) => (this.ensureUi(s.id!).assigneeOpen = false));
    this.closeTaskMenu();

    const active = this.statuses.find((s) => this.ensureUi(s.id!).adding);
    if (active) {
      if (this.shouldAutoSave(active.id!)) this.saveTask(active.id!);
      else this.cancelAddTask(active.id!);
    }

    // ⇩⇩ NEW: editor statusa
    if (this.addingStatus) {
      this.shouldSaveStatus() ? this.commitAddStatus() : this.cancelAddStatus();
    }
  }
}
