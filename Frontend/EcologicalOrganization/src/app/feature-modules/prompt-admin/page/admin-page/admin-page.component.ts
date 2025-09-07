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

  showVersionsSidebar = false;

  constructor(
    private promptService: PromptService,
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

  openPrompt(id: number): void {
    const found = this.prompts.find((x) => x.id === id);
    this.activePrompt = found ?? null;

    this.showVersionsSidebar = !!this.activePrompt;
  }

  onCreateNew(): void {
    console.log('TODO: create prompt');
  }

  onSelectPrompt(p: Prompt): void {
    this.activePrompt = p;
    this.router.navigate(['/prompt-admin', p.id]);
    this.showVersionsSidebar = true;
  }
  onDeletePrompt(promptId: number): void {
    console.log('TODO: delete prompt', promptId);
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
