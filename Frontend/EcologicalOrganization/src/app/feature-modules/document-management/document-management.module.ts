import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentManagementPageComponent } from './components/document-management-page/document-management-page.component';
import { MainSectionSidebarComponent } from './components/main-section-sidebar/main-section-sidebar.component';
import { DirectoryViewComponent } from './components/directory-view/directory-view.component';
import { DocumentManagementWelcomeComponent } from './components/document-management-welcome/document-management-welcome.component';
import { RouterModule } from '@angular/router';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { MaterialModule } from 'src/app/infrastructure/material/material.module';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MetadataComponent } from './components/metadata/metadata.component';
import { TagsComponent } from './components/tags/tags.component';
import { UserGroupsComponent } from './components/user-groups/user-groups.component';
import { GroupViewComponent } from './components/group-view/group-view.component';
import { DocumentViewComponent } from './components/document-view/document-view.component';
import { DirectoryEditComponent } from './components/directory-edit/directory-edit.component';
import { AdvancedSearchComponent } from './components/advanced-search/advanced-search.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';

@NgModule({
  declarations: [
    DocumentManagementPageComponent,
    MainSectionSidebarComponent,
    DirectoryViewComponent,
    DocumentManagementWelcomeComponent,
    SearchBarComponent,
    MetadataComponent,
    TagsComponent,
    UserGroupsComponent,
    GroupViewComponent,
    DocumentViewComponent,
    DirectoryEditComponent,
    AdvancedSearchComponent,
    AuditLogsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MatIconModule,
    FormsModule,
  ],
})
export class DocumentManagementModule {}
