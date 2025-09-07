import { Component } from '@angular/core';

@Component({
  selector: 'xp-writing-assistant-page',
  templateUrl: './writing-assistant-page.component.html',
  styleUrls: ['./writing-assistant-page.component.css'],
})
export class WritingAssistantPageComponent {
  showTemplatesSidebar = false;

  openTemplates(): void {
    this.showTemplatesSidebar = true;
  }

  closeTemplates(): void {
    this.showTemplatesSidebar = false;
  }
}
