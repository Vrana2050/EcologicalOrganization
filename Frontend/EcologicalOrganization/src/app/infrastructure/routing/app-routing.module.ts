import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
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
