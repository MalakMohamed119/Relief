import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  sessionExpired = false;
  loginError = '';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.sessionExpired = this.route.snapshot.queryParamMap.get('expired') === '1';
    // Clear any previous login errors
    this.loginError = '';
  }

  // Alias for onLogin to match template (ngSubmit)="onSubmit()"
  onSubmit() {
    this.onLogin();
  }

  onLogin() {
    // Clear previous error
    this.loginError = '';

    if (this.loginForm.invalid) {
      // mark controls as touched so per-field errors and invalid styles show
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        const role = (res.role ?? '').toLowerCase();
        
        // Fetch profile to get verification status for PSW users
        if (role === 'psw' || role === 'caregiver') {
          this.profileService.getMyProfile().subscribe({
            next: () => {
              // Profile fetched and verification status stored
              this.navigateByRole(role);
            },
            error: () => {
              // Even if profile fetch fails, continue navigation
              this.navigateByRole(role);
            }
          });
        } else {
          this.navigateByRole(role);
        }
      },
      error: err => {
        this.isLoading = false;
        // Handle different error scenarios
        if (err.status === 401) {
          this.loginError = 'Invalid email or password. Please try again.';
        } else if (err.status === 0) {
          this.loginError = 'Unable to connect to server. Please check your internet connection.';
        } else if (err.error?.message) {
          this.loginError = err.error.message;
        } else {
          this.loginError = 'An error occurred during login. Please try again.';
        }
        console.error('Login error:', err);
      }
    });
  }

  private navigateByRole(role: string): void {
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'carehome' || role === 'individual') {
      this.router.navigate(['/care-home']);
    } else {
      // PSW users always go to PSW dashboard after login
      // Never redirect to complete profile after login
      this.router.navigate(['/psw']);
    }
  }

  // Helper method to check for form control errors
  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.hasError(errorName) && (control.dirty || control.touched) : false;
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}