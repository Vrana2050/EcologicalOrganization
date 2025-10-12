import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionCreateDTO } from '../models/permission.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly baseUrl = 'http://127.0.0.1:8000/api/permission';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  givePermission(permission: PermissionCreateDTO): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/share`, permission, {
      headers: this.headers,
    });
  }
}
