import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { WritingAssistantPageComponent } from 'src/app/feature-modules/writting-assistant/page/writing-assistant-page/writing-assistant-page.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
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
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
