import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../service/project.service';
import { IProjectBoard } from '../model/interface/project.model';
import { DocumentBoard } from '../model/implementation/document-impl.model';
import { DocumentService } from '../service/document.service';

@Component({
  selector: 'document-preparation-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class DocumentPreparationProjectComponent implements OnInit {
  projectId!: number;
  project!: IProjectBoard;
  documents: DocumentBoard[] = [];
  constructor(private route: ActivatedRoute, private projectService: ProjectService, private documentService: DocumentService) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
    });
    this.loadProject();
    this.loadDocuments();
  }

  loadProject(): void {
    this.projectService.getBoardProjectById(this.projectId).subscribe(project => {
      this.project = project;
    });
  }
  loadDocuments(): void {
    this.documentService.getBoardDocumentsByProjectId(this.projectId).subscribe(docs => {
      this.documents = docs;
    });
  }
}
