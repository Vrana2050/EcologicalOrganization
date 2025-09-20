import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
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
export class TemplatesSidebarComponent implements OnInit {
  templates: Template[] = [];
  loading = true;
  creating = false;

  @Output() hide = new EventEmitter<void>();
  @Output() created = new EventEmitter<ChatSession>();

  @Input() documentTypes: DocumentType[] = [];

  showCreateModal = false;

  constructor(
    private templateService: TemplateService,
    private chatSessionService: ChatSessionService
  ) {}

  ngOnInit(): void {
    this.templateService.list().subscribe({
      next: (page) => {
        this.templates = page.items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading templates:', err);
        this.loading = false;
      },
    });
  }

  onHide(): void {
    this.hide.emit();
  }

  onSelectTemplate(t: Template): void {
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

  openCreateModal() {
    console.log('open');
    this.showCreateModal = true;
  }
  onModalClose() {
    this.showCreateModal = false;
  }
  onTemplateCreated(tpl: Template) {
    const dt = this.documentTypes.find((d) => d.id === tpl.documentTypeId);
    tpl.documentTypeName = dt ? dt.name : '';
    this.templates = [tpl, ...this.templates];
  }
}
