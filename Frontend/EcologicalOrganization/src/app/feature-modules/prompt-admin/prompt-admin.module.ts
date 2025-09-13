import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptAdminPageComponent } from './page/admin-page/admin-page.component';
import { PromptsSidebarComponent } from './components/prompts-sidebar/prompts-sidebar.component';
import { VersionsSidebarComponent } from './components/versions-sidebar/versions-sidebar.component';
import { PromptHeaderComponent } from './components/prompt-header/prompt-header.component';
import { PromptEditorComponent } from './components/prompt-editor/prompt-editor.component';
import { PromptVersionComponent } from './components/prompt-version/prompt-version.component';
import { FormsModule } from '@angular/forms';
import { DocumentTypeManagementComponent } from './page/document-type-management/document-type-management.component';

@NgModule({
  declarations: [
    PromptAdminPageComponent,
    PromptsSidebarComponent,
    VersionsSidebarComponent,
    PromptHeaderComponent,
    PromptEditorComponent,
    PromptVersionComponent,
    DocumentTypeManagementComponent,
  ],
  imports: [CommonModule, FormsModule],
})
export class PromptAdminModule {}
