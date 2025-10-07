import { ProjectStatus } from '../interface/project.model';
import { IUserProject } from '../interface/user-project.model';
import { IWorkflow } from '../interface/workflow.model';
import { UserProject, UserProjectCreate } from './user-project-impl.model';
import { IProject, IProjectHome, IBaseProject, IProjectBoard} from '../interface/project.model';
import { Workflow } from './workflow-impl.model';
import { ProjectRole } from '../interface/user-project.model';

export class BaseProject implements IBaseProject{
  id: number;
  name: string;
  status: ProjectStatus;
  completionPercentage: number;
  members: IUserProject[];

  constructor(data: any) {
    if (data == null) {
      throw new Error('BaseProject: No data provided.');
    }
    if (data.id == null) {
      throw new Error('BaseProject: "id" is required.');
    }
    if (!data.naziv) {
      throw new Error('BaseProject: "name" is required.');
    }
    if (data.status == null) {
      throw new Error('BaseProject: "status" is required.');
    }
    if (data.procenatZavrsenosti == null) {
      throw new Error('BaseProject: "completionPercentage" is required.');
    }
    this.id = data.id;
    this.name = data.naziv;
    this.status = data.status;
    this.completionPercentage = data.procenatZavrsenosti;
    this.members = data.korisniciProjekta ? data.korisniciProjekta.map((member: any) => new UserProject(member)) : undefined;

  }
  getStatusLabel(): string {
    switch (this.status) {
      case ProjectStatus.Completed:
        return 'Completed';
      case ProjectStatus.Abandoned:
        return 'Abandoned';
      case ProjectStatus.InProgress:
        return 'In Progress';
      default:
        return 'Unknown Status';
    }
  }
  isCompleted(): boolean {
    return this.status === ProjectStatus.Completed;
  }
  isAbandoned(): boolean {
    return this.status === ProjectStatus.Abandoned;
  }
  isInProgress(): boolean {
    return this.status === ProjectStatus.InProgress;
  }
  isUserOwner(userId: number): boolean {
    return this.members?.some(member => member.userId === userId && member.projectRole === ProjectRole.Manager) || false;
  }
  isUserAssignee(userId: number): boolean {
    return this.members?.some(member => member.userId === userId && member.projectRole !== ProjectRole.Manager) || false;
  }
  canEdit(userId: number): boolean {
    return this.isUserOwner(userId) && this.isInProgress();
  }

}
export class Project extends BaseProject implements IProject {
  dueDate: Date;
  workflow: IWorkflow;
  constructor(data: any) {
    super(data);
    if (!data.rokZavrsetka) {
      throw new Error('Project: "dueDate" is required.');
    }
    if (!data.tokProjekta) {
      throw new Error('Project: "workflow" is required.');
    }
    this.dueDate = new Date(data.rokZavrsetka);
    this.workflow =  new Workflow(data.tokProjekta);
  }
}
export class ProjectHome extends BaseProject implements IProjectHome {
  constructor(data: any) {
    super(data);
    if (!Array.isArray(data.korisniciProjekta)) {
      throw new Error('ProjectHome: "members" must be a valid array.');
    }
    if (!this.members) {
      throw new Error('ProjectHome: "members" is required.');
    }
  }
  getNumberOfMembers(): number {
    return this.members.length;
  }
}
export class ProjectBoard extends BaseProject implements IProjectBoard {
  dueDate: Date;
  workflow: IWorkflow;

  constructor(data:any) {
    super(data);
    if (!data.rokZavrsetka) {
      throw new Error('Project: "dueDate" is required.');
    }
    if (!data.tokProjekta) {
      throw new Error('Project: "workflow" is required.');
    }
    this.dueDate = new Date(data.rokZavrsetka);
    this.workflow =  new Workflow(data.tokProjekta);
  }

}

export class ProjectCreate {
  naziv: string;
  rokZavrsetka: Date;
  tokProjekta:{
    id: number;
  };
  korisniciProjekta:[{
    korisnikId: number,
    ulogaUProjektu: ProjectRole,
  }];

  constructor(data: any) {
    this.naziv = data.name;
    this.rokZavrsetka = new Date(data.dueDate);
    this.tokProjekta = { id: data.workflow.id };
    this.korisniciProjekta = data.assignees.map((assignee: any) => ({
      korisnikId: assignee.userId,
      ulogaUProjektu: assignee.projectRole,
    }));
  }
}
