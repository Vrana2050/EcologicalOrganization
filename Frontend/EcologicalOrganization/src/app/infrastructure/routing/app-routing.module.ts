import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { WritingAssistantPageComponent } from 'src/app/feature-modules/writting-assistant/page/writing-assistant-page/writing-assistant-page.component';
import { PromptAdminModule } from 'src/app/feature-modules/prompt-admin/prompt-admin.module';
import { PromptAdminPageComponent } from 'src/app/feature-modules/prompt-admin/page/admin-page/admin-page.component';
import { DocumentTypeManagementComponent } from 'src/app/feature-modules/prompt-admin/page/document-type-management/document-type-management.component';
import { DocumentManagementPageComponent } from 'src/app/feature-modules/document-management/components/document-management-page/document-management-page.component';
import { DirectoryViewComponent } from 'src/app/feature-modules/document-management/components/directory-view/directory-view.component';
import { DocumentManagementWelcomeComponent } from 'src/app/feature-modules/document-management/components/document-management-welcome/document-management-welcome.component';
import { MetadataComponent } from 'src/app/feature-modules/document-management/components/metadata/metadata.component';
import { TagsComponent } from 'src/app/feature-modules/document-management/components/tags/tags.component';
import { UserGroupsComponent } from 'src/app/feature-modules/document-management/components/user-groups/user-groups.component';
import { GroupViewComponent } from 'src/app/feature-modules/document-management/components/group-view/group-view.component';
import { DocumentViewComponent } from 'src/app/feature-modules/document-management/components/document-view/document-view.component';
import { DirectoryEditComponent } from 'src/app/feature-modules/document-management/components/directory-edit/directory-edit.component';
import { AdvancedSearchComponent } from 'src/app/feature-modules/document-management/components/advanced-search/advanced-search.component';
import { AuditLogsComponent } from 'src/app/feature-modules/document-management/components/audit-logs/audit-logs.component';
const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    component: RegistrationComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },

  { path: 'writing-assistant', component: WritingAssistantPageComponent },
  {
    path: 'writing-assistant/:sessionId',
    component: WritingAssistantPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: PromptAdminPageComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'document-type-management',
    component: DocumentTypeManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'document-management',
    component: DocumentManagementPageComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MANAGER', 'EMPLOYEE'] },
    children: [
      { path: 'directory/:directoryId', component: DirectoryViewComponent },
      { path: 'document/:documentId', component: DocumentViewComponent },
      { path: 'welcome', component: DocumentManagementWelcomeComponent },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: 'metadata', component: MetadataComponent },
      { path: 'tags', component: TagsComponent },
      { path: 'groups', component: UserGroupsComponent },
      { path: 'group/:groupId', component: GroupViewComponent },
      {
        path: 'directory-edit/:directoryId',
        component: DirectoryEditComponent,
      },
      {
        path: 'advanced-search',
        component: AdvancedSearchComponent,
      },
      {
        path: 'audit-logs',
        component: AuditLogsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
