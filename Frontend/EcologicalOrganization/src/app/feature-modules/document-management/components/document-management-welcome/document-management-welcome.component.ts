import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-document-management-welcome',
  templateUrl: './document-management-welcome.component.html',
  styleUrls: ['./document-management-welcome.component.css'],
})
export class DocumentManagementWelcomeComponent implements OnInit {
  user: User;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.user$.getValue();
  }
}
