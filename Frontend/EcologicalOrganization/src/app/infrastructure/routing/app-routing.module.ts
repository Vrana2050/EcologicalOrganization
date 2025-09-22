import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { DocumentPreparationLayoutComponent } from 'src/app/feature-modules/document-preparation/layout/layout.component';
import { DocumentPreparationNewsComponent } from 'src/app/feature-modules/document-preparation/news/news.component';
import { DocumentPreparationHomeComponent } from 'src/app/feature-modules/document-preparation/home/home.component';
import { DocumentPreparationProjectComponent } from 'src/app/feature-modules/document-preparation/project/project.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    component: RegistrationComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
 {
    path: 'document-preparation',
    component: DocumentPreparationLayoutComponent,
    children: [
      { path: '', component: DocumentPreparationHomeComponent },
      { path: 'news', component: DocumentPreparationNewsComponent },
      { path: 'project/:id', component: DocumentPreparationProjectComponent }
    ]
  },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
