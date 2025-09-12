import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { Prompt } from '../../models/prompt.model';
import { PromptService } from '../../services/prompt.service';
import { PromptVersion } from '../../models/prompt-version.model';
import { PromptVersionService } from '../../services/prompt-version.service';

@Component({
  selector: 'pa-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css'],
})
export class PromptAdminPageComponent implements OnInit {
  prompts: Prompt[] = [];
  loading = true;

  activePrompt: Prompt | null = null;

  versions: PromptVersion[] = [];
  versionsLoading = false;

  showVersionsSidebar = false;

  constructor(
    private promptService: PromptService,
    private promptVersionService: PromptVersionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrompts();

    this.route.paramMap
      .pipe(
        map((p) => p.get('promptId')),
        filter((id): id is string => !!id),
        map((id) => +id),
        distinctUntilChanged()
      )
      .subscribe((id) => this.openPrompt(id));
  }

  loadPrompts(): void {
    this.loading = true;
    this.promptService.list().subscribe({
      next: (page) => {
        this.prompts = page.items;
        this.loading = false;

        if (!this.activePrompt && this.prompts.length > 0) {
          const active = this.prompts.find((p) => p.isActive);
          const toOpen = active ?? this.prompts[0] ?? '';
          this.openPrompt(toOpen.id);
          this.router.navigate(['/prompt-admin', toOpen.id]);
        }
      },
      error: (err) => {
        console.error('Error loading prompts:', err);
        this.loading = false;
      },
    });
  }

  loadVersions(promptId: number): void {
    this.versionsLoading = true;
    this.promptVersionService.listVersions(promptId).subscribe({
      next: (rows) => {
        this.versions = rows;
        this.versionsLoading = false;

        const active = rows.find((v) => v.isActive);
        const selected = active ?? rows[0] ?? null;
        if (selected) {
          this.onVersionSelected(selected);
        }
      },
      error: (err) => {
        console.error('Error loading versions:', err);
        this.versions = [];
        this.versionsLoading = false;
      },
    });
  }

  openPrompt(id: number): void {
    const found = this.prompts.find((x) => x.id === id);
    this.activePrompt = found ?? null;

    if (this.activePrompt) {
      this.loadVersions(this.activePrompt.id);
    }

    this.showVersionsSidebar = !!this.activePrompt;
  }

  onCreateNew(): void {
    console.log('TODO: create prompt');
  }

  onSelectPrompt(p: Prompt): void {
    this.activePrompt = p;
    this.router.navigate(['/prompt-admin', p.id]);
    this.showVersionsSidebar = true;
    this.loadVersions(p.id);
  }

  onDeletePrompt(promptId: number): void {
    if (!promptId) return;
    const confirmed = window.confirm(
      'Da li sigurno želiš da obrišeš ovaj prompt?'
    );
    if (!confirmed) return;

    this.promptService.delete(promptId).subscribe({
      next: () => {
        this.loading = true;

        this.prompts = this.prompts.filter((p) => p.id !== promptId);

        if (this.activePrompt?.id === promptId) {
          const nextPrompt = this.prompts[0] ?? null;
          this.activePrompt = nextPrompt;
          if (nextPrompt) {
            this.router.navigate(['/prompt-admin', nextPrompt.id]);
            this.loadVersions(nextPrompt.id);
          } else {
            this.showVersionsSidebar = false;
            this.versions = [];
            this.router.navigate(['/prompt-admin']);
          }
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting prompt:', err);
        if (err.status === 409) {
          alert('Ne možeš obrisati prompt koji u sebi ima aktivnu verziju.');
        } else {
          alert('Brisanje prompta nije uspelo. Pokušaj ponovo.');
        }
      },
    });
  }

  onDeletePromptVersion(versionId: number): void {
    if (!versionId || !this.activePrompt) return;
    const confirmed = window.confirm(
      'Da li sigurno želiš da obrišeš ovu verziju?'
    );
    if (!confirmed) return;

    this.promptVersionService.delete(versionId).subscribe({
      next: () => {
        if (this.activePrompt?.activeVersion?.id === versionId) {
          this.activePrompt = {
            ...this.activePrompt,
            activeVersion: null,
          };
        }
        if (this.activePrompt) {
          this.loadVersions(this.activePrompt.id);
        }
      },
      error: (err) => {
        console.error('Error deleting version:', err);
        if (err.status === 409) {
          alert(
            'Ne možeš obrisati verziju koja je aktivna. Postavi neku drugu verziju kao aktivnu i pokušaj ponovo.'
          );
        } else {
          alert('Brisanje verzije nije uspelo. Pokušaj ponovo.');
        }
      },
    });
  }

  openVersions(): void {
    this.showVersionsSidebar = true;
  }
  closeVersions(): void {
    this.showVersionsSidebar = false;
  }

  onVersionSelected(v: PromptVersion): void {
    if (!this.activePrompt) return;
    this.activePrompt = {
      ...this.activePrompt,
      activeVersion: {
        ...v,
        isActive:
          this.activePrompt.activeVersion?.id === v.id ? true : v.isActive,
      },
    };
  }

  onSetActiveVersion(versionId: number): void {
    console.log('Set active version', versionId);
  }

  onSaveVersion(ev: {
    versionId: number;
    name: string;
    description: string;
    promptText: string;
  }): void {
    console.log('Save existing version', ev);
  }

  onSaveAsNewVersion(ev: {
    promptId: number;
    name: string;
    description: string;
    promptText: string;
  }): void {
    console.log('Save as new version', ev);
  }
}
