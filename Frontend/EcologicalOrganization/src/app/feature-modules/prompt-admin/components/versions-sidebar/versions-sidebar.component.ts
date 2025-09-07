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
  selector: 'pa-versions-sidebar', // <= MATCHUJE u HTML-u
  templateUrl: './versions-sidebar.component.html',
  styleUrls: ['./versions-sidebar.component.css'],
})
export class VersionsSidebarComponent implements OnChanges {
  @Input() promptId: number | null = null; // <= input postoji
  @Output() hide = new EventEmitter<void>();
  @Output() selected = new EventEmitter<PromptVersion>(); // <= output postoji

  loading = false; // <= polje postoji
  versions: PromptVersion[] = []; // <= polje postoji

  constructor(private versionService: PromptVersionService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['promptId']) this.load();
  }

  onHide(): void {
    this.hide.emit();
  }

  onSelectVersion(v: PromptVersion): void {
    this.selected.emit(v);
  }

  private load(): void {
    if (!this.promptId) {
      this.versions = [];
      this.loading = false;
      return;
    }
    this.loading = true;
    this.versionService.listVersions(this.promptId).subscribe({
      next: (rows) => {
        this.versions = rows;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading versions for prompt', this.promptId, err);
        this.versions = [];
        this.loading = false;
      },
    });
  }
}
