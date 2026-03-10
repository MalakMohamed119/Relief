import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompleteProfileService } from '../../../core/services/complete-profile.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-psw-complete-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  providers: [CompleteProfileService],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.scss']
})
export class PswCompleteProfile {
  private svc = inject(CompleteProfileService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  form: FormGroup;

  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      proofIdentityType: ['ID', Validators.required],
      workStatus: [true],
      proofIdentityFile: [null, Validators.required],
      pswCertificateFile: [null, Validators.required],
      cvFile: [null, Validators.required],
      immunizationRecordFile: [null, Validators.required],
      criminalRecordFile: [null, Validators.required],
      firstAidOrCPRFile: [null]
    });
  }

  onFileChange(field: string, ev: any) {
    const file = ev?.target?.files?.[0] ?? null;
    this.form.get(field)?.setValue(file);
  }

  skip() {
    // allow skipping but keep profile incomplete
    localStorage.setItem('pswProfileComplete', '0');
    this.notifications.show('You skipped completing profile. You will need to finish it to apply or assist.', 'info');
    this.router.navigate(['/psw']);
  }

  submit() {
    if (this.form.invalid) {
      this.notifications.show('Please fill the required fields.', 'error');
      return;
    }
    this.isSubmitting = true;

    const payload: any = {
      proofIdentityType: this.form.value.proofIdentityType,
      workStatus: this.form.value.workStatus,
      proofIdentityFile: this.form.value.proofIdentityFile,
      pswCertificateFile: this.form.value.pswCertificateFile,
      cvFile: this.form.value.cvFile,
      immunizationRecordFile: this.form.value.immunizationRecordFile,
      criminalRecordFile: this.form.value.criminalRecordFile,
      firstAidOrCPRFile: this.form.value.firstAidOrCPRFile
    };

    this.svc.completeProfile(payload).subscribe({
      next: () => {
        localStorage.setItem('pswProfileComplete', '1');
        this.notifications.show('Profile completed successfully.', 'success');
        this.router.navigate(['/psw']);
      },
      error: (err) => {
        console.error('Complete profile error', err);
        this.notifications.show(err?.error?.message ?? 'Failed to complete profile.', 'error', 5000);
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
