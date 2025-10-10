import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { switchMap } from 'rxjs/operators';

import { Task } from '../../../project-realization/models/task.model';
import { Comment } from '../../models/comment.model';
import { Member } from '../../models/member.model';
import { Resource } from '../../models/resource.model';
import { Status } from '../../models/status.model';
import { TaskResourceView } from '../../models/task-resource-view.model';
import { UnitOfMeasure } from '../../models/unit-of-measure.mode';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'xp-task-drawer',
  templateUrl: './task-drawer.component.html',
  styleUrls: ['./task-drawer.component.css'],
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', animate('220ms ease-out')),
      transition('* => void', animate('180ms ease-in')),
    ]),
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('150ms ease')),
    ]),
  ],
})
export class TaskDrawerComponent implements OnChanges {
  @Input() task!: Task;
  @Input() members: Member[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Task>();
  @Output() deleted = new EventEmitter<number>();

  private api = inject(ProjectService);
  private ctx = inject(ProjectContextService);

  comments: Comment[] = [];
  commentsLoading = false;
  commentsError = '';

  resources: TaskResourceView[] = [];
  resLoading = false;
  resError = '';

  resourcesCatalog: Resource[] = [];
  units: UnitOfMeasure[] = [];
  catalogLoading = false;

  addResOpen = false;

  descDraft = '';

  private loadCurrentStatus() {
    const sid = this.task?.statusId;
    if (!sid) {
      this.currentStatus = null;
      // don’t lock the UI just because we don’t know yet
      this.isTerminal = false;
      return;
    }

    this.api.getStatusById(sid).subscribe({
      next: (s) => {
        this.currentStatus = s || null;
        // honor terminal from backend; if you also use allowedNext, keep the OR if you prefer
        this.isTerminal = !!this.currentStatus?.terminal;
      },
      error: () => {
        this.currentStatus = null;
        // don’t lock on error
        this.isTerminal = false;
      },
    });
  }

  // ───────── Status data ─────────
  statusesMap = new Map<number, Status>(); // id -> Status (for names)
  allowedNext: Status[] = []; // allowed next statuses for current task
  isTerminal = false; // true if no allowed next
  fetchingStatusInfo = false;

  get isArchived(): boolean {
    return !!this.ctx.project()?.archived;
  }

  get isLocked(): boolean {
    return this.isArchived || !this.isLocked;
  }

  // ───────── Status helpers ─────────

  private loadStatusesMapIfNeeded() {
    if (!this.task?.projectId) return;
    if (this.statusesMap.size) return;
    this.api.getStatusesForProject(this.task.projectId).subscribe({
      next: (rows) => {
        (rows ?? []).forEach((s) => this.statusesMap.set(s.id!, s));
      },
      error: () => {},
    });
  }

  private refreshAllowedNext() {
    if (!this.task?.projectId || !this.task?.id) return;
    this.fetchingStatusInfo = true;
    this.api
      .getAllowedNextStatuses(this.task.projectId, this.task.id)
      .subscribe({
        next: (rows) => {
          this.allowedNext = rows ?? [];
          this.isTerminal = (this.allowedNext?.length ?? 0) === 0;
          this.fetchingStatusInfo = false;
        },
        error: () => {
          this.allowedNext = [];
          this.isTerminal = false; // don’t lock on error
          this.fetchingStatusInfo = false;
        },
      });
  }

  statusName(id?: number | null): string {
    if (id == null) return '—';
    return this.statusesMap.get(id)?.name ?? `Status #${id}`;
  }
  allowedNextStatuses: Status[] = [];

  /* ================== DESCRIPTION (editable) ================== */

  saveDescription() {
    if (this.isLocked) return;
    const next = (this.descDraft || '').trim();
    const prev = this.task.description || '';
    if (next === prev) return;

    // optimistic update + emit so board/list reflect quickly
    const old = this.task.description;
    this.task = { ...this.task, description: next };
    this.updated.emit(this.task);

    const svc: any = this.api as any;

    if (typeof svc.updateTaskDescription === 'function') {
      // preferred if you have it
      svc.updateTaskDescription(this.task.id, next).subscribe({
        error: () => {
          // rollback on error
          this.task = { ...this.task, description: old || '' };
          this.descDraft = this.task.description || '';
          this.updated.emit(this.task);
        },
      });
    } else if (typeof svc.updateTask === 'function') {
      // generic update fallback
      svc
        .updateTask({
          ...this.task,
          description: next,
        })
        .subscribe({
          error: () => {
            this.task = { ...this.task, description: old || '' };
            this.descDraft = this.task.description || '';
            this.updated.emit(this.task);
          },
        });
    } else {
      // no API available — keep optimistic result
    }
  }
  allowedStatuses: Status[] = [];
  private ensureCurrentStatusLoaded() {
    const sid = this.task?.statusId;
    if (!sid || this.statusesMap.has(sid)) return;

    this.api.getStatusById(sid).subscribe({
      next: (st) => {
        if (st?.id != null) this.statusesMap.set(st.id, st);
      },
      error: () => {
        /* ignore – fallback name will show */
      },
    });
  }

  get canChangeStatus(): boolean {
    if (this.isArchived) return false;
    return !this.currentStatus?.terminal; // terminal = view-only
  }

  private loadStatusAndAllowed() {
    const p = this.ctx.project();
    if (!p || !this.task?.id) return;

    // fetch current status (for label) - optional, but useful if you show it somewhere
    if (this.task.statusId != null) {
      this.api.getStatusById(this.task.statusId).subscribe({
        next: (s) => (this.currentStatus = s ?? null),
        error: () => (this.currentStatus = null),
      });
    } else {
      this.currentStatus = null;
    }

    // fetch allowed next statuses for dropdown
    this.api.getAllowedNextStatuses(p.id, this.task.id).subscribe({
      next: (rows) => {
        // Make sure current status appears as the selected option too (top of the list)
        const list = rows ?? [];
        const curId = this.task?.statusId ?? null;
        const hasCurInList = curId != null && list.some((s) => s.id === curId);
        if (!hasCurInList && this.currentStatus) {
          this.allowedStatuses = [this.currentStatus, ...list];
        } else {
          this.allowedStatuses = list;
        }
      },
      error: () => (this.allowedStatuses = []),
    });
  }
  onStatusPick(nextId: number) {
    // update local selection, mark dirty; do NOT call the API yet
    this.selectedStatusId = nextId;
    this.statusDirty = nextId !== this.task.statusId;
  }

  // When user picks a new status from the dropdown
  onStatusChange(newStatusId: number) {
    if (!this.canChangeStatus || !this.task?.id) return;
    if (!newStatusId || newStatusId === this.currentStatus?.id) return;

    const picked =
      this.allowedNextStatuses.find((s) => s.id === newStatusId) || null;
    if (!picked) return;

    // Optimistic UI – reflect the choice immediately
    this.stagedStatus = picked;
    this.statusDirty = true;

    this.currentStatus = picked;
    this.task.statusId = picked.id!;
  }

  // CUSTOM MODAL (restored)
  customOpen = false;
  custom = {
    fromCatalogId: null as number | null, // picked catalog resource id
    name: '' as string, // display only
    description: '' as string, // display only
    amount: null as number | null, // quantity to create with
    unitId: null as number | null, // for display (comes from catalog)
  };

  private savingProvided = new Set<number>();
  private deleting = new Set<number>();

  @ViewChild('addResRef') addResRef!: ElementRef<HTMLElement>;

  // ==== STATUS STATE ====
  statusLoading = false;
  currentStatus: Status | null = null;

  selectedStatusId: number | null = null; // what is shown in the dropdown
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']?.currentValue?.id) {
      const id = Number(changes['task'].currentValue.id);
      this.loadResources(id);
      this.loadComments(id);

      // init selected status from task
      this.selectedStatusId = this.task?.statusId ?? null;

      // load status + allowed next (for dropdown)
      this.loadStatusAndAllowed();

      if (!this.resourcesCatalog.length || !this.units.length) {
        this.loadCatalogs();
      }
    }
  }

  /* ================== LOADERS ================== */

  private loadResources(taskId: number) {
    this.resLoading = true;
    this.resError = '';
    this.resources = [];
    this.api.getResourcesForTask(taskId).subscribe({
      next: (data) => {
        this.resources = data ?? [];
        this.resLoading = false;
      },
      error: () => {
        this.resError = 'Failed to load resources.';
        this.resLoading = false;
      },
    });
  }
  unitCodeById(id: number | null | undefined): string {
    if (id == null) return '—';
    const u = this.units.find((x) => x.id === id);
    return u?.code ?? '—';
  }

  private loadCatalogs() {
    this.catalogLoading = true;
    this.api.getAllResources(1000).subscribe({
      next: (rs) => {
        this.resourcesCatalog = rs ?? [];
        this.catalogLoading = false;
      },
      error: () => (this.catalogLoading = false),
    });

    this.api.getAllUnitsOfMeasure(1000).subscribe({
      next: (u) => (this.units = u ?? []),
      error: () => {},
    });
  }

  private loadComments(taskId: number) {
    this.commentsLoading = true;
    this.commentsError = '';
    this.comments = [];
    this.api.getCommentsForTask(taskId).subscribe({
      next: (data) => {
        this.comments = data ?? [];
        this.commentsLoading = false;
      },
      error: (err) => {
        this.commentsError = err?.error?.message || 'Failed to load comments.';
        this.commentsLoading = false;
      },
    });
  }

  /* ================== RESOURCES ================== */

  resTitle(r: TaskResourceView) {
    const d = r.resourceDescription || '';
    const qty = `${r.quantity} ${r.unitCode ?? ''}`.trim();
    return d
      ? `${r.resourceName}\n${qty}\n\n${d}`
      : `${r.resourceName}\n${qty}`;
  }

  toggleAddResDropdown(ev: MouseEvent) {
    if (this.isArchived) return;
    ev.stopPropagation();
    this.addResOpen = !this.addResOpen;
    if (
      this.addResOpen &&
      (!this.resourcesCatalog.length || !this.units.length)
    ) {
      this.loadCatalogs();
    }
  }

  pickCatalogResource(item: Resource) {
    if (this.isArchived) return;
    // Pre-populate the custom modal from catalog resource
    this.customOpen = true;
    this.custom.fromCatalogId = item.id;
    this.custom.name = item.name || '';
    this.custom.description = item.description || '';
    this.custom.unitId = item.unitOfMeasureId ?? null;
    this.custom.amount = null; // user provides
    this.addResOpen = false;
  }

  openEmptyCustom() {
    if (this.isArchived) return;
    // We still require a catalog resource to create TaskResource on BE,
    // so opening “empty” just clears prefill, but we’ll block creation
    // if no catalog is chosen.
    this.customOpen = true;
    this.custom.fromCatalogId = null;
    this.custom.name = '';
    this.custom.description = '';
    this.custom.unitId = null;
    this.custom.amount = null;
    this.addResOpen = false;
  }

  cancelCustom() {
    this.customOpen = false;
  }
  createCustom() {
    if (this.isArchived) return;

    this.resError = '';

    const qty = Number(this.custom?.amount);
    if (!qty || qty <= 0) {
      this.resError = 'Unesite ispravnu količinu.';
      return;
    }

    // 1) Ako je izabran postojeći resurs iz kataloga → samo ga veži na task
    if (this.custom?.fromCatalogId) {
      this.api
        .createTaskResource({
          taskId: this.task.id,
          resourceId: this.custom.fromCatalogId,
          quantity: qty,
          provided: false,
        })
        .subscribe({
          next: () => {
            this.customOpen = false;
            this.loadResources(this.task.id);
          },
          error: () => {
            this.resError = 'Greška pri dodavanju resursa na task.';
          },
        });
      return;
    }

    // 2) Nije izabran postojeći → prvo napravi novi Resource pa ga veži
    const name = (this.custom?.name ?? '').trim();
    const description = this.custom?.description?.trim?.() ?? '';
    const unitOfMeasureId = Number(this.custom?.unitId ?? this.custom?.unitId); // podrži oba naziva iz forme

    if (!name) {
      this.resError = 'Unesite naziv resursa.';
      return;
    }
    if (!unitOfMeasureId) {
      this.resError = 'Odaberite jedinicu mere.';
      return;
    }

    // opciono toggle za UI
    (this as any).posting = true;

    this.api
      .createResource({
        // Omit<Resource, 'id'>
        name,
        description,
        unitOfMeasureId, // bitno: koristi se baš ovo polje iz modela Resource
      })
      .pipe(
        switchMap((res: Resource) =>
          this.api.createTaskResource({
            taskId: this.task.id,
            resourceId: res.id,
            quantity: qty,
            provided: false,
          })
        )
      )
      .subscribe({
        next: () => {
          (this as any).posting = false;
          this.customOpen = false;
          this.loadResources(this.task.id);
        },
        error: () => {
          (this as any).posting = false;
          this.resError = 'Greška pri kreiranju i vezivanju resursa.';
        },
      });
  }

  toggleProvided(r: TaskResourceView, ev: MouseEvent) {
    ev.stopPropagation();
    if (this.isArchived || !r?.id || this.savingProvided.has(r.id)) return;

    const prev = r.provided;
    r.provided = !r.provided; // optimistic
    this.savingProvided.add(r.id);

    const body = {
      id: r.id,
      taskId: this.task.id,
      resourceId: r.resourceId,
      quantity: r.quantity,
      provided: r.provided,
    };

    this.api.updateTaskResource(body).subscribe({
      next: (updated) => {
        if (updated) {
          r.provided =
            typeof updated.provided === 'number'
              ? updated.provided === 1
              : !!updated.provided;
          r.quantity =
            typeof updated.quantity === 'string'
              ? Number(updated.quantity)
              : updated.quantity ?? r.quantity;
        }
        this.savingProvided.delete(r.id);
      },
      error: () => {
        r.provided = prev; // rollback
        this.savingProvided.delete(r.id);
        this.resError = 'Failed to update provided status.';
      },
    });
  }

  removeResource(r: TaskResourceView, ev: MouseEvent) {
    ev.stopPropagation();
    if (this.isArchived || !r?.id || this.deleting.has(r.id)) return;

    this.deleting.add(r.id);
    this.api.deleteTaskResource(r.id).subscribe({
      next: () => {
        this.resources = this.resources.filter((x) => x.id !== r.id);
        this.deleting.delete(r.id);
        this.loadResources(this.task.id);
      },
      error: () => {
        this.deleting.delete(r.id);
        this.resError = 'Failed to delete resource.';
      },
    });
  }

  /* ================== COMMENTS ================== */

  commentDraft = '';
  posting = false;

  postComment() {
    if (this.isArchived) return;

    const text = (this.commentDraft || '').trim();
    if (!text || this.posting) return;

    const memberId = this.task?.assignedMemberId; // adjust if you have current user/member
    if (!memberId) {
      this.commentsError = 'No member available to author the comment.';
      return;
    }

    const optimistic: Comment = {
      id: -Date.now(),
      projectId: this.task.projectId,
      taskId: this.task.id,
      memberId,
      text,
      createdAt: new Date().toISOString(),
    };

    this.posting = true;
    this.comments = [...(this.comments ?? []), optimistic];

    this.api
      .createComment({
        projectId: optimistic.projectId,
        taskId: optimistic.taskId,
        memberId: optimistic.memberId,
        text: optimistic.text,
      })
      .subscribe({
        next: (saved) => {
          const idx = this.comments.findIndex((c) => c.id === optimistic.id);
          if (idx >= 0) this.comments[idx] = saved;
          this.commentDraft = '';
          this.posting = false;
        },
        error: () => {
          this.comments = this.comments.filter((c) => c.id !== optimistic.id);
          this.commentsError = 'Failed to post comment.';
          this.posting = false;
        },
      });
  }

  /* ================== UI HELPERS ================== */

  trackByResId = (_: number, r: TaskResourceView) => r.id;
  trackByCommentId = (_: number, c: Comment) => c.id;
  trackByCatalogId = (_: number, x: Resource) => x.id;

  private commitStatusIfDirty() {
    if (!this.statusDirty || this.selectedStatusId == null) return;
    if (this.selectedStatusId === this.task.statusId) {
      this.statusDirty = false;
      return;
    }

    const payload = { ...this.task, statusId: this.selectedStatusId };

    this.api.updateTask(payload).subscribe({
      next: (saved) => {
        // update local task
        this.task = saved ?? (payload as Task);
        // refresh status lists (optional but nice)
        this.loadStatusAndAllowed();
        this.statusDirty = false;
        // notify parent so it can reload the lists/board
        this.updated.emit(this.task);
      },
      error: () => {
        // rollback UI selection to server value
        this.selectedStatusId = this.task.statusId ?? null;
        this.statusDirty = false;
        // (optional) toast/snackbar
      },
    });
  }

  // === Deferred status commit ===
  stagedStatus: Status | null = null; // what user picked in dropdown
  statusDirty = false; // true if something to commit

  @ViewChild('drawerRoot') drawerRoot!: ElementRef<HTMLElement>;

  onDrawerScroll() {
    if (this.addResOpen) this.addResOpen = false;
  }

  //////////////////////
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    // existing resource dropdown close logic...
    if (this.addResOpen) {
      const host = this.addResRef?.nativeElement;
      if (host && !host.contains(ev.target as Node)) {
        this.addResOpen = false;
      }
    }
    // commit deferred status change on outside click
    this.commitStatusIfDirty();
  }

  onDrawerSurfaceClick(ev: MouseEvent) {
    if (!this.addResOpen) {
      // treat clicking the drawer surface as “inside”; we do not commit here
      return;
    }
    const host = this.addResRef?.nativeElement;
    if (host && !host.contains(ev.target as Node)) {
      this.addResOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscKey() {
    if (this.customOpen) {
      this.cancelCustom();
      return;
    }
    if (this.addResOpen) {
      this.addResOpen = false;
      return;
    }
    // ESC is an “exit” action → commit before closing
    this.commitStatusIfDirty();
    this.onClose();
  }

  onClose() {
    // clicking the “✕” close button → commit before closing
    this.commitStatusIfDirty();
    this.close.emit();
  }
}
