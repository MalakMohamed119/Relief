import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';
import { OffersService } from '../../../../core/services/offers.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  offers: any[] = [];
  offersLoading = true;
  offersError: string | null = null;
  selectedOffer: any | null = null;

  constructor(
    private offersService: OffersService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    const careHomeId = this.authService.getUserId();
    this.offersService.getOffers({ careHomeId: careHomeId ?? undefined }).subscribe({
      next: (list) => {
        this.offers = Array.isArray(list) ? list : [];
        this.offersLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.offersError = err?.error?.message ?? 'Failed to load offers.';
        this.offersLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goToCreateOffer(): void {
    try {
      const role = localStorage.getItem('userRole');
      const pswComplete = localStorage.getItem('pswProfileComplete');
      if (role === 'psw' && pswComplete !== '1') {
        this.notifications.show('Complete your PSW verification before creating or assisting with offers.', 'error', 5000);
        return;
      }
    } catch (e) {
      // ignore storage errors
    }
    this.router.navigate(['/care-home'], { fragment: 'request-form' });
  }

  onViewOffer(offer: any): void {
    this.selectedOffer = offer;
    // mark for check so modal appears when using OnPush or change detection
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.selectedOffer = null;
    this.cdr.markForCheck();
  }

  onEditOffer(offer: any): void {
    if (!offer?.id) {
      this.notifications.show('Offer id is missing, cannot edit.', 'error', 4000);
      return;
    }
    this.router.navigate(['/care-home'], {
      queryParams: { offerId: offer.id },
      fragment: 'request-form'
    });
  }

  onDeleteOffer(offer: any): void {
    if (!offer?.id) {
      this.notifications.show('Offer id is missing, cannot delete.', 'error', 4000);
      return;
    }
    this.offersService.deleteOffer(offer.id).subscribe({
      next: () => {
        this.offers = this.offers.filter(o => o.id !== offer.id);
        if (this.selectedOffer?.id === offer.id) {
          this.selectedOffer = null;
        }
        this.notifications.show('Offer deleted successfully.', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Delete offer error:', err);
        const msg = err?.error?.message ?? err?.message ?? 'Failed to delete offer.';
        this.notifications.show(msg, 'error', 5000);
      }
    });
  }
}
