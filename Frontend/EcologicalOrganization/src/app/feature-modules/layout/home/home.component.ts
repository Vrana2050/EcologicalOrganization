import { Component } from '@angular/core';
import {
  AuthService,
  Subsystem,
} from 'src/app/infrastructure/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private auth: AuthService, private router: Router) {}

  routeMap: Record<Subsystem, string> = {
    WA: '/writing-assistant',
    DM: '/document-management',
    DP: '/document-preparation',
    PM: '/project-realization',
  };

  enter(subsystem: Subsystem, event?: Event) {
    event?.preventDefault();
    this.auth.loginToSubsystem(subsystem).subscribe({
      next: () => this.router.navigate([this.routeMap[subsystem]]),
      error: (err) => {
        console.error('Subsystem login failed', err);
      },
    });
  }
}
