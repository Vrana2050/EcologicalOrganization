import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { DocumentService } from '../../service/document.service';
import { IDocumentBase, IDocumentDetails } from '../../model/interface/document.model';
import { DocumentBoard, DocumentDetails } from '../../model/implementation/document-impl.model';
import { IDocumentBoard } from '../../model/interface/document.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { IStatus, IWorkflowStatus } from '../../model/interface/workflow.model';
import { ViewChild } from '@angular/core';
import { BoardComponent } from '../../shared/board/board.component';

@Component({
  selector: 'document-preparation-document-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class DocumentPreparationBoardDocumentComponent {
  @ViewChild(BoardComponent)
  boardComponent!: BoardComponent;

  documentId!: number;
  parentDocument!: IDocumentDetails;
  documents!: IDocumentBoard[];
  canEdit: boolean;
  showCreateDocumentModal: boolean = false;
  statusToCreateDocumentIn: IWorkflowStatus;
  showMyTasksFlag: boolean = false;
  constructor(private route: ActivatedRoute,private router: Router,private authService: AuthService,private documentService: DocumentService) {}

   ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.documentId = Number(params.get('id'));
      this.loadBoardData();
    });
  }

  private loadBoardData(): void {
    this.documentService.getDocumentById(this.documentId)
      .subscribe(parent => {
        this.parentDocument = parent;
        this.parentDocument.workflow?.sortStatuses();
        this.canEdit = this.parentDocument.canEditInCurrentStatus(this.authService.user$.value.id);
      });
    this.documentService.getBoardDocumentsByParentDocumentId(this.documentId)
      .subscribe(docs => {this.documents = docs;});
  }

  isUserAssignee(): boolean {
    if(!this.documents) {
      return false;
    }
    return this.documents!.some(doc => doc.isUserAssignee(this.authService.user$.value.id));
  }
  isUserOwner(): boolean {
    return this.parentDocument.isUserAssignee(this.authService.user$.value.id);
  }
  canAnalyze(): boolean {
    if(this.parentDocument instanceof DocumentDetails){
      return this.parentDocument.isDone();
    }
    return false;
  }
  openDocumentAnalysis(document: IDocumentBoard): void {
    this.router.navigate(['document-preparation/analysis/document', document.id]);
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
}
