import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
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
  @Output() deleteConversation = new EventEmitter<ChatSession>();

  menuOpenId: number | null = null;

  onCreateNew(): void {
    this.createNew.emit();
  }

  onSelectConversation(c: ChatSession): void {
    this.selectConversation.emit(c);
  }

  toggleMenu(id: number): void {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }

  onDelete(c: ChatSession): void {
    this.deleteConversation.emit(c);
    this.menuOpenId = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrap')) {
      this.menuOpenId = null;
    }
  }
}
