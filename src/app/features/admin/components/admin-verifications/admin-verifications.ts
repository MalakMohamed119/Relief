import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface VerificationResponse {
  success: boolean;
  count: number;
  data: VerificationItem[];
}

interface VerificationItem {
  pswUserId: string;
  fullName: string;
  email: string;
  proofIdentityType: string;
  verificationStatus: string;
  rejectionReason: string | null;
  profileCompletedAt: string;
  proofIdentityFileId: string;
  pswCertificateFileId: string;
  cvFileId: string;
  immunizationRecordFileId: string;
  criminalRecordFileId: string;
  firstAidOrCPRFileId: string;
}

@Component({
  selector: 'app-admin-verifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-verifications.html',
  styleUrls: ['./admin-verifications.scss'],
})
export class AdminVerifications implements OnInit {
  private admin = inject(AdminService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  verifications: VerificationItem[] = [];
  isLoading = true;
  error: string | null = null;
  rejectReason = '';
  selectedPswId: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.admin.getPendingVerifications().subscribe({
      next: (response: VerificationResponse) => {
        console.log('Pending verifications response:', response);
        this.verifications = response?.data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading verifications:', err);
        this.error = err?.error?.message || err?.message || 'Failed to load verifications.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  approve(pswId: string): void {
    if (!pswId) {
      this.notifications.show('Invalid PSW ID.', 'error');
      return;
    }

    this.admin.approveVerification(pswId).subscribe({
      next: () => {
        this.notifications.show('Verification approved successfully.', 'success');
        this.verifications = this.verifications.filter(v => v.pswUserId !== pswId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notifications.show(err?.error?.message || 'Failed to approve verification.', 'error');
      },
    });
  }

  openReject(pswId: string): void {
    this.selectedPswId = pswId;
    this.rejectReason = '';
  }

  submitReject(): void {
    if (!this.selectedPswId || !this.rejectReason.trim()) {
      this.notifications.show('Please enter a rejection reason.', 'error');
      return;
    }

    this.admin.rejectVerification(this.selectedPswId, { reason: this.rejectReason.trim() }).subscribe({
      next: () => {
        this.notifications.show('Verification rejected.', 'success');
        this.verifications = this.verifications.filter(v => v.pswUserId !== this.selectedPswId);
        this.selectedPswId = null;
        this.rejectReason = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notifications.show(err?.error?.message || 'Failed to reject verification.', 'error');
      },
    });
  }

  cancelReject(): void {
    this.selectedPswId = null;
    this.rejectReason = '';
  }

  getDisplayName(v: VerificationItem): string {
    return v.fullName || 'N/A';
  }

  getEmail(v: VerificationItem): string {
    return v.email || 'N/A';
  }

  getIdentityType(v: VerificationItem): string {
    return v.proofIdentityType || 'N/A';
  }

  getSubmittedDate(v: VerificationItem): string {
    if (v.profileCompletedAt) {
      return new Date(v.profileCompletedAt).toLocaleDateString('en-US', {
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

