import { Component } from '@angular/core';
import { IProjectHome } from '../model/interface/project.model';
import { OnInit } from '@angular/core';
import { ProjectService } from '../service/project.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'document-preparation-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class DocumentPreparationHomeComponent implements OnInit {
  projects : IProjectHome[] = [];
  selectedProject: IProjectHome ;
  isViewMembersVisible: boolean = false;
  canAddProjectFlag!:boolean;
  constructor(private projectService: ProjectService,private router: Router,private authService: AuthService) { }

  ngOnInit(): void {
    this.initializeProjects();
  }
  initializeProjects(): void {
    this.projectService.getAllHomeProjects().subscribe(projects => {
      this.projects = projects;
      this.canAddProjectFlag = this.canAddProject();
    });
  }
  viewProjectMembers(project: IProjectHome): void {
    this.selectedProject = project;
    this.isViewMembersVisible = true;
  }
  closeViewMembers(): void {
    this.isViewMembersVisible = false;
  }
  viewProject(project: IProjectHome): void {
    this.router.navigate(['document-preparation/board/project', project.id]);
  }
  canAddProject(): boolean {
    return this.authService.isUserManager();
  }
  addProject(): void {
    this.router.navigate(['document-preparation/create/project']);
  }
}
