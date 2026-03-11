import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddressDTO, UpdateProfileDto } from '../models/api.models';
import { AuthService } from './auth.service';

export interface ProfileDto extends UpdateProfileDto {
  email?: string | null;
  id?: string;
  role?: string | null;
  profileImage?: string | null;
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  /** GET /api/profile – current logged-in user's profile */
  getMyProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${this.apiUrl}/api/profile`).pipe(
      tap((profile) => {
        // Set verification status for PSW users
        if (profile?.verificationStatus) {
          this.authService.setVerificationStatus(profile.verificationStatus);
        }
      })
    );
  }

  /** PUT /api/profile – update current user's profile */
  updateMyProfile(payload: UpdateProfileDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/profile`, payload);
  }

  /** GET /api/profile/{id} – profile by ID (for viewing others) */
  getProfileById(id: string): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${this.apiUrl}/api/profile/${id}`);
  }

  /** POST /api/profile/upload-photo – upload profile photo */
  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/api/profile/upload-photo`, formData);
  }
}

