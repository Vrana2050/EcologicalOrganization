import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { WorkflowService } from 'src/app/feature-modules/document-preparation/service/workflow.service';
import { IWorkflow } from '../../model/interface/workflow.model';

@Component({
  selector: 'document-preparation-existing-workflow-window',
  templateUrl: './existing-workflow-window.component.html',
  styleUrls: ['./existing-workflow-window.component.css']
})
export class DocumentPreparationExistingWorkflowWindowComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() done = new EventEmitter<IWorkflow>();
  selectedWorkflow: IWorkflow | null = null;
  workflows: IWorkflow[] = [];

  constructor(private workflowService: WorkflowService) { }

  ngOnInit(): void {
    this.workflowService.getAll().subscribe(workflows => {
      this.workflows = workflows;
      console.log('Fetched workflows:', this.workflows);
    });
  }
  selectWorkflow(event: MouseEvent, workflow: IWorkflow): void {
    event.stopPropagation();
    this.selectedWorkflow = workflow;
  }

}
