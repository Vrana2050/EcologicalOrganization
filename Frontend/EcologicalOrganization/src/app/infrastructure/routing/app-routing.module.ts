import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { DocumentPreparationLayoutComponent } from 'src/app/feature-modules/document-preparation/layout/layout.component';
import { DocumentPreparationNewsComponent } from 'src/app/feature-modules/document-preparation/news/news.component';
import { DocumentPreparationHomeComponent } from 'src/app/feature-modules/document-preparation/home/home.component';
import { DocumentPreparationBoardProjectComponent } from 'src/app/feature-modules/document-preparation/project/board/project.component';
import { DocumentPreparationBoardDocumentComponent } from 'src/app/feature-modules/document-preparation/document/board/board.component';
import { DocumentPreparationDocumentComponent } from 'src/app/feature-modules/document-preparation/document/document.component';
import { DocumentPreparationDocumentAnalysisComponent } from 'src/app/feature-modules/document-preparation/document/analysis/analysis.component';
import { DocumentPreparationProjectAnalysisComponent } from 'src/app/feature-modules/document-preparation/project/analysis/analysis.component';
import { DocumentPreparationReviewComponent } from 'src/app/feature-modules/document-preparation/document/review/review.component';
import { DocumentPreparationProjectCreateComponent } from 'src/app/feature-modules/document-preparation/project/create/project-create.component';
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
      { path: 'board/project/:id', component: DocumentPreparationBoardProjectComponent },
      { path: 'board/document/:id', component: DocumentPreparationBoardDocumentComponent },
      { path: 'document/:id', component: DocumentPreparationDocumentComponent },
      { path: 'review/document/:id', component: DocumentPreparationReviewComponent },
      { path: 'analysis/document/:id', component: DocumentPreparationDocumentAnalysisComponent },
      { path: 'analysis/project/:id',component:DocumentPreparationProjectAnalysisComponent },
      { path: 'create/project', component: DocumentPreparationProjectCreateComponent },
      { path: 'edit/project/:id', component: DocumentPreparationProjectCreateComponent },
    ]
  },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
