// section-read.dto.ts
export enum PrincipalType {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  GROUP = 'GROUP',
}

export enum AccessType {
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  PREVIEW = 'PREVIEW',
}

export interface SectionReadDTO {
  directory_id: number;
  directory_name: string;
  principal_type: PrincipalType;
  access_type: AccessType;
}

export interface SectionsReadDTO {
  sections: SectionReadDTO[];
}

export interface SectionCreateDTO {
  directory_name: string;
}

export const MOCK_SECTIONS: SectionReadDTO[] = [
  {
    directory_id: 1,
    directory_name: 'Finance Reports',
    principal_type: PrincipalType.OWNER,
    access_type: AccessType.EDITOR,
  },
  {
    directory_id: 2,
    directory_name: 'HR Policies',
    principal_type: PrincipalType.MANAGER,
    access_type: AccessType.EDITOR,
  },
  {
    directory_id: 3,
    directory_name: 'Project Docs',
    principal_type: PrincipalType.EMPLOYEE,
    access_type: AccessType.VIEWER,
  },
  {
    directory_id: 4,
    directory_name: 'Team Guidelines',
    principal_type: PrincipalType.GROUP,
    access_type: AccessType.PREVIEW,
  },
];
