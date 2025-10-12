import { AppComponent } from './../../../../app.component';
import { SearchService } from './../../services/search.service';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { TagService } from '../../services/tag.service';
import { MetadataService } from '../../services/metadata.service';

@Component({
  selector: 'xp-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css'],
})
export class AdvancedSearchComponent implements OnInit {
  constructor(
    private tagService: TagService,
    private metadataService: MetadataService,
    private searchService: SearchService
  ) {}
  ngOnInit(): void {
    this.loadTagsAndMeta();
  }

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  loadTagsAndMeta() {
    this.tagService.getAll().subscribe({
      next: (data) => (this.allTags = data),
      error: (err) => console.error('Error fetching tags', err),
    });
    this.metadataService.getAll().subscribe({
      next: (data) => (this.allMetadata = data),
      error: (err) => console.error('Error fetching metadata', err),
    });
  }

  // Search term
  searchTerm = '';
  searchTermOptions = ['All', 'Document Name', 'Directory Name', 'Content'];
  selectedSearchTermType = 'All';
  allItems: any[] = [];

  // Folder & creator
  folderName = '';
  creatorEmail = '';

  // Date range
  createdFrom: string | null = null;
  createdTo: string | null = null;

  // Tags
  tagInput = '';
  selectedTags: any[] = [];
  filteredTags: any[] = [];
  allTags: any[] = []; // popunjava se iz API-ja

  // Metadata
  allMetadata: any[] = []; // popunjava se iz API-ja
  selectedMetadata: any[] = [];
  selectedMetadataId: number | null = null;

  /** ---------------- TAGS ---------------- */
  // filterTags() {
  //   const query = this.tagInput.toLowerCase();
  //   this.filteredTags = this.allTags.filter(
  //     (t) =>
  //       t.name.toLowerCase().includes(query) &&
  //       !this.selectedTags.find((s) => s.id === t.id)
  //   );
  // }

  // selectSuggestion(tag: any) {
  //   this.selectedTags.push(tag);
  //   this.tagInput = '';
  //   this.filteredTags = [];
  // }

  // addTagFromInput(event: Event) {
  //   event.preventDefault();
  //   if (!this.tagInput.trim()) return;
  //   const existing = this.allTags.find(
  //     (t) => t.name.toLowerCase() === this.tagInput.toLowerCase()
  //   );
  //   if (existing) {
  //     this.selectedTags.push(existing);
  //     this.tagInput = '';
  //     this.filteredTags = [];
  //   }
  // }

  removeTag(tag: any) {
    this.selectedTags = this.selectedTags.filter((t) => t.id !== tag.id);
  }

  // handleBackspace(event: Event) {
  //   if (!this.tagInput && this.selectedTags.length > 0) {
  //     this.selectedTags.pop();
  //   }
  // }
  @ViewChildren('suggestionItem') suggestionItems!: QueryList<ElementRef>;

  selectedSuggestionIndex: number = -1;

  filterTags() {
    const query = this.tagInput.toLowerCase();
    this.filteredTags = this.allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(query) &&
        !this.selectedTags.find((s) => s.id === t.id)
    );
    this.selectedSuggestionIndex = this.filteredTags.length > 0 ? 0 : -1;
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.filteredTags.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex =
          (this.selectedSuggestionIndex + 1) % this.filteredTags.length;
        this.scrollToSelected();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex =
          (this.selectedSuggestionIndex - 1 + this.filteredTags.length) %
          this.filteredTags.length;
        this.scrollToSelected();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          const tag = this.filteredTags[this.selectedSuggestionIndex];
          this.selectSuggestion(tag);
        } else {
          this.addTagFromInput(event);
        }
        break;

      case 'Backspace':
        this.handleBackspace(event);
        break;
    }
  }

  private scrollToSelected() {
    const items = this.suggestionItems?.toArray();
    if (items && items[this.selectedSuggestionIndex]) {
      items[this.selectedSuggestionIndex].nativeElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }

  selectSuggestion(tag: any) {
    this.selectedTags.push(tag);
    this.tagInput = '';
    this.filteredTags = [];
    this.selectedSuggestionIndex = -1;
  }

  addTagFromInput(event: Event) {
    event.preventDefault();
    if (!this.tagInput.trim()) return;
    const existing = this.allTags.find(
      (t) => t.name.toLowerCase() === this.tagInput.toLowerCase()
    );
    if (existing) {
      this.selectedTags.push(existing);
      this.tagInput = '';
      this.filteredTags = [];
    }
  }

  handleBackspace(event: Event) {
    if (!this.tagInput && this.selectedTags.length > 0) {
      this.selectedTags.pop();
    }
  }

  /** ---------------- METADATA ---------------- */
  addMetadata() {
    const meta = this.allMetadata.find((m) => m.id === this.selectedMetadataId);
    if (!meta) return;

    this.selectedMetadata.push({
      custom_metadata: meta,
      value: null,
      operator: 'is',
    });
    this.selectedMetadataId = null;
  }

  removeMetadata(index: number) {
    this.selectedMetadata.splice(index, 1);
  }

  isMetadataDisabled(id: number): boolean {
    return this.selectedMetadata.some((m) => m.custom_metadata.id === id);
  }

  getOperators(type: string): string[] {
    const common = ['exists', 'does not exist'];
    switch (type) {
      case 'Boolean':
        return ['is', 'is not', ...common];
      case 'Integer':
      case 'Decimal':
      case 'Date':
      case 'Datetime':
      case 'Time':
        return [
          'is',
          'is not',
          'is below',
          'is above',
          'at least',
          'at most',
          ...common,
        ];
      case 'String':
        return ['is', 'is not', 'includes', 'excludes', ...common];
      default:
        return common;
    }
  }

  searchResults: any;
  pageSize: number = 8;
  totalPages: number = 0;
  currentPage: number = 0;
  totalCount: number = 0;
  hasSearched: boolean = false;
  payload: any;
  // U component.ts
  displayedColumns: string[] = []; // dinamičke kolone
  updateDisplayedColumns() {
    // Uvek prikazujemo Name i Tags
    const cols = ['Name', 'Tags', 'Score', 'Actions'];

    // Dodajemo "Date Created" samo ako je filter postavljen
    if (this.createdFrom || this.createdTo) {
      cols.splice(1, 0, 'Date Created'); // ubaci posle Name
    }

    if (
      this.searchTerm &&
      (this.selectedSearchTermType == 'All' ||
        this.selectedSearchTermType == 'Content')
    ) {
      if (this.createdFrom || this.createdTo) {
        cols.splice(2, 0, 'Summary');
      } else {
        cols.splice(1, 0, 'Summary');
      }
    }

    // Dodajemo kolone iz Custom Metadata ako su izabrane
    for (const m of this.selectedMetadata) {
      if (m?.custom_metadata?.name) {
        cols.splice(cols.length - 2, 0, m.custom_metadata.name);
      }
    }

    this.displayedColumns = cols;
  }

  hasMetadataColumn(col: string): boolean {
    return this.selectedMetadata?.some((m) => m?.custom_metadata?.name === col);
  }

  getMetadataValue(item: any, col: string): any {
    const selected = this.selectedMetadata?.find(
      (sm) => sm.custom_metadata.name === col
    );
    if (!selected) return 'missing';

    const meta = item.metadata?.find(
      (m: any) => m.metadata_id === selected.custom_metadata.id
    );
    return meta?.value ?? 'missing';
  }

  getMetadataValueColor(item: any, col: string): any {
    const selected = this.selectedMetadata?.find(
      (sm) => sm.custom_metadata.name === col
    );
    if (!selected) return 'red';

    const meta = item.metadata?.find(
      (m: any) => m.metadata_id === selected.custom_metadata.id
    );
    return meta?.value ? 'black' : 'red';
  }

  getColumnWidth(col: string): string {
    const nameWidth = 20;
    const scoreWidth = 5;
    const actionsWidth = 5;
    const summaryWidth = 20;
    var fixedWidth = nameWidth + scoreWidth + actionsWidth;

    // Dinamične kolone (Custom Metadata)
    const dynamicCols = this.displayedColumns.filter(
      (c) => !['Name', 'Tags', 'Score', 'Actions'].includes(c)
    );

    if (this.displayedColumns.includes('Summary')) fixedWidth += summaryWidth;

    if (col == 'Summary') return `${summaryWidth}%`;

    const remaining = 100 - fixedWidth;

    // Ako NEMA dodatnih kolona → Tags zauzima sve (do 70%)
    if (col === 'Tags' && dynamicCols.length === 0) {
      return `${Math.min(70, remaining)}%`;
    }

    // Ako IMA dodatnih kolona → Tags se smanjuje, ali ne ispod 35%
    if (col === 'Tags' && dynamicCols.length > 0) {
      const usedByDynamic = Math.min(remaining * 0.5, dynamicCols.length * 10); // npr. svaka meta kolona uzme do 8%
      const tagsWidth = Math.max(35, remaining - usedByDynamic);
      return `${tagsWidth}%`;
    }

    // Name, Score, Actions su fiksni
    if (col === 'Name') return `${nameWidth}%`;
    if (col === 'Score' || col === 'Actions') return `${scoreWidth}%`;

    // Custom Metadata kolone dele preostali prostor (oduzmi i Tags)
    const tagsWidth = this.getColumnWidth('Tags'); // možeš i izračunati odvojeno ako hoćeš da izbegneš rekurziju
    const tagsNumeric = Number(tagsWidth.replace('%', ''));
    const remainingForDynamic = 100 - (fixedWidth + tagsNumeric);
    const width =
      dynamicCols.length > 0 ? remainingForDynamic / dynamicCols.length : 0;

    return `${width}%`;
  }

  /** ---------------- SEARCH ---------------- */
  performSearch() {
    this.selectedMetadata = this.selectedMetadata.filter((m) => {
      const op = m.operator;
      if (['exists', 'does not exist'].includes(op)) return true;
      return m.value !== null && m.value !== '';
    });
    if (!this.createdFrom) this.createdFrom = null;
    if (!this.createdTo) this.createdTo = null;

    this.payload = {
      searchTerm: this.searchTerm,
      searchTermType: this.selectedSearchTermType,
      folderName: this.folderName,
      createdFrom: this.createdFrom,
      createdTo: this.createdTo,
      creatorEmail: this.creatorEmail,
      tags: this.selectedTags.map((t) => t.id),
      metadata: this.selectedMetadata.map((m) => ({
        id: m.custom_metadata.id,
        operator: m.operator,
        value: m.value,
      })),
      page_size: 7,
      page: 1,
    };

    this.searchService.search(this.payload).subscribe({
      next: (data) => {
        this.allItems = [
          ...(data.directories || []),
          ...(data.documents || []),
        ].sort((a, b) => b.score - a.score);
        this.hasSearched = true;
        this.pageSize = data.page_size;
        this.currentPage = data.page;
        this.totalPages = data.total_pages;
        this.totalCount = data.total_count;
        if (data.total_count > 0) {
          setTimeout(() => this.scrollToBottom(), 0);
          this.updateDisplayedColumns();
        }
      },
      error: (err) => {
        console.error('Error loading directory:', err);
      },
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.payload.page = this.currentPage - 1;
      this.searchService.search(this.payload).subscribe({
        next: (data) => {
          this.allItems = [
            ...(data.directories || []),
            ...(data.documents || []),
          ];
          this.hasSearched = true;
          this.pageSize = data.page_size;
          this.currentPage = data.page;
          this.totalPages = data.total_pages;
          this.totalCount = data.total_count;
        },
        error: (err) => {
          console.error('Error loading directory:', err);
        },
      });
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.payload.page = this.currentPage + 1;
      this.searchService.search(this.payload).subscribe({
        next: (data) => {
          this.allItems = [
            ...(data.directories || []),
            ...(data.documents || []),
          ];
          this.hasSearched = true;
          this.pageSize = data.page_size;
          this.currentPage = data.page;
          this.totalPages = data.total_pages;
          this.totalCount = data.total_count;
        },
        error: (err) => {
          console.error('Error loading directory:', err);
        },
      });
    }
  }

  generatePDF() {
    this.selectedMetadata = this.selectedMetadata.filter((m) => {
      const op = m.operator;
      if (['exists', 'does not exist'].includes(op)) return true;
      return m.value !== null && m.value !== '';
    });
    if (!this.createdFrom) this.createdFrom = null;
    if (!this.createdTo) this.createdTo = null;

    this.payload.page_size = this.topN;

    this.searchService.generatePDF(this.payload).subscribe({
      next: (data) => {
        alert('uspeo');
      },
      error: (err) => {
        console.error('Error loading directory:', err);
      },
    });
  }

  reportTitle: string = '';
  topN: number | null = null;
  isModalOpen = false;

  closeModal() {
    this.isModalOpen = false;
  }

  generateReport() {
    this.generatePDF();
  }

  openModal() {
    this.isModalOpen = true;
  }
}
