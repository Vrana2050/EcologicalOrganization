import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../models/template.model';
import { DocumentType } from 'src/app/feature-modules/prompt-admin/models/document-type.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'xp-add-new-template',
  templateUrl: './add-new-template.component.html',
  styleUrls: [
    './add-new-template.component.css',
    '../../writing-assistant.styles.css',
  ],
})
export class AddNewTemplateComponent implements OnInit {
  @Input() documentTypes: DocumentType[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<Template>();

  form = {
    name: '',
    documentTypeId: <number | null>null,
    file: <File | null>null,
  };

  touchedName = false;
  saving = false;

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    const def = this.documentTypes.find((d) => d.name === 'Default');
    if (def) this.form.documentTypeId = def.id;
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.form.file = file;

    if (file && !this.touchedName && !this.form.name) {
      this.form.name = file.name.replace(/\.[^.]+$/, '');
    }
  }

  isValid(): boolean {
    return !!(
      this.form.file &&
      this.form.name.trim() &&
      this.form.documentTypeId
    );
  }

  submit() {
    if (!this.isValid() || this.saving) return;

    const fd = new FormData();
    fd.append('name', this.form.name.trim());
    fd.append('document_type_id', String(this.form.documentTypeId));
    fd.append('file', this.form.file!);

    this.saving = true;
    this.templateService.create(fd).subscribe({
      next: (tpl) => {
        this.saving = false;
        this.created.emit(tpl);
        this.close.emit();
      },
      error: (err) => {
        console.error('Greška pri kreiranju šablona:', err);
        this.saving = false;
      },
    });
  }

  cancel() {
    if (!this.saving) this.close.emit();
  }
  backdropClick() {
    this.cancel();
  }

  @HostListener('document:keydown.escape') onEsc() {
    this.cancel();
  }

  clearFile(inputEl: HTMLInputElement) {
    this.form.file = null;

    if (!this.touchedName) this.form.name = '';

    inputEl.value = '';
  }
}
