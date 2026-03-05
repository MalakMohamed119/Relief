import { Component } from '@angular/core';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';

@Component({
  selector: 'app-notifications',
  imports: [Navbar,Footer],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
acceptRequest(requestId: number) {
    console.log('Accepted request:', requestId);
  }
  rejectRequest(requestId: number) {
    console.log('Rejected request:', requestId);
  }
  viewProfile(userId: number) {
    console.log('View profile:', userId);
  }
}
