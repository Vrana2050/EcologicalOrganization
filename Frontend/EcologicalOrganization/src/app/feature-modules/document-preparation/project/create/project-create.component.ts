import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { IWorkflow } from '../../model/interface/workflow.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { IUserProject, ProjectRole } from '../../model/interface/user-project.model';
import { UserProjectService } from '../../service/user-project.service';
import { IUser } from '../../model/interface/user.model';
import { debounceTime } from 'rxjs/operators';
import { UserProjectCreate } from '../../model/implementation/user-project-impl.model';
import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';
import { ProjectCreate } from '../../model/implementation/project-impl.model';
import { ProjectService } from '../../service/project.service';
import { NotificationService } from '../../service/Util/toast-notification.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class DocumentPreparationProjectCreateComponent implements OnInit {

  isWorkflowPopupVisible = true;
  projectForm!: FormGroup;
  selectedWorkflow: IWorkflow | undefined;
  memberSearch = new FormControl('');
  availableMembers : IUser[] = [];
  filteredMembers: IUser[] = [];
  projectRoles: ProjectRole[] = [ProjectRole.Leader, ProjectRole.Member];

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder, private userProjectService: UserProjectService, private projectService: ProjectService, private toastNotificationService: NotificationService) { }

  ngOnInit(): void {
    this.userProjectService.getAllUsers().subscribe(members => {
      this.availableMembers = members.filter(member => member.id !== this.authService.user$.value?.id);
      console.log('Available Members:', this.availableMembers);
    });

    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      workflow: [this.selectedWorkflow, Validators.required],
      assignees: [[], [Validators.required, this.checkMembersValid]] as [UserProjectCreate[], any],
      dueDate: ['', Validators.required]
    });
    this.memberSearch.valueChanges
          .pipe(debounceTime(300)) // ⏳ čekaj 300ms
          .subscribe(value => {
            if (value) {
              this.filteredMembers = this.availableMembers.filter(user =>
                user.firstName!.toLowerCase().includes(value.toLowerCase())
              );
              console.log('Filtered Members:', this.filteredMembers);
            } else {
              this.filteredMembers = [];
            }
          });
  }
  checkMembersValid(control: AbstractControl): ValidationErrors | null {
    const members = control.value as UserProjectCreate[];
    const invalidMembers = members.filter(member => !member.projectRole || member.projectRole.trim() === '');
    return invalidMembers.length > 0 ? { invalidMembers } : null;
  }
  closePopup() {
    this.isWorkflowPopupVisible = false;
  }
  handleWorkflowDone(selectedWorkflow:IWorkflow) {
    this.isWorkflowPopupVisible = false;
    this.selectedWorkflow = selectedWorkflow;
    this.projectForm.patchValue({ workflow: this.selectedWorkflow });
  }
  onSubmit() {
    if (this.projectForm.valid) {
      const projectData = this.projectForm.value;
      console.log('Form Data:', projectData);
      const project: ProjectCreate = new ProjectCreate(projectData);
      console.log('Project to be created:', project);
      this.projectService.createProject(project).subscribe(response => {
        this.toastNotificationService.success('Project created successfully!');
        this.router.navigate(['document-preparation']);

      }, error => {
        console.error('Error creating project:', error);
      });
    }
  }
  handleWorkflowChange() {
    this.isWorkflowPopupVisible = true;
    this.selectedWorkflow = undefined;
  }
  selectMember(member: IUser) {
    const userProject: UserProjectCreate = new UserProjectCreate({
      userId: member.id,
      projectRole: '',
      name: member.firstName + ' ' + member.lastName
    });
    this.memberSearch.setValue('');
    this.filteredMembers = [];
    const currentAssignees = this.projectForm.get('assignees')?.value || [];
    this.projectForm.patchValue({ assignees: [...currentAssignees, userProject] });
  }
  removeMember(member:UserProjectCreate,event:Event) {
    event.stopPropagation();
    const currentAssignees = this.projectForm.get('assignees')?.value || [];
    const index = currentAssignees.findIndex((m: UserProjectCreate) => m.userId === member.userId);
    if (index !== -1) {
      currentAssignees.splice(index, 1);
      this.projectForm.patchValue({ assignees: currentAssignees });
    }
  }
  getRoleName(role:ProjectRole):string {
    switch(role) {
      case ProjectRole.Leader:
        return 'Team Leader';
      case ProjectRole.Member:
        return 'Team Member';
      default:
        return '';
    }
  }
  assignRoleToMember(member:UserProjectCreate,role:any) {
    const currentAssignees = this.projectForm.get('assignees')?.value || [];
    const index = currentAssignees.findIndex((m: UserProjectCreate) => m.userId === member.userId);
    if (index !== -1) {
      currentAssignees[index].projectRole = role.value;
      this.projectForm.patchValue({ assignees: currentAssignees });
    }
  }
  cancel() {
    this.router.navigate(['document-preparation']);
  }
}
