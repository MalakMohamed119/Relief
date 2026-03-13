import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastComponent } from '../toast/toast';

@Component({
  selector: 'app-psw-nav',
  standalone: true, 
  imports: [RouterLink, RouterLinkActive, ToastComponent], 
  templateUrl: './psw-nav.html',
  styleUrls: ['./psw-nav.scss'],
})
export class PswNav {
  userRole: string = 'psw';
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  get isProfileIncomplete(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    // Get verification status from auth service
    const verificationStatus = this.authService.getVerificationStatus();
    
    // Profile is considered complete if:
    // 1. User has verification status (approved or pending) - they submitted documents
    // 2. OR profile is marked complete in localStorage AND doesn't need completion
    const hasVerificationStatus = verificationStatus === 'approved' || verificationStatus === 'pending';
    if (hasVerificationStatus) {
      return false;
    }
    
    // Check localStorage flags
    const profileComplete = localStorage.getItem('pswProfileComplete') === '1';
    const needsCompletion = this.authService.getNeedsProfileCompletion();
    
    // Profile is incomplete if needs completion AND not profile complete
    return needsCompletion && !profileComplete;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
