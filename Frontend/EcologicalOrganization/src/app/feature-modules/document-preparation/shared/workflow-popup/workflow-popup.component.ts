import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { IWorkflow } from '../../model/interface/workflow.model';

@Component({
  selector: 'document-preparation-workflow-popup',
  templateUrl: './workflow-popup.component.html',
  styleUrls: ['./workflow-popup.component.css']
})
export class DocumentPreparationWorkflowPopupComponent  implements  OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() done = new EventEmitter<IWorkflow>();
  @Output() selectedOption = new EventEmitter<void>();
  showChooseExisting: boolean = false;

  constructor( ) { }

  ngOnInit(): void {
  }
  closePopup(): void {
    this.close.emit();
  }
  chooseExisting(): void {
    this.selectedOption.emit();
    this.showChooseExisting = true;
  }
  handleWorkflowDone(workflow: IWorkflow): void {
    this.done.emit(workflow);
    this.showChooseExisting = false;
  }
}
