import { Component } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css'],
})
export class AuditLogsComponent {
  showModal = false;
  selectedYear = new Date().getFullYear();
  selectedMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}
  openModal() {
    this.showModal = true;
  }

  closeModal(event?: MouseEvent) {
    this.showModal = false;
  }
  isLoading = false;
  generatedDocumentId = null;
  showSuccessModal = false;

  generateReport() {
    const monthString = `${this.selectedYear}-${this.selectedMonth}`;
    this.isLoading = true;

    this.documentService.generateReport(monthString).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showModal = false;
        this.generatedDocumentId = response.document_id;
        this.showSuccessModal = true;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error generating report:', err);
      },
    });
  }

  viewGeneratedReport() {
    this.showSuccessModal = false;
    this.router.navigate([
      '/document-management/document',
      this.generatedDocumentId,
    ]);
  }

  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  auditLogs = [
    {
      created_at: '23.02.2025. 16:50',
      user_email: 'user1@example.com',
      object_type: 'FILE',
      object_name: 'file3.txt',
      action: 'File: Preview',
    },
    {
      created_at: '23.02.2025. 16:47',
      user_email: 'admin@example.com',
      object_type: 'DIRECTORY',
      object_name: 'Project_A',
      action: 'Directory: Created',
    },
    {
      created_at: '23.02.2025. 16:40',
      user_email: 'user2@example.com',
      object_type: 'FILE',
      object_name: 'report.pdf',
      action: 'File: Deleted',
    },
    {
      created_at: '23.02.2025. 16:35',
      user_email: 'manager@example.com',
      object_type: 'FILE',
      object_name: 'budget.xlsx',
      action: 'File: Downloaded',
    },
    {
      created_at: '23.02.2025. 16:30',
      user_email: 'user3@example.com',
      object_type: 'DIRECTORY',
      object_name: 'Archive_2024',
      action: 'Directory: Renamed',
    },
    {
      created_at: '23.02.2025. 16:25',
      user_email: 'user4@example.com',
      object_type: 'FILE',
      object_name: 'photo.png',
      action: 'File: Uploaded',
    },
    {
      created_at: '23.02.2025. 16:20',
      user_email: 'user5@example.com',
      object_type: 'DIRECTORY',
      object_name: 'Team_Docs',
      action: 'Directory: Deleted',
    },
    {
      created_at: '23.02.2025. 16:15',
      user_email: 'user2@example.com',
      object_type: 'FILE',
      object_name: 'presentation.pptx',
      action: 'File: Shared',
    },
    {
      created_at: '23.02.2025. 16:10',
      user_email: 'user1@example.com',
      object_type: 'FILE',
      object_name: 'notes.txt',
      action: 'File: Edited',
    },
    {
      created_at: '23.02.2025. 16:05',
      user_email: 'guest@example.com',
      object_type: 'FILE',
      object_name: 'readme.md',
      action: 'File: Viewed',
    },
  ];
}
