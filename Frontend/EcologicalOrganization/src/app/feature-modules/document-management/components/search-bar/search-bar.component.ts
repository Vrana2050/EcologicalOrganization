import { Component, EventEmitter, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'xp-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  @Output() searchChange = new EventEmitter<string>();

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(500), // čeka 500ms od zadnjeg unosa
        distinctUntilChanged() // ignoriše ako se tekst nije promenio
      )
      .subscribe((value) => {
        this.searchChange.emit(value); // pošalje roditelju
      });
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchSubject.next(input);
  }
}
