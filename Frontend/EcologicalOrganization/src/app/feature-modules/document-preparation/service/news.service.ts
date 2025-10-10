import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/env/environment';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { ProjectHome } from '../model/implementation/project-impl.model';
import { HttpHeaders } from '@angular/common/http';
import { ProjectBoard } from '../model/implementation/project-impl.model';
import { DocumentActiveFileUpdate, DocumentBoard } from '../model/implementation/document-impl.model';
import { Analysis } from '../model/implementation/analysis-impl.model';
import { DocumentDetails } from '../model/implementation/document-impl.model';
import { File } from '../model/implementation/file-impl.model';
import { IDocumentActiveFile } from '../model/interface/document.model';

import { DocumentActiveFile } from '../model/implementation/document-impl.model';
import { IFile } from '../model/interface/file.model';
import { INotification } from '../model/interface/notification.model';
import { Notification } from '../model/implementation/notification-impl.model';


@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private baseUrl = environment.apiHost + 'docPrep/';
  private apiUrl = this.baseUrl + "notification";
  headers = new HttpHeaders({
      'X-USER-ROLE': this.authService.user$.value.role,
      'X-USER-ID': this.authService.user$.value.id.toString()
  });
  constructor( private authService: AuthService,
    private http: HttpClient
  ) {}
   getAllNotificationsForUser(): Observable<INotification[]> {
      const url = `${this.apiUrl}`;
     return this.http.get<any[]>(url, { headers: this.headers }).pipe(map(notifications => notifications.map(n => new Notification(n))));
  }
}
