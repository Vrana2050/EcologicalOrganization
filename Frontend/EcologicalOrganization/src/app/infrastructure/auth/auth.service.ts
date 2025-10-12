import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorage } from './jwt/token.service';
import { environment } from 'src/env/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Login } from './model/login.model';
import { AuthenticationResponse } from './model/authentication-response.model';
import { User } from './model/user.model';
import { Registration, RoleType } from './model/registration.model';

export type Subsystem = 'WA' | 'DM' | 'DP' | 'PM';

export interface TokenResponse {
  access_token: string;
  token_type: string; // "bearer"
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = new BehaviorSubject<User>({
    email: 'admin@admin.com',
    id: 3,
    role: 'MANAGER',
  });

  // MANAGER   3   admin@admin.com
  // EMPLOYEE  6   ivan@ivan.com

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {}

  login(login: Login): Observable<AuthenticationResponse> {
    const body = new URLSearchParams();
    body.set('username', login.username);
    body.set('password', login.password);

    return this.http
      .post<AuthenticationResponse>(
        `${environment.apiHost}auth/login`,
        body.toString(),
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        }
      )
      .pipe(
        tap((resp) => {
          this.tokenStorage.saveAccessToken(resp.access_token);
          this.setUser();
        })
      );
  }

  loginToSubsystem(subsystem: Subsystem): Observable<TokenResponse> {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Not logged in'));
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<TokenResponse>(
        `${environment.apiHost}auth/login_to_subsystem/${subsystem}`,
        { headers }
      )
      .pipe(
        tap((resp) => {
          this.tokenStorage.saveAccessToken(resp.access_token);
          this.setUser();
        })
      );
  }

  register(
    registration: Registration
  ): Observable<{ id: number; email: string; roles: any }> {
    const rolesRecord: Record<Subsystem, RoleType | 'ADMIN'> = {
      WA: 'EMPLOYEE',
      DM: 'EMPLOYEE',
      DP: 'EMPLOYEE',
      PM: 'EMPLOYEE',
    };
    for (const r of registration.roles) {
      if (['WA', 'DM', 'DP', 'PM'].includes(r.subsystem)) {
        rolesRecord[r.subsystem as Subsystem] = r.role;
      }
    }

    const payload = {
      email: registration.email,
      first_name: registration.name,
      last_name: registration.surname,
      password: registration.password,
      roles: rolesRecord,
    };

    return this.http.post<{ id: number; email: string; roles: any }>(
      `${environment.apiHost}auth/register-account`,
      payload
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.user$.next({ email: '', id: 0, role: '' });
    this.router.navigate(['/login']);
  }

  checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (!accessToken) return;
    this.setUser();
  }

  private setUser(): void {
    const jwtHelperService = new JwtHelperService();
    const accessToken = this.tokenStorage.getAccessToken() || '';
    try {
      const decoded: any = jwtHelperService.decodeToken(accessToken);
      const user: User = {
        id: +decoded.id,
        email: decoded.email ?? decoded.sub,
        role:
          decoded[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] ||
          decoded.role ||
          '',
      };
      this.user$.next(user);
    } catch {
      this.user$.next({ email: '', id: 0, role: '' });
    }
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return false;
    const helper = new JwtHelperService();
    return !helper.isTokenExpired(token);
  }
}
