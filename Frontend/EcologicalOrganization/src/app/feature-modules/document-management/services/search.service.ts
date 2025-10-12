import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient, private authService: AuthService) {}
  private readonly apiUrl = 'http://127.0.0.1:8000/api/search';
  private headers = new HttpHeaders({
    'x-user-id': this.authService.user$.value.id,
    'x-user-role': this.authService.user$.value.role,
    'x-user-email': this.authService.user$.value.email,
  });

  search(searchPayload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, searchPayload, {
      headers: this.headers,
    });
  }

  generatePDF(searchPayload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate-pdf`, searchPayload, {
      headers: this.headers,
    });
  }
}
