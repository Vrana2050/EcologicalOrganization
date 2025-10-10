import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { AnalyticsComponent } from 'src/app/feature-modules/project-realization/components/analytics/analytics.component';
import { AuditLogComponent } from 'src/app/feature-modules/project-realization/components/audit-log/audit-log.component';
import { BoardComponent } from 'src/app/feature-modules/project-realization/components/board/board.component';
import { ListComponent } from 'src/app/feature-modules/project-realization/components/list/list.component';
import { OverviewComponent } from 'src/app/feature-modules/project-realization/components/overview/overview.component';
import { ProjectCreateWizardComponent } from 'src/app/feature-modules/project-realization/components/project-create-wizard/project-create-wizard.component';
import { ProjectsHomeComponent } from 'src/app/feature-modules/project-realization/components/projects-home/projects-home.component';
import { ShellComponent } from 'src/app/feature-modules/project-realization/components/shell/shell.component';
import { PromptAdminPageComponent } from 'src/app/feature-modules/prompt-admin/page/admin-page/admin-page.component';
import { DocumentTypeManagementComponent } from 'src/app/feature-modules/prompt-admin/page/document-type-management/document-type-management.component';
import { WritingAssistantPageComponent } from 'src/app/feature-modules/writting-assistant/page/writing-assistant-page/writing-assistant-page.component';
import { AuthGuard } from '../auth/auth.guard';
import { LoginComponent } from '../auth/login/login.component';
import { RegistrationComponent } from '../auth/registration/registration.component';
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
  { path: 'project-realization/new', component: ProjectCreateWizardComponent },

  // projects list
  { path: 'project-realization', component: ProjectsHomeComponent },

  // single project
  {
    path: 'project-realization/:id',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: OverviewComponent },
      { path: 'board', component: BoardComponent },
      { path: 'list', component: ListComponent },
      { path: 'audit-log', component: AuditLogComponent },
      { path: 'analytics', component: AnalyticsComponent },
    ],
  },

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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
