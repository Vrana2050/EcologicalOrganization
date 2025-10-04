import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'document-preparation-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
   isProjectClicked: boolean = true;
   isNewsClicked: boolean = false;

  constructor(private router: Router) {}

  clickProject() {
    this.isProjectClicked = true;
    this.isNewsClicked = false;
    this.router.navigate(['document-preparation']);
  }

  clickNews() {
    this.isProjectClicked = false;
    this.isNewsClicked = true;
    this.router.navigate(['document-preparation/news']);
  }
}
