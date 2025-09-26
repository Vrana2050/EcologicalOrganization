import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'xp-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.css'],
})
export class WelcomeScreenComponent {
  @Output() createNew = new EventEmitter<void>();

  onCreateNew(): void {
    this.createNew.emit();
  }
}
