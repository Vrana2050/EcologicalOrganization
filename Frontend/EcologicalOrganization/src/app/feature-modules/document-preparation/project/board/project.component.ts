import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { IProjectBoard, ProjectStatus } from '../../model/interface/project.model';
import { DocumentBoard } from '../../model/implementation/document-impl.model';
import { DocumentService } from '../../service/document.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';
import { IStatus, IWorkflowStatus } from '../../model/interface/workflow.model';
import { ViewChild } from '@angular/core';
import { BoardComponent } from '../../shared/board/board.component';

@Component({
  selector: 'document-preparation-board-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class DocumentPreparationBoardProjectComponent implements OnInit {
  @ViewChild(BoardComponent)
  boardComponent!: BoardComponent;
  projectId!: number;
  project!: IProjectBoard;
  documents!: DocumentBoard[];
  canEdit: boolean;
  showCreateDocumentModal: boolean = false;
  statusToCreateDocumentIn: IWorkflowStatus;
  showMyTasksFlag: boolean = false;
  constructor(private route: ActivatedRoute, private projectService: ProjectService, private documentService: DocumentService,public authService: AuthService,private router: Router) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      this.loadProject();
      this.loadDocuments();
    });
  }

  loadProject(): void {
    this.projectService.getBoardProjectById(this.projectId).subscribe(project => {
      this.project = project;
      this.project.workflow?.sortStatuses();
      this.canEdit = this.project.canEdit(this.authService.user$.value.id);
    });
  }
  loadDocuments(): void {
    this.documentService.getBoardDocumentsByProjectId(this.projectId).subscribe(docs => {
      this.documents = docs;
    });
  }
  isUserAssignee(): boolean {
    return this.project.isUserAssignee(this.authService.user$.value.id);
  }
  isUserOwner(): boolean {
    return this.project.isUserOwner(this.authService.user$.value.id);
  }
  canAnalyze(): boolean {
    return this.project.isCompleted();
  }
  openProjectAnalysis(project: IProjectBoard): void {
    this.router.navigate(['document-preparation/analysis/project', project.id]);
  }
  openAddDocument(status: IWorkflowStatus): void {
    this.showCreateDocumentModal = true;
    this.statusToCreateDocumentIn = status;
  }
  showMyTasks(): void {
    this.showMyTasksFlag =!this.showMyTasksFlag;
    if(!this.showMyTasksFlag){
      this.boardComponent.refreshBoard(this.documents);
      return;
    }
    else{
      this.boardComponent.refreshBoard(this.documents.filter(doc => doc.isUserAssignee(this.authService.user$.value.id)));
    }
  }
  canAbandon(): boolean {
    return this.project.canAbandon(this.authService.user$.value.id);
  }
  abandonProject(): void {
    this.projectService.abandonProject(this.project.id).subscribe(() => {
      location.reload();
    });
  }
}
