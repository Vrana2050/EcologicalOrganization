import { Component } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { DocumentService } from '../service/document.service';
import { IDocumentActiveFile, IDocumentBoard, IDocumentDetails } from '../model/interface/document.model';
import { DocumentDetails } from '../model/implementation/document-impl.model';
import { IWorkflow } from '../model/interface/workflow.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { FileService } from '../service/file.service';
import { IFile } from '../model/interface/file.model';
import { FileViewerService } from '../service/Util/file-viewer.service';
import { ElementRef, ViewChild } from '@angular/core';
import { ProjectService } from '../service/project.service';
import { IProject } from '../model/interface/project.model';

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
  showCreateDocument: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isUserAssignee: boolean = false;
  isUserSubAssignee: boolean = false;
  isUserOwner: boolean;


  documentToEdit: IDocumentDetails | undefined;
  parentDocument: IDocumentDetails | undefined;
  project: IProject | undefined;
  parentSortedWorkflow : IWorkflow;
  showEditDocument: boolean;
  constructor(private route: ActivatedRoute, private documentService: DocumentService,private router : Router,private authService: AuthService,private fileService: FileService,private fileViewerService: FileViewerService,private projectService: ProjectService) { }

  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.dokumentId = Number(params.get('id'));
          this.documentService.getDocumentById(this.dokumentId).subscribe(document => {
            this.document = document;
            this.isUserOwner = this.document.isUserOwner(this.userId!);
            this.documentService.getBoardDocumentsByParentDocumentId(this.dokumentId).subscribe(doc => {
            this.document.subDocuments = doc;
            this.isUserAssignee = this.document.isUserAssignee(this.userId!);
            this.isUserSubAssignee = this.document.isUserSubAssignee(this.userId!);
            this.fileService.getMainFilesByDocumentId(this.dokumentId).subscribe(files => {
              this.document.activeFiles = files;
            });
            console.log(this.document);
            if(this.document.subDocuments && this.document.subDocuments.length > 0){
            this.addStatusColors();
          }
          });
          });
          this.statusColor = history.state['statusColor'];
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
      console.log('Odabran fajl:', file);

      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result;
        console.log('Base64 sadržaj:', fileContent);
      };
      reader.readAsDataURL(file);
    }
  }
  addSubDocument() {
    if(!this.document.workflow){
      alert("Document workflow is not set. Cannot add subdocument. TESTIRATI OVO KAD SE POJAVI CREATE TREBA DA IZADJE POPUP");
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
}