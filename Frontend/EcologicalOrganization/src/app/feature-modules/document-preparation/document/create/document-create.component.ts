import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Input } from '@angular/core';
import { IDocumentDetails } from '../../model/interface/document.model';
import { IStatus, IWorkflow,IWorkflowStatus } from '../../model/interface/workflow.model';
import { IProject, IProjectBoard } from '../../model/interface/project.model';
import { DocumentDetails } from '../../model/implementation/document-impl.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IUserProject } from '../../model/interface/user-project.model';
import { UserProjectService } from '../../service/user-project.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { Priority } from '../../model/interface/document.model';
import { FormArray } from '@angular/forms';
import {IDocumentBase} from '../../model/interface/document.model';
import { DocumentService } from '../../service/document.service';

@Component({
  selector: 'document-preparation-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.css']
})
export class DocumentPreparationCreateDocumentComponent implements OnInit {
  @Input() document: IDocumentDetails | undefined;

  @Input() status : IStatus | undefined;
  @Input() project : IProject | undefined;
  @Input() parentDocument : IDocumentDetails | undefined;
  @Input() isUserOwner : boolean = false;
  @Input() isUserAssignee : boolean = false;
  @Input() sortedWorkflow!: IWorkflow;

  dropdownOpen: boolean = false;
  documentForm!: FormGroup;
  isEditing: boolean = false;
  statusColor!: string;
  allowedStatuses: Map<IStatus, string> = new Map<IStatus, string>();
  availableUsers: IUserProject[];
  filteredAssignees: IUserProject[];
  assigneeSearch = new FormControl('');
  potentialDependencies: IDocumentBase[] = [];
  priorityLevels :Priority [] = [Priority.Low, Priority.Medium, Priority.High];
  toggleDependencyOpen: boolean = false;
  showChooseWorkflowPopup: boolean = false;
  constructor(private fb: FormBuilder, private userProjectService: UserProjectService,private documentService : DocumentService) { }
  ngOnInit(): void {
    const projectId = this.project ? this.project.id : this.parentDocument?.projectId;
    this.documentService.getPotentialDependencies(this.project ? this.project.id :undefined,this.parentDocument ? this.parentDocument.id : undefined).subscribe(dependencies => {
      this.potentialDependencies = dependencies;
    });

    this.userProjectService.getAllAvailableUsersOnProject(projectId!).subscribe(users => {
      this.availableUsers = users;
    });
    this.isEditing = !!this.document;
    if(!this.sortedWorkflow){
      return;
    }
    if(this.isEditing){
      const currentStatus = this.document ? this.document.status : undefined;
      if(currentStatus){
        this.allowedStatuses = this.getNextAllowedStatus()
      } else {
        this.allowedStatuses = this.getAllAllowedStatuses();
      }
    }
    else{
      if(!this.sortedWorkflow)
      {
        this.showChooseWorkflowPopup =true;
      }
      this.allowedStatuses = this.getAllAllowedStatuses();
    }
    this.documentForm = this.fb.group({
      name: [this.document?.name || '', Validators.required],
      status: [this.status?.name || ''],
      assignees: this.fb.array((this.document?.assignees || []).map(a => this.fb.control(a))),
      priority: [this.document?.priority || ''],
      dueDate: [this.document?.dueDate ? new Date(this.document.dueDate).toISOString().split('T')[0]  : ''],
      description: [this.document?.description || ''],
      dependencies: this.fb.array((this.document?.dependsOn || []).map(d => this.fb.control(d))),
    });
    console.log(this.documentForm.value);
    if(this.status){
        this.statusColor = this.allowedStatuses.get(this.status) || 'transparent';
      }
    if(this.availableUsers && this.availableUsers.length > 0 && this.availableUsers[0].name){
      this.assigneeSearch.valueChanges
      .pipe(debounceTime(300)) // ⏳ čekaj 300ms
      .subscribe(value => {
        if (value) {
          this.filteredAssignees = this.availableUsers.filter(user =>
            user.name!.toLowerCase().includes(value.toLowerCase())
          );
        } else {
          this.filteredAssignees = [];
        }
      });
    }
  }
   onSubmit() {
    if (this.documentForm.valid) {
      //VALIDIRATI DEPENDENCY DUEDATE I DOKUMENT DUEDATE
      console.log('Form submitted:', this.documentForm.value);
    }
  }
  getAllAllowedStatuses(): Map<IStatus, string> {
    const statuses = new Map<IStatus, string>();
    const colors = this.generateStatusColors(this.sortedWorkflow.statuses.length);
    this.sortedWorkflow.statuses.forEach((status, index) => {
       if(this.isUserOwner && status.canOwnerAdd()) {
        statuses.set(status.currentStatus, colors[index]);
      }
      if(this.isUserAssignee && status.canAssigneeAdd()) {
        statuses.set(status.currentStatus, colors[index]);
      }
    });
    return statuses;
  }
  getNextAllowedStatus(): Map<IStatus, string> {
    let statuses = new Map<IStatus, string>();

    if(this.document!.isInDraft()){
      statuses = this.getAllAllowedStatuses();
    }
    else{
      const colors = this.generateStatusColors(this.sortedWorkflow.statuses.length);
      const allowedStatuses: IStatus[] = [];
      const nextStatus : IStatus | undefined = this.document!.getNextStatus()?.currentStatus;
      allowedStatuses.push(this.status!);
      allowedStatuses.push(nextStatus!);
      for (let i = 0; i < this.sortedWorkflow.statuses.length; i++) {
        const status = this.sortedWorkflow.statuses[i];
        const allowedStatus = allowedStatuses.find(s => s.id === status.currentStatus.id);
        if(allowedStatus) {
          statuses.set(allowedStatus, colors[i]);
        }
      }
    }
    return statuses;
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
selectStatus(status: any) {
  this.documentForm.get('status')?.setValue(status.name);
  this.statusColor = this.allowedStatuses.get(status) || 'transparent';
  this.status = status;
}
toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}
selectAssignee(user: IUserProject) {
  const assignees = this.documentForm.get('assignees')?.value || [];
  if (!assignees.find((u: IUserProject) => u.id === user.id)) {
    assignees.push(user);
    this.documentForm.get('assignees')?.setValue(assignees);
  }
  this.assigneeSearch.setValue('');
  this.filteredAssignees = [];

}
getPriorityLevels(priority: Priority): string {
  switch (priority) {
    case Priority.Low:
      return "Low";
    case Priority.Medium:
      return "Medium";
    case Priority.High:
      return "High";
    default:
      return "Unknown";
  }
}
get dependencies(): FormArray {
  return this.documentForm.get('dependencies') as FormArray;
}

toggleDependency(document: IDocumentBase) {
 const dependencies = this.documentForm.get('dependencies')?.value || [];

  if (!dependencies.find((d: IDocumentBase) => d.id === document.id)) {
    dependencies.push(document);
    this.documentForm.get('dependencies')?.setValue(dependencies);
  }
}
toggleDependencyDropdown() {
  this.toggleDependencyOpen = !this.toggleDependencyOpen;
}
selectDependency(document: IDocumentBase) {
const exists = this.dependencies.value.some((d: IDocumentBase) => d.id === document.id);

  if (!exists) {
    this.dependencies.push(this.fb.control(document));
  }

  this.toggleDependencyOpen = false;
}
}