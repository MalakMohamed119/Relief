import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PswNav } from "../../../../shared/components/psw-nav/psw-nav";
import { Footer } from "../../../../shared/components/footer/footer";

interface HistoryItem {
  id: number;
  serviceType: string;
  clientName: string;
  phone: string;
  dateTime: string;
  completedDate: string;
  status: 'completed' | 'cancelled' | 'pending';
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, PswNav, Footer],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  historyItems: HistoryItem[] = [
    {
      id: 1,
      serviceType: 'Elderly Care',
      clientName: 'Ahmed Mohamed Mahmoud',
      phone: '+201234567890',
      dateTime: 'February 15, 2024 - 10:00 AM',
      completedDate: 'February 20, 2024',
      status: 'completed'
    },
    {
      id: 2,
      serviceType: 'Home Nursing',
      clientName: 'Sara Ahmed Ali',
      phone: '+201112345678',
      dateTime: 'February 10, 2024 - 2:00 PM',
      completedDate: 'February 12, 2024',
      status: 'completed'
    }
  ];
}
