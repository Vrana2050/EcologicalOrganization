import { Component } from '@angular/core';
import { TagService } from '../../services/tag.service';
import { CreateTagDTO, TagDTO } from '../../models/tag.model';

@Component({
  selector: 'xp-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
})
export class TagsComponent {
  constructor(private tagService: TagService) {}

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.tagService.getAll().subscribe({
      next: (data) => {
        this.tagList = data;
        this.filteredTags = data;
      },
      error: (err) => console.error('Error fetching metadata', err),
    });
  }

  onSearch(value: string): void {
    const search = value.trim().toLowerCase();

    if (!search) {
      // ako je polje prazno, vrati sve
      this.filteredTags = [...this.tagList];
      return;
    }

    this.filteredTags = this.tagList.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(search);

      const descMatch = item.description?.toLowerCase().includes(search);

      return nameMatch || descMatch;
    });
  }

  tagList: TagDTO[] = [];
  filteredTags: TagDTO[] = [];
  isModalOpen = false;
  isCreating = true;
  isDeleting = false;
  isUpdating = false;
  newTagName: string;
  newTagDescription: string;
  selectedTagId: number | null = null;
  openModalId: number | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.isUpdating) {
      this.isUpdating = false;
      this.isCreating = true;
      this.selectedTagId = null;
      this.newTagName = '';
      this.newTagDescription = '';
    }
    if (this.isDeleting) {
      this.isDeleting = false;
      this.isCreating = true;
      this.newTagName = '';
      this.selectedTagId = null;
    }
  }

  openModalUpdate() {
    this.selectedTagId = this.openModalId;
    this.isUpdating = true;
    this.isCreating = false;
    this.isModalOpen = true;
    const meta = this.tagList.find((m) => m.id === this.selectedTagId);

    if (meta) {
      this.newTagName = meta.name;
      this.newTagDescription = meta.description ?? '';
    }
  }

  openModalDelete() {
    this.selectedTagId = this.openModalId;
    this.isDeleting = true;
    this.isCreating = false;
    this.isModalOpen = true;
    const meta = this.tagList.find((m) => m.id === this.selectedTagId);

    this.newTagName = meta!.name;
  }

  createTag() {
    const newTag: CreateTagDTO = {
      name: this.newTagName,
      description: this.newTagDescription,
    };

    this.tagService.create(newTag).subscribe({
      next: (createdMeta) => {
        this.loadTags();
        this.closeModal();
        this.newTagName = '';
        this.newTagDescription = '';
      },
      error: (err) => console.error('Error creating metadata', err),
    });
  }

  toggleMenu(metadataId: number) {
    if (this.openModalId) this.selectedTagId = this.openModalId;
    this.openModalId = this.openModalId === metadataId ? null : metadataId;
  }

  updateTag() {
    const updatedTag: TagDTO = {
      id: this.selectedTagId!,
      name: this.newTagName,
      description: this.newTagDescription,
    };

    this.tagService.update(updatedTag).subscribe({
      next: (res) => {
        // osveži listu ili izmeni lokalno
        this.loadTags();
        this.closeModal();
        this.newTagName = '';
        this.newTagDescription = '';
        this.selectedTagId = null;
      },
      error: (err) => console.error('Update failed', err),
    });
  }

  deleteTag() {
    this.tagService.delete(this.selectedTagId!).subscribe({
      next: () => {
        this.loadTags();
        this.closeModal();
        this.selectedTagId = null;
      },
      error: (err) => console.error('Delete failed', err),
    });
  }
}
