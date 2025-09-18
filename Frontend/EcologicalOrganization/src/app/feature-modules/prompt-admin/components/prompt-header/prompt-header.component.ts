import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DocumentType } from '../../models/document-type.model';

@Component({
  selector: 'pa-prompt-header',
  templateUrl: './prompt-header.component.html',
  styleUrls: ['../../prompt-admin.styles.css', './prompt-header.component.css'],
})
export class PromptHeaderComponent implements OnChanges {
  /** Naslov prompta (za prikaz/izmenu) */
  @Input() title: string | null = null;

  /** Da li je ovo NOVI prompt (draft)? Ako jeste, prikazujemo combobox za tip. */
  @Input() isNewPrompt = false;

  /** Lista svih tipova dokumenata (za combobox kod drafta) */
  @Input() documentTypes: DocumentType[] = [];

  /** Trenutni tip dokumenta (id) */
  @Input() documentTypeId: number | null = null;

  /** (Opcionalno) otvori editor naziva odmah (zgodno za draft) */
  @Input() startInEditMode = false;

  /** Sačuvaj naslov */
  @Output() savePrompt = new EventEmitter<{ name: string }>();

  /** Obrisi prompt */
  @Output() deletePrompt = new EventEmitter<void>();

  /** Promena tipa dokumenta (emituje se samo kada je combobox vidljiv, tj. za draft) */
  @Output() docTypeChanged = new EventEmitter<number>();

  /** Kreiraj novu verziju */
  @Output() createNewVersion = new EventEmitter<void>();

  // --- UI state ---
  nameDraft = '';
  editingName = false;
  invalidName = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title']) {
      this.nameDraft = this.title ?? '';
    }
    if (changes['startInEditMode'] && this.startInEditMode) {
      this.editingName = true;
      this.invalidName = false;
    }
  }

  // prompt-header.component.ts (dopune unutar postojeće klase)
  @Output() saveNewPrompt = new EventEmitter<{
    title: string;
    documentTypeId: number;
  }>();

  onSaveNewPrompt(): void {
    const title = (this.nameDraft || '').trim();
    if (!title) {
      this.invalidName = true;
      return;
    }
    if (this.documentTypeId == null) {
      // ako je doc type obavezan — možeš dodati vizuelnu poruku po želji
      return;
    }
    this.invalidName = false;
    // ne gasim editingName na sili — možeš po želji
    this.saveNewPrompt.emit({ title, documentTypeId: this.documentTypeId });
  }

  /** Tekst prikaza za fiksni tip (za postojeće promptove) */
  get docTypeLabel(): string {
    const dt = this.documentTypes.find((d) => d.id === this.documentTypeId);
    // Ako nema pogodaka – verovatno je tip obrisan
    return dt?.name ?? 'Ovaj tip dokumenta je obrisan';
  }

  // --- Handleri za naziv ---
  startEditName(): void {
    this.editingName = true;
    this.invalidName = false;
  }

  trySaveName(): void {
    const newName = (this.nameDraft || '').trim();
    if (!newName) {
      this.invalidName = true;
      return;
    }
    this.invalidName = false;
    this.editingName = false;
    this.savePrompt.emit({ name: newName });
  }

  cancelEditName(): void {
    this.editingName = false;
    this.invalidName = false;
    this.nameDraft = this.title ?? '';
  }

  // --- Akcije ---
  onDeletePrompt(): void {
    this.deletePrompt.emit();
  }

  onCreateNewVersion(): void {
    this.createNewVersion.emit();
  }

  // --- Promena tipa dokumenta (samo za draft; za postojeće se ne prikazuje select) ---
  onDocTypeChanged(id: number): void {
    // iako UI prikazuje select samo za draft, svejedno emituješ; parent može da ignorise ako želi
    this.docTypeChanged.emit(+id);
  }
}
