import { Component, OnInit } from '@angular/core';
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

  constructor(private chatSessionService: ChatSessionService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
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
    console.log('Klik na kreiranje novog dokumenta');
  }

  onSelectConversation(c: ChatSession): void {
    console.log('Odabrana konverzacija:', c);
  }
}
