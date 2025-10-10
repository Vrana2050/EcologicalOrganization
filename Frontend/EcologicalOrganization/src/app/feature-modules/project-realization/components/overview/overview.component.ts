import { Component, computed, effect, inject } from '@angular/core';
import { Member } from '../../models/member.model';
import { Project } from '../../models/project.model';
import { ProjectContextService } from '../../services/project-context.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'pr-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
  private ctx = inject(ProjectContextService);
  project = computed(() => this.ctx.project());
  api = inject(ProjectService);

  durationDays(p: Project): number {
    const start = new Date(p.startDate);
    const end = p.endDate ? new Date(p.endDate) : new Date();
    const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.max(0, Math.round((b - a) / (24 * 60 * 60 * 1000)));
  }

  members: Member[] = [];
  membersLoading = false;
  membersError = '';

  // Kada se promeni projekat u kontekstu, učitaj članove
  private _loadMembersEffect = effect(() => {
    const p = this.project();
    if (!p?.id) return;

    this.membersLoading = true;
    this.membersError = '';
    this.api.getProjectMembers(p.id).subscribe({
      next: (list) => {
        // Ako želiš samo aktivne članove:
        this.members = (list ?? []).filter((m) => m.active);
        this.membersLoading = false;
      },
      error: (err) => {
        this.members = [];
        this.membersError = err?.error?.message || 'Unable to load members.';
        this.membersLoading = false;
      },
    });
  });

  roleLabel(code: string | null | undefined): string {
    switch ((code || '').toUpperCase()) {
      case 'GK':
        return 'Main coordinator';
      case 'PK':
        return 'Assistant coordinator';
      case 'NO':
        return 'Responsible person';
      default:
        return 'Project member';
    }
  }

  // Pošto u modelu imamo userId (a ne ime), prikažemo "Member #ID".
  // Ako kasnije API bude vraćao ime, ovde lako prilagodiš.
  displayName(m: Member): string {
    return `Member #${m.userId}`;
  }

  // Avatar slovo (kad nema imena – stavi "M")
  avatarLetter(m: Member): string {
    return 'M';
  }
}
