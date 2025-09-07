import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptAdminPageComponent } from './page/admin-page/admin-page.component';
import { PromptsSidebarComponent } from './components/prompts-sidebar/prompts-sidebar.component';
import { VersionsSidebarComponent } from './components/versions-sidebar/versions-sidebar.component';

@NgModule({
  declarations: [
    PromptAdminPageComponent,
    PromptsSidebarComponent,
    VersionsSidebarComponent,
  ],
  imports: [CommonModule],
})
export class PromptAdminModule {}
