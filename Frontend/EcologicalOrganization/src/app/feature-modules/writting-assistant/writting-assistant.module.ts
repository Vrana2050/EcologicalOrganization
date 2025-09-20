import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WritingAssistantPageComponent } from './page/writing-assistant-page/writing-assistant-page.component';
import { ConversationsSidebarComponent } from './components/conversations-sidebar/conversations-sidebar.component';
import { TemplatesSidebarComponent } from './components/templates-sidebar/templates-sidebar.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { SessionEditorComponent } from './components/session-editor/session-editor.component';
import { SessionHeaderComponent } from './components/session-header/session-header.component';
import { SessionSectionComponent } from './components/session-section/session-section.component';
import { FormsModule } from '@angular/forms';
import { AddNewTemplateComponent } from './components/add-new-template/add-new-template.component';

@NgModule({
  declarations: [
    WritingAssistantPageComponent,
    ConversationsSidebarComponent,
    TemplatesSidebarComponent,
    WelcomeScreenComponent,
    SessionEditorComponent,
    SessionHeaderComponent,
    SessionSectionComponent,
    AddNewTemplateComponent,
  ],
  imports: [CommonModule, FormsModule],
})
export class WrittingAssistantModule {}
