import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PromptVersion } from '../../models/prompt-version.model';
import { PromptVersionService } from '../../services/prompt-version.service';

@Component({
  selector: 'pa-versions-sidebar',
  templateUrl: './versions-sidebar.component.html',
  styleUrls: ['./versions-sidebar.component.css'],
})
export class VersionsSidebarComponent implements OnChanges {
  @Input() promptId: number | null = null;
  @Output() hide = new EventEmitter<void>();
  @Output() selected = new EventEmitter<PromptVersion>();

  loading = false;
  versions: PromptVersion[] = [];

  selectedId: number | null = null;

  constructor(private versionService: PromptVersionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['promptId']) this.load();
  }

  onSelectVersion(v: PromptVersion): void {
    this.selectedId = v.id;
    this.selected.emit(v);
  }

  private load(): void {
    if (!this.promptId) {
      this.versions = [];
      this.loading = false;
      this.selectedId = null;
      return;
    }
    this.loading = true;
    this.versionService.listVersions(this.promptId).subscribe({
      next: (rows) => {
        this.versions = rows;
        this.loading = false;

        const active = rows.find((v) => v.isActive);
        this.selectedId = active ? active.id : rows[0]?.id ?? null;

        if (this.selectedId) {
          const selectedVersion = rows.find((v) => v.id === this.selectedId);
          if (selectedVersion) {
            this.selected.emit(selectedVersion);
          }
        }
      },
      error: (err) => {
        console.error('Error loading versions for prompt', this.promptId, err);
        this.versions = [];
        this.loading = false;
        this.selectedId = null;
      },
    });
  }
}
