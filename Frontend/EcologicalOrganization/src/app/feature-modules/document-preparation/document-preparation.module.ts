import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentPreparationLayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DocumentPreparationHomeComponent } from './home/home.component';
import { DocumentPreparationNewsComponent } from './news/news.component';
import { AppRoutingModule } from 'src/app/infrastructure/routing/app-routing.module';
import { ProgressBarComponent } from './shared/progress-bar/progress-bar.component';
import { ProjectMembersPopupComponent } from './shared/project-members-popup/project-members-popup.component';
import { DocumentPreparationProjectComponent } from './project/project.component';
import { BoardComponent } from './shared/board/board.component';



@NgModule({
  declarations: [
    DocumentPreparationLayoutComponent,
    SidebarComponent,
    DocumentPreparationHomeComponent,
    DocumentPreparationNewsComponent,
    ProgressBarComponent,
    ProjectMembersPopupComponent,
    DocumentPreparationProjectComponent,
    BoardComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule
  ]
})
export class DocumentPreparationModule { }
