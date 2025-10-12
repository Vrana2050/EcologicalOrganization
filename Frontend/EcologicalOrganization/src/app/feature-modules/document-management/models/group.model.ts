export interface GroupUpdateDTO {
  id: number;
  name: string;
  description?: string;
}

export interface GroupDTO {
  id: number;
  name: string;
  description?: string;
  members: number[];
}

export interface Member {
  id: number;
  email: string;
}

export interface GroupWithUsersDTO {
  id: number;
  name: string;
  description?: string;
  members: Member[];
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
}
