import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Footer } from '../../../../shared/components/footer/footer';
import { OffersService } from '../../../../core/services/offers.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './offers.html',
  styleUrls: ['./offers.scss'],
})
export class Offers implements OnInit {
  offers: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private offersService: OffersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.offersService.getOffers().subscribe({
      next: (list) => {
        this.offers = list ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load offers.';
        this.loading = false;
      },
    });
  }

  goToCreateOffer(): void {
    this.router.navigate(['/care-home'], { fragment: 'request-form' });
  }
}
