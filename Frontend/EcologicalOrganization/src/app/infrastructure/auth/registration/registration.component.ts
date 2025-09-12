import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Registration, RoleType } from '../model/registration.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  systems = ['DM', 'PM', 'WA', 'DP'] as const;

  registrationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),

    DM: new FormControl<RoleType>('EMPLOYEE', [Validators.required]),
    PM: new FormControl<RoleType>('EMPLOYEE', [Validators.required]),
    WA: new FormControl<RoleType>('EMPLOYEE', [Validators.required]),
    DP: new FormControl<RoleType>('EMPLOYEE', [Validators.required]),
  });

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    if (!this.registrationForm.valid) return;

    const registration: Registration = {
      name: this.registrationForm.value.name || '',
      surname: this.registrationForm.value.surname || '',
      email: this.registrationForm.value.email || '',
      password: this.registrationForm.value.password || '',
      roles: this.systems.map((subsystem) => ({
        subsystem,
        role: this.registrationForm.value[subsystem] as RoleType,
      })),
    };

    this.authService.register(registration).subscribe({
      next: () => this.router.navigate(['home']),
    });
  }
}
