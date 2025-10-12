import { Component } from '@angular/core';
import { MOCK_SECTIONS, SectionReadDTO } from '../../models/section.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { Router } from '@angular/router';
import { DirectoryService } from '../../services/directory.service';
import { CreateDirectoryDTO } from '../../models/directory.model';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'xp-main-section-sidebar',
  templateUrl: './main-section-sidebar.component.html',
  styleUrls: ['./main-section-sidebar.component.css'],
})
export class MainSectionSidebarComponent {
  sections: SectionReadDTO[]; // popuni sa API-jem
  openMenuId: number | null = null;
  private sub!: Subscription;

  user: User;
  constructor(
    private authService: AuthService,
    private directoryService: DirectoryService,
    private refreshService: RefreshService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user$.getValue();
    this.loadSections();
    this.sub = this.refreshService.refresh$.subscribe(() => {
      this.loadSections();
    });
  }

  toggleMenu(id: number) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  loadSections() {
    this.directoryService.getUserSections().subscribe({
      next: (data) => {
        console.log('Sections:', data);
        this.sections = data.sections;
      },
      error: (err) => {
        console.error('Error while loading sections', err);
      },
    });
  }

  isModalOpen = false;
  newSectionName = '';

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.newSectionName = '';
  }

  createSection() {
    const newSection: CreateDirectoryDTO = {
      name: this.newSectionName, // ili null ako praviš root
    };

    this.directoryService.createDirectory(newSection).subscribe({
      next: (created) => {
        this.loadSections(); // da osvežiš listu nakon kreiranja
      },
      error: (err) => {
        console.error('Error creating section:', err);
      },
    });
  }

  openActivityReports() {
    this.directoryService.getActivityReportSectionId().subscribe({
      next: (response) => {
        this.router.navigate([
          '/document-management/directory',
          response.directory_id,
        ]);
      },
      error: (err) => {
        console.error('Error generating report:', err);
      },
    });
  }
}
