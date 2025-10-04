import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentPreparationLayoutComponent } from './layout/layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DocumentPreparationHomeComponent } from './home/home.component';
import { DocumentPreparationNewsComponent } from './news/news.component';
import { AppRoutingModule } from 'src/app/infrastructure/routing/app-routing.module';
import { ProgressBarComponent } from './shared/progress-bar/progress-bar.component';
import { ProjectMembersPopupComponent } from './shared/project-members-popup/project-members-popup.component';
import { DocumentPreparationBoardProjectComponent } from './project/board/project.component';
import { BoardComponent } from './shared/board/board.component';
import { DocumentPreparationDocumentComponent } from './document/document.component';
import { DocumentPreparationReviewComponent } from './document/review/review.component';
import { DocumentPreparationDocumentAnalysisComponent } from './document/analysis/analysis.component';
import { DocumentPreparationProjectAnalysisComponent } from './project/analysis/analysis.component';
import { GraphAnalysisComponent } from './shared/analysis/analysis.component';
import { NgChartsModule } from 'ng2-charts';
import { PieChartComponent } from './shared/pieChart/pie-chart.component';
import { DocumentPreparationBoardDocumentComponent } from './document/board/board.component';
import { DocumentPreparationCreateDocumentComponent } from './document/create/document-create.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentPreparationWorkflowPopupComponent } from './shared/workflow-popup/workflow-popup.component';
import { DocumentPreparationProjectCreateComponent } from './project/create/project-create.component';
import { DocumentPreparationExistingWorkflowWindowComponent } from './shared/existing-workflow-window/existing-workflow-window.component';
import { DocumentPreparationWorkflowGraphComponent } from './shared/workflow-graph/workflow-graph.component';





@NgModule({
  declarations: [
    DocumentPreparationLayoutComponent,
    SidebarComponent,
    DocumentPreparationHomeComponent,
    DocumentPreparationNewsComponent,
    ProgressBarComponent,
    ProjectMembersPopupComponent,
    DocumentPreparationBoardProjectComponent,
    BoardComponent,
    DocumentPreparationDocumentComponent,
    DocumentPreparationReviewComponent,
    DocumentPreparationDocumentAnalysisComponent,
    DocumentPreparationProjectAnalysisComponent,
    GraphAnalysisComponent,
    PieChartComponent,
    DocumentPreparationBoardDocumentComponent,
    DocumentPreparationCreateDocumentComponent,
    DocumentPreparationWorkflowPopupComponent,
    DocumentPreparationProjectCreateComponent,
    DocumentPreparationExistingWorkflowWindowComponent,
    DocumentPreparationWorkflowGraphComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DocumentPreparationModule { }
