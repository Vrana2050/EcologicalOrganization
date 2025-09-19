import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { Prompt } from '../../models/prompt.model';
import { PromptService } from '../../services/prompt.service';
import { PromptVersion } from '../../models/prompt-version.model';
import { PromptVersionService } from '../../services/prompt-version.service';
import { CommonModule } from '@angular/common';
import { DocumentTypeService } from '../../services/document-type.service';
import {
  DocumentTypePage,
  DocumentType,
} from '../../models/document-type.model';

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
  documentTypes: DocumentType[] = [];
  versionsLoading = false;

  showVersionsSidebar = false;

  constructor(
    private documentTypeService: DocumentTypeService,
    private promptService: PromptService,
    private promptVersionService: PromptVersionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();
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

  onCreateNewPrompt(): void {
    const defaultDocTypeId = this.getDefaultDocTypeId();
    if (defaultDocTypeId == null) {
      alert('Nije učitan nijedan Tip dokumenta. Pokušaj ponovo.');
      return;
    }

    const draft: Prompt = {
      id: -1,
      title: '',
      documentTypeId: defaultDocTypeId,
      isActive: false,
      activeVersion: null,
      updatedAt: null,
    };

    this.versions = [];
    this.activePrompt = draft;

    this.showVersionsSidebar = true;
  }

  private getDefaultDocTypeId(): number | null {
    const def = this.documentTypes.find((dt) => dt.name === 'Default');
    return def?.id ?? this.documentTypes[0]?.id ?? null;
  }

  onCreateNewVersion(): void {
    if (!this.activePrompt) return;

    const draft: PromptVersion = {
      id: -1,
      promptId: this.activePrompt.id,
      name: this.buildDefaultDraftName(),
      description: '',
      promptText: '',
      isActive: false,
      createdAt: null,
      updatedAt: null,
      isNew: true,
    };

    this.versions = [draft, ...this.versions];
    this.activePrompt = { ...this.activePrompt, activeVersion: draft };

    this.showVersionsSidebar = true;
  }

  onSaveNewVersion(ev: {
    promptId: number;
    name: string;
    description: string;
    promptText: string;
  }): void {
    this.promptVersionService.createVersion(ev).subscribe({
      next: (created) => {
        if (this.activePrompt) {
          this.versions = this.versions.filter((v) => v.id !== -1 && !v.isNew);

          this.versions = [created, ...this.versions];

          this.onVersionSelected(created);
        }
      },
      error: (err) => {
        console.error('[page] createVersion ERROR', err);
        alert('Kreiranje nove verzije nije uspelo.');
      },
    });
  }
  onSelectPrompt(p: Prompt): void {
    this.activePrompt = p;
    // this.router.navigate(['/prompt-admin', p.id]);
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
            // this.router.navigate(['/prompt-admin', nextPrompt.id]);
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

  onSaveNewPrompt(ev: { title: string; documentTypeId: number }): void {
    this.promptService.saveNewPrompt(ev.title, ev.documentTypeId).subscribe({
      next: (created) => {
        this.prompts = this.prompts.filter((p) => p.id !== -1);

        this.prompts = [created, ...this.prompts];

        this.activePrompt = created;

        this.showVersionsSidebar = true;
      },
      error: (err) => {
        console.error('Error creating prompt:', err);
        alert('Kreiranje prompta nije uspelo.');
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
    if (!this.activePrompt) return;

    const currentPromptId = this.activePrompt.id;
    const currentDocTypeId = this.activePrompt.documentTypeId;

    this.promptVersionService.activateVersion(versionId).subscribe({
      next: (activated) => {
        this.versions = this.versions.map((v) => ({
          ...v,
          isActive: v.id === activated.id,
        }));

        const newActiveLocal =
          this.versions.find((v) => v.id === activated.id) ||
          ({
            id: activated.id,
            promptId: activated.promptId,
            name: activated.name,
            description: activated.description,
            promptText: activated.promptText,
            isActive: true,
            createdAt: activated.createdAt,
            updatedAt: activated.updatedAt,
          } as PromptVersion);

        this.activePrompt = {
          ...this.activePrompt!,
          isActive: true,
          activeVersion: { ...newActiveLocal, isActive: true },
        };

        this.prompts = this.prompts.map((p) => {
          if (p.documentTypeId !== currentDocTypeId) return p;

          if (p.id === currentPromptId) {
            return {
              ...p,
              isActive: true,
              activeVersion: this.activePrompt!.activeVersion ?? null,
            };
          } else {
            return { ...p, isActive: false, activeVersion: null };
          }
        });

        const selected = this.versions.find((v) => v.id === activated.id);
        if (selected) {
          this.onVersionSelected(selected);
        }
      },
      error: (err) => {
        console.error('Greška pri aktivaciji verzije:', err);
        alert('Aktivacija verzije nije uspela. Pokušaj ponovo.');
      },
    });
  }

  onSaveVersion(ev: {
    versionId: number;
    name: string;
    description: string;
    promptText: string;
  }): void {
    console.log('Save existing version', ev);
  }

  onSavePrompt(ev: { name: string }): void {
    if (!this.activePrompt) return;

    if (this.activePrompt.id === -1) {
      return;
    }

    this.activePrompt = {
      ...this.activePrompt,
      title: ev.name,
      documentTypeId: this.activePrompt.documentTypeId,
    };

    this.prompts = this.prompts.map((p) =>
      p.id === this.activePrompt!.id ? { ...p, title: ev.name } : p
    );

    this.promptService.updateTitle(this.activePrompt.id, ev.name).subscribe({
      error: (err) => {
        console.error('Error updating prompt title:', err);
        alert('Nije uspelo ažuriranje naziva prompta.');
      },
    });
  }

  onSaveVersionBasicInfo(ev: {
    versionId: number;
    name: string;
    description: string;
  }): void {
    if (!this.activePrompt?.activeVersion) return;

    const keepText = this.activePrompt.activeVersion.promptText;

    this.promptVersionService
      .updateBasicInfo(ev.versionId, ev.name, ev.description)
      .subscribe({
        next: (server) => {
          const merged = {
            ...this.activePrompt!.activeVersion!,
            name: server.name,
            description: server.description,
            updatedAt: server.updatedAt,
            promptText: keepText,
          };

          this.activePrompt = { ...this.activePrompt!, activeVersion: merged };

          this.versions = this.versions.map((v) =>
            v.id === ev.versionId
              ? {
                  ...v,
                  name: server.name,
                  description: server.description,
                  updatedAt: server.updatedAt,
                }
              : v
          );
        },
        error: (err) => console.error('PATCH basic-info gagal', err),
      });
  }

  onSaveVersionPromptText(ev: { versionId: number; promptText: string }): void {
    if (!this.activePrompt?.activeVersion) return;

    const keepName = this.activePrompt.activeVersion.name;
    const keepDesc = this.activePrompt.activeVersion.description;

    this.promptVersionService
      .updatePromptText(ev.versionId, ev.promptText)
      .subscribe({
        next: (server) => {
          const merged = {
            ...this.activePrompt!.activeVersion!,
            promptText: server.promptText,
            updatedAt: server.updatedAt,
            name: keepName,
            description: keepDesc,
          };

          this.activePrompt = { ...this.activePrompt!, activeVersion: merged };
        },
        error: (err) => console.error('PATCH prompt-text gagal', err),
      });
  }

  loadDocumentTypes(): void {
    this.documentTypeService.list().subscribe({
      next: (page) => {
        this.documentTypes = page.items;
      },
      error: (err) => {
        console.error('Error loading document types:', err);
      },
    });
  }

  getDocumentTypeName(documentTypeId: number | undefined | null): string {
    if (!documentTypeId) return 'Default';
    const dt = this.documentTypes.find((d) => d.id === documentTypeId);
    return dt ? dt.name : 'Default';
  }

  private buildDefaultDraftName(): string {
    const dt = new Date();
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    const yyyy = dt.getFullYear();
    const MM = pad(dt.getMonth() + 1);
    const dd = pad(dt.getDate());
    const HH = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    const ss = pad(dt.getSeconds());
    const SSS = String(dt.getMilliseconds()).padStart(3, '0');
    return `v - ${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}.${SSS}`;
  }
}
