import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PromptVersion } from '../../models/prompt-version.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pa-versions-sidebar',
  templateUrl: './versions-sidebar.component.html',
  styleUrls: ['./versions-sidebar.component.css'],
})
export class VersionsSidebarComponent {
  @Input() versions: PromptVersion[] = [];
  @Input() loading = false;
  @Input() selectedId: number | null = null;
  @Output() createNewVersion = new EventEmitter<void>();

  @Output() selected = new EventEmitter<PromptVersion>();

  onSelectVersion(v: PromptVersion): void {
    this.selected.emit(v);
  }

  onCreateNewVersion(): void {
    this.createNewVersion.emit();
  }
}
