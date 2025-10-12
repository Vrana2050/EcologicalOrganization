import { CommonModule } from '@angular/common';
import { Member } from './../../models/group.model';
import { Component, OnInit } from '@angular/core';
import { CreateMetadataDTO, MetadataDTO } from '../../models/metadata.model';
import { MetadataService } from '../../services/metadata.service';

@Component({
  selector: 'xp-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css'],
})
export class MetadataComponent implements OnInit {
  constructor(private metadataService: MetadataService) {}

  ngOnInit() {
    this.loadMetadata();
  }

  onSearch(value: string): void {
    const search = value.trim().toLowerCase();

    if (!search) {
      // ako je polje prazno, vrati sve
      this.filteredMetadata = [...this.metadataList];
      return;
    }

    this.filteredMetadata = this.metadataList.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(search);

      const descMatch = item.description?.toLowerCase().includes(search);

      const typeMatch = item.metadata_type.toLowerCase().includes(search);

      return nameMatch || descMatch || typeMatch;
    });
  }

  loadMetadata() {
    this.metadataService.getAll().subscribe({
      next: (data) => {
        this.metadataList = data;
        this.filteredMetadata = data;
      },
      error: (err) => console.error('Error fetching metadata', err),
    });
  }

  metadataList: MetadataDTO[] = [];
  filteredMetadata: MetadataDTO[] = [];

  isModalOpen = false;
  isCreating = true;
  isDeleting = false;
  isUpdating = false;
  newMetadataName: string;
  newMetadataDescription: string;
  newMetadataType: string = 'String';
  selectedMetadataId: number | null = null;
  openModalId: number | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.isUpdating) {
      this.isUpdating = false;
      this.isCreating = true;
      this.selectedMetadataId = null;
      this.newMetadataName = '';
      this.newMetadataDescription = '';
      this.newMetadataType = 'String';
    }
    if (this.isDeleting) {
      this.isDeleting = false;
      this.isCreating = true;
      this.newMetadataName = '';
      this.selectedMetadataId = null;
    }
  }

  openModalUpdate() {
    this.selectedMetadataId = this.openModalId;
    this.isUpdating = true;
    this.isCreating = false;
    this.isModalOpen = true;
    const meta = this.metadataList.find(
      (m) => m.id === this.selectedMetadataId
    );

    if (meta) {
      this.newMetadataName = meta.name;
      this.newMetadataDescription = meta.description ?? '';
      this.newMetadataType = meta.metadata_type;
    }
  }

  openModalDelete() {
    this.selectedMetadataId = this.openModalId;
    this.isDeleting = true;
    this.isCreating = false;
    this.isModalOpen = true;
    const meta = this.metadataList.find(
      (m) => m.id === this.selectedMetadataId
    );

    this.newMetadataName = meta!.name;
  }

  createMetadata() {
    const newMeta: CreateMetadataDTO = {
      name: this.newMetadataName,
      metadata_type: this.newMetadataType,
      description: this.newMetadataDescription,
    };

    this.metadataService.create(newMeta).subscribe({
      next: (createdMeta) => {
        this.loadMetadata();
        this.closeModal();
        this.newMetadataName = '';
        this.newMetadataDescription = '';
        this.newMetadataType = 'String';
      },
      error: (err) => console.error('Error creating metadata', err),
    });
  }

  toggleMenu(metadataId: number) {
    if (this.openModalId) this.selectedMetadataId = this.openModalId;
    this.openModalId = this.openModalId === metadataId ? null : metadataId;
  }

  updateMetadata() {
    const updatedMetadata: MetadataDTO = {
      id: this.selectedMetadataId!,
      name: this.newMetadataName,
      metadata_type: this.newMetadataType,
      description: this.newMetadataDescription,
    };

    this.metadataService.update(updatedMetadata).subscribe({
      next: (res) => {
        // osveži listu ili izmeni lokalno
        this.loadMetadata();
        this.closeModal();
        this.newMetadataName = '';
        this.newMetadataDescription = '';
        this.newMetadataType = 'String';
        this.selectedMetadataId = null;
      },
      error: (err) => console.error('Update failed', err),
    });
  }

  deleteMetadata() {
    this.metadataService.delete(this.selectedMetadataId!).subscribe({
      next: () => {
        this.loadMetadata();
        this.closeModal();
        this.selectedMetadataId = null;
      },
      error: (err) => console.error('Delete failed', err),
    });
  }
}
