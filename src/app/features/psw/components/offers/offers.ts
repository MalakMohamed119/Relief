import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PswNav } from '../../../../shared/components/psw-nav/psw-nav';
import { Footer } from '../../../../shared/components/footer/footer';
import { OffersService } from '../../../../core/services/offers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApplyToOfferDto } from '../../../../core/models/api.models';

interface BrowseOffer {
  id: string;
  title: string;
  description: string;
  address: string;
  hourlyRate: number | null;
  shifts: any[];
}

interface OfferDetails extends BrowseOffer {
  careHomeName?: string;
  requirements?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-psw-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, FormsModule, PswNav, Footer],
  templateUrl: './offers.html',
  styleUrl: './offers.scss',
})
export class PswOffers implements OnInit {
  private offersService = inject(OffersService);
  private notifications = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private authService = inject(AuthService);

  offers: BrowseOffer[] = [];
  isLoading = true;
  error: string | null = null;

  pageIndex = 1;
  pageSize = 12;
  search = '';

  selectedOffer: OfferDetails | null = null;
  selectedShiftIds: string[] = [];
  isLoadingDetails = false;
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
    if (!offer?.id) return;
    
    // Check if PSW has completed profile before opening modal
    const role = this.authService.getUserRole();
    const pswComplete = localStorage.getItem('pswProfileComplete');
    const verificationStatus = this.authService.getVerificationStatus();
    const isPsw = role?.toLowerCase() === 'psw' || role?.toLowerCase() === 'caregiver';
    
    console.log('openDetails check - role:', role, 'isPsw:', isPsw, 'pswComplete:', pswComplete, 'verificationStatus:', verificationStatus);
    
    // If PSW hasn't completed profile → redirect to complete profile form
    if (isPsw && (!pswComplete || pswComplete !== '1')) {
      console.log('Redirecting to complete profile');
      this.notifications.show('Complete your profile and upload documents before applying to offers.', 'error');
      this.router.navigate(['/psw/complete-profile']);
      return;
    }
    
    // If PSW completed but verification is pending → show error and don't open modal
    if (isPsw && verificationStatus === 'pending') {
      console.log('Showing pending message');
      this.notifications.show('Your verification is still pending. You cannot apply for offers until approved.', 'error');
      return;
    }
    
    this.selectedOffer = null;
    this.selectedShiftIds = [];
    this.isLoadingDetails = true;

    // Fetch full offer details from API
    this.offersService.getOfferById(offer.id).subscribe({
      next: (details) => {
        this.selectedOffer = details as OfferDetails;
        // Pre-select all available shift IDs
        this.selectedShiftIds = (this.selectedOffer.shifts || [])
          .map((s: any) => s.shiftId ?? s.ShiftId ?? s.id ?? s.Id)
          .filter((id: string | null | undefined) => !!id);
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load offer details', err);
        this.notifications.show('Failed to load offer details', 'error');
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeDetails(): void {
    this.selectedOffer = null;
    this.selectedShiftIds = [];
  }

  // Toggle shift selection
  toggleShift(shiftId: string): void {
    const index = this.selectedShiftIds.indexOf(shiftId);
    if (index > -1) {
      this.selectedShiftIds.splice(index, 1);
    } else {
      this.selectedShiftIds.push(shiftId);
    }
  }

  // Check if shift is selected
  isShiftSelected(shiftId: string): boolean {
    return this.selectedShiftIds.includes(shiftId);
  }

  apply(offer: BrowseOffer): void {
    if (!offer?.id) return;

    // Check if PSW has completed profile and is verified
    const role = this.authService.getUserRole();
    const pswComplete = localStorage.getItem('pswProfileComplete');
    const verificationStatus = this.authService.getVerificationStatus();
    const isPsw = role?.toLowerCase() === 'psw' || role?.toLowerCase() === 'caregiver';
    
    console.log('Apply check - role:', role, 'isPsw:', isPsw, 'pswComplete:', pswComplete, 'verificationStatus:', verificationStatus);
    
    // If PSW hasn't completed profile OR profile not verified
    if (isPsw && (!pswComplete || pswComplete !== '1')) {
      console.log('Redirecting to complete profile');
      this.notifications.show('Complete your profile and upload documents before applying to offers.', 'error');
      this.router.navigate(['/psw/complete-profile']);
      return;
    }
    
    if (isPsw && verificationStatus === 'pending') {
      console.log('Showing pending message');
      this.notifications.show('Your verification is still pending. You cannot apply for offers until approved.', 'error');
      return;
    }

    // If no shifts selected, show error
    if (this.selectedShiftIds.length === 0) {
      this.notifications.show('Please select at least one shift to apply.', 'error');
      return;
    }

    this.applyingOfferId = offer.id;

    const payload: ApplyToOfferDto = {
      offerId: offer.id,
      shiftIds: this.selectedShiftIds.length > 0 ? this.selectedShiftIds : null,
    };

    this.offersService.applyToOffer(payload).subscribe({
      next: () => {
        this.notifications.show('Application submitted successfully.', 'success');
        this.applyingOfferId = null;
        this.closeDetails();
      },
      error: (err) => {
        console.error('Apply error', err);
        let msg = err?.error?.message || err?.message || 'Failed to apply to offer.';
        if (err?.status === 403) {
          msg = 'You are not allowed to apply to this offer (403 Forbidden). Please check your PSW verification or permissions.';
        }
        this.notifications.show(msg, 'error');
        this.applyingOfferId = null;
      },
    });
  }
}

