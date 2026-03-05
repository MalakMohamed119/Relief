import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Footer } from "../../../../shared/components/footer/footer";
import { PswNav } from "../../../../shared/components/psw-nav/psw-nav";

interface ServiceRequest {
  id: string;
  status: string;
  patientName: string;
  serviceType: string;
  description: string;
  requestDate: Date;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  title?: string;
  date?: Date;
  timeFrom?: string;
  timeTo?: string;
}

@Component({
  selector: 'app-psw-home',
  templateUrl: './psw-home.html',
  styleUrls: ['./psw-home.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    SlicePipe,
    Footer,
    PswNav
]
})
export class PswHome implements OnInit {
  selectedRequest: ServiceRequest | null = null;
  requests: ServiceRequest[] = [
    {
      id: '1',
      status: 'pending',
      patientName: 'John Smith',
      serviceType: 'Personal Care',
      description: 'Assistance with morning routine and medication',
      requestDate: new Date(),
      priority: 'high',
      title: 'Morning Care',
      assignedTo: '',
      timeFrom: '08:00',
      timeTo: '10:00'
    },
    {
      id: '2',
      status: 'assigned',
      patientName: 'Mary Johnson',
      serviceType: 'Meal Preparation',
      description: 'Help with lunch preparation and feeding',
      requestDate: new Date(),
      priority: 'medium',
      title: 'Lunch Assistance',
      assignedTo: 'You',
      timeFrom: '12:30',
      timeTo: '13:30'
    },
    {
      id: '3',
      status: 'pending',
      patientName: 'Robert Brown',
      serviceType: 'Mobility Assistance',
      description: 'Assistance with afternoon walk in the garden',
      requestDate: new Date(),
      priority: 'low',
      title: 'Afternoon Walk',
      assignedTo: '',
      timeFrom: '15:00',
      timeTo: '16:00'
    }
  ];
  isLoading: boolean = false;

  // Add methods used in the template
  assignToMe(request: ServiceRequest): void {
    // Implementation for assigning a request
  }

  viewRequest(request: ServiceRequest): void {
    this.selectedRequest = request;
  }

  closeDetails(): void {
    this.selectedRequest = null;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}