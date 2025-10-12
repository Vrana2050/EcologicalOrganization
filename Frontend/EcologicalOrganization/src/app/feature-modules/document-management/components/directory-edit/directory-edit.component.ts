import {
  CustomMetadataValue,
  PathItem,
  Tag,
  UpdateDocumentDTO,
} from './../../models/document.model';
import { PagedResults } from './../../../../shared/model/paged-results.model';
import {
  DirectoryOpenResponse,
  DirectoryReadDTO,
  UpdateDirectoryDTO,
} from '../../models/directory.model';
import { Component, OnInit } from '@angular/core';
import { TagDTO } from '../../models/tag.model';
import { MetadataDTO } from '../../models/metadata.model';
import { TagService } from '../../services/tag.service';
import { MetadataService } from '../../services/metadata.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectoryService } from '../../services/directory.service';

@Component({
  selector: 'xp-directory-edit',
  templateUrl: './directory-edit.component.html',
  styleUrls: ['./directory-edit.component.css'],
})
export class DirectoryEditComponent implements OnInit {
  path: PathItem[] = [];
  directory: DirectoryReadDTO;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tagService: TagService,
    private metadataService: MetadataService,
    private directoryService: DirectoryService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const directoryId = Number(params.get('directoryId'));
      if (directoryId) {
        this.loadDirectory(directoryId);
        this.loadTagsAndMeta();
      }
    });
  }

  loadDirectory(directoryId: number) {
    this.directoryService.getDirectoryForUpdate(directoryId).subscribe({
      next: (data) => {
        this.directory = data;
        console.log(data);
        this.path = data.path;
        this.updateTags = data.tags;
        this.updateName = data.directory_name;
        this.updateMetadata = data.custom_metadata_values;
      },
      error: (err) => console.error('Error fetching metadata', err),
    });
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

  allTags: TagDTO[] = [];
  allMetadata: MetadataDTO[] = [];
  updateTags: TagDTO[] = [];
  updateName: string = '';
  updateMetadata: CustomMetadataValue[] = [];

  filteredTags: TagDTO[] = [];
  tagInput: string = '';
  addTagFromInput(event: Event) {
    event.preventDefault();
    const value = this.tagInput.trim().toLowerCase();
    if (!value) return;

    // da li već postoji u allTags
    const found = this.allTags.find((tag) => tag.name.toLowerCase() === value);
    if (found && !this.updateTags.some((t) => t.name === found.name)) {
      this.updateTags.push(found);

      this.tagInput = '';
      this.filteredTags = [];
    } else if (
      !found &&
      !this.updateTags.some((t) => t.name.toLowerCase() === value)
    ) {
      // ako ne postoji u allTags, možeš ili da napraviš novi tag objekat
      this.updateTags.push({ id: 0, name: value, description: '' } as TagDTO);

      this.tagInput = '';
      this.filteredTags = [];
    }
  }

  removeTag(index: number) {
    this.updateTags.splice(index, 1);
  }

  handleBackspace(event: any) {
    if (!this.tagInput && this.updateTags.length > 0) {
      this.updateTags.pop();
    }
  }

  filterTags() {
    const search = this.tagInput.toLowerCase();
    this.filteredTags = this.allTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(search) &&
        !this.updateTags.some((t) => t.id === tag.id)
    );
  }

  selectSuggestion(suggestion: TagDTO) {
    if (!this.updateTags.some((t) => t.id === suggestion.id)) {
      this.updateTags.push(suggestion);
    }
    this.tagInput = '';
    this.filteredTags = [];
  }

  selectedMetadataId: number | null = null;

  addMetadata() {
    if (this.selectedMetadataId) {
      const metaToAdd = this.allMetadata.find(
        (m) => m.id === this.selectedMetadataId
      );
      if (metaToAdd) {
        let defaultValue: any = null;

        switch (metaToAdd.metadata_type) {
          case 'String':
            defaultValue = '';
            break;
          case 'Boolean':
            defaultValue = false;
            break;
          default:
            defaultValue = null;
        }

        this.updateMetadata.push({
          id: 0, // novi, backend će dodeliti
          value: defaultValue,
          is_missing_value: false,
          custom_metadata: {
            id: metaToAdd.id,
            name: metaToAdd.name,
            metadata_type: metaToAdd.metadata_type,
            description: metaToAdd.description ?? null,
          },
        });
      }
      this.selectedMetadataId = null;
    }
  }

  removeMetadata(index: number) {
    this.updateMetadata.splice(index, 1);
  }

  isMetadataDisabled(metaId: number): boolean {
    return (
      this.updateMetadata?.some((m) => m.custom_metadata.id === metaId) ?? false
    );
  }

  onBooleanChange(event: Event, meta: CustomMetadataValue) {
    const input = event.target as HTMLInputElement;
    meta.value = input.checked ? 'true' : 'false';
  }

  cancelUpdate() {
    this.updateError = '';
    this.router.navigate([
      '/document-management/directory',
      this.directory.directory_id,
    ]);
  }

  updatedDirectory: UpdateDirectoryDTO;
  updateError: string = '';
  saveUpdate() {
    this.updatedDirectory = {
      directory_id: this.directory.directory_id,
      directory_name: this.updateName,
      tags: this.updateTags.map((tag) => tag.name),
      metadata: this.updateMetadata.map((meta) => ({
        metadata_id: meta.custom_metadata.id,
        value: meta.value,
      })),
    };
    console.log(this.updatedDirectory);
    this.directoryService.updateDirectory(this.updatedDirectory).subscribe({
      next: (response) => {
        console.log('✅ Dokument uspešno ažuriran:', response);
        // REDIRECT
        if (this.directory.parent_directory_id) {
          this.router.navigate([
            '/document-management/directory',
            this.directory.parent_directory_id,
          ]);
        } else {
          this.router.navigate([
            '/document-management/directory',
            this.directory.directory_id,
          ]);
        }

        this.updateError = '';
      },
      error: (error) => {
        this.updateError = error.error.detail;
        console.log(error);
      },
    });
  }
}
