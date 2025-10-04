import { IUserProject, ProjectRole } from '../interface/user-project.model';
export class UserProject implements IUserProject {
  id: number;
  userId: number;
  projectId: number;
  projectRole: ProjectRole;
  name?: string;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.korisnikId;
    this.projectId = data.projekatId;
    this.projectRole = data.ulogaUProjektu;
  }
}
export class UserProjectCreate {
  userId: number;
  projectRole: ProjectRole;
  name?: string;

  constructor(data: any) {
    this.userId = data.userId;
    this.projectRole = data.projectRole;
    this.name = data.name;
  }
}