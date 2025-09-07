import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'wa-session-header',
  templateUrl: './session-header.component.html',
  styleUrls: [
    '../../writing-assistant.styles.css',
    './session-header.component.css',
  ],
})
export class SessionHeaderComponent {
  @Output() addSection = new EventEmitter<void>();
  @Output() saveTitle = new EventEmitter<string>();
  @Output() globalInstructionChange = new EventEmitter<string>();

  @Input() title = 'Dokument';
  @Input() globalInstruction = '';

  editingTitle = false;
  titleDraft = '';
  invalidTitle = false;

  startEdit() {
    this.editingTitle = true;
    this.titleDraft = this.title;
    this.invalidTitle = false;
  }

  trySave() {
    const newTitle = (this.titleDraft || '').trim();
    if (!newTitle) {
      this.invalidTitle = true;
      return;
    }
    this.invalidTitle = false;
    this.saveTitle.emit(newTitle);
    this.editingTitle = false;
  }

  cancelEdit() {
    this.editingTitle = false;
    this.invalidTitle = false;
    this.titleDraft = this.title;
  }

  onGlobalInstructionInput(val: string) {
    this.globalInstructionChange.emit(val);
  }
}
