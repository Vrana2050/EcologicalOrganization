import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SessionSectionWithLatest } from '../../models/session-section.model';

@Component({
  selector: 'wa-session-section',
  templateUrl: './session-section.component.html',
  styleUrls: [
    '../../writing-assistant.styles.css',
    './session-section.component.css',
  ],
})
export class SessionSectionComponent {
  @Input() section!: SessionSectionWithLatest & {
    _isNew?: boolean;
    _key?: string;
  };
  @Input() isNew = false;

  @Output() save = new EventEmitter<{
    section: SessionSectionWithLatest;
    name: string;
  }>();
  @Output() remove = new EventEmitter<SessionSectionWithLatest>();
  @Output() generate = new EventEmitter<SessionSectionWithLatest>();

  instrDraft = '';
  editingTitle = false;
  titleDraft = '';
  invalidTitle = false;

  ngOnInit(): void {
    const latestInstr =
      this.section?.latestIteration?.sectionInstruction?.text ?? '';
    this.instrDraft = latestInstr;

    this.editingTitle = this.isNew || !!(this.section as any)._isNew;
    this.titleDraft = this.section?.name ?? '';
  }

  startEditTitle() {
    this.editingTitle = true;
    this.titleDraft = this.section?.name ?? '';
    this.invalidTitle = false;
  }

  trySaveTitle() {
    const name = (this.titleDraft || '').trim();
    if (!name) {
      this.invalidTitle = true;
      return;
    }
    this.invalidTitle = false;
    this.save.emit({ section: this.section, name });
    this.editingTitle = false;
  }

  cancelEditTitle() {
    if (this.section._isNew && !this.section.name) {
      this.titleDraft = 'Sekcija';
      this.trySaveTitle();
      return;
    }

    this.editingTitle = false;
    this.invalidTitle = false;
    this.titleDraft = this.section?.name ?? '';
  }
  onRemove() {
    this.remove.emit(this.section);
  }

  onGenerate() {
    this.generate.emit(this.section);
  }
}
