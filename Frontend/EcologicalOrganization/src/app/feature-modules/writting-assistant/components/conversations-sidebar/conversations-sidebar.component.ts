import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ChatSessionService } from '../../services/chat-session.service';
import { ChatSession } from '../../models/chat-session.model';

@Component({
  selector: 'wa-conversations-sidebar',
  templateUrl: './conversations-sidebar.component.html',
  styleUrls: ['./conversations-sidebar.component.css'],
})
export class ConversationsSidebarComponent implements OnInit {
  conversations: ChatSession[] = [];
  loading = true;

  @Output() createNew = new EventEmitter<void>();

  constructor(private chatSessionService: ChatSessionService) {}

  ngOnInit(): void {
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

  onCreateNew(): void {
    this.createNew.emit();
  }

  onSelectConversation(c: ChatSession): void {
    console.log('Odabrana konverzacija:', c);
  }
}
