import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WritingAssistantPageComponent } from './page/writing-assistant-page/writing-assistant-page.component';
import { ConversationsSidebarComponent } from './components/conversations-sidebar/conversations-sidebar.component';



@NgModule({
  declarations: [
    WritingAssistantPageComponent,
    ConversationsSidebarComponent
  ],
  imports: [
    CommonModule
  ]
})
export class WrittingAssistantModule { }
