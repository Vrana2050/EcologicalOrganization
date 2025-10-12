import { ActivatedRoute } from '@angular/router';
import { UserGroupService } from '../../services/user-group.service';
import { GroupWithUsersDTO, Member } from './../../models/group.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'xp-group-view',
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.css'],
})
export class GroupViewComponent implements OnInit {
  public group: GroupWithUsersDTO;

  isModalOpen = false;
  isAdding = true;
  isRemoving = false;
  newMemberEmail: string;
  selectedMemberId: number | null = null;
  openModalId: number | null = null;
  error: string = '';
  filteredMembers: Member[] = [];

  constructor(
    private groupService: UserGroupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadGroup();
  }

  onSearch(value: string): void {
    const search = value.trim().toLowerCase();

    if (!search) {
      // ako je polje prazno, vrati sve
      this.filteredMembers = [...this.group.members];
      return;
    }

    this.filteredMembers = this.group.members.filter((item) => {
      const nameMatch = item.email.toLowerCase().includes(search);

      return nameMatch;
    });
  }

  loadGroup() {
    const groupId = Number(this.route.snapshot.paramMap.get('groupId'));
    this.groupService.getGroupById(groupId).subscribe({
      next: (res) => {
        this.group = res;
        this.filteredMembers = res.members;
      },
      error: (err) => alert(err),
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.isAdding = true;
  }

  toggleMenu(memberId: number) {
    if (this.openModalId) this.selectedMemberId = this.openModalId;
    this.openModalId = this.openModalId === memberId ? null : memberId;
  }

  openModalRemove() {
    this.selectedMemberId = this.openModalId;
    this.isRemoving = true;
    this.isAdding = false;
    this.isModalOpen = true;
    const meta = this.group.members.find((m) => m.id === this.selectedMemberId);

    this.newMemberEmail = meta!.email;
  }

  closeModal() {
    this.isModalOpen = false;
    if (this.isRemoving) {
      this.isRemoving = false;
      this.isAdding = true;
      this.selectedMemberId = null;
      this.newMemberEmail = '';
    }
    this.error = '';
  }

  AddMember(): void {
    if (!this.group || !this.newMemberEmail) return;

    this.groupService.addMember(this.group.id, this.newMemberEmail).subscribe({
      next: (res) => {
        this.loadGroup();
        this.newMemberEmail = ''; // reset inputa
        this.error = '';
      },
      error: (err) => (this.error = err.error.detail),
    });
  }

  RemoveMember(): void {
    if (!this.group || !this.selectedMemberId) return;

    this.groupService
      .removeMember(this.group.id, this.selectedMemberId)
      .subscribe({
        next: () => {
          this.loadGroup();
          this.selectedMemberId = null; // reset
          this.isModalOpen = false;
          this.isRemoving = false;
          this.newMemberEmail = '';
        },
        error: (err) => console.error('Greška pri uklanjanju člana:', err),
      });
  }
}
