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
import { NotificationService } from '../../service/Util/toast-notification.service';
import { DocumentCreate } from '../../model/implementation/document-impl.model';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'document-preparation-document-create',
  templateUrl: './document-create.component.html',
  styleUrls: ['./document-create.component.css']
})
export class DocumentPreparationCreateDocumentComponent implements OnInit {
  @Input() document: IDocumentDetails | undefined;

  @Input() workflowStatus : IWorkflowStatus | undefined;
  @Input() project : IProject | undefined;
  @Input() parentDocument : IDocumentDetails | undefined;
  @Input() isUserOwner : boolean = false;
  @Input() isUserAssignee : boolean = false;
  @Input() sortedWorkflow!: IWorkflow;

  dropdownOpen: boolean = false;
  documentForm!: FormGroup;
  isEditing: boolean = false;
  statusColor!: string;
  allowedStatuses: Map<IWorkflowStatus, string> = new Map<IWorkflowStatus, string>();
  availableUsers: IUserProject[];
  filteredAssignees: IUserProject[];
  assigneeSearch = new FormControl('');
  potentialDependencies: IDocumentBase[] = [];
  priorityLevels :Priority [] = [Priority.Low, Priority.Medium, Priority.High];
  toggleDependencyOpen: boolean = false;
  showChooseWorkflowPopup: boolean = false;
  isSelfAssigned: boolean = false;
  userId!: number;
  constructor(private authService: AuthService, private location: Location, private fb: FormBuilder, private userProjectService: UserProjectService, private documentService: DocumentService, private toastNotificationService: NotificationService) { }
  ngOnInit(): void {

    const projectId = this.project ? this.project.id : this.parentDocument?.projectId;
    this.userId = this.authService.user$.value.id;
    this.documentService.getPotentialDependencies(this.project ? this.project.id :undefined,this.parentDocument ? this.parentDocument.id : undefined).subscribe(dependencies => {
      this.potentialDependencies = dependencies;
    });

    this.userProjectService.getAllAvailableUsersOnProject(projectId!).subscribe(usersProjects => {
      this.userProjectService.getAllUsers().subscribe(users => {
      if(this.document && this.document.assignees && this.document.assignees.length > 0)
      {
        for(let assignee of this.document.assignees){
          const fullUser = users.find(u => u.id === assignee.userId);
          if (fullUser) {
            assignee.name = fullUser.firstName + ' ' + fullUser.lastName;
          }
        }
      }
      this.availableUsers = usersProjects;
      for (let availableUser of this.availableUsers) {
        const fullUser = users.find(u => u.id === availableUser.userId);
        if (fullUser) {
          availableUser.name = fullUser.firstName + ' ' + fullUser.lastName;
        }
      }
    });
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
      status: [this.workflowStatus?.currentStatus.name || '', Validators.required],
      assignees: this.fb.array((this.document?.assignees || []).map(a => this.fb.control(a))),
      priority: [this.document?.priority || undefined],
      dueDate: [this.document?.dueDate ? new Date(this.document.dueDate).toISOString().split('T')[0]  : '',Validators.required],
      description: [this.document?.description || ''],
      dependencies: this.fb.array((this.document?.dependsOn || []).map(d => this.fb.control(d))),
    });
    if(this.workflowStatus){
        this.statusColor = this.allowedStatuses.get(this.workflowStatus) || 'transparent';
      }
      this.assigneeSearch.valueChanges
      .pipe(debounceTime(300)) // ⏳ čekaj 300ms
      .subscribe(value => {
        if (value) {
          this.filteredAssignees = this.availableUsers.filter(user =>{
            return user.name!.toLowerCase().includes(value.toLowerCase()) && this.documentForm.value.assignees.every((assignee: IUserProject) => assignee.id !== user.id);
          });
        } else {
          this.filteredAssignees = [];
        }
      });
  }
   onSubmit() {
    if (this.documentForm.valid) {
      if(this.documentForm.value.dueDate && this.documentForm.value.dependencies && this.documentForm.value.dependencies.length > 0){
        const dueDate = new Date(this.documentForm.value.dueDate);
        const dependencies = this.documentForm.value.dependencies.map((dep: any) => new Date(dep));

        if(dependencies.some((dep:IDocumentBase) => dep.dueDate! < dueDate)){
          this.toastNotificationService.error('Some dependencies have due dates earlier than the document due date.');
        return;
        }
      }
      let formValues = this.documentForm.value;
      formValues.projectId = this.project ? this.project.id : this.parentDocument?.projectId;
      formValues.parentDocumentId = this.parentDocument ? this.parentDocument.id : undefined;
      formValues.statusId = this.workflowStatus ? this.workflowStatus.id : undefined;
      const document: DocumentCreate = new DocumentCreate(formValues);
      if(this.isEditing){
        document.vlasnik = {
          id: this.document!.vlasnik.id,
          korisnikId: this.document!.vlasnik.userId,
          ulogaUProjektu: this.document!.vlasnik.projectRole
        }
        document.id = this.document?.id;
        this.documentService.updateDocument(document).subscribe( () => {
            this.toastNotificationService.success('Document updated successfully');
           window.location.reload();
        });
      }
      else{
        this.documentService.createDocument(document).subscribe( () => {
            this.toastNotificationService.success('Document created successfully');
            this.documentForm.reset();
             window.location.reload();
        });
      }
    }
  }
  getAllAllowedStatuses(): Map<IWorkflowStatus, string> {
    const statuses = new Map<IWorkflowStatus, string>();
    const colors = this.generateStatusColors(this.sortedWorkflow.statuses.length);
    this.sortedWorkflow.statuses.forEach((status, index) => {
      if(status.id === this.workflowStatus?.id){
        statuses.set(this.workflowStatus, colors[index]);
        return;
      }
       if(this.isUserOwner && status.canOwnerAdd()) {
        statuses.set(status, colors[index]);
      }
    });
    return statuses;
  }
  getNextAllowedStatus(): Map<IWorkflowStatus, string> {
    let statuses = new Map<IWorkflowStatus, string>();

    if(this.document!.isInDraft()){
      statuses = this.getAllAllowedStatuses();
    }
    else{
      const colors = this.generateStatusColors(this.sortedWorkflow.statuses.length);
      const allowedStatuses: IWorkflowStatus[] = [];
      const nextStatus : IWorkflowStatus | undefined = this.document!.getNextStatus(this.sortedWorkflow);
      allowedStatuses.push(this.workflowStatus!);
      if(nextStatus) {
        allowedStatuses.push(nextStatus!);
      }
      for (let i = 0; i < this.sortedWorkflow.statuses.length; i++) {
        const status = this.sortedWorkflow.statuses[i];
        const allowedStatus = allowedStatuses.find(s => s.id === status.id);
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
selectStatus(status: IWorkflowStatus) {
  this.documentForm.get('status')?.setValue(status.currentStatus.name);
  this.statusColor = this.allowedStatuses.get(status) || 'transparent';
  this.workflowStatus = status;
}
toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}
selectAssignee(user: IUserProject) {
  const assigneesArray = this.documentForm.get('assignees') as FormArray;

  const exists = assigneesArray.value.some((u: IUserProject) => u.id === user.id);
  if (!exists) {
    assigneesArray.push(new FormControl(user));
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
  const index = this.dependencies.value.findIndex((d: IDocumentBase) => d.id === document.id);

  if (index === -1) {
    this.dependencies.push(new FormControl(document));
  } else {
    this.dependencies.removeAt(index);
  }
}
get assigneesArray(): FormArray {
  return this.documentForm.get('assignees') as FormArray;
}
removeAssignee(index: number): void {
  const removed = this.assigneesArray.at(index)?.value;
  this.assigneesArray.removeAt(index);

  if (removed && removed.userId === this.userId) {
    this.isSelfAssigned = false;
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
assignToSelf() {
  this.isSelfAssigned=true;
  const assigneesArray = this.documentForm.get('assignees') as FormArray;

  const exists = assigneesArray.value.some((u: IUserProject) => u.userId === this.userId);
  if (!exists) {
    assigneesArray.push(new FormControl(this.availableUsers.find(u => u.userId === this.userId)));
  }
}
}