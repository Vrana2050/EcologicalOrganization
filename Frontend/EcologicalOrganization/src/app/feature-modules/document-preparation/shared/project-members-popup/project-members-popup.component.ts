import { Component } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { IProjectHome } from '../../model/interface/project.model';
import { OnInit } from '@angular/core';

@Component({
  selector: 'project-members-popup',
  templateUrl: './project-members-popup.component.html',
  styleUrls: ['./project-members-popup.component.css']
})
export class ProjectMembersPopupComponent implements  OnInit {
  @Input() project: IProjectHome;
  @Output() close = new EventEmitter<void>();
  projectMembers: any[];
  constructor( ) { }

  ngOnInit(): void {
    // POZVATI AUTH SERVICE I DOBAVITI IMENA CLANOVA
   /* this.authService.getProjectMembers(this.project.id).subscribe(members => {
      this.project.members = members;
    });*/
    this.projectMembers = [
      { name: 'John Doe', role: 'Manager', sex: 'Male' },
      { name: 'Jane Smith', role: 'Leader', sex: 'Female' },
      { name: 'Alice Johnson', role: 'Member', sex: 'Female' }
    ]
  }

  closePopup(): void {
    this.close.emit();
  }
}
