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

    // po želji: automatski otvori sidebar sa verzijama kad izabereš prompt
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

  onDeletePrompt(p: Prompt): void {
    console.log('TODO: delete prompt', p);
  }

  openVersions(): void {
    this.showVersionsSidebar = true;
  }
  closeVersions(): void {
    this.showVersionsSidebar = false;
  }

  onVersionSelected(v: PromptVersion): void {
    if (!this.activePrompt) return;
    // UI preview aktivne verzije – ne menja status u bazi
    this.activePrompt = {
      ...this.activePrompt,
      activeVersion: {
        ...v,
        isActive:
          this.activePrompt.activeVersion?.id === v.id ? true : v.isActive,
      },
    };
  }
}
