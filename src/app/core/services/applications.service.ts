import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AcceptShiftDto,
  RejectShiftDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getApplicationsByOfferId(offerId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/carehome/applications/${offerId}`);
  }

  acceptShift(payload: AcceptShiftDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/carehome/applications/accept`, payload);
  }

  rejectShift(payload: RejectShiftDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/carehome/applications/reject`, payload);
  }
}

