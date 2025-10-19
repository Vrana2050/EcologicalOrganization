import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { ChatSession } from '../../models/chat-session.model';
import { ChatSessionService } from '../../services/chat-session.service';
import { SessionOverview } from '../../models/session-section.model';
import { DocumentTypeService } from 'src/app/feature-modules/prompt-admin/services/document-type.service';
import { DocumentType } from 'src/app/feature-modules/prompt-admin/models/document-type.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'xp-writing-assistant-page',
  templateUrl: './writing-assistant-page.component.html',
  styleUrls: ['./writing-assistant-page.component.css'],
})
export class WritingAssistantPageComponent implements OnInit {
  conversations: ChatSession[] = [];
  documentTypes: DocumentType[] = [];
  currentUser: User | null = null;
  private userSub?: Subscription;
  loading = true;

  showTemplatesSidebar = false;
  showPreview = false;

  activeSession: ChatSession | null = null;
  sessionOverview: SessionOverview | null = null;

  private lastSearchTerm?: string;

  page = 1;
  perPage = 20;
  totalCount = 0;
  loadingMore = false;
  hasMore = false;
  currentSearchTerm?: string;

  constructor(
    private chatSessionService: ChatSessionService,
    private documentTypeService: DocumentTypeService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe(
      (u) => (this.currentUser = u)
    );
    this.loadConversations(); // inicijalno bez filtera
    this.loadDocumentTypes();

    this.route.paramMap
      .pipe(
        map((p) => p.get('sessionId')),
        filter((sid): sid is string => !!sid),
        map((sid) => +sid),
        distinctUntilChanged()
      )
      .subscribe((id) => this.openSession(id));
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadConversations(searchTerm?: string, append = false): void {
    this.loading = !append;
    if (!append) {
      this.page = 1;
    }

    this.chatSessionService
      .list(this.page, this.perPage, searchTerm)
      .subscribe({
        next: (res) => {
          this.totalCount = res.meta.totalCount;
          this.conversations = append
            ? [...this.conversations, ...res.items]
            : res.items;
          this.loading = false;
          this.loadingMore = false; // indikator za učitavanje sledeće strane
          this.hasMore = this.conversations.length < this.totalCount;
        },
        error: () => {
          this.loading = false;
          this.loadingMore = false;
        },
      });
  }

  // ⬇️ poziva se iz sidebar-a: (search)="onSearch($event)"
  onSearch(term?: string) {
    this.currentSearchTerm = (term ?? '').trim() || undefined;
    this.lastSearchTerm = this.currentSearchTerm; // zadržavamo i staro polje
    this.loadConversations(this.currentSearchTerm, false); // reset (bez append)
  }

  // ⬇️ poziva se iz sidebar-a: (loadMore)="onLoadMore()"
  onLoadMore() {
    if (!this.hasMore || this.loadingMore) return;
    this.loadingMore = true;
    this.page += 1;

    this.chatSessionService
      .list(this.page, this.perPage, this.currentSearchTerm)
      .subscribe({
        next: (res) => {
          this.conversations = [...this.conversations, ...res.items];
          this.loadingMore = false;
          this.totalCount = res.meta.totalCount;
          this.hasMore = this.conversations.length < this.totalCount;
        },
        error: () => {
          this.loadingMore = false;
        },
      });
  }

  loadDocumentTypes(): void {
    this.documentTypeService.list().subscribe({
      next: (page) => {
        this.documentTypes = page.items;
      },
      error: (err) => {
        console.error('Error loading document types:', err);
      },
    });
  }

  onDocTypeChanged(newId: number) {
    if (!this.activeSession) return;

    const prev = this.activeSession.documentTypeId;
    this.activeSession = { ...this.activeSession, documentTypeId: +newId };

    this.chatSessionService
      .patchDocumentType(this.activeSession.id, +newId)
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error patching document type:', err);
          this.activeSession = { ...this.activeSession!, documentTypeId: prev };
        },
      });
  }

  openTemplates(): void {
    this.showTemplatesSidebar = true;
    this.showPreview = false;
  }
  closeTemplates(): void {
    this.showTemplatesSidebar = false;
  }

  onSessionCreated(session: ChatSession): void {
    this.conversations = [session, ...this.conversations];
    this.showTemplatesSidebar = false;
    this.showPreview = false;
    this.activeSession = session;
    this.router.navigate(['/writing-assistant', session.id]);
  }

  onSelectConversation(c: ChatSession): void {
    this.showTemplatesSidebar = false;
    this.showPreview = false;
    if (this.activeSession?.id === c.id) return;
    this.router.navigate(['/writing-assistant', c.id]);
  }

  private openSession(id: number): void {
    this.showPreview = false;
    const found = this.conversations.find((x) => x.id === id);
    this.activeSession = found ?? {
      id,
      templateId: 0,
      createdBy: 0,
      documentTypeId: 0,
      title: '',
      updatedAt: undefined,
    };

    this.loadOverview(id);
  }

  private loadOverview(sessionId: number): void {
    this.chatSessionService.getOverview(sessionId).subscribe({
      next: (rows) => {
        this.sessionOverview = rows;

        if (this.activeSession) {
          this.activeSession = {
            ...this.activeSession,
            documentTypeId: rows.documentTypeId,
          };
        }
      },
      error: (err) =>
        console.error('Error loading session overview for', sessionId, err),
    });
  }

  onSessionTitleChanged(ev: { id: number; title: string }) {
    const idx = this.conversations.findIndex((c) => c.id === ev.id);
    if (idx > -1) {
      this.conversations[idx] = {
        ...this.conversations[idx],
        title: ev.title,
      };
    }
    if (this.activeSession?.id === ev.id) {
      this.activeSession = { ...this.activeSession, title: ev.title };
    }
  }

  onSessionDocTypeChanged(ev: { id: number; documentTypeId: number }) {
    if (!this.activeSession) return;

    const prev = this.activeSession.documentTypeId;
    this.activeSession = {
      ...this.activeSession,
      documentTypeId: ev.documentTypeId,
    };

    this.chatSessionService
      .patchDocumentType(ev.id, ev.documentTypeId)
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error updating document type:', err);
          this.activeSession = { ...this.activeSession!, documentTypeId: prev };
        },
      });
  }

  onDeleteConversation(c: ChatSession): void {
    this.chatSessionService.delete(c.id).subscribe({
      next: () => {
        this.conversations = this.conversations.filter((x) => x.id !== c.id);
        if (this.activeSession?.id === c.id) {
          this.activeSession = null;
          this.sessionOverview = null;
          this.showPreview = false;
          this.router.navigate(['/writing-assistant']);
        }
      },
      error: (err) => console.error('Error deleting conversation:', err),
    });
  }

  onOverviewChanged(ov: SessionOverview) {
    this.sessionOverview = {
      ...ov,
      sections: [...(ov.sections ?? [])],
    };
  }
}
