import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';
import { OffersService } from '../../../../core/services/offers.service';

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

  constructor(
    private offersService: OffersService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.offersService.getOffers().subscribe({
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
    this.router.navigate(['/care-home'], { fragment: 'request-form' });
  }
}
