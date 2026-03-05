import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const expectedRole = route.data['role'];
    const userRole = authService.getUserRole();

    if (authService.isAuthenticated() && userRole === expectedRole) {
      return true;
    }

    if (authService.isAuthenticated()) {
      alert('Access Denied: You do not have permission to view this page.');
      const redirectPath = userRole === 'CareHome' ? '/care-home' : '/psw';
      router.navigate([redirectPath]);
      return false;
    }
  }
  router.navigate(['/login']);
  return false;
};