import { IUser } from '../interface/user.model';

export class User implements IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  constructor(data: any) {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
  }
}