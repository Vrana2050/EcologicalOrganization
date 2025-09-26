export type RoleType = 'EMPLOYEE' | 'MANAGER';

export interface Registration {
  name: string;
  surname: string;
  email: string;
  password: string;

  roles: {
    subsystem: 'DM' | 'PM' | 'WA' | 'DP';
    role: RoleType;
  }[];
}
