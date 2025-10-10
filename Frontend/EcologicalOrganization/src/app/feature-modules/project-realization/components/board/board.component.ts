import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { Member } from '../../models/member.model';
import { Status } from '../../models/status.model';
import { Task } from '../../models/task.model';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

type ColUI = {
  adding: boolean;
  assigneeOpen: boolean;
  draftName: string;
  draftAssignee: Member | null;
  draftDue: string | null; // yyyy-MM-dd
};
@Component({
  selector: 'xp-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent {
  private ctx = inject(ProjectContextService);
  private api = inject(ProjectService);
  get isArchived(): boolean {
    return !!this.ctx.project()?.archived;
  }

  members: Member[] = [];
  private membersById = new Map<number, Member>();

  statuses: Status[] = [];
  tasksByStatus = new Map<number, Task[]>();
  ui = new Map<number, ColUI>();

  commentCounts = new Map<number, number>();

  // drawer
  drawerOpen = false;
  selectedTask: Task | null = null;
  d: string;

  ngOnInit() {
    const p = this.ctx.project();
    if (p) this.load(p.id);
    else {
      const int = setInterval(() => {
        const proj = this.ctx.project();
        if (proj) {
          clearInterval(int);
          this.load(proj.id);
        }
      }, 50);
      setTimeout(() => clearInterval(int), 3000);
    }
  }
  private load(projectId: number) {
    forkJoin({
      statuses: this.api.getStatusesForProject(projectId),
      tasks: this.api.getTasksForProject(projectId),
      members: this.api.getProjectMembers(projectId),
    }).subscribe({
      next: ({ statuses, tasks, members }) => {
        // statusi – ako treba:
        this.statuses = (statuses ?? []).map((s) => ({
          ...s,
          id: Number(s.id),
          orderNum: Number(s.orderNum),
        }));
        this.statuses.forEach((s) => this.ensureUi(s.id!));

        // tasks → brojčani ID-evi
        const map = new Map<number, Task[]>();
        (tasks ?? [])
          .map((t) => ({
            ...t,
            id: Number(t.id),
            projectId: Number(t.projectId),
            statusId: Number(t.statusId),
            assigneedMemberId:
              t.assignedMemberId != null
                ? Number(t.assignedMemberId)
                : undefined,
          }))
          .forEach((t) => {
            if (!map.has(t.statusId)) map.set(t.statusId, []);
            map.get(t.statusId)!.push(t);
          });
        this.tasksByStatus = map;

        // posle što napraviš tasksByStatus:
        const allTaskIds: number[] = (tasks ?? [])
          .map((t) => Number(t.id))
          .filter(Boolean);

        if (allTaskIds.length) {
          this.api.getCommentCounts(allTaskIds).subscribe({
            next: (rec) => {
              this.commentCounts = new Map<number, number>(
                Object.entries(rec).map(([k, v]) => [Number(k), Number(v)])
              );
            },
            error: () => {
              this.commentCounts = new Map(); // fallback: sve 0 na prikazu
            },
          });
        } else {
          this.commentCounts = new Map();
        }

        // members → brojčani ID-evi
        this.members = (members ?? []).map((m) => ({
          ...m,
          id: Number(m.id),
          projectId: Number(m.projectId),
          userId: Number(m.userId),
        }));
        this.membersById.clear();
        this.members.forEach((m) => this.membersById.set(m.id, m));
      },
      error: () => {
        this.statuses = [];
        this.tasksByStatus = new Map();
        this.members = [];
        this.membersById.clear();
      },
    });
  }

  private ensureUi(statusId: number): ColUI {
    let u = this.ui.get(statusId);
    if (!u) {
      u = {
        adding: false,
        assigneeOpen: false,
        draftName: '',
        draftAssignee: null,
        draftDue: null,
      };
      this.ui.set(statusId, u);
    }
    return u;
  }

  tasksFor(statusId: number): Task[] {
    return this.tasksByStatus.get(statusId) ?? [];
  }

  isTerminal(status: Status): boolean {
    // backend već vraća sortiran po orderNum; terminal je poslednji u listi
    return status.terminal;
  }

  /* ---------- Editor (inline kartica) ---------- */
  startAdd(statusId: number, ev?: MouseEvent) {
    if (this.isArchived) return;
    ev?.stopPropagation();
    this.ui.forEach((u, id) => (u.adding = id === statusId)); // samo jedan editor aktivan
    const u = this.ensureUi(statusId);
    u.adding = true;
    u.assigneeOpen = false;
    u.draftName = '';
    u.draftAssignee = null;
    u.draftDue = null;
  }

  cancelAdd(statusId: number) {
    const u = this.ensureUi(statusId);
    u.adding = false;
    u.assigneeOpen = false;
  }

  pickAssignee(statusId: number, member: Member) {
    const u = this.ensureUi(statusId);
    u.draftAssignee = member; // <=== Member
    u.assigneeOpen = false;
    this.autoSave(statusId);
  }

  onDueChange(statusId: number, value: string) {
    if (this.isArchived) return;
    const u = this.ensureUi(statusId);
    u.draftDue = value || null;
    this.autoSave(statusId);
  }

  toggleAssignee(statusId: number, ev: MouseEvent) {
    if (this.isArchived) return;
    ev.stopPropagation();
    this.ui.forEach(
      (x, id) => (x.assigneeOpen = id === statusId ? !x.assigneeOpen : false)
    );
  }

  private autoSave(statusId: number) {
    const u = this.ensureUi(statusId);
    const ready = !!u.draftName?.trim() && !!u.draftAssignee && !!u.draftDue;
    if (ready) this.save(statusId);
  }

  save(statusId: number) {
    if (this.isArchived) return;
    const u = this.ensureUi(statusId);
    const proj = this.ctx.project();
    if (!proj) return;

    const toLocalDateTime = (d?: string | null) =>
      d ? `${d}T00:00:00` : undefined; // "2025-10-15T00:00:00"

    const body: Partial<Task> = {
      projectId: proj.id,
      statusId,
      name: (u.draftName || '').trim(),
      assignedMemberId: u.draftAssignee
        ? Number(u.draftAssignee.id)
        : undefined,
      deadline: toLocalDateTime(u.draftDue),
      description: '',
      // createdAt: undefined   // 👈 ne šalji; ili:
      // createdAt: new Date().toISOString().slice(0,19)  // "YYYY-MM-DDTHH:mm:ss" bez 'Z'
    };

    this.api.createTask(body).subscribe({
      next: (created) => {
        const list = this.tasksByStatus.get(statusId) ?? [];
        this.tasksByStatus.set(statusId, [...list, created]);
        this.cancelAdd(statusId);
      },
      error: (err) => {
        console.error('Create task failed', err);
        this.cancelAdd(statusId);
        // opciono: toast poruka
      },
    });
  }

  /* ---------- Drawer ---------- */
  openTask(t: Task) {
    this.selectedTask = t;
    this.drawerOpen = true;
  }
  closeDrawer() {
    this.drawerOpen = false;
    this.selectedTask = null;
    const projectId = this.ctx.project()?.id;
    if (projectId) this.refreshTasksAndCounts(projectId);
  }
  onDrawerUpdated(_updated: Task) {
    const projectId = this.ctx.project()?.id;
    if (projectId) this.refreshTasksAndCounts(projectId);
  }
  private refreshTasksAndCounts(projectId: number) {
    this.api.getTasksForProject(projectId).subscribe({
      next: (tasks) => {
        // rebuild tasksByStatus map
        const map = new Map<number, Task[]>();
        (tasks ?? [])
          .map((t) => ({
            ...t,
            id: Number(t.id),
            projectId: Number(t.projectId),
            statusId: Number(t.statusId),
          }))
          .forEach((t) => {
            if (!map.has(t.statusId)) map.set(t.statusId, []);
            map.get(t.statusId)!.push(t);
          });
        this.tasksByStatus = map;

        // refresh comment counts
        const ids = (tasks ?? []).map((t) => Number(t.id)).filter(Boolean);
        if (ids.length) {
          this.api.getCommentCounts(ids).subscribe({
            next: (rec) => {
              this.commentCounts = new Map<number, number>(
                Object.entries(rec).map(([k, v]) => [Number(k), Number(v)])
              );
            },
            error: () => (this.commentCounts = new Map()),
          });
        } else {
          this.commentCounts = new Map();
        }
      },
      error: () => {
        // keep previous state if you prefer; no-op here
      },
    });
  }

  /* ---------- Global click: zatvori assignee/otkaži editor ako nije kompletan ---------- */
  @HostListener('document:click')
  onDocClick() {
    // zatvori sve dropdown-e
    this.ui.forEach((u) => (u.assigneeOpen = false));
    if (this.isArchived) return;

    // otkaži nedovršene task editore
    for (const [statusId, u] of this.ui) {
      if (u.adding) {
        const ready =
          !!u.draftName?.trim() && !!u.draftAssignee && !!u.draftDue;
        if (!ready) this.cancelAdd(statusId);
      }
    }

    // status editor: jednom, van petlje
    if (this.addingStatus) {
      this.shouldSaveStatus() ? this.commitAddStatus() : this.cancelAddStatus();
    }
  }

  addingStatus = false;
  draftStatusName = '';

  @ViewChild('boardRef') boardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('newStatusInput') newStatusInput!: ElementRef<HTMLInputElement>;

  startAddStatus(ev?: MouseEvent) {
    if (this.isArchived) return;
    ev?.stopPropagation(); // don’t let document click cancel it
    this.addingStatus = true;
    this.draftStatusName = '';

    // scroll to the end and focus the input
    setTimeout(() => {
      const el = this.boardRef?.nativeElement;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      this.newStatusInput?.nativeElement?.focus();
    });
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

    // max(orderNum) + 1
    const maxOrder = this.statuses.reduce(
      (m, s) => Math.max(m, s.orderNum),
      -1
    );
    const orderNum = maxOrder + 1;

    // zatvorimo editor odmah (optimistic UX)
    this.addingStatus = false;
    this.draftStatusName = '';

    const payload: Omit<Status, 'id'> = {
      projectId: proj.id,
      name,
      orderNum,
      terminal: false,
    };

    this.api.createStatus(payload).subscribe({
      next: (created) => {
        // dodaj na kraj (backend vraća id)
        this.statuses = [...this.statuses, created];
        this.tasksByStatus.set(created.id!, []);
        // skrol do nove kolone
        setTimeout(() => {
          const el = this.boardRef?.nativeElement;
          el?.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        });
      },
      error: () => {
        // po želji: vrati editor ili prikaži toast
      },
    });
  }

  cancelAddStatus() {
    this.addingStatus = false;
    this.draftStatusName = '';
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.addingStatus) this.cancelAddStatus();
  }

  assigneeFor(t: Task): Member | null {
    const raw = t.assignedMemberId;
    if (raw == null) return null;
    const id = Number(raw);
    if (Number.isNaN(id)) return null;
    return this.membersById.get(id) ?? null;
  }

  roleLabel(role: string) {
    switch ((role || '').toUpperCase()) {
      case 'GK':
        return 'Main coordinator';
      case 'PK':
        return 'Assistant coordinator';
      case 'NO':
        return 'Responsible person';
      default:
        return role || 'Member';
    }
  }
  avatarLetter(m?: Member): string {
    // Dok nemaš ime – inicijal “M”; kad API doda ime, izračunaj inicijal
    return 'M';
  }

  displayName(m?: Member): string {
    return m ? `Member #${m.userId}` : '—';
  }
  initialsFrom(m?: Member | null): string {
    // bez imena na BE, pa neutralna inicijala:
    return 'U';
  }
}
