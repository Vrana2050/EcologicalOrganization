import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { TemplateService } from '../../services/template.service';
import { Template } from '../../models/template.model';
import { ChatSessionService } from '../../services/chat-session.service';
import { ChatSession } from '../../models/chat-session.model';
import { DocumentType } from 'src/app/feature-modules/prompt-admin/models/document-type.model';

@Component({
  selector: 'wa-templates-sidebar',
  templateUrl: './templates-sidebar.component.html',
  styleUrls: ['./templates-sidebar.component.css'],
})
export class TemplatesSidebarComponent implements OnInit, OnDestroy {
  templates: Template[] = [];
  loading = true;
  loadingMore = false;
  creating = false;

  page = 1;
  perPage = 20;
  totalCount = 0;
  hasMore = false;

  searchTerm = '';
  private search$ = new Subject<string>();
  private searchSub?: Subscription;

  menuOpenId: number | null = null;
  deletingId: number | null = null;

  bottomHintVisible = false;
  private loadMoreDelayTimer: any = null;
  private hintDelayTimer: any = null;

  @ViewChild('tplSearchInputRef')
  tplSearchInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('tplScrollRef') tplScrollRef!: ElementRef<HTMLDivElement>;

  @Output() hide = new EventEmitter<void>();
  @Output() created = new EventEmitter<ChatSession>();

  @Input() documentTypes: DocumentType[] = [];

  showCreateModal = false;

  constructor(
    private templateService: TemplateService,
    private chatSessionService: ChatSessionService
  ) {}

  ngOnInit(): void {
    this.loadTemplates();

    this.searchSub = this.search$
      .pipe(
        map((v) => (v ?? '').trim()),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((term) => {
        this.scrollToTop();
        this.page = 1;
        this.loadTemplates(term || undefined, false);
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.clearLoadMoreTimers();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrap')) {
      this.menuOpenId = null;
    }
  }

  toggleMenu(id: number): void {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }

  private loadTemplates(search?: string, append = false): void {
    this.loading = !append;
    if (!append) this.page = 1;

    this.templateService.list(this.page, this.perPage, search).subscribe({
      next: (res) => {
        this.totalCount = res.meta.totalCount;
        this.templates = append ? [...this.templates, ...res.items] : res.items;

        this.promotePrazanFirst();
        this.normalizeDocumentTypeNames();

        this.loading = false;
        this.loadingMore = false;
        this.hasMore = this.templates.length < this.totalCount;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.loading = false;
        this.loadingMore = false;
      },
    });
  }

  private loadMore(): void {
    if (!this.hasMore || this.loading || this.loadingMore) return;
    this.loadingMore = true;
    this.page += 1;

    this.templateService
      .list(this.page, this.perPage, this.currentSearch)
      .subscribe({
        next: (res) => {
          this.templates = [...this.templates, ...res.items];

          this.promotePrazanFirst();
          this.normalizeDocumentTypeNames();

          this.totalCount = res.meta.totalCount;
          this.loadingMore = false;
          this.hasMore = this.templates.length < this.totalCount;
        },
        error: () => (this.loadingMore = false),
      });
  }

  get currentSearch(): string | undefined {
    const t = (this.searchTerm ?? '').trim();
    return t ? t : undefined;
  }

  private promotePrazanFirst(): void {
    const isPrazan = (t: Template) =>
      (t.name ?? '').trim().toLowerCase() === 'prazan';
    const idx = this.templates.findIndex(isPrazan);
    if (idx > 0) {
      const [p] = this.templates.splice(idx, 1);
      this.templates = [p, ...this.templates];
    }
  }

  private normalizeDocumentTypeNames(): void {
    this.templates = this.templates.map((t) => {
      const raw = (t.documentTypeName ?? '').trim().toLowerCase();
      if (raw === 'default' || raw === 'ostali') {
        return { ...t, documentTypeName: 'Opšti' };
      }
      return t;
    });
  }

  onHide(): void {
    this.hide.emit();
  }

  onSelectTemplate(t: Template): void {
    if (this.menuOpenId === t.id) return;

    this.creating = true;
    this.chatSessionService.create(t.id).subscribe({
      next: (session) => {
        this.creating = false;
        this.created.emit(session);
        this.hide.emit();
      },
      error: (err) => {
        console.error('Error creating chat session:', err);
        this.creating = false;
      },
    });
  }

  onDeleteTemplate(t: Template): void {
    if (this.deletingId) return;
    this.deletingId = t.id;
    this.menuOpenId = null;

    this.templateService.delete(t.id).subscribe({
      next: () => {
        this.templates = this.templates.filter((x) => x.id !== t.id);
        this.promotePrazanFirst();

        if (this.hasMore && this.templates.length < this.totalCount) {
          this.loadMore();
        }

        this.deletingId = null;
      },
      error: (err) => {
        console.error('Error deleting template:', err);
        this.deletingId = null;
      },
    });
  }

  onSearchInput(val: string): void {
    this.searchTerm = val;
    this.search$.next(val);
  }

  clearSearch(): void {
    if (!this.searchTerm) return;
    this.searchTerm = '';
    this.scrollToTop();
    this.page = 1;
    this.loadTemplates(undefined, false);
  }

  onScroll(evt: Event): void {
    if (!this.hasMore || this.loading || this.loadingMore) return;
    const el = evt.target as HTMLElement;
    const threshold = 160;
    const nearBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;

    if (nearBottom) {
      if (!this.hintDelayTimer && !this.bottomHintVisible) {
        this.hintDelayTimer = setTimeout(() => {
          this.bottomHintVisible = true;
          this.hintDelayTimer = null;
        }, 500);
      }
      if (!this.loadMoreDelayTimer) {
        this.loadMoreDelayTimer = setTimeout(() => {
          this.clearLoadMoreTimers();
          this.bottomHintVisible = false;
          this.loadMore();
        }, 500);
      }
    } else {
      this.bottomHintVisible = false;
      this.clearLoadMoreTimers();
    }
  }

  private clearLoadMoreTimers(): void {
    if (this.loadMoreDelayTimer) {
      clearTimeout(this.loadMoreDelayTimer);
      this.loadMoreDelayTimer = null;
    }
    if (this.hintDelayTimer) {
      clearTimeout(this.hintDelayTimer);
      this.hintDelayTimer = null;
    }
  }

  private scrollToTop(): void {
    const el = this.tplScrollRef?.nativeElement;
    if (el) el.scrollTop = 0;
  }

  openCreateModal() {
    this.showCreateModal = true;
  }
  onModalClose() {
    this.showCreateModal = false;
  }
  onTemplateCreated(tpl: Template) {
    const dt = this.documentTypes.find((d) => d.id === tpl.documentTypeId);
    tpl.documentTypeName = dt ? dt.name : '';
    this.templates = [tpl, ...this.templates];
    this.normalizeDocumentTypeNames();
    this.promotePrazanFirst();
  }
}
