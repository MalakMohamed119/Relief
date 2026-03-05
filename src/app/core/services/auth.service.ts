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
            this.tokenSubject.next(res.token);
          }
        })
      );
  }

  getUserRole(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('userRole') : null;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      this.tokenSubject.next(null);
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }
}