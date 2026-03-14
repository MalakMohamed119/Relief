import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponseDTO, LoginDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) this.tokenSubject.next(token);
    }
  }

  register(data: any, type: string): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/api/auth/register/${type}`, data);
  }

  login(credentials: LoginDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/api/auth/login`, credentials)
      .pipe(
        tap(res => {
          if (res.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
            if (res.role) {
              localStorage.setItem('userRole', res.role);
            }
            if (res.userId) {
              localStorage.setItem('userId', res.userId);
            }
            this.tokenSubject.next(res.token);
          }
        })
      );
  }

  getUserRole(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('userRole') : null;
  }

  getUserId(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('userId') : null;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  updateToken(token: string): void {
    this.tokenSubject.next(token);
  }

  logout(): void {
    // Call backend logout endpoint (fire-and-forget)
    this.http.post<void>(`${this.apiUrl}/api/auth/logout`, {}).subscribe({
      next: () => {},
      error: () => {},
    });

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      // Clear PSW profile-related data
      localStorage.removeItem('pswProfileComplete');
      localStorage.removeItem('pswNeedsProfileCompletion');
      localStorage.removeItem('pswVerificationStatus');
      this.tokenSubject.next(null);
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  setProfileComplete(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pswProfileComplete', '1');
    }
  }

  setNeedsProfileCompletion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pswNeedsProfileCompletion', '1');
    }
  }

  getNeedsProfileCompletion(): boolean {
    return isPlatformBrowser(this.platformId) 
      ? localStorage.getItem('pswNeedsProfileCompletion') === '1'
      : false;
  }

  clearNeedsProfileCompletion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('pswNeedsProfileCompletion');
    }
  }

  setVerificationStatus(status: 'pending' | 'approved' | 'rejected'): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pswVerificationStatus', status);
    }
  }

  getVerificationStatus(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('pswVerificationStatus') : null;
  }
}
