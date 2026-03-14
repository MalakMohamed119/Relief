import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Endpoints that should NOT trigger logout on 401 (invalid credentials, not expired session)
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const auth = inject(AuthService);

  // Check if this is a public endpoint that shouldn't have auth header
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));

  // Only add token for protected endpoints
  if (isPlatformBrowser(platformId) && !isPublicEndpoint) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Only trigger logout for 401 errors on PROTECTED endpoints
      // For login/register, a 401 means invalid credentials, not expired session
      if (err?.status === 401 && isPlatformBrowser(platformId) && !isPublicEndpoint) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { expired: '1' } });
      }
      return throwError(() => err);
    })
  );
};
