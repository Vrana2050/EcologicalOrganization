import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import { IDocumentDetails, IRevisionDocumentActiveFile } from '../../model/interface/document.model';
import { DocumentService } from '../../service/document.service';
import { FileService } from '../../service/file.service';
import { RevisionDocumentActiveFile } from '../../model/implementation/document-impl.model';
import { IRevisionIssue } from '../../model/interface/revision.model';

@Component({
  selector: 'document-preparation-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class DocumentPreparationReviewComponent implements OnInit {
  dokumentId!: number;
  document!: IDocumentDetails;
  i:number=0;
  hasUnResolvedReview: boolean = false;
  globalIssues!: IRevisionIssue[];
  selectedFile?: IRevisionDocumentActiveFile;
  unResolvedFiles!: IRevisionDocumentActiveFile[];
  reviewedFiles!: IRevisionDocumentActiveFile[];

  constructor(private route: ActivatedRoute,private documentService: DocumentService,private fileService: FileService) { }

  ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
          this.dokumentId = Number(params.get('id'));
          this.documentService.getDocumentById(this.dokumentId).subscribe(document => {
            this.document = document;
            this.hasUnResolvedReview= document.hasUnResolvedReview();
            this.fileService.getMainFilesByDocumentId(this.dokumentId).subscribe(activeFiles => {
              this.document.activeFiles=activeFiles;
              this.unResolvedFiles=[];
              this.reviewedFiles=[];
              for(let activeFile of activeFiles){
                const issues =document.getAllReviewIssuesForActiveFile(activeFile.id);
                const isFileNew = document.revisions!.length === 0 || document.hasReviewAfter(activeFile.file.dateUploaded);
                if(issues.length===0 && !isFileNew){
                  this.reviewedFiles.push(new RevisionDocumentActiveFile(issues,activeFile,isFileNew));
                }
                else{
                  this.unResolvedFiles.push(new RevisionDocumentActiveFile(issues,activeFile,isFileNew));
                }
              }
              this.selectedFile= this.unResolvedFiles.length>0 ? this.unResolvedFiles[0] : undefined;
              this.globalIssues= document.getGlobalReviewIssues();
            });
          });
        });
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
      this.reviewedFiles.push(this.selectedFile!);
      this.i=this.i+1;
      this.selectedFile=this.unResolvedFiles[this.i];
  }
  canApprove():boolean{
    return this.globalIssues !== undefined && this.globalIssues.length === 0 && !this.document.hasUnResolvedReview() && this.reviewedFiles.length === this.document.activeFiles!.length;
  }
  canReject():boolean{
    return this.globalIssues !== undefined && this.globalIssues.length > 0 && this.document.hasUnResolvedReview() && this.reviewedFiles.length === this.document.activeFiles!.length;
  }
  approve():void{
    return;
  }
  reject():void{
    return;
  }
  selectFile(activeFileId:number):void{
    this.selectedFile= new RevisionDocumentActiveFile(this.document.getAllReviewIssuesForActiveFile(activeFileId),this.document.activeFiles!.find(af=>af.id===activeFileId)!,this.document.hasReviewAfter(this.document.activeFiles!.find(af=>af.id===activeFileId)!.file.dateUploaded));
  }
  hasReviewed(activeFileId:number):boolean{
    return this.reviewedFiles !== undefined && this.reviewedFiles.find(file => file.activeFile.id === activeFileId) !== undefined;
  }
}
