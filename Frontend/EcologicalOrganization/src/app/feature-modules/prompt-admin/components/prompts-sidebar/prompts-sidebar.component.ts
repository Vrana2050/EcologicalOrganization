import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Prompt } from '../../models/prompt.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'pa-prompts-sidebar',
  templateUrl: './prompts-sidebar.component.html',
  styleUrls: ['./prompts-sidebar.component.css'],
})
export class PromptsSidebarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() prompts: Prompt[] = [];
  @Input() loading = false;
  @Input() loadingMore = false;
  @Input() hasMore = false;
  @Input() selectedId: number | null | undefined = null;

  @Output() createNewPrompt = new EventEmitter<void>();
  @Output() selectPrompt = new EventEmitter<Prompt>();
  @Output() deletePrompt = new EventEmitter<number>();
  @Output() openSystemAnalytics = new EventEmitter<void>();
  @Output() search = new EventEmitter<string | undefined>();
  @Output() loadMore = new EventEmitter<void>();

  menuOpenId: number | null = null;

  showSearch = false;
  searchTerm = '';
  private search$ = new Subject<string>();
  private searchSub?: Subscription;

  bottomHintVisible = false;
  private loadMoreDelayTimer: any = null;
  private hintDelayTimer: any = null;

  @ViewChild('searchInputRef') searchInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('scrollAreaRef') scrollAreaRef!: ElementRef<HTMLDivElement>;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.searchSub = this.search$
      .pipe(
        map((v) => (v ?? '').trim()),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((term) => {
        this.scrollToTop();
        this.search.emit(term || undefined);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prompts']?.previousValue && changes['prompts']?.currentValue) {
      const prevLen =
        (changes['prompts'].previousValue as Prompt[]).length ?? 0;
      const currLen = (changes['prompts'].currentValue as Prompt[]).length ?? 0;
      if (currLen <= 20 && currLen < prevLen) {
        this.scrollToTop();
      }
    }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.clearLoadMoreTimers();
  }

  onCreateNewPrompt(): void {
    this.createNewPrompt.emit();
  }

  onSelectPrompt(p: Prompt): void {
    this.selectPrompt.emit(p);
  }

  toggleMenu(id: number): void {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }

  onDelete(promptId: number): void {
    this.deletePrompt.emit(promptId);
    this.menuOpenId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrap')) this.menuOpenId = null;
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 0);
    } else {
      this.clearSearch();
    }
  }

  onSearchInput(val: string): void {
    this.searchTerm = val;
    this.search$.next(val);
  }

  clearSearch(): void {
    const hadTerm = !!this.searchTerm;
    this.searchTerm = '';
    if (hadTerm) {
      this.scrollToTop();
      this.search.emit(undefined);
    }
    this.showSearch = false;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.showSearch) this.clearSearch();
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
          this.loadMore.emit();
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
    const el = this.scrollAreaRef?.nativeElement;
    if (el) el.scrollTop = 0;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
