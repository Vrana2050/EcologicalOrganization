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

  @Input() title = 'Dokument';
  @Input() globalInstruction = '';
}
