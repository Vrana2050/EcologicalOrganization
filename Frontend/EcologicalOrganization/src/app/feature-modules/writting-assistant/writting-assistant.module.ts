import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WritingAssistantPageComponent } from './page/writing-assistant-page/writing-assistant-page.component';
import { ConversationsSidebarComponent } from './components/conversations-sidebar/conversations-sidebar.component';
import { TemplatesSidebarComponent } from './components/templates-sidebar/templates-sidebar.component';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';



@NgModule({
  declarations: [
    WritingAssistantPageComponent,
    ConversationsSidebarComponent,
    TemplatesSidebarComponent,
    WelcomeScreenComponent
  ],
  imports: [
    CommonModule
  ]
})
export class WrittingAssistantModule { }
