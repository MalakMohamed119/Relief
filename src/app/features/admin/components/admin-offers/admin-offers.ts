import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface OffersResponse {
  success: boolean;
  count: number;
  data: OfferItem[];
}

interface OfferItem {
  offerId: string;
  title: string;
  description: string;
  address: string;
  hourlyRate: number;
  careHomeId: string;
  careHomeName: string;
  shifts: ShiftItem[];
  createdAt: string;
  isActive: boolean;
}

interface ShiftItem {
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-offers.html',
  styleUrls: ['./admin-offers.scss'],
})
export class AdminOffers implements OnInit {
  private admin = inject(AdminService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  offers: OfferItem[] = [];
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.error = null;

    this.admin.getAdminOffers().subscribe({
      next: (response: OffersResponse) => {
        console.log('Admin offers response:', response);
        this.offers = response?.data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading offers:', err);
        this.error = err?.error?.message || err?.message || 'Failed to load offers.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getTitle(offer: OfferItem): string {
    return offer.title || 'Untitled Offer';
  }

  getCareHomeName(offer: OfferItem): string {
    return offer.careHomeName || 'N/A';
  }

  getAddress(offer: OfferItem): string {
    return offer.address || 'N/A';
  }

  getHourlyRate(offer: OfferItem): string {
    return offer.hourlyRate != null ? `£${offer.hourlyRate}/hr` : 'N/A';
  }

  getShiftCount(offer: OfferItem): number {
    return offer.shifts?.length ?? 0;
  }

  getShiftDates(offer: OfferItem): string {
    if (!offer.shifts || offer.shifts.length === 0) return 'No shifts';
    
    const dates = offer.shifts.slice(0, 3).map(s => 
      new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    if (offer.shifts.length > 3) {
      return dates.join(', ') + ` +${offer.shifts.length - 3} more`;
    }
    return dates.join(', ');
  }

  getStatus(offer: OfferItem): string {
    return offer.isActive ? 'Active' : 'Inactive';
  }
}

