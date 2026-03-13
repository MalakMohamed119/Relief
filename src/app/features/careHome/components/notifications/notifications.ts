import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';
import { ApplicationsService } from '../../../../core/services/applications.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface Application {
  id: string;
  jobRequestItemId: string;
  pswUserId?: string | null;
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
  imports: [CommonModule, FormsModule, Navbar, Footer, RouterModule],
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
  activeTab: 'pending' | 'accepted' | 'rejected' = 'pending';
  
  // Modal properties
  showRejectModal = false;
  rejectReason = '';
  selectedAppId: string | null = null;

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

  getPendingCount(): number {
    return this.applications.filter(app => app.statusCode === 1).length;
  }

  getPendingApplications(): Application[] {
    return this.applications.filter(app => app.statusCode === 1);
  }

  getAcceptedApplications(): Application[] {
    return this.applications.filter(app => app.statusCode === 2);
  }

  getRejectedApplications(): Application[] {
    return this.applications.filter(app => app.statusCode === 3);
  }

  acceptRequest(app: Application): void {
    console.log('Accept request app data:', app); // Debug log

    // Fallback for jobRequestItemId
    const jobRequestItemId = app.jobRequestItemId || app.id;
    if (!jobRequestItemId) {
      this.notificationService.show(`Cannot accept: missing jobRequestItemId (app.id: ${app.id || 'none'})`, 'error');
      return;
    }

    // Improved shiftId fallback
    const shiftId = app.shiftId ?? app.id ?? app.offerId ?? null;
    if (!shiftId) {
      this.notificationService.show('Cannot accept: missing shift details', 'error');
      return;
    }

    this.acceptingId = jobRequestItemId;
        this.applicationsService.acceptShift({
      shiftId,
      jobRequestItemId: jobRequestItemId
    }).subscribe({
      next: () => {
        this.notificationService.show('Application accepted successfully!', 'success');
        const idx = this.applications.findIndex(a => a.jobRequestItemId === jobRequestItemId || a.id === jobRequestItemId);
        if (idx !== -1) {
          this.applications[idx].statusCode = 2;
          this.applications[idx].status = 'Accepted';
        }
        this.acceptingId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Accept error:', err);
        this.notificationService.show(err?.error?.message || 'Failed to accept application', 'error');
        this.acceptingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  openRejectModal(app: Application): void {
    this.selectedAppId = app.jobRequestItemId;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectReason = '';
    this.selectedAppId = null;
  }

  confirmReject(): void {
    if (!this.selectedAppId) {
      this.notificationService.show('No application selected', 'error');
      return;
    }
    if (!this.rejectReason.trim()) {
      this.notificationService.show('Please enter a rejection reason', 'error');
      return;
    }

    this.rejectingId = this.selectedAppId;
    this.applicationsService.rejectShift({
      jobRequestItemId: this.selectedAppId
    }).subscribe({
      next: () => {
        this.notificationService.show('Application rejected', 'success');
        const idx = this.applications.findIndex(a => a.jobRequestItemId === this.selectedAppId);
        if (idx !== -1) {
          this.applications[idx].statusCode = 3;
          this.applications[idx].status = 'Rejected';
        }
        this.rejectingId = null;
        this.closeRejectModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Reject error:', err);
        this.notificationService.show(err?.error?.message || 'Failed to reject application', 'error');
        this.rejectingId = null;
        this.cdr.detectChanges();
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

  getPswName(app: Application): string {
    return app.pswName || 'Unknown PSW';
  }

  isProcessing(app: Application): boolean {
    return this.acceptingId === app.jobRequestItemId || this.rejectingId === app.jobRequestItemId;
  }
}

