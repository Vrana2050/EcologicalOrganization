import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { ChatSession } from '../../models/chat-session.model';
import { ChatSessionService } from '../../services/chat-session.service';
import { SessionOverview } from '../../models/session-section.model';

@Component({
  selector: 'xp-writing-assistant-page',
  templateUrl: './writing-assistant-page.component.html',
  styleUrls: ['./writing-assistant-page.component.css'],
})
export class WritingAssistantPageComponent implements OnInit {
  conversations: ChatSession[] = [];
  loading = true;

  showTemplatesSidebar = false;
  activeSession: ChatSession | null = null;
  sessionOverview: SessionOverview | null = null;

  constructor(
    private chatSessionService: ChatSessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();

    this.route.paramMap
      .pipe(
        map((p) => p.get('sessionId')),
        filter((sid): sid is string => !!sid),
        map((sid) => +sid),
        distinctUntilChanged()
      )
      .subscribe((id) => this.openSession(id));
  }

  loadConversations(): void {
    this.loading = true;
    this.chatSessionService.list().subscribe({
      next: (page) => {
        this.conversations = page.items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading conversations:', err);
        this.loading = false;
      },
    });
  }

  openTemplates(): void {
    this.showTemplatesSidebar = true;
  }
  closeTemplates(): void {
    this.showTemplatesSidebar = false;
  }

  onSessionCreated(session: ChatSession): void {
    this.conversations = [session, ...this.conversations];
    this.showTemplatesSidebar = false;
    this.activeSession = session;
    this.router.navigate(['/writing-assistant', session.id]);
  }

  onSelectConversation(c: ChatSession): void {
    this.showTemplatesSidebar = false;
    this.activeSession = c;
    if (this.activeSession?.id !== c.id) this.activeSession = c;
    this.router.navigate(['/writing-assistant', c.id]);
  }

  private openSession(id: number): void {
    const found = this.conversations.find((x) => x.id === id);
    this.activeSession = found ?? {
      id,
      templateId: 0,
      createdBy: 0,
      title: '',
      updatedAt: undefined,
    };

    this.loadOverview(id);
  }

  private loadOverview(sessionId: number): void {
    this.chatSessionService.getOverview(sessionId).subscribe({
      next: (rows) => (this.sessionOverview = rows),
      error: (err) =>
        console.error('Error loading session overview for', sessionId, err),
    });
  }
}
