import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  /** GET /api/applications – all applications for logged-in care home */
  getAllApplications(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/api/applications`).pipe(
      map((res) => this.normalizeApplicationsResponse(res))
    );
  }

  /** Normalize API response to array */
  private normalizeApplicationsResponse(res: any): any[] {
    if (res == null) return [];
    if (Array.isArray(res)) return this.normalizeApplicationItems(res);
    const list =
      res.data ??
      res.items ??
      res.value ??
      res.results ??
      res.content ??
      res.applications ??
      res.list;
    if (Array.isArray(list)) return this.normalizeApplicationItems(list);
    return [];
  }

  /** Pick first non-null from possible keys (supports nested obj.key.subKey) */
  private pick(item: any, ...keys: string[]): any {
    for (const k of keys) {
      const parts = k.split('.');
      let v: any = item;
      for (const p of parts) {
        v = v?.[p];
        if (v == null) break;
      }
      if (v != null && v !== '') return v;
    }
    return null;
  }

  /** Normalize each application item – supports multiple API shapes */
  private normalizeApplicationItems(list: any[]): any[] {
    return list.map((item) => {
      const shifts = item.shifts ?? item.Shifts ?? item.shift ?? [];
      const firstShift = Array.isArray(shifts) && shifts[0] ? shifts[0] : (typeof item.shift === 'object' && item.shift != null ? item.shift : null);
      const offer = item.offer ?? item.Offer ?? item.jobRequest ?? {};
      const statusCode = item.statusCode ?? item.StatusCode ?? item.status ?? item.Status ?? 1;
      const shiftId = item.shiftId ?? item.ShiftId ?? firstShift?.id ?? firstShift?.shiftId ?? firstShift?.Id ?? null;
      return {
        id: item.id ?? item.Id ?? item.applicationId ?? item.ApplicationId,
        jobRequestItemId: item.jobRequestItemId ?? item.JobRequestItemId ?? item.id ?? item.Id,
        offerId: item.offerId ?? item.OfferId ?? item.offerID ?? offer?.id ?? offer?.Id,
        shiftId,
        offerTitle: this.pick(item, 'offerTitle', 'OfferTitle', 'title', 'Title', 'offer.title') ?? '',
        pswName: this.pick(item, 'pswName', 'PswName', 'applicantName', 'Name', 'caregiverName', 'psw.name', 'applicant.name', 'user.name') ?? 'Applicant',
        pswPhone: this.pick(item, 'pswPhone', 'PswPhone', 'phone', 'Phone', 'phoneNumber', 'PhoneNumber', 'applicantPhone', 'psw.phone', 'applicant.phone', 'user.phone') ?? '',
        serviceType: this.pick(item, 'serviceType', 'ServiceType', 'type', 'Type') ?? 'Care Service',
        address: this.pick(item, 'address', 'Address', 'location', 'Location', 'offer.address', 'offer.Address') ?? '',
        shiftDate: this.pick(item, 'shiftDate', 'ShiftDate', 'date', 'Date', 'scheduleDate', 'shift.date', 'offer.date') ?? (firstShift ? this.pick(firstShift, 'date', 'Date', 'shiftDate') : '') ?? '',
        startTime: (this.pick(item, 'startTime', 'StartTime', 'start', 'Start') ?? (firstShift ? this.pick(firstShift, 'startTime', 'start', 'Start') : '')) ?? '',
        endTime: (this.pick(item, 'endTime', 'EndTime', 'end', 'End') ?? (firstShift ? this.pick(firstShift, 'endTime', 'end', 'End') : '')) ?? '',
        hourlyRate: item.hourlyRate ?? item.HourlyRate ?? item.hourly_rate ?? offer?.hourlyRate ?? null,
        statusCode,
        status: this.getStatusText(statusCode)
      };
    });
  }

  /** Convert status code to readable text */
  private getStatusText(status: number | string): string {
    const s = typeof status === 'string' ? parseInt(status, 10) : status;
    switch (s) {
      case 1: return 'Pending';
      case 2: return 'Accepted';
      case 3: return 'Rejected';
      case 4: return 'Cancelled';
      default: return 'Pending';
    }
  }

  /** GET /api/applications/{offerId} – applications for a specific offer */
  getApplicationsByOfferId(offerId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/api/applications/${offerId}`).pipe(
      map((res) => this.normalizeApplicationsResponse(res))
    );
  }

  acceptShift(payload: AcceptShiftDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/applications/accept`, payload);
  }

  rejectShift(payload: RejectShiftDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/applications/reject`, payload);
  }
}

