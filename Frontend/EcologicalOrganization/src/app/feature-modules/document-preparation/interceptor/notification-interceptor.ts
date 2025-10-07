import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationService } from '../service/Util/toast-notification.service';

@Injectable()
export class ProjectNotificationInterceptor implements HttpInterceptor {

  constructor(private notify: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 🎯 Interceptuj samo tvoj podsistem
    if (!req.url.includes('/docPrep/')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap({
        error: (error: HttpErrorResponse) => {
          if (error instanceof HttpErrorResponse) {
            // 🔍 Izvuci backend poruku (ako postoji)
            const backendMessage =
              error.error ||
              'No additional details provided.';

            // 📦 Napravi dodatni string koji sadrži i backend poruku
            const msgWithDetails = (text: string) =>
              `${text}\n[${error.status}] ${backendMessage}`;

            // 🔄 Switch po status kodu
            switch (error.status) {
              case 400:
                this.notify.error(msgWithDetails('Bad request — please check input data.'));
                break;
              case 401:
                this.notify.warning(msgWithDetails('Unauthorized — please log in.'));
                break;
              case 403:
                this.notify.error(msgWithDetails('Forbidden — you do not have permission.'));
                break;
              case 404:
                this.notify.warning(msgWithDetails('Resource not found.'));
                break;
              case 500:
                this.notify.error(msgWithDetails('Internal server error — please try again later.'));
                break;
              default:
                this.notify.error(msgWithDetails(`Unexpected error (${error.status}).`));
            }

            // (opciono) loguj u konzolu za dev debug
            console.error('Backend error:', {
              url: req.url,
              status: error.status,
              backendMessage,
              fullError: error
            });
          }
        }
      })
    );
  }
}
