import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Footer } from "../../../../shared/components/footer/footer";
import { Navbar } from "../../../../shared/components/navbar/navbar";
import { OffersService } from '../../../../core/services/offers.service';
import { CreateJobOfferDto } from '../../../../core/models/api.models';
import { first } from 'rxjs/operators';
import * as L from 'leaflet';

// Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

function addressOrLocationValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const address = (g.get('address')?.value ?? '').trim();
    const lat = Number(g.get('latitude')?.value);
    const lng = Number(g.get('longitude')?.value);
    const hasAddress = address.length > 0;
    const hasLocation = !Number.isNaN(lat) && !Number.isNaN(lng) && (lat !== 0 || lng !== 0);
    return hasAddress || hasLocation ? null : { addressOrLocationRequired: true };
  };
}

interface Service {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

@Component({
  selector: 'app-care-home-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    Footer,
    Navbar
  ],
  templateUrl: './care-home-home.html',
  styleUrls: ['./care-home-home.scss'],
})
export class CareHomeHome implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  requestForm: FormGroup;
  isSubmitting = false;
  map: L.Map | null = null;
  marker: L.Marker | null = null;
  mapReady = false;
  addressOrLocationError = false;

  constructor(
    private fb: FormBuilder,
    private offersService: OffersService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      address: [''],
      latitude: [0],
      longitude: [0],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      shifts: this.fb.array([this.createShiftGroup()])
    }, { validators: addressOrLocationValidator() });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.route.fragment.subscribe((f) => {
      if (f === 'request-form') {
        setTimeout(() => this.scrollToRequestForm(), 100);
      }
    });
  }

  scrollToRequestForm(): void {
    const el = document.getElementById('request-form');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;
    const defaultCenter: L.LatLngTuple = [30.0444, 31.2357]; // Cairo
    this.map = L.map(this.mapContainer.nativeElement).setView(defaultCenter, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e.latlng));
    this.mapReady = true;
    this.cdr.markForCheck();
  }

  private onMapClick(latlng: L.LatLng): void {
    const lat = latlng.lat;
    const lng = latlng.lng;
    this.requestForm.patchValue({ latitude: lat, longitude: lng });
    if (this.marker) this.marker.setLatLng(latlng);
    else if (this.map) {
      this.marker = L.marker(latlng).addTo(this.map);
    }
    this.reverseGeocode(lat, lng);
    this.addressOrLocationError = false;
    this.cdr.markForCheck();
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(res => res.json())
      .then((data: { display_name?: string }) => {
        const addr = data?.display_name ?? '';
        if (addr) this.requestForm.patchValue({ address: addr });
        this.cdr.markForCheck();
      })
      .catch(() => this.cdr.markForCheck());
  }

  private createShiftGroup(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      startTime: ['08:00', Validators.required],
      endTime: ['16:00', Validators.required]
    });
  }

  get shifts(): FormArray {
    return this.requestForm.get('shifts') as FormArray;
  }

  addShift(): void {
    this.shifts.push(this.createShiftGroup());
  }

  removeShift(index: number): void {
    if (this.shifts.length > 1) {
      this.shifts.removeAt(index);
    }
  }

  /** Format date as "yyyy-MM-dd" for POST /api/Offers */
  private toDateString(value: string | Date): string {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const s = String(value ?? '').trim();
    if (!s) return '';
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toISOString().slice(0, 10);
  }

  private toTimeHHmmss(value: string): string {
    if (!value) return '08:00:00';
    const parts = String(value).trim().split(':');
    if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    return '08:00:00';
  }

  submitRequest(): void {
    this.addressOrLocationError = this.requestForm.hasError('addressOrLocationRequired');
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    const v = this.requestForm.value;
    const payload: CreateJobOfferDto = {
      title: String(v.title ?? ''),
      description: String(v.description ?? ''),
      address: String(v.address ?? ''),
      latitude: Number(v.latitude) || 0,
      longitude: Number(v.longitude) || 0,
      hourlyRate: Number(v.hourlyRate) || 0,
      shifts: v.shifts.map((s: { date: string | Date; startTime: string; endTime: string }) => ({
        date: this.toDateString(s.date),
        startTime: this.toTimeHHmmss(s.startTime),
        endTime: this.toTimeHHmmss(s.endTime)
      }))
    };
    this.isSubmitting = true;
    this.offersService.createOffer(payload).pipe(first()).subscribe({
      next: () => {
        alert('Request created successfully.');
        this.requestForm.patchValue({
          title: '',
          description: '',
          address: '',
          latitude: 0,
          longitude: 0,
          hourlyRate: 0
        });
        if (this.marker && this.map) {
          this.map.removeLayer(this.marker);
          this.marker = null;
        }
        while (this.shifts.length > 1) this.shifts.removeAt(1);
        this.shifts.at(0).reset({ date: '', startTime: '08:00', endTime: '16:00' });
        this.isSubmitting = false;
        this.addressOrLocationError = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Create offer failed', err);
        this.isSubmitting = false;
        this.cdr.markForCheck();
        const status = err?.status;
        if (status === 401) {
          alert('Please log in to create an offer.');
          this.router.navigate(['/login']);
        } else if (status === 0) {
          alert('Cannot reach the server. Check CORS and network, or try again later.');
        } else {
          const msg = err?.error?.message || err?.message || 'Request failed. Try again.';
          alert(msg);
        }
      }
    });
  }

  services: Service[] = [
    {
      icon: 'elderly',
      title: 'Elderly Care',
      description: 'Comprehensive care for the elderly in their homes with the highest quality standards'
    },
    {
      icon: 'medication',
      title: 'Nursing Care',
      description: 'Specialized nursing services by qualified caregivers'
    },
    {
      icon: 'groups',
      title: 'Companionship',
      description: 'Companionship and assistance with daily activities'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Ahmed Mohamed',
      role: "Client's Son",
      content: 'Excellent service and very professional caregivers. Thank you!',
      rating: 5
    },
    {
      name: 'Sara Ahmed',
      role: "Client's Daughter",
      content: 'Professional team providing excellent care for my mother',
      rating: 4
    }
  ];

  getServiceIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'elderly': 'fa-user-nurse',
      'medication': 'fa-pills',
      'groups': 'fa-people-group',
      // Add more mappings as needed
    };
    return iconMap[iconName] || 'fa-question-circle'; // Default icon if not found
  }
}