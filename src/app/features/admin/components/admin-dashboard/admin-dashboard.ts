import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard implements OnInit {
  stats = {
    verifications: 0,
    applications: 0,
    offers: 0
  };
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    
    // Load pending verifications
    this.adminService.getPendingVerifications().subscribe({
      next: (data) => {
        this.stats.verifications = Array.isArray(data) ? data.length : 0;
      },
      error: () => {
        this.stats.verifications = 0;
      }
    });

    // Load pending applications
    this.adminService.getPendingApplications().subscribe({
      next: (data) => {
        this.stats.applications = Array.isArray(data) ? data.length : 0;
      },
      error: () => {
        this.stats.applications = 0;
      }
    });

    // Load all offers
    this.adminService.getAdminOffers().subscribe({
      next: (data) => {
        this.stats.offers = Array.isArray(data) ? data.length : 0;
        this.isLoading = false;
      },
      error: () => {
        this.stats.offers = 0;
        this.isLoading = false;
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

