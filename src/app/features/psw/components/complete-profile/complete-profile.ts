import { Component, ChangeDetectorRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastComponent } from '../../../../shared/components/toast/toast';
import { CompleteProfileService } from '../../../../core/services/complete-profile.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-psw-complete-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './complete-profile.html',
  styleUrls: ['./complete-profile.scss']
})
export class PswCompleteProfile implements OnInit {
  private svc = inject(CompleteProfileService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

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

  ngOnInit(): void {
    // التحقق من أن المستخدم لم يكمل الملف الشخصي بالفعل
    if (isPlatformBrowser(this.platformId as Object)) {
      const verificationStatus = this.authService.getVerificationStatus();
      const profileComplete = localStorage.getItem('pswProfileComplete');
      
      // إذا كان لديه حالة تحقق (pending أو approved) أو تم وضع علامة الاكتمال
      // لا نريد التوجيه إذا كان status = rejected لأن المستخدم يحتاج لإعادة إدخال البيانات
      if ((verificationStatus === 'pending' || verificationStatus === 'approved' || profileComplete === '1') && verificationStatus !== 'rejected') {
        // توجيه المستخدم إلى الصفحة الرئيسية لـ PSW
        this.router.navigate(['/psw']);
        return;
      }
    }
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
        // Profile completed successfully
        // Clear the needs profile completion flag and mark as complete
        this.authService.clearNeedsProfileCompletion();
        this.authService.setProfileComplete();
        
        this.notifications.show('Profile completed successfully!', 'success');
        this.router.navigate(['/psw']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.notifications.show(err?.error?.message || 'Upload failed', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  skip() { 
    // After skip, clear the needs profile completion flag and go to PSW dashboard
    this.authService.clearNeedsProfileCompletion();
    this.router.navigate(['/psw']); 
  }
}
