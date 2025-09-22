import { Component } from '@angular/core';
import { IWorkflow } from '../../model/interface/workflow.model';
import { Input } from '@angular/core';
import { DocumentBoard } from '../../model/implementation/document-impl.model';

@Component({
  selector: 'document-preparation-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
@Input() workflow: IWorkflow;
@Input() documents: DocumentBoard[];
}
