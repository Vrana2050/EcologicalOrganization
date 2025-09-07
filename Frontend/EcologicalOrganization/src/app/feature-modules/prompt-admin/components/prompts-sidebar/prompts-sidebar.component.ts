import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import { Prompt } from '../../models/prompt.model';

@Component({
  selector: 'pa-prompts-sidebar',
  templateUrl: './prompts-sidebar.component.html',
  styleUrls: ['./prompts-sidebar.component.css'],
})
export class PromptsSidebarComponent {
  @Input() prompts: Prompt[] = [];
  @Input() loading = false;
  @Input() selectedId: number | null | undefined = null;

  @Output() createNew = new EventEmitter<void>();
  @Output() selectPrompt = new EventEmitter<Prompt>();
  @Output() deletePrompt = new EventEmitter<Prompt>();

  menuOpenId: number | null = null;

  onCreateNew(): void {
    this.createNew.emit();
  }
  onSelectPrompt(p: Prompt): void {
    this.selectPrompt.emit(p);
  }
  toggleMenu(id: number): void {
    this.menuOpenId = this.menuOpenId === id ? null : id;
  }
  onDelete(p: Prompt): void {
    this.deletePrompt.emit(p);
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
