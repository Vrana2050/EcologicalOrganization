import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GroupDTO,
  GroupWithUsersDTO,
  GroupUpdateDTO,
} from '../models/group.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserGroupService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/user_group';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  // GET /api/groups/
  getAll(): Observable<GroupDTO[]> {
    return this.http.get<GroupDTO[]>(`${this.baseUrl}/`, {
      headers: this.headers,
    });
  }

  // GET /api/groups/{group_id}
  getGroupById(groupId: number): Observable<GroupWithUsersDTO> {
    return this.http.get<GroupWithUsersDTO>(`${this.baseUrl}/${groupId}`, {
      headers: this.headers,
    });
  }

  // POST /api/groups/
  create(newGroup: {
    name: string;
    description?: string;
  }): Observable<GroupDTO> {
    return this.http.post<GroupDTO>(`${this.baseUrl}/`, newGroup, {
      headers: this.headers,
    });
  }

  // GET /api/groups/add_member/{groupId}/{userEmail}
  addMember(groupId: number, userEmail: string): Observable<GroupWithUsersDTO> {
    return this.http.get<GroupWithUsersDTO>(
      `${this.baseUrl}/add_member/${groupId}/${encodeURIComponent(userEmail)}`,
      { headers: this.headers }
    );
  }

  // DELETE /api/groups/remove_member/{groupId}/{memberId}
  removeMember(groupId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/remove_member/${groupId}/${memberId}`,
      { headers: this.headers }
    );
  }

  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete<void>(`${this.baseUrl}/${groupId}`, {
      headers: this.headers,
    });
  }
}
