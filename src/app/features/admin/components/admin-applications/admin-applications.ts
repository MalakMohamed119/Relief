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
  applicationId: string;
  pswUserId: string;
  offerId: string;
  pswName: string;
  pswEmail: string;
  offerTitle: string;
  careHomeName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
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
    if (!app.applicationId) {
      this.notifications.show('Missing application ID.', 'error');
      return;
    }

    this.admin.approveApplication(app.applicationId).subscribe({
      next: () => {
        this.notifications.show('Application approved successfully.', 'success');
        this.applications = this.applications.filter(a => a.applicationId !== app.applicationId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notifications.show(err?.error?.message || 'Failed to approve application.', 'error');
      },
    });
  }

  openReject(app: ApplicationItem): void {
    this.selectedRequestId = app.applicationId;
    this.rejectReason = '';
  }

  submitReject(): void {
    if (!this.selectedRequestId || !this.rejectReason.trim()) {
      this.notifications.show('Please enter a rejection reason.', 'error');
      return;
    }

    this.admin.rejectApplication(this.selectedRequestId, { reason: this.rejectReason.trim() }).subscribe({
      next: () => {
        this.notifications.show('Application rejected.', 'success');
        this.applications = this.applications.filter(a => a.applicationId !== this.selectedRequestId);
        this.selectedRequestId = null;
        this.rejectReason = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notifications.show(err?.error?.message || 'Failed to reject application.', 'error');
      },
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
}

