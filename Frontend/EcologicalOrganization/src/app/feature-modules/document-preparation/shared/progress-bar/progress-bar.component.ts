import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'document-preparation-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent {
 @Input() percentage: number = 0;
}
