import { Component } from '@angular/core';
import { UserGroupService } from '../../services/user-group.service';
import { CreateGroupDTO, GroupDTO } from '../../models/group.model';

@Component({
  selector: 'xp-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.css'],
})
export class UserGroupsComponent {
  constructor(private groupService: UserGroupService) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.groupService.getAll().subscribe({
      next: (data) => {
        this.groupList = data;
        this.filteredGroups = data;
      },
      error: (err) => console.error('Error fetching metadata', err),
    });
  }

  onSearch(value: string): void {
    const search = value.trim().toLowerCase();

    if (!search) {
      // ako je polje prazno, vrati sve
      this.filteredGroups = [...this.groupList];
      return;
    }

    this.filteredGroups = this.groupList.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(search);

      const descMatch = item.description?.toLowerCase().includes(search);

      const memberCountMatch =
        item.members.length.toString().substring(0, value.length) === value;

      return nameMatch || descMatch || memberCountMatch;
    });
  }

  filteredGroups: GroupDTO[] = [];
  groupList: GroupDTO[] = [];

  isModalOpen = false;
  isCreating = true;
  isDeleting = false;
  isUpdating = false;
  newGroupName: string;
  newGroupDescription: string;
  selectedGroupId: number | null = null;
  openModalId: number | null = null;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.isUpdating) {
      this.isUpdating = false;
      this.isCreating = true;
      this.selectedGroupId = null;
      this.newGroupName = '';
      this.newGroupDescription = '';
    }
    if (this.isDeleting) {
      this.isDeleting = false;
      this.isCreating = true;
      this.newGroupName = '';
      this.selectedGroupId = null;
    }
  }

  openModalUpdate() {
    this.selectedGroupId = this.openModalId;
    this.isUpdating = true;
    this.isCreating = false;
    this.isModalOpen = true;
    const meta = this.groupList.find((m) => m.id === this.selectedGroupId);

    if (meta) {
      this.newGroupName = meta.name;
      this.newGroupDescription = meta.description ?? '';
    }
  }

  openModalDelete() {
    this.selectedGroupId = this.openModalId;
    this.isDeleting = true;
    this.isCreating = false;
    this.isModalOpen = true;
    const meta = this.groupList.find((m) => m.id === this.selectedGroupId);

    this.newGroupName = meta!.name;
  }

  createGroup() {
    const newGroup: CreateGroupDTO = {
      name: this.newGroupName,
      description: this.newGroupDescription,
    };

    this.groupService.create(newGroup).subscribe({
      next: (createdMeta) => {
        this.loadGroups();
        this.closeModal();
        this.newGroupName = '';
        this.newGroupDescription = '';
      },
      error: (err) => console.error('Error creating metadata', err),
    });
  }

  toggleMenu(groupId: number) {
    if (this.openModalId) this.selectedGroupId = this.openModalId;
    this.openModalId = this.openModalId === groupId ? null : groupId;
  }

  updateGroup() {
    // const updatedGroup: GroupDTO = {
    //   id: this.selectedGroupId!,
    //   name: this.newGroupName,
    //   description: this.newGroupDescription,
    // };
    // this.groupService.update(updatedGroup).subscribe({
    //   next: (res) => {
    //     // osveži listu ili izmeni lokalno
    //     this.loadGroups();
    //     this.closeModal();
    //     this.newGroupName = '';
    //     this.newGroupDescription = '';
    //     this.selectedGroupId = null;
    //   },
    //   error: (err) => console.error('Update failed', err),
    // });
  }

  deleteGroup() {
    this.groupService.deleteGroup(this.selectedGroupId!).subscribe({
      next: () => {
        this.loadGroups();
        this.closeModal();
        this.selectedGroupId = null;
      },
      error: (err) => console.error('Delete failed', err),
    });
  }
}
