import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';
import { ApplicationsService } from '../../../../core/services/applications.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface Application {
  id: string;
  jobRequestItemId: string;
  offerId: string;
  shiftId?: string | null;
  offerTitle: string;
  pswName: string;
  pswPhone: string;
  serviceType: string;
  address: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number | null;
  statusCode: number;
  status: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  applications: Application[] = [];
  loading = true;
  error: string | null = null;
  acceptingId: string | null = null;
  rejectingId: string | null = null;
  currentOfferId: string | null = null;

  constructor(
    private applicationsService: ApplicationsService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentOfferId = params['offerId'] || null;
      this.loadApplications();
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.error = null;

    const appsObservable = this.currentOfferId
      ? this.applicationsService.getApplicationsByOfferId(this.currentOfferId)
      : this.applicationsService.getAllApplications();
    
    appsObservable.subscribe({
      next: (apps) => {
        this.applications = Array.isArray(apps) ? apps : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.error = err?.error?.message || 'Failed to load applications.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  acceptRequest(app: Application): void {
    if (!app.jobRequestItemId) {
      this.notificationService.show('Missing application details', 'error');
      return;
    }
    const shiftId = app.shiftId ?? app.offerId;
    if (!shiftId) {
      this.notificationService.show('Missing shift ID for accept', 'error');
      return;
    }

    this.acceptingId = app.jobRequestItemId;
    this.applicationsService.acceptShift({
      shiftId,
      jobRequestItemId: app.jobRequestItemId
    }).subscribe({
      next: () => {
        this.notificationService.show('Application accepted successfully!', 'success');
        const idx = this.applications.findIndex(a => a.jobRequestItemId === app.jobRequestItemId);
        if (idx !== -1) {
          this.applications[idx].statusCode = 2;
          this.applications[idx].status = 'Accepted';
        }
        this.acceptingId = null;
      },
      error: (err) => {
        console.error('Accept error:', err);
        this.notificationService.show(err?.error?.message || 'Failed to accept application', 'error');
        this.acceptingId = null;
      }
    });
  }

  rejectRequest(app: Application): void {
    if (!app.jobRequestItemId) {
      this.notificationService.show('Missing application details', 'error');
      return;
    }

    this.rejectingId = app.jobRequestItemId;
    this.applicationsService.rejectShift({
      jobRequestItemId: app.jobRequestItemId
    }).subscribe({
      next: () => {
        this.notificationService.show('Application rejected', 'success');
        const idx = this.applications.findIndex(a => a.jobRequestItemId === app.jobRequestItemId);
        if (idx !== -1) {
          this.applications[idx].statusCode = 3;
          this.applications[idx].status = 'Rejected';
        }
        this.rejectingId = null;
      },
      error: (err) => {
        console.error('Reject error:', err);
        this.notificationService.show(err?.error?.message || 'Failed to reject application', 'error');
        this.rejectingId = null;
      }
    });
  }

  viewProfile(userId: string): void {
    console.log('View profile:', userId);
    this.notificationService.show('Profile viewing coming soon!', 'info');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const time = String(timeStr).substring(0, 5);
    return time;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  isProcessing(app: Application): boolean {
    return this.acceptingId === app.jobRequestItemId || this.rejectingId === app.jobRequestItemId;
  }
}

