import { Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { DocumentService } from '../service/document.service';
import { IDocumentActiveFile, IDocumentBase, IDocumentBoard, IDocumentDetails } from '../model/interface/document.model';
import { DocumentActiveFileUpdate, DocumentCreate, DocumentDependencyUpdate, DocumentDetails, DocumentStatusUpdate, DocumentWorkflowCreate } from '../model/implementation/document-impl.model';
import { IWorkflow, IWorkflowStatus } from '../model/interface/workflow.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { FileService } from '../service/file.service';
import { IFile } from '../model/interface/file.model';
import { FileViewerService } from '../service/Util/file-viewer.service';
import { ElementRef, ViewChild } from '@angular/core';
import { ProjectService } from '../service/project.service';
import { IProject } from '../model/interface/project.model';
import { NotificationService } from '../service/Util/toast-notification.service';
import { WorkflowService } from '../service/workflow.service';
import { DocumentMainFileUpdate } from '../model/implementation/document-impl.model';
import { IRevisionIssue } from '../model/interface/revision.model';
import { ReviewService } from '../service/review.service';
import { RevisionUpdate } from '../model/implementation/revision-impl.model';

@Component({
  selector: 'document-preparation-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentPreparationDocumentComponent implements OnInit {


  dokumentId!: number;
  document!: IDocumentDetails;
  statusColor!: any;
  isCollapsed: boolean = false;
  statusColors: { [id: number]: string } = {};
  userId = this.authService.user$.value?.id;
  fileVersions: IFile[];
  activeVersion!: IDocumentActiveFile;
  isRestoring: boolean = false;
  showMain: boolean = true;
  showCreateDocument: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isUserAssignee: boolean = false;
  isUserSubAssignee: boolean = false;
  isUserOwner: boolean;

  showWorkflowPopup: boolean = false;


  documentToEdit: IDocumentDetails | undefined;
  parentDocument: IDocumentDetails | undefined;
  project: IProject | undefined;
  parentSortedWorkflow : IWorkflow;
  showEditDocument: boolean;

  parentWorkflow: IWorkflow | undefined;
  nextStatus:IWorkflowStatus | undefined;
  nextStatusColor: string | undefined;

  showUpdateStatus: boolean = false;
  showEditDependency: boolean = false;

  statusToShow: IWorkflowStatus | undefined;
  removedDependencies: IDocumentBase[] = [];
  addedDependencies: IDocumentBase[] = [];

  dependencySearchTerm: string = '';
  availableDependencies: IDocumentBase[] = [];
  filteredDependencies: IDocumentBase[] = [];
  constructor(private reviewService: ReviewService,private workflowService: WorkflowService,private route: ActivatedRoute, private documentService: DocumentService,private router : Router,private authService: AuthService,private fileService: FileService,private fileViewerService: FileViewerService,private projectService: ProjectService,private toastNotificationService: NotificationService) { }

  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.dokumentId = Number(params.get('id'));
          this.documentService.getDocumentById(this.dokumentId).subscribe(document => {
            this.document = document;
            this.statusToShow = this.document.status;
             this.workflowService.getById(this.document.status.workflowId).subscribe(workflow => {
              this.parentWorkflow = workflow;
              this.nextStatus = this.document.getNextStatus(this.parentWorkflow!);
              this.addParentStatusColors();
            });

            this.isUserOwner = this.document.isUserOwner(this.userId!);
            this.documentService.getBoardDocumentsByParentDocumentId(this.dokumentId).subscribe(doc => {
            this.document.subDocuments = doc;
            this.isUserAssignee = this.document.isUserAssignee(this.userId!);
            this.isUserSubAssignee = this.document.isUserSubAssignee(this.userId!);
            this.fileService.getActiveFilesByDocumentId(this.dokumentId).subscribe(files => {
              this.document.activeFiles = files;
            });
            console.log(this.document);
            if(this.document.subDocuments && this.document.subDocuments.length > 0){
            this.addStatusColors();
          }
          });
          });
          //this.statusColor = history.state['statusColor'];
          });
  }
  getTimeLeftFormatted(): string {
  if (!this.document?.dueDate) {
    return '';
  }

  const now = new Date();
  const diffMs = this.document.dueDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  if (years > 0) {
    return `${years} years`;
  } else if (days > 0) {
    return `${days} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  } else {
    return `${seconds} seconds`;
  }
}
  getTimeLeftColor(): string {
  if (!this.document?.dateCreated || !this.document?.dueDate) {
    return 'gray';
  }

  const now = new Date().getTime();
  const created = new Date(this.document.dateCreated).getTime();
  const due = new Date(this.document.dueDate).getTime();

  const total = due - created;
  const left = due - now;

  if (left <= 0) {
    return 'red';
  }

  const ratio = left / total;

  if (ratio > 0.5) {
    return 'green';
  } else {
    // Od narandžaste (#FFA500) do crvene (#FF0000)
    const r = 255;
    const g = Math.floor(165 * ratio * 2); // ide od 165 do 0
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
}
getDateRangeFormatted(): string {
  if (!this.document?.dateCreated || !this.document?.dueDate) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  const createdStr = new Date(this.document.dateCreated).toLocaleDateString('en-GB', options);
  const dueStr = new Date(this.document.dueDate).toLocaleDateString('en-GB', options);

  return `${createdStr} - ${dueStr}`;
}
togglePanel() {
  this.isCollapsed = !this.isCollapsed;
}
openBoardView() {
  this.router.navigate(['document-preparation/board/document', this.dokumentId]);
}
addStatusColors() {
  this.document.workflow?.sortStatuses();
  const colors = this.generateStatusColors(this.document.workflow!.statuses.length);
  console.log(colors);
  this.document.workflow!.statuses.forEach((s, i) => {
    this.statusColors[s.currentStatus.id] = colors[i];
  });
}
addParentStatusColors() {
  this.parentWorkflow?.sortStatuses();
  const colors = this.generateStatusColors(this.parentWorkflow!.statuses.length);
  console.log(colors);
  this.parentWorkflow!.statuses.forEach((s, i) => {
    if(s.id === this.document.status.id)
    {
      this.statusColor = colors[i];
    }
    if(s.id === this.nextStatus?.id){
      this.nextStatusColor = colors[i];
    }
  });
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
openSubDocument(document: IDocumentBoard) {
  this.router.navigate(['document-preparation/document', document.id], { state: { statusColor: this.statusColors[document.status.id] } });
}
openDocumentAnalysis($event: any, document: IDocumentBoard) {
  $event.stopPropagation();
  this.router.navigate(['document-preparation/analysis/document', document.id]);
}
openDocumentReview($event: any, document: IDocumentBoard) {
  $event.stopPropagation();
  this.router.navigate(['document-preparation/review/document', document.id]);
}
canReviewDocument(subDoc: IDocumentBoard): boolean {
  if(!this.document.canReviewSubDocument(this.userId!))
  {
    return false;
  }
  return true;//subDoc.isUserOwner(this.userId!);
}
openRestoreOptions($event: any, activeFile: IDocumentActiveFile) {
  $event.stopPropagation();
  this.fileService.getAllVersions(activeFile.id).subscribe(files => {
    this.fileVersions = files.sort((a, b) => b.dateUploaded.getTime() - a.dateUploaded.getTime());
    this.activeVersion = activeFile;
    this.isRestoring = true;
  });
}
closeRestoreOptions() {
  this.isRestoring = false;
  this.fileVersions = [];
  this.activeVersion = undefined!;
}
openFile(file: IFile): void {
  this.fileViewerService.openFile(file);
}
uploadFile(): void {
    this.fileInput.nativeElement.click();
}
onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file) return;
      const formData = new FormData();

      formData.append('file', file);

      formData.append('dokumentId', this.document.id.toString());
      formData.append('naziv', file.name);
      const ext = file.name.split('.').pop();
      formData.append('ekstenzija', ext || '');
      this.fileService.uploadFile(formData).subscribe({
        next: res => {
          this.toastNotificationService.success("File uploaded successfully.","Success");
          this.fileService.getActiveFileByDocumentAndFile(this.document.id, (res as any).id).subscribe(f => {
            this.document.activeFiles?.push(f);
          });
        }
      });
    }
  }
  addSubDocument() {
    if(!this.document.workflow){
      this.showWorkflowPopup = true;
      return;
    }
    this.showCreateDocument = true;
  }
  openEditDocument() {
   if (this.document.parentDocumentId) {
    this.documentService.getDocumentById(this.document.parentDocumentId).subscribe({
      next: (doc) => {
        doc.workflow!.sortStatuses();
        this.parentSortedWorkflow = doc.workflow!;
        this.parentDocument = doc;
        this.documentToEdit = this.document;

        // Tek kada API završi, prikaži modal
        this.showEditDocument = true;
        console.log("showEditDocument set to true (parent):", this.showEditDocument);
      },
      error: (err) => {
        console.error("Error fetching parent document", err);
      }
    });
  } else {
    this.projectService.getProjectById(this.document.projectId).subscribe({
      next: (proj) => {
        proj.workflow.sortStatuses();
        this.parentSortedWorkflow = proj.workflow;
        this.project = proj;
        this.documentToEdit = this.document;

        // Tek kada API završi
        this.showEditDocument = true;
        console.log("showEditDocument set to true (project):", this.showEditDocument);
      },
      error: (err) => {
        console.error("Error fetching project", err);
      }
    });
  }
  }
  canEditDocument(): boolean {
    return this.document.canEditDocument(this.userId!);
  }
  closeWorkflowPopup() {
    this.showWorkflowPopup = false;
  }
  onWorkflowDone(workflow: IWorkflow) {
    this.document.workflow = workflow;
    const createWorkflow: DocumentWorkflowCreate = new DocumentWorkflowCreate(this.document);
    this.documentService.updateDocumentWorkflow(createWorkflow).subscribe(document => {
      this.toastNotificationService.success("Workflow successfully set. You can now create sub-documents.","Success");
    });
    this.showWorkflowPopup = false;
    this.document.workflow.sortStatuses();
    this.showCreateDocument = true;
  }
  onSelectedOption() {
    this.showMain = false;
  }
  selectNextStatus() {
    if(!this.nextStatus){
      return;
    }
    this.statusToShow = this.nextStatus;
    this.statusColor = this.nextStatusColor;
    this.nextStatus = undefined;
    this.showUpdateStatus = true;
  }
  confirmStatusChange() {
    const statusUpdate: DocumentStatusUpdate = {
      id: this.document.id,
      status: {
        id: this.statusToShow!.id
      }
    }

    this.documentService.updateDocumentStatus(statusUpdate).subscribe( {
      next: (doc) => {

      this.toastNotificationService.success("Status successfully updated.","Success");
      this.showUpdateStatus = false;
      this.document.status = this.statusToShow!;
      this.nextStatus = this.document.getNextStatus(this.parentWorkflow!);
      this.addParentStatusColors();
    },
      error: (err) => {
        this.showUpdateStatus = false;
        this.statusToShow = this.document.status;
        this.nextStatus = this.document.getNextStatus(this.parentWorkflow!);
        this.addParentStatusColors();
      }
    });

  }
  canAddSubDocument(): any {
    return this.document.canAddSubDocument(this.userId);
  }
  markAsMain($event: any, activeFile: IDocumentActiveFile) {
    $event.stopPropagation();
    const updateMainFile: DocumentMainFileUpdate = {
      id: this.document.id,
      glavniFajl: { id: activeFile.file.id }
    };
    this.documentService.updateMainFile(updateMainFile).subscribe(() => {
      this.toastNotificationService.success("Main file successfully updated.","Success");
      this.document.mainFileId = activeFile.file.id;
    });
  }
  restoreFile(event: any, file: IFile) {
    event.stopPropagation();
    if(!this.activeVersion){
      return;
    }
    this.fileService.restoreFile(file.id, this.activeVersion.id).subscribe(() => {
        this.document.activeFiles!.forEach(af => {
          if(this.document.mainFileId === af.file.id){
            this.document.mainFileId = file.id;
          }
          if(af.file.id === file.id){
            af.file = file;
          }
        });

      this.toastNotificationService.success("File successfully restored.","Success");
      this.closeRestoreOptions();
    });
  }
toggleIssueCorrection(issue: IRevisionIssue) {
  if (issue.isCorrected()) {
    issue.UnCorrectIssue()
  } else {
    issue.CorrectIssue();
  }
  const updatedIssue: RevisionUpdate = new RevisionUpdate(this.document.projectId, false, this.document.status.id, this.document.id, [{id: issue.id, izmena: issue.issue, ispravljena: issue.isCorrected(), ispravkaOdobrena: issue.isApproved(), datumIspravljanja: issue.correctionDate, dokumentRevizijaId: issue.revisionId, fajlId: issue.fileId, aktivniFajlId: issue.activeFileId}],issue.revisionId);
  this.reviewService.updateReview([updatedIssue]).subscribe(() => {
    this.toastNotificationService.success("Issue successfully updated.","Success");
  });
}
openDependency(dependency: IDocumentBase) {
  this.router.navigate(['document-preparation/document', dependency.id], { state: { statusColor: this.statusColors[dependency.status.id] } });
}
openEditDependencies() {
  this.showEditDependency = true;
  this.loadAvailableDependencies();
}
removeDependency(event: any, dependency: IDocumentBase) {
  event.stopPropagation();
  this.document.dependsOn = this.document.dependsOn?.filter(d => d.id !== dependency.id);
  this.removedDependencies.push(dependency);
  const docToUpdate: DocumentCreate = new DocumentCreate(this.document);
}
addDependency(dependency: IDocumentBase) {
  if(!this.document.dependsOn){
    this.document.dependsOn = [];
  }
  if(this.document.dependsOn.find(d => d.id === dependency.id)){
    return;
  }
  this.document.dependsOn.push(dependency);
  this.addedDependencies.push(dependency);
  this.filteredDependencies = [];
  this.dependencySearchTerm = '';
}
cancelEditDependencies() {
  const trulyAdded = this.addedDependencies.filter(
    a => !this.removedDependencies.some(r => r.id === a.id)
  );
  const trulyRemoved = this.removedDependencies.filter(
    r => !this.addedDependencies.some(a => a.id === r.id)
  );

  // Ako posle čišćenja nema stvarnih promena — ništa ne radi
  if (trulyAdded.length === 0 && trulyRemoved.length === 0) {
    this.showEditDependency = false;
    this.removedDependencies = [];
    this.addedDependencies = [];
    this.dependencySearchTerm = '';
    this.filteredDependencies = [];
    return;
  }

  // Primeni samo realne promene
  if (trulyAdded.length > 0) {
    this.document.dependsOn = this.document.dependsOn?.filter(
      d => !trulyAdded.find(added => added.id === d.id)
    );
  }
  if (trulyRemoved.length > 0) {
    this.document.dependsOn?.push(...trulyRemoved);
  }
  this.showEditDependency = false;
  this.removedDependencies = [];
  this.addedDependencies = [];
  this.dependencySearchTerm = '';
  this.filteredDependencies = [];
}
saveDependencies() {
  const docToUpdate: DocumentDependencyUpdate = new DocumentDependencyUpdate(this.document);
  this.documentService.updateDocumentDependencies(docToUpdate).subscribe( {
    next: (doc) => {
      this.toastNotificationService.success("Dependencies successfully updated.","Success");
      this.showEditDependency = false;
      this.removedDependencies = [];
      this.addedDependencies = [];
    },
    error: (err) => {
      this.cancelEditDependencies();
    }
  });
}
loadAvailableDependencies() {
  this.documentService.getDocumentsWithSameParent(this.document.id).subscribe(docs => {
    this.availableDependencies = docs.filter(d => d.id !== this.document.id);
  });
}
searchDependencies() {
  if(this.dependencySearchTerm.trim() === ''){
    this.filteredDependencies = this.availableDependencies;
    return;
  }
  const term = this.dependencySearchTerm.toLowerCase();
  this.filteredDependencies = this.availableDependencies.filter(d => d.name.toLowerCase().includes(term) && !this.document.dependsOn?.find(dep => dep.id === d.id));
}
showAllAvailableDependencies() {
  if(this.filteredDependencies.length>0){
    return;
  }
  this.filteredDependencies = this.availableDependencies.filter(d => !this.document.dependsOn?.find(dep => dep.id === d.id));
}
}