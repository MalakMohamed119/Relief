import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompleteProfileService } from '../../../../core/services/complete-profile.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-psw-complete-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.scss']
})
export class PswCompleteProfile {
  private svc = inject(CompleteProfileService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  form: FormGroup;
  isSubmitting = false;
  selectedFileNames: { [key: string]: string } = {};
  previews: { [key: string]: string } = {}; // للمعاينة الفورية

  constructor() {
    this.form = this.fb.group({
      proofIdentityType: ['ID', Validators.required],
      workStatus: [true],
      proofIdentityFile: [null],
      proofIdentityFileFront: [null],
      proofIdentityFileBack: [null],
      pswCertificateFile: [null, Validators.required],
      cvFile: [null, Validators.required],
      immunizationRecordFile: [null, Validators.required],
      criminalRecordFile: [null, Validators.required],
      firstAidOrCPRFile: [null]
    });
  }

  // Check if selected type needs two sides (ID or License)
  showTwoSides(): boolean {
    const type = this.form.get('proofIdentityType')?.value;
    return type === 'ID' || type === 'License';
  }

  // Called when identity type changes
  onIdentityTypeChange(): void {
    // Clear previous identity file fields when type changes
    this.form.patchValue({
      proofIdentityFile: null,
      proofIdentityFileFront: null,
      proofIdentityFileBack: null
    });
    this.selectedFileNames = {
      proofIdentityFile: '',
      proofIdentityFileFront: '',
      proofIdentityFileBack: ''
    };
    this.previews = {
      proofIdentityFile: '',
      proofIdentityFileFront: '',
      proofIdentityFileBack: ''
    };
    this.cdr.detectChanges();
  }

  onFileChange(field: string, ev: any) {
    const file = ev?.target?.files?.[0] ?? null;
    if (file) {
      this.form.patchValue({ [field]: file });
      this.selectedFileNames[field] = file.name;

      // توليد معاينة للصورة قبل الرفع
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previews[field] = reader.result as string;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
      this.cdr.detectChanges();
    }
  }

  submit() {
    this.form.markAllAsTouched();
    
    // Validate based on identity type
    const isTwoSides = this.showTwoSides();
    let missing: string[] = [];
    
    if (isTwoSides) {
      // For ID or License: need front and back
      if (!this.form.get('proofIdentityFileFront')?.value) missing.push('Proof identity (Front)');
      if (!this.form.get('proofIdentityFileBack')?.value) missing.push('Proof identity (Back)');
    } else {
      // For Passport: need single file
      if (!this.form.get('proofIdentityFile')?.value) missing.push('Proof identity');
    }
    
    if (this.form.get('pswCertificateFile')?.invalid || !this.form.get('pswCertificateFile')?.value) missing.push('PSW certificate');
    if (this.form.get('cvFile')?.invalid || !this.form.get('cvFile')?.value) missing.push('CV');
    if (this.form.get('immunizationRecordFile')?.invalid || !this.form.get('immunizationRecordFile')?.value) missing.push('Immunization record');
    if (this.form.get('criminalRecordFile')?.invalid || !this.form.get('criminalRecordFile')?.value) missing.push('Criminal record');
    
    if (missing.length > 0) {
      this.notifications.show(`Please upload: ${missing.join(', ')}`, 'error');
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare form data based on identity type
    const formValue = { ...this.form.value };
    if (isTwoSides) {
      // Combine front and back into proofIdentityFile for API
      formValue.proofIdentityFile = formValue.proofIdentityFileFront;
      formValue.proofIdentityFileBack = formValue.proofIdentityFileBack;
    }
    
    this.svc.completeProfile(formValue).subscribe({
      next: () => {
        this.notifications.show('Profile completed!', 'success');
        this.router.navigate(['/psw/offers']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.notifications.show(err?.error?.message || 'Upload failed', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  skip() { this.router.navigate(['/psw']); }
}
