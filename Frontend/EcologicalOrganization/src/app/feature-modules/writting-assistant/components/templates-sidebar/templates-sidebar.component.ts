import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../models/template.model';

@Component({
  selector: 'wa-templates-sidebar',
  templateUrl: './templates-sidebar.component.html',
  styleUrls: ['./templates-sidebar.component.css'],
})
export class TemplatesSidebarComponent implements OnInit {
  templates: Template[] = [];
  loading = true;

  @Output() hide = new EventEmitter<void>();
  @Output() selectTemplate = new EventEmitter<Template>();

  constructor(private templateService: TemplateService) {}

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
    this.selectTemplate.emit(t);
  }
}
