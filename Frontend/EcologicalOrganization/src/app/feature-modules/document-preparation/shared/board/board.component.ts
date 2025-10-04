import { Component } from '@angular/core';
import { IBoardWorkflow, IWorkflow, IWorkflowStatus } from '../../model/interface/workflow.model';
import { Input } from '@angular/core';
import { DocumentBase, DocumentBoard } from '../../model/implementation/document-impl.model';
import { OnInit } from '@angular/core';
import { Workflow } from '../../model/implementation/workflow-impl.model';
import { IStatus } from '../../model/interface/workflow.model';
import { IBoardWorkflowStatus } from '../../model/interface/workflow.model';
import { IFile } from '../../model/interface/file.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { FileViewerService } from '../../service/Util/file-viewer.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'document-preparation-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
@Input() sortedWorkflow: IWorkflow;
@Input() documents: DocumentBoard[];
@Input() isUserOwner: boolean;
@Input() isUserAssignee: boolean;
@Input() canEdit: boolean = false;
@Output() addDocument = new EventEmitter<IStatus>();

boardWorkflow : IBoardWorkflow;
statusColors: { [id: number]: string } = {};
isDocumentDescriptionModalOpen: boolean = false;
descriptionToShow:string = "";
modalPosition = { top: 0, left: 0 };
userId :number;

constructor(private router: Router,private authService: AuthService,private fileViewerService: FileViewerService) { }

ngOnInit(): void {
  this.userId = this.authService.user$.value.id;
  this.boardWorkflow = {
    id: this.sortedWorkflow.id,
    name: this.sortedWorkflow.name,
    statuses: this.sortedWorkflow.statuses.map(status => ({
      status,
      documents: [] as DocumentBoard[]
    })),
  }
  this.addStatusColors();
  this.connectDocumentsToStatuses();
}
addStatusColors() {
  const colors = this.generateStatusColors(this.boardWorkflow.statuses.length);

  this.boardWorkflow.statuses.forEach((s, i) => {
    this.statusColors[s.status.currentStatus.id] = colors[i];
  });
}
connectDocumentsToStatuses() {
  this.boardWorkflow.statuses.forEach(status => {
    status.documents = this.documents.filter(doc => doc.status.id === status.status.id);
  });
}
getDocumentCountByStatus(status: IBoardWorkflowStatus): number {
  return status.documents ? status.documents.length : 0;
}
canAddDocument(status: IStatus): boolean {
  if(!this.canEdit) {
    return false;
  }
  return (this.isUserAssignee && status.assigneeAddPermission) || (this.isUserOwner && status.ownerAddPermission);
}
generateStatusColors(count: number): string[] {
  const colors: string[] = [];
  const step = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = Math.round(i * step);
    const saturation = 70;
    const lightness = 45;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
}
openDescriptionModal(event: MouseEvent, document: DocumentBoard): void {
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();

  this.modalPosition = {
    top: rect.bottom + window.scrollY + 5,   // malo ispod dugmeta
    left: rect.left + window.scrollX         // levo poravnato sa dugmetom
  };

  this.descriptionToShow = document.description ?? '';
  this.isDocumentDescriptionModalOpen = true;
}

closeDescriptionModal(event: any): void {
  event.stopPropagation();
  this.isDocumentDescriptionModalOpen = false;
  this.descriptionToShow = '';
}
openFile(event:any,file: IFile): void {
  event.stopPropagation();
  this.fileViewerService.openFile(file);
}
canReviewDocument(doc: DocumentBoard): boolean {
  if(!this.canEdit) {
    return false;
  }
  return this.isUserOwner;
}
openDocument(doc: DocumentBoard): void {
  this.router.navigate(['document-preparation/document', doc.id], {
    state: { statusColor: this.statusColors[doc.status.currentStatus.id] }
  });
}
openDocumentReview(event: MouseEvent, doc: DocumentBoard): void {
  event.stopPropagation();
  this.router.navigate(['document-preparation/review/document', doc.id]);
}
openDocumentAnalysis(event: MouseEvent, doc: DocumentBoard): void {
  event.stopPropagation();
  this.router.navigate(['document-preparation/analysis/document', doc.id]);
}
openCreateDocumentModal(event: MouseEvent, status: IStatus): void {
  event.stopPropagation();
  this.addDocument.emit(status);
}
}