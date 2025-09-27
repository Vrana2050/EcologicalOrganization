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
    if (this.registrationForm.invalid) return;

    const v = this.registrationForm.value;

    const registration: Registration = {
      name: v.name || '',
      surname: v.surname || '',
      email: v.email || '',
      password: v.password || '',
      roles: this.systems.map((subsystem) => ({
        subsystem,
        role: (v[subsystem] as RoleType) ?? 'EMPLOYEE',
      })),
    };

    this.authService.register(registration).subscribe({
      next: () => {
        alert('Korisnik uspešno napravljen ✅');

        this.registrationForm.reset({
          name: '',
          surname: '',
          email: '',
          password: '',
          DM: 'EMPLOYEE',
          PM: 'EMPLOYEE',
          WA: 'EMPLOYEE',
          DP: 'EMPLOYEE',
        });
        this.registrationForm.markAsPristine();
        this.registrationForm.markAsUntouched();
      },
      error: (err) => {
        const msg =
          err?.error?.detail ||
          err?.error?.message ||
          'Došlo je do greške pri registraciji.';
        alert(msg);
      },
    });
  }

  goBack() {
    window.history.back();
  }
}
