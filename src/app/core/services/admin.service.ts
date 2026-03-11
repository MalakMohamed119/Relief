import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminRejectDto } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** GET /api/admin/verifications/pending */
  getPendingVerifications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/admin/verifications/pending`);
  }

  /** POST /api/admin/verifications/{pswId}/approve */
  approveVerification(pswId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/verifications/${pswId}/approve`, {});
  }

  /** POST /api/admin/verifications/{pswId}/reject */
  rejectVerification(pswId: string, payload: AdminRejectDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/verifications/${pswId}/reject`, payload);
  }

  /** GET /api/admin/applications/pending */
  getPendingApplications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/admin/applications/pending`);
  }

  /** POST /api/admin/applications/{requestId}/approve */
  approveApplication(requestId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/applications/${requestId}/approve`, {});
  }

  /** POST /api/admin/applications/{requestId}/reject */
  rejectApplication(requestId: string, payload: AdminRejectDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/applications/${requestId}/reject`, payload);
  }

  /** GET /api/admin/offers */
  getAdminOffers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/admin/offers`);
  }
}

