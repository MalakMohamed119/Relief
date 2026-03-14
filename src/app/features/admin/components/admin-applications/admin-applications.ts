import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface ApplicationResponse {
  success: boolean;
  count: number;
  data: ApplicationItem[];
}

interface ApplicationItem {
  jobRequestId: string;
  pswUserId?: string;
  offerId: string;
  pswName: string;
  pswEmail?: string;
  offerTitle: string;
  careHomeName: string;
  shiftDate?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  appliedAt: string;
}

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-applications.html',
  styleUrls: ['./admin-applications.scss'],
})
export class AdminApplications implements OnInit {
  private admin = inject(AdminService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  applications: ApplicationItem[] = [];
  isLoading = true;
  error: string | null = null;
  rejectReason = '';
  selectedRequestId: string | null = null;
  approvingId: string | null = null;
  rejectingId: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.admin.getPendingApplications().subscribe({
      next: (response: ApplicationResponse) => {
        console.log('Pending applications response:', response);
        this.applications = response?.data ?? [];
        console.log('Loaded pending applications:', this.applications);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading applications:', err);
        this.error = err?.error?.message || err?.message || 'Failed to load applications.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  approve(app: ApplicationItem): void {
    console.log('Approve clicked for app:', app.jobRequestId, app);
    if (!app.jobRequestId) {
      this.notifications.show('Missing jobRequestId.', 'error');
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(app.jobRequestId)) {
      console.error('Invalid UUID:', app.jobRequestId);
      this.notifications.show('Invalid jobRequestId format.', 'error');
      return;
    }

    this.approvingId = app.jobRequestId;

    this.admin.approveApplication(app.jobRequestId).subscribe({
      next: () => {
        this.notifications.show('Application approved & forwarded to CareHome for final review.', 'success');
        this.applications = this.applications.filter(a => a.jobRequestId !== app.jobRequestId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Approve error - Status:', err.status, 'Response:', err.error);
        this.notifications.show(err?.error?.message || `Approve failed (Status: ${err.status || 'unknown'})`, 'error');
      },
      complete: () => {
        this.approvingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  openReject(app: ApplicationItem): void {
    this.selectedRequestId = app.jobRequestId;
    this.rejectReason = '';
  }

  submitReject(): void {
    console.log('Reject submitted for ID:', this.selectedRequestId, 'Reason:', this.rejectReason);
    if (!this.selectedRequestId || !this.rejectReason.trim()) {
      this.notifications.show('Please enter a rejection reason.', 'error');
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.selectedRequestId!)) {
      console.error('Invalid UUID for reject:', this.selectedRequestId);
      this.notifications.show('Invalid jobRequestId format.', 'error');
      return;
    }

    this.rejectingId = this.selectedRequestId;

    this.admin.rejectApplication(this.selectedRequestId, { reason: this.rejectReason.trim() }).subscribe({
      next: () => {
        this.notifications.show('Application rejected successfully.', 'success');
        this.applications = this.applications.filter(a => a.jobRequestId !== this.selectedRequestId);
        this.selectedRequestId = null;
        this.rejectReason = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Reject error - Status:', err.status, 'Response:', err.error);
        this.notifications.show(err?.error?.message || `Reject failed (Status: ${err.status || 'unknown'})`, 'error');
      },
      complete: () => {
        this.rejectingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  cancelReject(): void {
    this.selectedRequestId = null;
    this.rejectReason = '';
  }

  getOfferTitle(app: ApplicationItem): string {
    return app.offerTitle || 'N/A';
  }

  getPswName(app: ApplicationItem): string {
    return app.pswName || 'N/A';
  }

  getCareHomeName(app: ApplicationItem): string {
    return app.careHomeName || 'N/A';
  }

  getShiftInfo(app: ApplicationItem): string {
    if (app.shiftDate) {
      const dateStr = new Date(app.shiftDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      if (app.startTime && app.endTime) {
        return `${dateStr} • ${app.startTime} - ${app.endTime}`;
      }
      return dateStr;
    }
    return 'N/A';
  }

  getSubmittedDate(app: ApplicationItem): string {
    if (app.appliedAt) {
      return new Date(app.appliedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'N/A';
  }

  isProcessing(app: ApplicationItem): boolean {
    return this.approvingId === app.jobRequestId || this.rejectingId === app.jobRequestId;
  }
}

