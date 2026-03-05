import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CreateJobOfferDto,
  UpdateJobOfferDto,
  ApplyToOfferDto,
} from '../models/api.models';

const OFFERS_BASE = '/api/Offers';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** POST /api/Offers – body: { title, description, address, latitude, longitude, hourlyRate, shifts[] } */
  createOffer(payload: CreateJobOfferDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${OFFERS_BASE}`, payload);
  }

  /** GET /api/Offers – returns observable of offer array (normalizes data/items/value/array) */
  getOffers(options?: {
    careHomeId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (options?.careHomeId) {
      params = params.set('careHomeId', options.careHomeId);
    }
    if (options?.pageNumber != null) {
      params = params.set('pageNumber', String(options.pageNumber));
    }
    if (options?.pageSize != null) {
      params = params.set('pageSize', String(options.pageSize));
    }

    return this.http.get<any>(`${this.apiUrl}${OFFERS_BASE}`, { params }).pipe(
      map((res) => this.normalizeOffersResponse(res))
    );
  }

  /** Extract offer list from API response (handles data / items / value / content / offers / direct array) */
  private normalizeOffersResponse(res: any): any[] {
    if (res == null) return [];
    if (Array.isArray(res)) return this.normalizeOfferItems(res);
    const list =
      res.data ??
      res.items ??
      res.value ??
      res.results ??
      res.content ??
      res.offers ??
      res.list;
    if (Array.isArray(list)) return this.normalizeOfferItems(list);
    return [];
  }

  /** Map each item to a display shape (handles PascalCase or camelCase from API) */
  private normalizeOfferItems(list: any[]): any[] {
    return list.map((o) => ({
      id: o.id ?? o.Id ?? o.offerId ?? o.offerID,
      title: o.title ?? o.Title ?? '',
      description: o.description ?? o.Description ?? '',
      address: o.address ?? o.Address ?? '',
      hourlyRate: o.hourlyRate ?? o.HourlyRate ?? o.hourly_rate ?? null,
      latitude: o.latitude ?? o.Latitude,
      longitude: o.longitude ?? o.Longitude,
      shifts: o.shifts ?? o.Shifts ?? []
    }));
  }

  getOfferById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${OFFERS_BASE}/${id}`);
  }

  updateOffer(id: string, payload: UpdateJobOfferDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${OFFERS_BASE}/${id}`, payload);
  }

  deleteOffer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${OFFERS_BASE}/${id}`);
  }

  applyToOffer(payload: ApplyToOfferDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/apply`, payload);
  }
}

