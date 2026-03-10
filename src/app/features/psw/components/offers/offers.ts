import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PswNav } from '../../../../shared/components/psw-nav/psw-nav';
import { Footer } from '../../../../shared/components/footer/footer';
import { OffersService } from '../../../../core/services/offers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApplyToOfferDto } from '../../../../core/models/api.models';

interface BrowseOffer {
  id: string;
  title: string;
  description: string;
  address: string;
  hourlyRate: number | null;
  shifts: any[];
}

@Component({
  selector: 'app-psw-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, PswNav, Footer],
  templateUrl: './offers.html',
  styleUrl: './offers.scss',
})
export class PswOffers implements OnInit {
  private offersService = inject(OffersService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  offers: BrowseOffer[] = [];
  isLoading = true;
  error: string | null = null;

  pageIndex = 1;
  pageSize = 12;
  search = '';

  selectedOffer: BrowseOffer | null = null;
  applyingOfferId: string | null = null;

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.error = null;
    this.offersService
      .browseOffers({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.search || undefined,
      })
      .subscribe({
        next: (list) => {
          this.offers = list as BrowseOffer[];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load offers', err);
          this.error = err?.error?.message || 'Failed to load offers.';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.pageIndex = 1;
    this.loadOffers();
  }

  openDetails(offer: BrowseOffer): void {
    this.selectedOffer = offer;
  }

  closeDetails(): void {
    this.selectedOffer = null;
  }

  apply(offer: BrowseOffer): void {
    if (!offer?.id) return;
    this.applyingOfferId = offer.id;

    const shiftIds =
      offer.shifts
        ?.map((s: any) => s.id ?? s.shiftId ?? s.Id)
        .filter((id: string | null | undefined) => !!id) ?? null;

    const payload: ApplyToOfferDto = {
      offerId: offer.id,
      shiftIds: shiftIds && shiftIds.length ? shiftIds : null,
    };

    this.offersService.applyToOffer(payload).subscribe({
      next: () => {
        this.notifications.show('Application submitted successfully.', 'success');
        this.applyingOfferId = null;
      },
      error: (err) => {
        console.error('Apply error', err);
        const msg = err?.error?.message || err?.message || 'Failed to apply to offer.';
        this.notifications.show(msg, 'error');
        this.applyingOfferId = null;
      },
    });
  }
}

