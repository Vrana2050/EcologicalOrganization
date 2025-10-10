import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { IDocumentActiveFile, IDocumentDetails, IRevisionDocumentActiveFile } from '../../model/interface/document.model';
import { DocumentService } from '../../service/document.service';
import { FileService } from '../../service/file.service';
import { RevisionDocumentActiveFile } from '../../model/implementation/document-impl.model';
import { IRevisionIssue,IRevision } from '../../model/interface/revision.model';
import { ReviewService } from '../../service/review.service';
import { RevisionIssue, RevisionIssueUpdate, RevisionUpdate } from '../../model/implementation/revision-impl.model';
import { FileViewerService } from '../../service/Util/file-viewer.service';
import { IFile } from '../../model/interface/file.model';
import { NotificationService } from '../../service/Util/toast-notification.service';
import { Router } from '@angular/router';


@Component({
  selector: 'document-preparation-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class DocumentPreparationReviewComponent implements OnInit {
  dokumentId!: number;
  document!: IDocumentDetails;
  i:number=0;
  showOnlyOneFile:boolean=false;
  hasUnResolvedReview: boolean = false;
  selectedFile?: IRevisionDocumentActiveFile;
  addGlobalIssue: boolean = false;
  addFileIssue: boolean = false;

  newFileIssue: string = "";
  newGlobalIssueDescription: string = "";

  globalIssues!: IRevisionIssue[];
  unResolvedFiles!: IRevisionDocumentActiveFile[];
  reviewedFiles!: IRevisionDocumentActiveFile[];

  userAddedFileIssues: IRevisionIssue[] = [];



  reviewsToUpdate: RevisionUpdate[] = [];

  constructor(private router:Router, private toastNotificationService: NotificationService, private fileViewerService: FileViewerService, private reviewService : ReviewService, private route: ActivatedRoute,private documentService: DocumentService,private fileService: FileService) { }

  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.dokumentId = Number(params.get('id'));
          this.documentService.getDocumentById(this.dokumentId).subscribe(document => {
            this.document = document;
            if(!document.canReview()){
              if(document.isSubDocument())
              {
                this.router.navigate(['document-preparation/board/document', document.parentDocumentId]);
                return;
              }
              this.router.navigate(['document-preparation/board/project', this.document.projectId]);
              return;
            }
            this.hasUnResolvedReview= document.hasUnResolvedReview();
            this.fileService.getActiveFilesByDocumentId(this.dokumentId).subscribe(activeFiles => {
              this.document.activeFiles=activeFiles;
              this.unResolvedFiles=[];
              this.reviewedFiles=[];
              for(let activeFile of activeFiles){
                const issues =document.getAllReviewIssuesForActiveFile(activeFile.id);
                const isFileNew = document.revisions!.length === 0 || !document.hasReviewAfter(activeFile.file.dateUploaded);
                if(issues.length===0 && !isFileNew){
                  this.reviewedFiles.push(new RevisionDocumentActiveFile(issues,activeFile,isFileNew));
                }
                else{
                  this.unResolvedFiles.push(new RevisionDocumentActiveFile(issues,activeFile,isFileNew));
                }
              }
              this.selectedFile= this.unResolvedFiles.length>0 ? this.unResolvedFiles[0] : undefined;
              this.globalIssues= document.getGlobalReviewIssues();
              console.log(this.unResolvedFiles);
            });
          });
        });
  }
  loadReviewsForUpdate(reviews:IRevision[] | undefined):void{
    if(reviews === undefined || reviews.length === 0){
      this.reviewsToUpdate=[];
      return;
    }
    this.reviewsToUpdate=reviews.map(r=>{
      if (!r.revisionIssues || r.revisionIssues.length === 0) {
        return new RevisionUpdate(this.document.projectId,r.approved,r.workflowStatusId,r.documentId,[],r.id);
      }
      return new RevisionUpdate(this.document.projectId,r.approved,r.workflowStatusId,r.documentId,r.revisionIssues.map(ri=>( new RevisionIssueUpdate(ri.issue,ri.corrected,ri.correctionApproved,ri.correctionDate,ri.id,ri.revisionId,ri.fileId,ri.activeFileId))),r.id);
  }
  );
  }



  canGoToPrevious():boolean{
    const newIndex=this.i-1;
    return newIndex >= 0;
  }
  canGoToNext():boolean{
    const newIndex=this.i+1;
    return newIndex < this.unResolvedFiles!.length;
  }
  goToPrevious():void{
      this.reviewedFiles.pop();
      this.i=this.i-1;
      this.selectedFile=this.unResolvedFiles[this.i];
  }
  goToNext():void{
    if(this.showOnlyOneFile){
      this.showOnlyOneFile=false;
      this.i=-2;
    }
      this.reviewedFiles.push(this.selectedFile!);
      this.i=this.i+1;
      this.selectedFile=this.unResolvedFiles[this.i];
  }
  canApprove():boolean{
    return (this.userAddedFileIssues === undefined || this.userAddedFileIssues.length === 0) && (this.globalIssues === undefined || !this.globalIssues.some(gi => !gi.isApproved())) && !this.document.hasUnResolvedReview() && this.reviewedFiles.length === this.document.activeFiles!.length;
  }
  canReject():boolean{
    return ((this.userAddedFileIssues !== undefined && this.userAddedFileIssues.length > 0) || (this.globalIssues !== undefined && this.globalIssues.some(gi => !gi.isApproved())) || this.document.hasUnResolvedReview()) && this.reviewedFiles.length === this.document.activeFiles!.length;
  }
  approve():void{
    this.loadReviewsForUpdate(this.document.revisions);

    this.reviewsToUpdate.push(new RevisionUpdate(this.document.projectId,true,this.document.status.id,this.document.id,undefined,undefined));
    this.reviewService.submitReview(this.reviewsToUpdate).subscribe(() => {
      this.toastNotificationService.success("Document review submitted successfully.");
      this.router.navigate(['/document-preparation/document', this.document.id]);
    });
    return;
  }

  reject():void{
    this.loadReviewsForUpdate(this.document.revisions);
    const newIssues: RevisionIssueUpdate[] = [];
    for(const issue of this.globalIssues){
      if(issue.id===-1){
        newIssues.push(new RevisionIssueUpdate(issue.issue,false,false,undefined,undefined,undefined,undefined,undefined));
      }
    }
    for(const issue of this.userAddedFileIssues){
      newIssues.push(new RevisionIssueUpdate(issue.issue,false,false,undefined,undefined,undefined,issue.fileId,issue.activeFileId));
    }
    if(newIssues.length !==0){
            this.reviewsToUpdate.push(new RevisionUpdate(this.document.projectId,false,this.document.status.id,this.document.id,newIssues,undefined));

    }
    this.reviewService.submitReview(this.reviewsToUpdate).subscribe(() => {
      this.toastNotificationService.success("Document review submitted successfully.");
      this.router.navigate(['/document-preparation/document', this.document.id]);
    });
  return;
  }
  selectFile(activeFileId:number):void{
    const fileIssues = this.document.getAllReviewIssuesForActiveFile(activeFileId);
    this.selectedFile= new RevisionDocumentActiveFile(fileIssues,this.document.activeFiles!.find(af=>af.id===activeFileId)!,this.document.hasReviewAfter(this.document.activeFiles!.find(af=>af.id===activeFileId)!.file.dateUploaded));
  }
  hasReviewed(activeFileId:number):boolean{
    return this.reviewedFiles !== undefined && this.reviewedFiles.find(file => file.activeFile.id === activeFileId) !== undefined;
  }
  openReviewFile(documentActiveFile: IDocumentActiveFile): void {
    this.hasUnResolvedReview = true;
    this.i=this.unResolvedFiles.findIndex(uf=>uf.activeFile.id===documentActiveFile.id);
    if(this.i!==-1){
      this.selectedFile=this.unResolvedFiles[this.i];
    }
    this.showOnlyOneFile=true;
  }
  openFile(file: IFile): void {
    this.fileViewerService.openFile(file);
  }
  openAddGlobalIssue():void{
    this.addGlobalIssue=true;
  }
  addGlobalIssueToDocument(issueDescription:string):void{
    if(issueDescription.trim().length===0){
      return;
    }
    const newIssue: RevisionIssue = new RevisionIssue({
      id: -1,
      dokumentRevizijaId: -1,
      izmena: issueDescription,
      datumIspravljanja: new Date(),
      ispravkaOdobrena: false,
      ispravljena: false,
      fajl: null,
      aktivniFajlId: null
    });
    this.globalIssues.push(newIssue);
    this.addGlobalIssue=false;
    this.newGlobalIssueDescription="";
  }
  removeGlobalIssue(issue: IRevisionIssue):void{
    if(issue.id===-1){
      this.globalIssues=this.globalIssues.filter(gi=>gi!==issue);
    }
  }
  openAddFileIssue():void{
    this.addFileIssue=true;
  }
  addFileIssueToSelectedFile(issueDescription:string):void{
    if(issueDescription.trim().length===0 || this.selectedFile===undefined){
      return;
    }

    const newIssue: RevisionIssue = new RevisionIssue({
      id: -1,
      dokumentRevizijaId: -1,
      izmena: issueDescription,
      datumIspravljanja: new Date(),
      ispravkaOdobrena: false,
      ispravljena: false,
      fajl: this.selectedFile.activeFile.file,
      aktivniFajlId: this.selectedFile.activeFile.id
    });
    this.userAddedFileIssues.push(newIssue);
    this.addFileIssue=false;
    this.newFileIssue="";
  }
  removeFileIssue(issue: IRevisionIssue):void{
    if(this.selectedFile===undefined){
      return;
    }
    if(issue.id===-1){
      this.userAddedFileIssues=this.userAddedFileIssues.filter(gi=>gi!==issue);
    }
  }
  getUserAddedFileIssuesForSelectedFile():IRevisionIssue[]{
    if(this.selectedFile===undefined){
      return [];
    }
    return this.userAddedFileIssues.filter(ri=>ri.activeFileId===this.selectedFile!.activeFile.id);
  }
  hasUnResolvedIssues(activeFileId:number):boolean{
    return this.document.getUnApprovedIssuesForActiveFile(activeFileId).length > 0 || this.userAddedFileIssues.filter(ri=>ri.activeFileId===activeFileId).length > 0;
  }
  getUnResolvedIssuesCount(activeFileId:number):number{
    return this.document.getUnApprovedIssuesForActiveFile(activeFileId).length + this.userAddedFileIssues.filter(ri=>ri.activeFileId===activeFileId).length;
  }
}
