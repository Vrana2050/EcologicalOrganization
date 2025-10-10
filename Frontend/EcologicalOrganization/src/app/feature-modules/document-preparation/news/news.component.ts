import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NewsService } from '../service/news.service';
import { INotification } from '../model/interface/notification.model';
import { Router } from '@angular/router';

@Component({
  selector: 'document-preparation-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class DocumentPreparationNewsComponent implements OnInit {
  notifications: INotification[] = [];
  constructor(private router: Router, private newsService: NewsService) { }

  ngOnInit(): void {
    this.newsService.getAllNotificationsForUser().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        console.log('Fetched notifications:', this.notifications);
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }
  openDocument(notification: INotification): void {
    this.router.navigate(['/document-preparation/document', notification.document.id]);
  }

}
