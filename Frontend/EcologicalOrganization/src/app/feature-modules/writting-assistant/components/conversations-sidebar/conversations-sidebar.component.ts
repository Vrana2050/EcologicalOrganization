import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatSession } from '../../models/chat-session.model';

@Component({
  selector: 'wa-conversations-sidebar',
  templateUrl: './conversations-sidebar.component.html',
  styleUrls: ['./conversations-sidebar.component.css'],
})
export class ConversationsSidebarComponent {
  @Input() conversations: ChatSession[] = [];
  @Input() loading = false;
  @Input() selectedId: number | null | undefined = null;

  @Output() createNew = new EventEmitter<void>();
  @Output() selectConversation = new EventEmitter<ChatSession>();

  onCreateNew(): void {
    this.createNew.emit();
  }

  onSelectConversation(c: ChatSession): void {
    this.selectConversation.emit(c);
  }
}
