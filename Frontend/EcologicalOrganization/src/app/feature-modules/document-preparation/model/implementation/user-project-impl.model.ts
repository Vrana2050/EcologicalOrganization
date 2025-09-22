import { ProjectRole } from '../interface/user-project.model';
export class UserProject {
  id: number;
  userId: number;
  projectId: number;
  projectRole: ProjectRole;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.korisnikId;
    this.projectId = data.projekatId;
    this.projectRole = data.ulogaUProjektu;
  }
}