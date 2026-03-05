import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CancelApplicationDto } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class PswApplicationsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPswApplications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/psw/applications`);
  }

  cancelApplication(payload: CancelApplicationDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/psw/applications/cancel`, payload);
  }
}

